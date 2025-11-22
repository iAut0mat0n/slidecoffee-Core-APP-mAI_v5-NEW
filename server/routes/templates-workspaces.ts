import { Router, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { validateLength, MAX_LENGTHS } from '../utils/validation.js';

const router = Router();

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// TEMPLATES
router.get('/templates', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('v2_templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch templates' });
  }
});

router.get('/templates/:id', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('v2_templates')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch template' });
  }
});

// WORKSPACES
router.get('/workspaces', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('v2_workspaces')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch workspaces' });
  }
});

router.post('/workspaces', async (req: Request, res: Response) => {
  try {
    // Validate workspace name
    const nameError = validateLength(req.body.name, 'Workspace name', MAX_LENGTHS.WORKSPACE_NAME, 1);
    if (nameError) {
      return res.status(400).json({ error: nameError.message });
    }

    const { data, error } = await supabase
      .from('v2_workspaces')
      .insert([req.body])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to create workspace' });
  }
});

export const templatesWorkspacesRouter = router;

