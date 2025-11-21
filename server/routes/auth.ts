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
    // TODO: Implement proper session management
    // For now, returning mock user
    res.json({
      user: {
        id: '1',
        email: 'demo@slidecoffee.com',
        name: 'Demo User',
        role: 'admin',
      },
    });
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

export const authRouter = router;

