import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import { db } from '../db.js';
import { v2Users, v2WorkspaceMembers } from '../../shared/schema.js';
import { eq } from 'drizzle-orm';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase auth credentials');
}

const supabaseAuth = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name?: string;
    role?: string;
    plan?: string;
    subscription_status?: string;
    workspaceId?: string;
  };
}

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

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!supabaseAuth) {
      throw new Error('Supabase auth not configured');
    }

    const token = getTokenFromRequest(req);
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { data: { user: authUser }, error: authError } = await supabaseAuth.auth.getUser(token);
    
    if (authError || !authUser) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const [userRecord] = await db
      .select({
        id: v2Users.id,
        email: v2Users.email,
        name: v2Users.name,
        role: v2Users.role,
        plan: v2Users.plan,
        defaultWorkspaceId: v2Users.defaultWorkspaceId,
        subscriptionStatus: v2Users.subscriptionStatus,
      })
      .from(v2Users)
      .where(eq(v2Users.id, authUser.id))
      .limit(1);

    if (!userRecord) {
      return res.status(401).json({ error: 'User not found' });
    }

    let workspaceId = userRecord.defaultWorkspaceId;
    
    if (!workspaceId) {
      const [membership] = await db
        .select({ workspaceId: v2WorkspaceMembers.workspaceId })
        .from(v2WorkspaceMembers)
        .where(eq(v2WorkspaceMembers.userId, authUser.id))
        .limit(1);
      
      workspaceId = membership?.workspaceId;
    }

    // Safety check: Ensure workspace membership exists (handles migration edge cases)
    if (workspaceId) {
      const [existingMembership] = await db
        .select({ id: v2WorkspaceMembers.id })
        .from(v2WorkspaceMembers)
        .where(eq(v2WorkspaceMembers.userId, userRecord.id))
        .limit(1);

      if (!existingMembership) {
        // Backfill missing membership for existing users
        await db
          .insert(v2WorkspaceMembers)
          .values({
            workspaceId,
            userId: userRecord.id,
            role: userRecord.id === userRecord.defaultWorkspaceId ? 'owner' : 'member',
          })
          .onConflictDoNothing();
        
        console.log('✅ Backfilled workspace membership for user:', userRecord.email);
      }
    }
    // Note: Users without workspaces are allowed during onboarding (workspace creation)

    const planMapping: Record<string, string> = {
      'starter': 'americano',
      'professional': 'cappuccino',
      'enterprise': 'frenchPress',
      'free': 'espresso',
      'pro': 'cappuccino',
      'business': 'coldBrew',
    };
    const rawPlan = userRecord.plan || 'espresso';
    const normalizedPlan = planMapping[rawPlan] || rawPlan;

    req.user = {
      id: userRecord.id,
      email: userRecord.email || '',
      name: userRecord.name || undefined,
      role: userRecord.role || 'user',
      plan: normalizedPlan,
      subscription_status: userRecord.subscriptionStatus || undefined,
      workspaceId: workspaceId || undefined,
    };

    next();
  } catch (error: any) {
    console.error('Auth middleware error:', error);
    if (error.message?.includes('authentication')) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    res.status(500).json({ error: 'Authentication failed' });
  }
}

export { getTokenFromRequest };
