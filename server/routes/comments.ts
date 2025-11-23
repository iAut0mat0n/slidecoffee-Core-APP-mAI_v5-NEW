import { Router, Response } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { getAuthenticatedSupabaseClient } from '../utils/supabase-auth.js';
import { validateLength, MAX_LENGTHS } from '../utils/validation.js';

const router = Router();

/**
 * 💬 COLLABORATION: Get all comments for a presentation
 */
router.get('/presentations/:id/comments', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const workspaceId = req.user?.workspaceId;

    if (!workspaceId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { supabase } = await getAuthenticatedSupabaseClient(req);

    // Verify presentation belongs to user's workspace
    const { data: presentation } = await supabase
      .from('v2_presentations')
      .select('id, workspace_id')
      .eq('id', id)
      .eq('workspace_id', workspaceId)
      .single();

    if (!presentation) {
      return res.status(404).json({ error: 'Presentation not found' });
    }

    // Get all comments with replies structured
    const { data: comments, error } = await supabase
      .from('v2_comments')
      .select('*')
      .eq('presentation_id', id)
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Structure comments with nested replies
    const commentMap = new Map();
    const topLevelComments: any[] = [];

    comments?.forEach((comment: any) => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    comments?.forEach((comment: any) => {
      if (comment.parent_comment_id) {
        const parent = commentMap.get(comment.parent_comment_id);
        if (parent) {
          parent.replies.push(commentMap.get(comment.id));
        }
      } else {
        topLevelComments.push(commentMap.get(comment.id));
      }
    });

    res.json({
      success: true,
      comments: topLevelComments
    });
  } catch (error: any) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

/**
 * 💬 COLLABORATION: Create a new comment or reply
 */
router.post('/presentations/:id/comments', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { content, slideIndex, parentCommentId, positionX, positionY } = req.body;
    const workspaceId = req.user?.workspaceId;
    const userId = req.user?.id;
    const userName = req.user?.name || req.user?.email || 'Anonymous';
    const userEmail = req.user?.email;

    if (!workspaceId || !userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Validate content
    const contentValidation = validateLength(content, 'Comment', 5000, 1);
    if (contentValidation) {
      return res.status(400).json({ error: contentValidation.message });
    }

    if (slideIndex === undefined || slideIndex === null) {
      return res.status(400).json({ error: 'Slide index is required' });
    }

    const { supabase } = await getAuthenticatedSupabaseClient(req);

    // Verify presentation belongs to user's workspace
    const { data: presentation } = await supabase
      .from('v2_presentations')
      .select('id, workspace_id')
      .eq('id', id)
      .eq('workspace_id', workspaceId)
      .single();

    if (!presentation) {
      return res.status(404).json({ error: 'Presentation not found' });
    }

    // Create comment
    const { data: comment, error } = await supabase
      .from('v2_comments')
      .insert({
        presentation_id: id,
        workspace_id: workspaceId,
        author_id: userId,
        author_name: userName,
        author_email: userEmail,
        content,
        slide_index: slideIndex,
        parent_comment_id: parentCommentId || null,
        position_x: positionX || null,
        position_y: positionY || null
      })
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      comment: {
        ...comment,
        replies: []
      }
    });
  } catch (error: any) {
    console.error('Error creating comment:', error);
    res.status(500).json({ error: 'Failed to create comment' });
  }
});

/**
 * 💬 COLLABORATION: Resolve or unresolve a comment
 */
router.patch('/comments/:commentId/resolve', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { commentId } = req.params;
    const { resolved } = req.body;
    const userId = req.user?.id;
    const workspaceId = req.user?.workspaceId;

    if (!userId || !workspaceId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { supabase } = await getAuthenticatedSupabaseClient(req);

    // Verify comment belongs to user's workspace
    const { data: comment } = await supabase
      .from('v2_comments')
      .select('id, workspace_id')
      .eq('id', commentId)
      .eq('workspace_id', workspaceId)
      .single();

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Update resolved status
    const { data, error } = await supabase
      .from('v2_comments')
      .update({
        resolved: resolved,
        resolved_by: resolved ? userId : null,
        resolved_at: resolved ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', commentId)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      comment: data
    });
  } catch (error: any) {
    console.error('Error resolving comment:', error);
    res.status(500).json({ error: 'Failed to resolve comment' });
  }
});

/**
 * 💬 COLLABORATION: Delete a comment
 */
router.delete('/comments/:commentId', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { commentId } = req.params;
    const userId = req.user?.id;
    const workspaceId = req.user?.workspaceId;

    if (!userId || !workspaceId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { supabase } = await getAuthenticatedSupabaseClient(req);

    // Verify comment belongs to user and workspace
    const { data: comment } = await supabase
      .from('v2_comments')
      .select('id, author_id, workspace_id')
      .eq('id', commentId)
      .eq('workspace_id', workspaceId)
      .single();

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Only author can delete their own comment (or workspace admin)
    if (comment.author_id !== userId) {
      return res.status(403).json({ error: 'Only the comment author can delete this comment' });
    }

    // Delete comment (cascades to replies)
    const { error } = await supabase
      .from('v2_comments')
      .delete()
      .eq('id', commentId);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

/**
 * 💬 COLLABORATION: Update presence (heartbeat for live collaboration)
 */
router.post('/presentations/:id/presence', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { activityType, currentSlideIndex, cursorX, cursorY } = req.body;
    const workspaceId = req.user?.workspaceId;
    const userId = req.user?.id;
    const userName = req.user?.name || req.user?.email || 'Anonymous';
    const userEmail = req.user?.email;
    const userAvatar = null; // Avatar URL from Supabase profile if needed

    if (!workspaceId || !userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { supabase } = await getAuthenticatedSupabaseClient(req);

    // Upsert presence (update if exists, insert if not)
    const { data, error } = await supabase
      .from('v2_presence')
      .upsert({
        presentation_id: id,
        workspace_id: workspaceId,
        user_id: userId,
        user_name: userName,
        user_email: userEmail,
        user_avatar: userAvatar,
        activity_type: activityType || 'viewing',
        current_slide_index: currentSlideIndex,
        cursor_x: cursorX,
        cursor_y: cursorY,
        last_seen_at: new Date().toISOString()
      },
      { 
        onConflict: 'user_id,presentation_id',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      presence: data
    });
  } catch (error: any) {
    console.error('Error updating presence:', error);
    res.status(500).json({ error: 'Failed to update presence' });
  }
});

/**
 * 💬 COLLABORATION: Get active collaborators for a presentation
 */
router.get('/presentations/:id/presence', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const workspaceId = req.user?.workspaceId;

    if (!workspaceId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { supabase } = await getAuthenticatedSupabaseClient(req);

    // Get active users (seen in last 30 seconds)
    const thirtySecondsAgo = new Date(Date.now() - 30000).toISOString();

    const { data: activeUsers, error } = await supabase
      .from('v2_presence')
      .select('*')
      .eq('presentation_id', id)
      .eq('workspace_id', workspaceId)
      .gte('last_seen_at', thirtySecondsAgo)
      .order('last_seen_at', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      activeUsers: activeUsers || []
    });
  } catch (error: any) {
    console.error('Error fetching presence:', error);
    res.status(500).json({ error: 'Failed to fetch active collaborators' });
  }
});

export { router as commentsRouter };
