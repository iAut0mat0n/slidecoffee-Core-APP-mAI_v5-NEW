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
      console.error('❌ Workspace creation failed: No userId in req.user');
      return res.status(401).json({ message: 'User not found' });
    }

    console.log(`🏢 Creating workspace for user: ${userId}`, req.body);

    // Validate workspace name
    const nameError = validateLength(req.body.name, 'Workspace name', MAX_LENGTHS.WORKSPACE_NAME, 1);
    if (nameError) {
      console.error('❌ Validation error:', nameError.message);
      return res.status(400).json({ error: nameError.message });
    }

    // Use transaction to ensure atomic workspace creation
    const workspace = await db.transaction(async (tx) => {
      // 1. Create workspace
      console.log('📝 Step 1: Creating workspace...');
      const [newWorkspace] = await tx
        .insert(v2Workspaces)
        .values({
          name: req.body.name,
          ownerId: userId,
        })
        .returning();
      console.log(`✅ Workspace created: ${newWorkspace.id}`);

      // 2. Create workspace membership for the owner
      console.log('📝 Step 2: Creating workspace membership...');
      await tx
        .insert(v2WorkspaceMembers)
        .values({
          workspaceId: newWorkspace.id,
          userId: userId,
          role: 'owner',
        })
        .onConflictDoNothing();
      console.log('✅ Membership created');

      // 3. Update user's default workspace
      console.log(`📝 Step 3: Updating user ${userId} defaultWorkspaceId to ${newWorkspace.id}...`);
      const updatedUsers = await tx
        .update(v2Users)
        .set({ defaultWorkspaceId: newWorkspace.id })
        .where(eq(v2Users.id, userId))
        .returning({ id: v2Users.id, defaultWorkspaceId: v2Users.defaultWorkspaceId });

      console.log('📊 Update result:', updatedUsers);

      // Verify user was updated (throw to rollback transaction if not)
      if (!updatedUsers || updatedUsers.length === 0) {
        console.error(`❌ User update failed - no rows returned for userId: ${userId}`);
        throw new Error(`Failed to update user default workspace - user ${userId} not found`);
      }

      console.log(`✅ User ${userId} updated with defaultWorkspaceId: ${newWorkspace.id}`);
      return newWorkspace;
    });

    console.log('🎉 Workspace creation transaction complete:', workspace);
    res.status(201).json(workspace);
  } catch (error: any) {
    console.error('❌ Error creating workspace:', error);
    res.status(500).json({ message: error.message || 'Failed to create workspace' });
  }
});

export const templatesWorkspacesRouter = router;

