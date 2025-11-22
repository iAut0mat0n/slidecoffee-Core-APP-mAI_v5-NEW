import { Router, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const router = Router();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.VITE_SUPABASE_ANON_KEY || ''
);

// Generate share link for presentation
router.post('/presentations/:id/share', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { access = 'unlimited', password, expiresAt } = req.body;

    // Generate unique share token
    const shareToken = crypto.randomBytes(16).toString('hex');

    // Update presentation with share settings
    const { data, error } = await supabase
      .from('v2_presentations')
      .update({
        share_token: shareToken,
        is_public: true,
        share_settings: {
          enabled: true,
          access,
          password: password || null,
          expiresAt: expiresAt || null,
        }
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Generate share URL
    const shareUrl = `${req.protocol}://${req.get('host')}/present/${shareToken}`;

    res.json({
      shareToken,
      shareUrl,
      shareSettings: data.share_settings
    });
  } catch (error: any) {
    console.error('Error generating share link:', error);
    res.status(500).json({ 
      error: 'Failed to generate share link',
      details: error.message 
    });
  }
});

// Update share settings
router.patch('/presentations/:id/share', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { enabled, access, password, expiresAt } = req.body;

    const { data, error } = await supabase
      .from('v2_presentations')
      .update({
        is_public: enabled,
        share_settings: {
          enabled,
          access: access || 'unlimited',
          password: password || null,
          expiresAt: expiresAt || null,
        }
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error: any) {
    console.error('Error updating share settings:', error);
    res.status(500).json({ 
      error: 'Failed to update share settings',
      details: error.message 
    });
  }
});

// Revoke share link
router.delete('/presentations/:id/share', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('v2_presentations')
      .update({
        share_token: null,
        is_public: false,
        share_settings: {
          enabled: false,
          access: 'unlimited',
          password: null,
          expiresAt: null,
        }
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Error revoking share link:', error);
    res.status(500).json({ 
      error: 'Failed to revoke share link',
      details: error.message 
    });
  }
});

// Get public presentation by share token
router.get('/present/:shareToken', async (req: Request, res: Response) => {
  try {
    const { shareToken } = req.params;
    const { password } = req.query;

    const { data, error } = await supabase
      .from('v2_presentations')
      .select('*')
      .eq('share_token', shareToken)
      .eq('is_public', true)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Presentation not found or not shared' });
    }

    const settings = data.share_settings || {};

    // Check if share link is expired
    if (settings.expiresAt && new Date(settings.expiresAt) < new Date()) {
      return res.status(403).json({ error: 'Share link has expired' });
    }

    // Check password if required
    if (settings.password && settings.password !== password) {
      return res.status(401).json({ 
        error: 'Password required',
        requiresPassword: true 
      });
    }

    // Return presentation data
    res.json({
      id: data.id,
      title: data.title,
      description: data.description,
      slides: data.slides,
      shareSettings: settings
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
