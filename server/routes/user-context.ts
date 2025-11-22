import { Router, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { UserContextManager } from '../utils/user-context.js';

const router = Router();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''
);

// Middleware to verify auth token
const requireAuth = async (req: Request, res: Response, next: Function) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    (req as any).user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
};

// Get user context
router.get('/user-context', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { contextType, contextKey, workspaceId } = req.query;

    const contexts = await UserContextManager.getContext(
      user.id,
      contextType as string || '',
      contextKey as string,
      workspaceId as string
    );

    res.json({ success: true, contexts });
  } catch (error: any) {
    console.error('Error fetching user context:', error);
    // Don't expose internal error details to client
    res.status(500).json({ 
      error: 'Failed to fetch user context'
    });
  }
});

// Set/update user context
router.post('/user-context', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { contextType, contextKey, contextValue, workspaceId, metadata } = req.body;

    // Input validation
    if (!contextType || !contextKey || contextValue === undefined) {
      return res.status(400).json({ 
        error: 'contextType, contextKey, and contextValue are required' 
      });
    }

    // Validate context type
    const validTypes = ['preference', 'conversation', 'insight', 'project_info', 'skill', 'goal'];
    if (!validTypes.includes(contextType)) {
      return res.status(400).json({ 
        error: 'Invalid context type' 
      });
    }

    // Validate key length
    if (contextKey.length > 255) {
      return res.status(400).json({ 
        error: 'Context key too long (max 255 characters)' 
      });
    }

    // Validate value size (prevent DoS)
    const valueSize = JSON.stringify(contextValue).length;
    if (valueSize > 50000) { // 50KB limit
      return res.status(400).json({ 
        error: 'Context value too large (max 50KB)' 
      });
    }

    await UserContextManager.setContext({
      userId: user.id,
      workspaceId,
      contextType,
      contextKey,
      contextValue,
      metadata,
    });

    res.json({ success: true, message: 'User context saved successfully' });
  } catch (error: any) {
    console.error('Error setting user context:', error);
    // Don't expose internal error details to client
    res.status(500).json({ 
      error: 'Failed to save user context'
    });
  }
});

// Delete user context
router.delete('/user-context', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { contextType, contextKey, workspaceId } = req.query;

    if (!contextType || !contextKey) {
      return res.status(400).json({ 
        error: 'contextType and contextKey are required' 
      });
    }

    await UserContextManager.deleteContext(
      user.id,
      contextType as string,
      contextKey as string,
      workspaceId as string
    );

    res.json({ success: true, message: 'User context deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting user context:', error);
    // Don't expose internal error details to client
    res.status(500).json({ 
      error: 'Failed to delete user context'
    });
  }
});

// Get user profile (formatted for AI)
router.get('/user-profile', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { workspaceId } = req.query;

    const profile = await UserContextManager.getUserProfile(
      user.id,
      workspaceId as string
    );

    res.json({ success: true, profile });
  } catch (error: any) {
    console.error('Error fetching user profile:', error);
    // Don't expose internal error details to client
    res.status(500).json({ 
      error: 'Failed to fetch user profile'
    });
  }
});

export { router as userContextRouter };
