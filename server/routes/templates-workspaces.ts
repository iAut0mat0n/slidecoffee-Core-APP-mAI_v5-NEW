import { Router, Request, Response } from 'express';
import { validateLength, MAX_LENGTHS } from '../utils/validation.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { getAuthenticatedSupabaseClient } from '../utils/supabase-auth.js';

const router = Router();

// TEMPLATES - Public templates (accessible to all users)
router.get('/templates', async (req: Request, res: Response) => {
  try {
    // Templates are public - use anon key for consistent access
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_ANON_KEY || ''
    );
    
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
    // Templates are public - use anon key for consistent access
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_ANON_KEY || ''
    );
    
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

// WORKSPACES - Require authentication to list workspaces
router.get('/workspaces', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const workspaceId = req.user?.workspaceId;
    if (!workspaceId) {
      return res.status(401).json({ message: 'Workspace not found' });
    }

    const { supabase } = await getAuthenticatedSupabaseClient(req);
    
    // Only return the user's workspace (workspace-scoped)
    const { data, error } = await supabase
      .from('v2_workspaces')
      .select('*')
      .eq('id', workspaceId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch workspaces' });
  }
});

router.post('/workspaces', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Validate workspace name
    const nameError = validateLength(req.body.name, 'Workspace name', MAX_LENGTHS.WORKSPACE_NAME, 1);
    if (nameError) {
      return res.status(400).json({ error: nameError.message });
    }

    const { supabase } = await getAuthenticatedSupabaseClient(req);
    
    const { data, error } = await supabase
      .from('v2_workspaces')
      .insert([{ ...req.body, owner_id: userId }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to create workspace' });
  }
});

export const templatesWorkspacesRouter = router;

