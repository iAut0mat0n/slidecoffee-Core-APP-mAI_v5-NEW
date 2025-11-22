import { Router, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { validateLength, MAX_LENGTHS } from '../utils/validation.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Admin middleware - check if user is admin
const requireAdmin = async (req: Request, res: Response, next: any) => {
  const user = (req as any).user;
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// GET /api/system/settings - Get all system settings
router.get('/system/settings', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('v2_system_settings')
      .select('*');

    if (error) {
      return res.status(500).json({ message: 'Failed to fetch system settings' });
    }

    // Convert array to key-value object
    const settings: Record<string, string> = {};
    data?.forEach((setting: any) => {
      settings[setting.key] = setting.value;
    });

    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/system/upload-logo - Upload logo (admin only)
router.post('/system/upload-logo', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { base64Image, filename } = req.body;

    if (!base64Image || !filename) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Validate filename length
    const filenameError = validateLength(filename, 'Filename', MAX_LENGTHS.PRESENTATION_TITLE);
    if (filenameError) {
      return res.status(400).json({ message: filenameError.message });
    }

    // Validate base64 image size (1MB max to prevent DoS)
    const MAX_IMAGE_SIZE = 1 * 1024 * 1024; // 1MB in bytes
    const estimatedSize = base64Image.length * 0.75; // Base64 is ~33% larger than binary
    if (estimatedSize > MAX_IMAGE_SIZE) {
      return res.status(400).json({ 
        message: `Image size exceeds maximum allowed size of ${MAX_IMAGE_SIZE / (1024 * 1024)}MB` 
      });
    }

    // Convert base64 to buffer
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // TODO: Upload to S3 storage
    // For now, using a placeholder URL
    const timestamp = Date.now();
    const logoUrl = `/uploads/logos/${timestamp}-${filename}`;

    // Update system settings
    const { error } = await supabase
      .from('v2_system_settings')
      .update({ value: logoUrl, updated_at: new Date().toISOString() })
      .eq('key', 'app_logo_url');

    if (error) {
      return res.status(500).json({ message: 'Failed to update logo setting' });
    }

    res.json({ logoUrl });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

export const systemSettingsRouter = router;

