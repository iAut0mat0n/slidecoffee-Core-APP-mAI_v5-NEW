import { Router, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { db } from '../db.js';
import { v2Users } from '../../shared/schema.js';
import { eq } from 'drizzle-orm';

const router = Router();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
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

router.put('/users/me', async (req: Request, res: Response) => {
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
    
    const updates: Partial<{ name: string }> = {};
    if (name !== undefined && typeof name === 'string' && name.trim().length > 0) {
      updates.name = name.trim();
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    const [updatedUser] = await db
      .update(v2Users)
      .set(updates)
      .where(eq(v2Users.id, authUser.id))
      .returning({
        id: v2Users.id,
        email: v2Users.email,
        name: v2Users.name,
        avatarUrl: v2Users.avatarUrl,
        role: v2Users.role,
        plan: v2Users.plan,
        defaultWorkspaceId: v2Users.defaultWorkspaceId,
      });

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('User profile updated:', authUser.email);

    res.json({ 
      success: true, 
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        avatar_url: updatedUser.avatarUrl,
        role: updatedUser.role,
        plan: updatedUser.plan,
        default_workspace_id: updatedUser.defaultWorkspaceId,
      }
    });
  } catch (error: any) {
    console.error('Failed to update user profile:', error);
    res.status(500).json({ message: error.message || 'Failed to update profile' });
  }
});

export const usersRouter = router;
