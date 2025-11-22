import { Router, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// Admin middleware - check if user is admin
const requireAdmin = async (req: Request, res: Response, next: any) => {
  const user = (req as any).user;
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// GET /api/admin/users - List all users with subscription info
router.get('/admin/users', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { data: users, error } = await supabase
      .from('v2_users')
      .select('id, email, name, role, plan, subscription_status, stripe_customer_id, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(users || []);
  } catch (error: any) {
    console.error('Failed to fetch users:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch users' });
  }
});

// GET /api/admin/subscriptions - List all subscriptions
router.get('/admin/subscriptions', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { data: subscriptions, error } = await supabase
      .from('v2_users')
      .select('id, email, name, plan, subscription_status, stripe_subscription_id, subscription_current_period_end, created_at')
      .not('stripe_subscription_id', 'is', null)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(subscriptions || []);
  } catch (error: any) {
    console.error('Failed to fetch subscriptions:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch subscriptions' });
  }
});

// GET /api/admin/stats - Get admin dashboard stats
router.get('/admin/stats', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    // Get total users
    const { count: totalUsers, error: usersError } = await supabase
      .from('v2_users')
      .select('*', { count: 'exact', head: true });

    if (usersError) throw usersError;

    // Get active subscriptions
    const { count: activeSubscriptions, error: subsError } = await supabase
      .from('v2_users')
      .select('*', { count: 'exact', head: true })
      .eq('subscription_status', 'active');

    if (subsError) throw subsError;

    // Get total projects
    const { count: totalProjects, error: projectsError } = await supabase
      .from('v2_projects')
      .select('*', { count: 'exact', head: true });

    if (projectsError) throw projectsError;

    res.json({
      totalUsers: totalUsers || 0,
      activeSubscriptions: activeSubscriptions || 0,
      totalProjects: totalProjects || 0,
      creditsUsed: 0, // TODO: Implement credit tracking
    });
  } catch (error: any) {
    console.error('Failed to fetch stats:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch stats' });
  }
});

// PATCH /api/admin/users/:id/role - Update user role
router.patch('/admin/users/:id/role', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const { error } = await supabase
      .from('v2_users')
      .update({ role })
      .eq('id', id);

    if (error) throw error;

    res.json({ success: true });
  } catch (error: any) {
    console.error('Failed to update user role:', error);
    res.status(500).json({ message: error.message || 'Failed to update user role' });
  }
});

// PATCH /api/admin/ai-settings/:id - Update AI provider settings
router.patch('/admin/ai-settings/:id', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { api_key, model, config } = req.body;

    const updates: any = {};
    if (api_key !== undefined) updates.api_key = api_key;
    if (model !== undefined) updates.model = model;
    if (config !== undefined) updates.config = config;
    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('v2_ai_settings')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Return without exposing the API key
    const safeData = { ...data };
    if (safeData.api_key) {
      safeData.api_key = '***';
    }

    res.json(safeData);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to update AI settings' });
  }
});

export const adminRouter = router;
