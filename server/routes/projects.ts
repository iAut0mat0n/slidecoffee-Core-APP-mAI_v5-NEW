import { Router, Response } from 'express';
import { validateLength, MAX_LENGTHS } from '../utils/validation.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { db } from '../db.js';
import { v2Projects } from '../../shared/schema.js';
import { eq, desc, and } from 'drizzle-orm';

const router = Router();

router.get('/projects', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const workspaceId = req.user?.workspaceId;
    if (!workspaceId) {
      return res.status(401).json({ message: 'Workspace not found' });
    }

    const projects = await db
      .select()
      .from(v2Projects)
      .where(eq(v2Projects.workspaceId, workspaceId))
      .orderBy(desc(v2Projects.updatedAt));

    res.json(projects);
  } catch (error: any) {
    console.error('Failed to fetch projects:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch projects' });
  }
});

router.get('/projects/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const workspaceId = req.user?.workspaceId;
    if (!workspaceId) {
      return res.status(401).json({ message: 'Workspace not found' });
    }

    const [project] = await db
      .select()
      .from(v2Projects)
      .where(and(
        eq(v2Projects.id, req.params.id),
        eq(v2Projects.workspaceId, workspaceId)
      ))
      .limit(1);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(project);
  } catch (error: any) {
    console.error('Failed to fetch project:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch project' });
  }
});

router.post('/projects', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const workspaceId = req.user?.workspaceId;
    if (!workspaceId) {
      return res.status(401).json({ message: 'Workspace not found' });
    }

    const nameError = validateLength(req.body.name, 'Project name', MAX_LENGTHS.PRESENTATION_TITLE, 1);
    if (nameError) {
      return res.status(400).json({ error: nameError.message });
    }

    if (req.body.description) {
      const descError = validateLength(req.body.description, 'Description', MAX_LENGTHS.PRESENTATION_DESCRIPTION, 0, false);
      if (descError) {
        return res.status(400).json({ error: descError.message });
      }
    }

    const [newProject] = await db
      .insert(v2Projects)
      .values({
        workspaceId,
        name: req.body.name,
        description: req.body.description,
        brandId: req.body.brandId || req.body.brand_id,
      })
      .returning();

    res.status(201).json(newProject);
  } catch (error: any) {
    console.error('Failed to create project:', error);
    res.status(500).json({ message: error.message || 'Failed to create project' });
  }
});

router.put('/projects/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const workspaceId = req.user?.workspaceId;
    if (!workspaceId) {
      return res.status(401).json({ message: 'Workspace not found' });
    }

    if (req.body.name) {
      const nameError = validateLength(req.body.name, 'Project name', MAX_LENGTHS.PRESENTATION_TITLE, 1);
      if (nameError) {
        return res.status(400).json({ error: nameError.message });
      }
    }

    if (req.body.description) {
      const descError = validateLength(req.body.description, 'Description', MAX_LENGTHS.PRESENTATION_DESCRIPTION, 0, false);
      if (descError) {
        return res.status(400).json({ error: descError.message });
      }
    }

    const updateData: any = {};
    if (req.body.name !== undefined) updateData.name = req.body.name;
    if (req.body.description !== undefined) updateData.description = req.body.description;
    if (req.body.brandId !== undefined || req.body.brand_id !== undefined) 
      updateData.brandId = req.body.brandId || req.body.brand_id;
    updateData.updatedAt = new Date();

    const [updatedProject] = await db
      .update(v2Projects)
      .set(updateData)
      .where(and(
        eq(v2Projects.id, req.params.id),
        eq(v2Projects.workspaceId, workspaceId)
      ))
      .returning();

    if (!updatedProject) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(updatedProject);
  } catch (error: any) {
    console.error('Failed to update project:', error);
    res.status(500).json({ message: error.message || 'Failed to update project' });
  }
});

router.delete('/projects/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const workspaceId = req.user?.workspaceId;
    if (!workspaceId) {
      return res.status(401).json({ message: 'Workspace not found' });
    }

    const result = await db
      .delete(v2Projects)
      .where(and(
        eq(v2Projects.id, req.params.id),
        eq(v2Projects.workspaceId, workspaceId)
      ))
      .returning();

    if (result.length === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.status(204).send();
  } catch (error: any) {
    console.error('Failed to delete project:', error);
    res.status(500).json({ message: error.message || 'Failed to delete project' });
  }
});

export const projectsRouter = router;
