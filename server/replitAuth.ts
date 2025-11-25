import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";
import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { db } from './db.js';
import { v2Users } from '../shared/schema.js';
import { eq } from 'drizzle-orm';

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  const isProduction = process.env.NODE_ENV === 'production';
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: isProduction, // Only require HTTPS in production
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(claims: any) {
  const replitAuthId = claims["sub"];
  const email = claims["email"];
  const firstName = claims["first_name"];
  const lastName = claims["last_name"];
  const profileImageUrl = claims["profile_image_url"];

  // First check if user exists by replit_auth_id
  const [existingUser] = await db
    .select()
    .from(v2Users)
    .where(eq(v2Users.replitAuthId, replitAuthId))
    .limit(1);

  if (existingUser) {
    // Update existing user
    await db
      .update(v2Users)
      .set({
        email,
        firstName,
        lastName,
        profileImageUrl,
        name: firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName || email,
        avatarUrl: profileImageUrl,
        updatedAt: new Date(),
      })
      .where(eq(v2Users.id, existingUser.id));
    return existingUser;
  } else {
    // Create new user
    const [newUser] = await db
      .insert(v2Users)
      .values({
        replitAuthId,
        email,
        firstName,
        lastName,
        profileImageUrl,
        name: firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName || email,
        avatarUrl: profileImageUrl,
      })
      .returning();

    // Create default workspace for new user
    const { v2Workspaces, v2WorkspaceMembers } = await import('../shared/schema.js');
    
    try {
      const [workspace] = await db
        .insert(v2Workspaces)
        .values({
          name: `${newUser.name || newUser.email}'s Workspace`,
          ownerId: newUser.id,
        })
        .returning();

      if (!workspace) {
        throw new Error('Failed to create workspace');
      }

      // Insert workspace membership (CRITICAL for workspace-scoped access)
      await db
        .insert(v2WorkspaceMembers)
        .values({
          workspaceId: workspace.id,
          userId: newUser.id,
          role: 'owner',
        });

      // Set default workspace
      await db
        .update(v2Users)
        .set({ defaultWorkspaceId: workspace.id })
        .where(eq(v2Users.id, newUser.id));

      console.log('✅ Created workspace and membership for new user:', newUser.email);
      
      return newUser;
    } catch (error) {
      console.error('❌ Failed to provision workspace for new user:', newUser.email, error);
      // Clean up user if workspace creation failed
      await db.delete(v2Users).where(eq(v2Users.id, newUser.id));
      throw new Error('Failed to provision user workspace');
    }
  }
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  const config = await getOidcConfig();

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    const user = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims());
    verified(null, user);
  };

  // Keep track of registered strategies
  const registeredStrategies = new Set<string>();

  // Helper function to ensure strategy exists for a domain
  const ensureStrategy = (domain: string) => {
    const strategyName = `replitauth:${domain}`;
    if (!registeredStrategies.has(strategyName)) {
      const strategy = new Strategy(
        {
          name: strategyName,
          config,
          scope: "openid email profile offline_access",
          callbackURL: `https://${domain}/api/callback`,
        },
        verify
      );
      passport.use(strategy);
      registeredStrategies.add(strategyName);
    }
  };

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  app.get("/api/login", (req, res, next) => {
    ensureStrategy(req.hostname);
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    ensureStrategy(req.hostname);
    passport.authenticate(`replitauth:${req.hostname}`, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login",
    })(req, res, next);
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID!,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
        }).href
      );
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = req.user as any;

  if (!req.isAuthenticated() || !user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};
