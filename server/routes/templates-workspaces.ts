import { Router, Request, Response } from 'express';
import { validateLength, MAX_LENGTHS } from '../utils/validation.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { getAuthenticatedSupabaseClient } from '../utils/supabase-auth.js';
import { db } from '../db.js';
import { v2Workspaces, v2WorkspaceMembers, v2Users } from '../../shared/schema.js';
import { eq, desc } from 'drizzle-orm';

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

    // Use Replit PostgreSQL with Drizzle ORM
    const workspaces = await db
      .select()
      .from(v2Workspaces)
      .where(eq(v2Workspaces.id, workspaceId))
      .orderBy(desc(v2Workspaces.createdAt));

    res.json(workspaces);
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

    // Use transaction to ensure atomic workspace creation
    const workspace = await db.transaction(async (tx) => {
      // 1. Create workspace
      const [newWorkspace] = await tx
        .insert(v2Workspaces)
        .values({
          name: req.body.name,
          ownerId: userId,
        })
        .returning();

      // 2. Create workspace membership for the owner
      await tx
        .insert(v2WorkspaceMembers)
        .values({
          workspaceId: newWorkspace.id,
          userId: userId,
          role: 'owner',
        })
        .onConflictDoNothing();

      // 3. Update user's default workspace
      const updatedUsers = await tx
        .update(v2Users)
        .set({ defaultWorkspaceId: newWorkspace.id })
        .where(eq(v2Users.id, userId))
        .returning({ id: v2Users.id });

      // Verify user was updated (throw to rollback transaction if not)
      if (!updatedUsers || updatedUsers.length === 0) {
        throw new Error(`Failed to update user default workspace - user ${userId} not found`);
      }

      return newWorkspace;
    });

    res.status(201).json(workspace);
  } catch (error: any) {
    console.error('Error creating workspace:', error);
    res.status(500).json({ message: error.message || 'Failed to create workspace' });
  }
});

export const templatesWorkspacesRouter = router;

