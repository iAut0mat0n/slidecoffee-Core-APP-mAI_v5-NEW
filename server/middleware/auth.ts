import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

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
    // Extract auth token from Authorization header or cookies
    const authHeader = req.headers.authorization;
    let token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    // Fallback to cookies if no Authorization header (Supabase browser sessions use cookies)
    if (!token && req.headers.cookie) {
      const cookies = req.headers.cookie.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = decodeURIComponent(value);
        return acc;
      }, {} as Record<string, string>);

      // Supabase stores access token in sb-<project-ref>-access-token cookie
      // Find cookie with pattern: sb-*-access-token
      const accessTokenCookieName = Object.keys(cookies).find(key => 
        key.startsWith('sb-') && key.endsWith('-access-token')
      );
      
      if (accessTokenCookieName) {
        token = cookies[accessTokenCookieName];
      }
    }

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Verify the JWT token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Fetch user's workspace and role (for admin checks)
    const { data: userRecord, error: userError } = await supabase
      .from('v2_users')
      .select('id, email, name, role, plan, default_workspace_id, subscription_status')
      .eq('id', user.id)
      .single();

    if (userError) {
      console.error('Error fetching user profile:', userError);
    }

    // Attach user info to request
    req.user = {
      id: user.id,
      email: user.email || '',
      name: userRecord?.name,
      role: userRecord?.role || 'user',
      plan: userRecord?.plan || 'starter',
      subscription_status: userRecord?.subscription_status,
      workspaceId: userRecord?.default_workspace_id,
    } as any;

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
}
