import { Router, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';

const router = Router();

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// GET /api/auth/me - Get current user
router.get('/auth/me', async (req: Request, res: Response) => {
  try {
    // Get session from cookies or Authorization header
    let token: string | undefined;
    const authHeader = req.headers.authorization;
    
    // Check Authorization header first
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
    
    // Fallback to cookies (Supabase Auth session cookies: sb-<ref>-access-token)
    if (!token && req.headers.cookie) {
      const cookies = req.headers.cookie.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = decodeURIComponent(value);
        return acc;
      }, {} as Record<string, string>);

      // Find cookie with pattern: sb-*-access-token
      const accessTokenCookieName = Object.keys(cookies).find(key => 
        key.startsWith('sb-') && key.endsWith('-access-token')
      );
      
      if (accessTokenCookieName) {
        token = cookies[accessTokenCookieName];
      }
    }
    
    if (!token) {
      return res.status(401).json({ user: null });
    }

    // Verify token and get user
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !authUser) {
      return res.status(401).json({ user: null });
    }

    // Fetch user profile with workspace info
    const { data: userProfile, error: profileError } = await supabase
      .from('v2_users')
      .select('id, email, name, avatar_url, role, plan, default_workspace_id, subscription_status')
      .eq('id', authUser.id)
      .single();

    if (profileError || !userProfile) {
      // User not in profile table yet, return basic auth user
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

    res.json({ user: userProfile });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch user' });
  }
});

// POST /api/auth/logout - Logout
router.post('/auth/logout', async (req: Request, res: Response) => {
  try {
    // TODO: Implement proper session management
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to logout' });
  }
});

// POST /api/auth/create-user - Create user record (uses service role to bypass RLS)
router.post('/auth/create-user', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.substring(7);
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !authUser) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('v2_users')
      .select('id')
      .eq('id', authUser.id)
      .single();

    if (existingUser) {
      return res.json({ success: true, message: 'User already exists' });
    }

    // Create user with service role (bypasses RLS)
    const { data: newUser, error } = await supabase
      .from('v2_users')
      .insert({
        id: authUser.id,
        email: authUser.email!,
        name: authUser.user_metadata?.name || 'User',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create user:', error);
      return res.status(500).json({ error: 'Failed to create user record' });
    }

    res.json({ success: true, user: newUser });
  } catch (error: any) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user record' });
  }
});

export const authRouter = router;

