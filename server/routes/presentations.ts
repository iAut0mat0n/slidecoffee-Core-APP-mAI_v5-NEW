import { Router, Response } from 'express';
import { requireAuth as sharedRequireAuth, AuthRequest } from '../middleware/auth.js';
import { getAuthenticatedSupabaseClient } from '../utils/supabase-auth.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = Router();

if (!process.env.JWT_SECRET) {
  throw new Error('FATAL: JWT_SECRET environment variable is required for secure share link generation. Please set JWT_SECRET in your environment.');
}

const JWT_SECRET = process.env.JWT_SECRET;

interface ShareSettings {
  enabled: boolean;
  access: 'unlimited' | 'limited';
  passwordHash?: string;
  expiresAt?: string;
}

interface ShareTokenPayload {
  presentationId: string;
  access: 'unlimited' | 'limited';
  workspaceId?: string;
  expiresAt?: number;
}

// Verify user owns/has access to presentation
const verifyPresentationAccess = async (
  supabase: any,
  presentationId: string, 
  userId: string, 
  workspaceId: string | undefined
): Promise<{ authorized: boolean; presentation?: any; error?: string }> => {
  const { data: presentation, error } = await supabase
    .from('v2_presentations')
    .select('*')
    .eq('id', presentationId)
    .single();

  if (error || !presentation) {
    return { authorized: false, error: 'Presentation not found' };
  }

  if (!workspaceId) {
    return { authorized: false, error: 'User workspace not found' };
  }

  // Check if presentation belongs to user's workspace
  if (presentation.workspace_id !== workspaceId) {
    return { authorized: false, error: 'Forbidden - No access to this presentation' };
  }

  return { authorized: true, presentation };
};

// Generate share link for presentation
router.post('/presentations/:id/share', sharedRequireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { access = 'unlimited', password, expiresAt } = req.body;
    const userId = req.user?.id;
    const workspaceId = req.user?.workspaceId;

    if (!userId || !workspaceId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Get authenticated Supabase client
    const { supabase } = await getAuthenticatedSupabaseClient(req);

    // Verify user owns this presentation
    const { authorized, presentation, error: authError } = await verifyPresentationAccess(supabase, id, userId, workspaceId);
    if (!authorized) {
      return res.status(presentation ? 403 : 404).json({ error: authError });
    }

    // For limited access, password is ALWAYS required
    if (access === 'limited' && (!password || !password.trim())) {
      return res.status(400).json({ error: 'Password is required for limited access mode' });
    }

    // Validate expiration
    let expiryTimestamp = undefined;
    if (expiresAt) {
      const expiryDate = new Date(expiresAt);
      if (expiryDate <= new Date()) {
        return res.status(400).json({ error: 'Expiration date must be in the future' });
      }
      expiryTimestamp = expiryDate.getTime();
    }

    // Hash password (required for limited mode, optional for unlimited)
    let passwordHash = undefined;
    if (password && password.trim()) {
      passwordHash = await bcrypt.hash(password, 10);
    }

    // Generate JWT-based share token
    const tokenPayload: ShareTokenPayload = {
      presentationId: id,
      access,
      ...(workspaceId && { workspaceId }),
      ...(expiryTimestamp && { expiresAt: expiryTimestamp })
    };

    const shareToken = jwt.sign(tokenPayload, JWT_SECRET, {
      expiresIn: expiryTimestamp ? Math.floor((expiryTimestamp - Date.now()) / 1000) : '30d'
    });

    // Update presentation with share settings (MUST include passwordHash for limited mode)
    const shareSettings: ShareSettings = {
      enabled: true,
      access,
      passwordHash,  // Include passwordHash even if undefined for unlimited mode
      ...(expiresAt && { expiresAt })
    };

    const { data, error } = await supabase
      .from('v2_presentations')
      .update({
        share_token: shareToken,
        is_public: true,
        share_settings: shareSettings
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Generate share URL
    const shareUrl = `${req.protocol}://${req.get('host')}/present/${shareToken}`;

    res.json({
      success: true,
      shareToken,
      shareUrl,
      shareSettings: {
        enabled: true,
        access,
        hasPassword: !!password,
        expiresAt
      }
    });
  } catch (error: any) {
    console.error('Error generating share link:', error);
    res.status(500).json({ 
      error: 'Failed to generate share link',
      details: error.message 
    });
  }
});

// Get share settings for a presentation
router.get('/presentations/:id/share', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;
    const workspaceId = (req as any).workspaceId;

    // Verify user owns this presentation
    const { authorized, presentation, error: authError } = await verifyPresentationAccess(id, user.id, workspaceId);
    if (!authorized) {
      return res.status(presentation ? 403 : 404).json({ error: authError });
    }

    if (!presentation.is_public || !presentation.share_settings) {
      return res.json({
        success: true,
        enabled: false,
        shareUrl: null
      });
    }

    const settings = presentation.share_settings as ShareSettings;
    const shareUrl = presentation.share_token 
      ? `${req.protocol}://${req.get('host')}/present/${presentation.share_token}`
      : null;

    res.json({
      success: true,
      enabled: settings.enabled,
      access: settings.access,
      hasPassword: !!settings.passwordHash,
      expiresAt: settings.expiresAt,
      shareUrl
    });
  } catch (error: any) {
    console.error('Error fetching share settings:', error);
    res.status(500).json({ 
      error: 'Failed to fetch share settings',
      details: error.message 
    });
  }
});

// Revoke share link
router.delete('/presentations/:id/share', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;
    const workspaceId = (req as any).workspaceId;

    // Verify user owns this presentation
    const { authorized, presentation, error: authError } = await verifyPresentationAccess(id, user.id, workspaceId);
    if (!authorized) {
      return res.status(presentation ? 403 : 404).json({ error: authError });
    }

    const { data, error } = await supabase
      .from('v2_presentations')
      .update({
        share_token: null,
        is_public: false,
        share_settings: {
          enabled: false,
          access: 'unlimited'
        }
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true });
  } catch (error: any) {
    console.error('Error revoking share link:', error);
    res.status(500).json({ 
      error: 'Failed to revoke share link',
      details: error.message 
    });
  }
});

// Update share settings (PATCH handler)
router.patch('/presentations/:id/share', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { enabled, access, password, expiresAt } = req.body;
    const user = (req as any).user;
    const workspaceId = (req as any).workspaceId;

    // Verify user owns this presentation
    const { authorized, presentation, error: authError } = await verifyPresentationAccess(id, user.id, workspaceId);
    if (!authorized) {
      return res.status(presentation ? 403 : 404).json({ error: authError });
    }

    // If disabled, clear all share settings
    if (!enabled) {
      const { data, error } = await supabase
        .from('v2_presentations')
        .update({
          share_token: null,
          is_public: false,
          share_settings: {
            enabled: false,
            access: 'unlimited'
          }
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return res.json({
        success: true,
        enabled: false,
        shareUrl: null
      });
    }

    // For limited access, password is ALWAYS required
    if (access === 'limited' && (!password || !password.trim())) {
      return res.status(400).json({ error: 'Password is required for limited access mode' });
    }

    // Validate expiration
    let expiryTimestamp = undefined;
    if (expiresAt) {
      const expiryDate = new Date(expiresAt);
      if (expiryDate <= new Date()) {
        return res.status(400).json({ error: 'Expiration date must be in the future' });
      }
      expiryTimestamp = expiryDate.getTime();
    }

    // Hash password (required for limited mode, optional for unlimited)
    let passwordHash = undefined;
    if (password && password.trim()) {
      passwordHash = await bcrypt.hash(password, 10);
    }

    // Generate NEW token to invalidate old ones
    const tokenPayload: ShareTokenPayload = {
      presentationId: id,
      access: access || 'unlimited',
      ...(workspaceId && { workspaceId }),
      ...(expiryTimestamp && { expiresAt: expiryTimestamp })
    };

    const shareToken = jwt.sign(tokenPayload, JWT_SECRET, {
      expiresIn: expiryTimestamp ? Math.floor((expiryTimestamp - Date.now()) / 1000) : '30d'
    });

    const shareSettings: ShareSettings = {
      enabled,
      access: access || 'unlimited',
      passwordHash,  // Include passwordHash even if undefined for unlimited mode
      ...(expiresAt && { expiresAt })
    };

    const { data, error } = await supabase
      .from('v2_presentations')
      .update({
        share_token: shareToken,
        is_public: enabled,
        share_settings: shareSettings
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    const shareUrl = `${req.protocol}://${req.get('host')}/present/${shareToken}`;

    res.json({
      success: true,
      enabled,
      access: access || 'unlimited',
      hasPassword: !!password,
      expiresAt,
      shareUrl
    });
  } catch (error: any) {
    console.error('Error updating share settings:', error);
    res.status(500).json({ 
      error: 'Failed to update share settings',
      details: error.message 
    });
  }
});

// Verify password for presentation (POST to prevent password in URL)
router.post('/present/:shareToken/verify', async (req: Request, res: Response) => {
  try {
    const { shareToken } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    // Decode JWT token
    let decoded: ShareTokenPayload;
    try {
      decoded = jwt.verify(shareToken, JWT_SECRET) as ShareTokenPayload;
    } catch (error) {
      return res.status(401).json({ error: 'Invalid or expired share link' });
    }

    // Check expiration
    if (decoded.expiresAt && decoded.expiresAt < Date.now()) {
      return res.status(403).json({ error: 'Share link has expired' });
    }

    const { data, error } = await supabase
      .from('v2_presentations')
      .select('*')
      .eq('id', decoded.presentationId)
      .eq('is_public', true)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Presentation not found or not shared' });
    }

    // CRITICAL: Validate that the provided token matches the current share_token
    if (data.share_token !== shareToken) {
      return res.status(401).json({ error: 'This share link has been revoked or replaced' });
    }

    const settings = data.share_settings as ShareSettings;

    // Check if password is required
    if (!settings.passwordHash) {
      return res.status(400).json({ error: 'Password not required for this presentation' });
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, settings.passwordHash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    // Return presentation data
    res.json({
      success: true,
      id: data.id,
      title: data.title,
      description: data.description,
      slides: data.slides,
      shareSettings: {
        access: settings.access,
        expiresAt: settings.expiresAt
      }
    });
  } catch (error: any) {
    console.error('Error verifying password:', error);
    res.status(500).json({ 
      error: 'Failed to verify password',
      details: error.message 
    });
  }
});

// Get public presentation by share token
router.get('/present/:shareToken', async (req: Request, res: Response) => {
  try {
    const { shareToken } = req.params;

    // Decode JWT token
    let decoded: ShareTokenPayload;
    try {
      decoded = jwt.verify(shareToken, JWT_SECRET) as ShareTokenPayload;
    } catch (error) {
      return res.status(401).json({ error: 'Invalid or expired share link' });
    }

    // Check expiration
    if (decoded.expiresAt && decoded.expiresAt < Date.now()) {
      return res.status(403).json({ error: 'Share link has expired' });
    }

    const { data, error } = await supabase
      .from('v2_presentations')
      .select('*')
      .eq('id', decoded.presentationId)
      .eq('is_public', true)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Presentation not found or not shared' });
    }

    // CRITICAL: Validate that the provided token matches the current share_token
    if (data.share_token !== shareToken) {
      return res.status(401).json({ error: 'This share link has been revoked or replaced' });
    }

    const settings = data.share_settings as ShareSettings;

    // For limited access, require password protection
    // (Future: can enforce workspace member authentication here)
    if (settings.access === 'limited' && !settings.passwordHash) {
      return res.status(403).json({ 
        error: 'Limited access requires password protection',
        requiresPassword: false
      });
    }

    // Check if password is required
    if (settings.passwordHash) {
      return res.status(401).json({ 
        error: 'Password required',
        requiresPassword: true 
      });
    }

    // Return presentation data (unlimited access, no password)
    res.json({
      success: true,
      id: data.id,
      title: data.title,
      description: data.description,
      slides: data.slides,
      shareSettings: {
        access: settings.access,
        expiresAt: settings.expiresAt
      }
    });
  } catch (error: any) {
    console.error('Error fetching public presentation:', error);
    res.status(500).json({ 
      error: 'Failed to load presentation',
      details: error.message 
    });
  }
});

export { router as presentationsRouter };
