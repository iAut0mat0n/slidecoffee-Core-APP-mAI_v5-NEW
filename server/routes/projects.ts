import { Router, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { validateLength, MAX_LENGTHS } from '../utils/validation.js';

const router = Router();

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// GET /api/projects - List all projects
router.get('/projects', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('v2_projects')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch projects' });
  }
});

// GET /api/projects/:id - Get single project
router.get('/projects/:id', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('v2_projects')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch project' });
  }
});

// POST /api/projects - Create project
router.post('/projects', async (req: Request, res: Response) => {
  try {
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

    const { data, error} = await supabase
      .from('v2_projects')
      .insert([req.body])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to create project' });
  }
});

// PUT /api/projects/:id - Update project
router.put('/projects/:id', async (req: Request, res: Response) => {
  try {
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

    const { data, error } = await supabase
      .from('v2_projects')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to update project' });
  }
});

// DELETE /api/projects/:id - Delete project
router.delete('/projects/:id', async (req: Request, res: Response) => {
  try {
    const { error } = await supabase
      .from('v2_projects')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to delete project' });
  }
});

export const projectsRouter = router;

