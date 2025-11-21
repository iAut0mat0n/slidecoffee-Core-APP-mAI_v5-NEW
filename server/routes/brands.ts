import { Router, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';

const router = Router();

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// GET /api/brands - List all brands
router.get('/brands', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('v2_brands')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch brands' });
  }
});

// POST /api/brands - Create brand
router.post('/brands', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('v2_brands')
      .insert([req.body])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to create brand' });
  }
});

// PUT /api/brands/:id - Update brand
router.put('/brands/:id', async (req: Request, res: Response) => {
  try {
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
router.delete('/brands/:id', async (req: Request, res: Response) => {
  try {
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

