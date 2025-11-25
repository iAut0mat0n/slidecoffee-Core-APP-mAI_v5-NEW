import { Router, Request, Response } from 'express';
import { db } from '../db.js';
import { v2Users, v2WorkspaceMembers } from '../../shared/schema.js';
import { eq } from 'drizzle-orm';
import { isAuthenticated } from '../replitAuth.js';

const router = Router();

// GET /api/auth/me - Returns current user info from Replit Auth session
router.get('/auth/me', isAuthenticated, async (req: Request, res: Response) => {
  try {
    console.log('📍 GET /api/auth/me called');
    
    const user = req.user as any;
    const replitAuthId = user?.claims?.sub;

    if (!replitAuthId) {
      console.log('❌ No Replit Auth ID in session');
      return res.status(401).json({ user: null });
    }

    console.log('✅ Replit Auth user verified:', user.claims.email);

    // Find user by replit_auth_id
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
      .where(eq(v2Users.replitAuthId, replitAuthId))
      .limit(1);

    if (!userProfile) {
      console.log('⚠️ User not found in database');
      return res.json({ user: null });
    }

    console.log('✅ User found in database:', userProfile.email);

    // Get workspace membership to include workspaceId in response
    const [membership] = await db
      .select({ workspaceId: v2WorkspaceMembers.workspaceId })
      .from(v2WorkspaceMembers)
      .where(eq(v2WorkspaceMembers.userId, userProfile.id))
      .limit(1);

    const workspaceId = membership?.workspaceId || userProfile.defaultWorkspaceId;

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
        workspaceId: workspaceId,
      }
    });
  } catch (error: any) {
    console.error('Failed to fetch user:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch user' });
  }
});

// POST /api/auth/logout - Handled by replitAuth.ts (GET /api/logout)
// This route exists for backward compatibility
router.post('/auth/logout', async (req: Request, res: Response) => {
  try {
    req.logout(() => {
      res.json({ success: true });
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to logout' });
  }
});

export const authRouter = router;
