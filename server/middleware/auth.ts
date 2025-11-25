import { Request, Response, NextFunction } from 'express';
import { db } from '../db.js';
import { v2Users, v2WorkspaceMembers } from '../../shared/schema.js';
import { eq } from 'drizzle-orm';

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

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    // Check if user is authenticated via Replit Auth session
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const sessionUser = req.user as any;
    const replitAuthId = sessionUser?.claims?.sub;

    if (!replitAuthId) {
      return res.status(401).json({ error: 'Invalid session' });
    }

    // Find user in database by replit_auth_id
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
      .where(eq(v2Users.replitAuthId, replitAuthId))
      .limit(1);

    if (!userRecord) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Get workspace ID
    let workspaceId = userRecord.defaultWorkspaceId;
    
    if (!workspaceId) {
      const [membership] = await db
        .select({ workspaceId: v2WorkspaceMembers.workspaceId })
        .from(v2WorkspaceMembers)
        .where(eq(v2WorkspaceMembers.userId, userRecord.id))
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
    } else {
      // Critical: User has no workspace - should not happen
      console.error('❌ User has no workspace:', userRecord.email);
      return res.status(500).json({ error: 'User workspace not configured' });
    }

    // Plan mapping for backward compatibility
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

    // Attach user info to request
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
    res.status(500).json({ error: 'Authentication failed' });
  }
}
