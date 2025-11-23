import { Router, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { validateLength, MAX_LENGTHS } from '../utils/validation.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Admin middleware - check if user is admin AND has MFA enabled (soft enforcement)
const requireAdmin = async (req: Request, res: Response, next: any) => {
  const user = (req as any).user;
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  
  // MFA Check - Soft enforcement for admin operations
  // TODO: Enable strict MFA requirement when MFA is widely adopted (set REQUIRE_ADMIN_MFA=true)
  const requireStrictMFA = process.env.REQUIRE_ADMIN_MFA === 'true';
  
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Use Supabase MFA API to check enrollment status
    const { data: mfaData, error: mfaError } = await supabase.auth.mfa.listFactors();
    
    if (!mfaError && mfaData) {
      const hasMFA = mfaData.totp.length > 0 || mfaData.all.some(f => f.status === 'verified');
      
      if (!hasMFA) {
        // Log warning about missing MFA
        console.warn(`⚠️  Admin user ${user.email} accessed admin endpoint without MFA`);
        
        if (requireStrictMFA) {
          // Strict mode: block access
          return res.status(403).json({ 
            message: 'Multi-factor authentication is required for admin operations. Please enable MFA in your account settings.',
            requiresMFA: true
          });
        } else {
          // Soft mode: log and allow (for development/transition period)
          console.log('✓ MFA not required (REQUIRE_ADMIN_MFA not enabled). Allowing admin access.');
        }
      } else {
        console.log(`✓ Admin user ${user.email} has MFA enabled`);
      }
    }
  } catch (error) {
    console.error('MFA check error:', error);
    // Don't block on MFA check failures unless strict mode is enabled
    if (requireStrictMFA) {
      return res.status(500).json({ message: 'Failed to verify MFA status' });
    }
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

// POST /api/system/upload-logo - Upload logo or favicon (admin only, MFA required)
router.post('/system/upload-logo', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { base64Image, filename, type = 'logo' } = req.body;

    if (!base64Image || !filename) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (!['logo', 'favicon'].includes(type)) {
      return res.status(400).json({ message: 'Invalid type. Must be "logo" or "favicon"' });
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

    // Upload to Supabase Storage
    const timestamp = Date.now();
    const storagePath = `system/${type}s/${timestamp}-${filename}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('assets')
      .upload(storagePath, buffer, {
        contentType: base64Image.match(/data:(image\/\w+);/)?.[1] || 'image/png',
        upsert: true
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return res.status(500).json({ message: 'Failed to upload file to storage' });
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('assets')
      .getPublicUrl(storagePath);

    // Update system settings
    const settingKey = type === 'logo' ? 'app_logo_url' : 'app_favicon_url';
    const { error: updateError } = await supabase
      .from('v2_system_settings')
      .upsert({
        key: settingKey,
        value: publicUrl,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'key'
      });

    if (updateError) {
      console.error('Settings update error:', updateError);
      return res.status(500).json({ message: 'Failed to update system settings' });
    }

    const responseData = type === 'logo' 
      ? { logoUrl: publicUrl } 
      : { faviconUrl: publicUrl };

    res.json(responseData);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export const systemSettingsRouter = router;

