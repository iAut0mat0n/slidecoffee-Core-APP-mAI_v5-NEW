import { Router, Response } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { getAuthenticatedSupabaseClient } from '../utils/supabase-auth.js';
import { STRIPE_CONFIG } from '../config/stripe-plans.js';

const router = Router();

// Helper to get plan limits
function getPlanLimits(planId: string) {
  const planConfig = STRIPE_CONFIG.plans[planId as keyof typeof STRIPE_CONFIG.plans];
  return planConfig?.limits || STRIPE_CONFIG.plans.espresso.limits;
}

// Get current month usage for authenticated user
router.get('/current', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const workspaceId = req.user?.workspaceId;
    const userPlan = req.user?.plan || 'espresso';

    if (!userId || !workspaceId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Get authenticated Supabase client (enforces RLS)
    const { supabase } = await getAuthenticatedSupabaseClient(req);

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

    // Get plan limits
    const limits = getPlanLimits(userPlan);

    res.json({
      usage: {
        slides: slideCount || 0,
        presentations: presentationCount || 0,
        brands: brandCount || 0,
      },
      limits: {
        slides: limits.slidesPerMonth,
        presentations: limits.presentationsPerMonth,
        brands: userPlan === 'espresso' ? 1 : -1, // Free tier: 1 brand, paid: unlimited
      },
      plan: userPlan,
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
