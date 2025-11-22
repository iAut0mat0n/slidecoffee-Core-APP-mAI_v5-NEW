import { Router, Response } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { createClient } from '@supabase/supabase-js';

const router = Router();

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_ANON_KEY || ''
);

// Get current month usage for authenticated user
router.get('/current', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const workspaceId = req.user?.workspaceId;

    if (!userId || !workspaceId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Get start of current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Count presentations created this month
    const { count: presentationCount } = await supabase
      .from('v2_presentations')
      .select('*', { count: 'exact', head: true })
      .eq('workspace_id', workspaceId)
      .gte('created_at', startOfMonth.toISOString());

    // Count total slides created this month
    const { count: slideCount } = await supabase
      .from('v2_slides')
      .select('*', { count: 'exact', head: true })
      .eq('workspace_id', workspaceId)
      .gte('created_at', startOfMonth.toISOString());

    // Count brands
    const { count: brandCount } = await supabase
      .from('v2_brands')
      .select('*', { count: 'exact', head: true })
      .eq('workspace_id', workspaceId);

    res.json({
      usage: {
        slides: slideCount || 0,
        presentations: presentationCount || 0,
        brands: brandCount || 0,
      },
      period: {
        start: startOfMonth.toISOString(),
        end: new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Usage tracking error:', error);
    res.status(500).json({ error: 'Failed to fetch usage data' });
  }
});

export default router;
