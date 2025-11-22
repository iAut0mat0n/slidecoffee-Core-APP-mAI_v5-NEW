import { Router, Response } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { getAuthenticatedSupabaseClient } from '../utils/supabase-auth.js';
import { validateLength, MAX_LENGTHS } from '../utils/validation.js';

const router = Router();

// GET /api/brands - List all brands
router.get('/brands', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { supabase } = await getAuthenticatedSupabaseClient(req);
    const workspaceId = req.user?.workspaceId;

    const { data, error } = await supabase
      .from('v2_brands')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch brands' });
  }
});

// GET /api/brands/:id - Get single brand
router.get('/brands/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { supabase } = await getAuthenticatedSupabaseClient(req);

    const { data, error } = await supabase
      .from('v2_brands')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch brand' });
  }
});

// POST /api/brands - Create brand (with limit enforcement)
router.post('/brands', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { supabase } = await getAuthenticatedSupabaseClient(req);
    const workspaceId = req.user?.workspaceId;
    const userPlan = req.user?.plan || 'espresso';

    // Validate input lengths
    const nameError = validateLength(req.body.name, 'Brand name', MAX_LENGTHS.BRAND_NAME, 1);
    if (nameError) {
      return res.status(400).json({ error: nameError.message });
    }

    // Enforce brand limits (Espresso: 1 brand, paid plans: unlimited)
    if (userPlan === 'espresso') {
      const { count } = await supabase
        .from('v2_brands')
        .select('*', { count: 'exact', head: true })
        .eq('workspace_id', workspaceId);

      if (count && count >= 1) {
        return res.status(403).json({
          error: 'Brand limit reached',
          message: 'Free plan limited to 1 brand. Upgrade to create more brands.',
          limit: 1,
          current: count,
          upgradeRequired: true,
        });
      }
    }

    const { data, error } = await supabase
      .from('v2_brands')
      .insert([{ ...req.body, workspace_id: workspaceId }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to create brand' });
  }
});

// PUT /api/brands/:id - Update brand
router.put('/brands/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { supabase } = await getAuthenticatedSupabaseClient(req);

    const { data, error } = await supabase
      .from('v2_brands')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to update brand' });
  }
});

// DELETE /api/brands/:id - Delete brand
router.delete('/brands/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { supabase } = await getAuthenticatedSupabaseClient(req);

    const { error } = await supabase
      .from('v2_brands')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to delete brand' });
  }
});

export const brandsRouter = router;

