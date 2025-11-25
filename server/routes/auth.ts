import { Router, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { db } from '../db.js';
import { v2Users, v2Workspaces, v2WorkspaceMembers } from '../../shared/schema.js';
import { eq } from 'drizzle-orm';

const router = Router();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials for auth!');
}

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

function getTokenFromRequest(req: Request): string | undefined {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  if (req.headers.cookie) {
    const cookies = req.headers.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = decodeURIComponent(value || '');
      return acc;
    }, {} as Record<string, string>);

    const accessTokenCookieName = Object.keys(cookies).find(key => 
      key.startsWith('sb-') && key.endsWith('-access-token')
    );
    
    if (accessTokenCookieName) {
      return cookies[accessTokenCookieName];
    }
  }
  
  return undefined;
}

router.get('/auth/me', async (req: Request, res: Response) => {
  try {
    if (!supabase) {
      return res.status(500).json({ error: 'Auth service not configured' });
    }

    const token = getTokenFromRequest(req);
    if (!token) {
      return res.status(401).json({ user: null });
    }

    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !authUser) {
      return res.status(401).json({ user: null });
    }

    const [userProfile] = await db
      .select({
        id: v2Users.id,
        email: v2Users.email,
        name: v2Users.name,
        avatarUrl: v2Users.avatarUrl,
        role: v2Users.role,
        plan: v2Users.plan,
        defaultWorkspaceId: v2Users.defaultWorkspaceId,
        subscriptionStatus: v2Users.subscriptionStatus,
      })
      .from(v2Users)
      .where(eq(v2Users.id, authUser.id))
      .limit(1);

    if (!userProfile) {
      return res.json({
        user: {
          id: authUser.id,
          email: authUser.email,
          name: authUser.user_metadata?.name || authUser.email,
          role: 'user',
          plan: 'starter',
          default_workspace_id: null,
        },
      });
    }

    res.json({ 
      user: {
        id: userProfile.id,
        email: userProfile.email,
        name: userProfile.name,
        avatar_url: userProfile.avatarUrl,
        role: userProfile.role,
        plan: userProfile.plan,
        default_workspace_id: userProfile.defaultWorkspaceId,
        subscription_status: userProfile.subscriptionStatus,
      }
    });
  } catch (error: any) {
    console.error('Failed to fetch user:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch user' });
  }
});

router.post('/auth/logout', async (req: Request, res: Response) => {
  try {
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to logout' });
  }
});

router.post('/auth/create-user', async (req: Request, res: Response) => {
  try {
    if (!supabase) {
      return res.status(500).json({ error: 'Auth service not configured' });
    }

    const token = getTokenFromRequest(req);
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !authUser) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    console.log('Creating user for:', authUser.email);

    const [existingUser] = await db
      .select({ id: v2Users.id })
      .from(v2Users)
      .where(eq(v2Users.id, authUser.id))
      .limit(1);

    if (existingUser) {
      console.log('User already exists:', authUser.email);
      return res.json({ success: true, message: 'User already exists' });
    }

    const [newUser] = await db
      .insert(v2Users)
      .values({
        id: authUser.id,
        email: authUser.email!,
        name: authUser.user_metadata?.name || 'User',
      })
      .returning();

    console.log('User created successfully:', authUser.email);
    res.json({ success: true, user: newUser });
  } catch (error: any) {
    console.error('Failed to create user:', error);
    res.status(500).json({ error: 'Failed to create user record', details: error.message });
  }
});

router.get('/workspaces', async (req: Request, res: Response) => {
  try {
    if (!supabase) {
      return res.status(500).json({ error: 'Auth service not configured' });
    }

    const token = getTokenFromRequest(req);
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !authUser) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const memberships = await db
      .select({
        id: v2Workspaces.id,
        name: v2Workspaces.name,
        ownerId: v2Workspaces.ownerId,
        createdAt: v2Workspaces.createdAt,
        role: v2WorkspaceMembers.role,
      })
      .from(v2WorkspaceMembers)
      .innerJoin(v2Workspaces, eq(v2WorkspaceMembers.workspaceId, v2Workspaces.id))
      .where(eq(v2WorkspaceMembers.userId, authUser.id));

    res.json(memberships);
  } catch (error: any) {
    console.error('Failed to fetch workspaces:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch workspaces' });
  }
});

router.post('/workspaces', async (req: Request, res: Response) => {
  try {
    if (!supabase) {
      return res.status(500).json({ error: 'Auth service not configured' });
    }

    const token = getTokenFromRequest(req);
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !authUser) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const { name } = req.body;
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'Workspace name is required' });
    }

    const [newWorkspace] = await db
      .insert(v2Workspaces)
      .values({
        name: name.trim(),
        ownerId: authUser.id,
      })
      .returning();

    await db
      .insert(v2WorkspaceMembers)
      .values({
        workspaceId: newWorkspace.id,
        userId: authUser.id,
        role: 'owner',
      });

    await db
      .update(v2Users)
      .set({ defaultWorkspaceId: newWorkspace.id })
      .where(eq(v2Users.id, authUser.id));

    console.log('Workspace created:', newWorkspace.name, 'for user:', authUser.email);

    res.status(201).json(newWorkspace);
  } catch (error: any) {
    console.error('Failed to create workspace:', error);
    res.status(500).json({ message: error.message || 'Failed to create workspace' });
  }
});

router.get('/workspaces/:id', async (req: Request, res: Response) => {
  try {
    if (!supabase) {
      return res.status(500).json({ error: 'Auth service not configured' });
    }

    const token = getTokenFromRequest(req);
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !authUser) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const [membership] = await db
      .select({
        id: v2Workspaces.id,
        name: v2Workspaces.name,
        ownerId: v2Workspaces.ownerId,
        createdAt: v2Workspaces.createdAt,
        role: v2WorkspaceMembers.role,
      })
      .from(v2WorkspaceMembers)
      .innerJoin(v2Workspaces, eq(v2WorkspaceMembers.workspaceId, v2Workspaces.id))
      .where(eq(v2WorkspaceMembers.workspaceId, req.params.id))
      .limit(1);

    if (!membership) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    res.json(membership);
  } catch (error: any) {
    console.error('Failed to fetch workspace:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch workspace' });
  }
});

export const authRouter = router;
