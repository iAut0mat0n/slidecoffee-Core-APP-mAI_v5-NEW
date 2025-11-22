import { Router, Response } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { createClient } from '@supabase/supabase-js';
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

    // Extract and validate auth token
    const authHeader = req.headers.authorization;
    let token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    // Fallback to cookies if no Authorization header
    if (!token && req.headers.cookie) {
      const cookies = req.headers.cookie.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = decodeURIComponent(value);
        return acc;
      }, {} as Record<string, string>);

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

    // Create Supabase client and VERIFY the session
    const supabase = createClient(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_ANON_KEY || ''
    );

    // Validate that the token belongs to the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user || user.id !== userId) {
      return res.status(401).json({ error: 'Invalid authentication token' });
    }

    // Now create authenticated client for RLS queries
    const authenticatedSupabase = createClient(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_ANON_KEY || '',
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );

    // Get start of current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Count presentations created this month
    const { count: presentationCount } = await authenticatedSupabase
      .from('v2_presentations')
      .select('*', { count: 'exact', head: true })
      .eq('workspace_id', workspaceId)
      .gte('created_at', startOfMonth.toISOString());

    // Count total slides created this month
    const { count: slideCount } = await authenticatedSupabase
      .from('v2_slides')
      .select('*', { count: 'exact', head: true })
      .eq('workspace_id', workspaceId)
      .gte('created_at', startOfMonth.toISOString());

    // Count brands
    const { count: brandCount } = await authenticatedSupabase
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
