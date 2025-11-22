import { Router, Request, Response } from 'express';
import { validateLength, MAX_LENGTHS } from '../utils/validation.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { getAuthenticatedSupabaseClient } from '../utils/supabase-auth.js';

const router = Router();

// GET /api/projects - List all projects for authenticated user's workspace
router.get('/projects', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const workspaceId = req.user?.workspaceId;
    if (!workspaceId) {
      return res.status(401).json({ message: 'Workspace not found' });
    }

    const { supabase } = await getAuthenticatedSupabaseClient(req);
    
    const { data, error } = await supabase
      .from('v2_projects')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch projects' });
  }
});

// GET /api/projects/:id - Get single project
router.get('/projects/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const workspaceId = req.user?.workspaceId;
    if (!workspaceId) {
      return res.status(401).json({ message: 'Workspace not found' });
    }

    const { supabase } = await getAuthenticatedSupabaseClient(req);
    
    const { data, error } = await supabase
      .from('v2_projects')
      .select('*')
      .eq('id', req.params.id)
      .eq('workspace_id', workspaceId)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch project' });
  }
});

// POST /api/projects - Create project
router.post('/projects', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const workspaceId = req.user?.workspaceId;
    if (!workspaceId) {
      return res.status(401).json({ message: 'Workspace not found' });
    }

    // Validate project name
    const nameError = validateLength(req.body.name, 'Project name', MAX_LENGTHS.PRESENTATION_TITLE, 1);
    if (nameError) {
      return res.status(400).json({ error: nameError.message });
    }

    // Validate description if provided
    if (req.body.description) {
      const descError = validateLength(req.body.description, 'Description', MAX_LENGTHS.PRESENTATION_DESCRIPTION, 0, false);
      if (descError) {
        return res.status(400).json({ error: descError.message });
      }
    }

    const { supabase } = await getAuthenticatedSupabaseClient(req);
    
    const { data, error} = await supabase
      .from('v2_projects')
      .insert([{ ...req.body, workspace_id: workspaceId }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to create project' });
  }
});

// PUT /api/projects/:id - Update project
router.put('/projects/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const workspaceId = req.user?.workspaceId;
    if (!workspaceId) {
      return res.status(401).json({ message: 'Workspace not found' });
    }

    // Validate name if provided
    if (req.body.name) {
      const nameError = validateLength(req.body.name, 'Project name', MAX_LENGTHS.PRESENTATION_TITLE, 1);
      if (nameError) {
        return res.status(400).json({ error: nameError.message });
      }
    }

    // Validate description if provided
    if (req.body.description) {
      const descError = validateLength(req.body.description, 'Description', MAX_LENGTHS.PRESENTATION_DESCRIPTION, 0, false);
      if (descError) {
        return res.status(400).json({ error: descError.message });
      }
    }

    const { supabase } = await getAuthenticatedSupabaseClient(req);
    
    const { data, error } = await supabase
      .from('v2_projects')
      .update(req.body)
      .eq('id', req.params.id)
      .eq('workspace_id', workspaceId)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to update project' });
  }
});

// DELETE /api/projects/:id - Delete project
router.delete('/projects/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const workspaceId = req.user?.workspaceId;
    if (!workspaceId) {
      return res.status(401).json({ message: 'Workspace not found' });
    }

    const { supabase } = await getAuthenticatedSupabaseClient(req);
    
    const { error } = await supabase
      .from('v2_projects')
      .delete()
      .eq('id', req.params.id)
      .eq('workspace_id', workspaceId);

    if (error) throw error;
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to delete project' });
  }
});

export const projectsRouter = router;

