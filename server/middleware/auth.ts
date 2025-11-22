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
        acc[key] = value;
        return acc;
      }, {} as Record<string, string>);

      // Supabase stores access token in sb-<project-ref>-auth-token cookie
      const supabaseAuthCookie = Object.keys(cookies).find(key => key.includes('sb-') && key.includes('-auth-token'));
      if (supabaseAuthCookie) {
        try {
          const cookieData = JSON.parse(decodeURIComponent(cookies[supabaseAuthCookie]));
          token = cookieData.access_token || cookieData[0]; // Handle both object and array formats
        } catch (e) {
          console.error('Failed to parse Supabase auth cookie:', e);
        }
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

    // Fetch user's workspace (default workspace for now)
    const { data: userRecord, error: userError } = await supabase
      .from('v2_users')
      .select('id, email, default_workspace_id')
      .eq('id', user.id)
      .single();

    if (userError) {
      console.error('Error fetching user workspace:', userError);
    }

    // Attach user info to request
    req.user = {
      id: user.id,
      email: user.email || '',
      workspaceId: userRecord?.default_workspace_id,
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
}
