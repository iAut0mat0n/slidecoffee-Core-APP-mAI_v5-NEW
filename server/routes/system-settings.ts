import { Router, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { validateLength, MAX_LENGTHS } from '../utils/validation.js';
import { requireAuth } from '../middleware/auth.js';
import { getAuthenticatedSupabaseClient } from '../utils/supabase-auth.js';

const router = Router();

// Admin middleware - check if user is admin AND has MFA enabled (soft enforcement)
const requireAdmin = async (req: Request, res: Response, next: any) => {
  const user = (req as any).user;
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  
  // MFA Check - Verify AAL using authenticated Supabase client
  const requireStrictMFA = process.env.REQUIRE_ADMIN_MFA === 'true';
  
  try {
    // Get authenticated Supabase client (token already validated by requireAuth)
    const { supabase: userSupabase } = await getAuthenticatedSupabaseClient(req);
    
    // Check MFA status using authenticated client
    const { data: aalData, error: aalError } = await userSupabase.auth.mfa.getAuthenticatorAssuranceLevel();
    
    if (aalError) {
      console.error('Failed to check MFA status:', aalError);
      if (requireStrictMFA) {
        return res.status(500).json({ message: 'Authentication verification failed' });
      }
      return next();
    }
    
    const { currentLevel, nextLevel } = aalData;
    
    // If user has MFA enrolled but hasn't verified this session (nextLevel=aal2, currentLevel=aal1)
    // OR user has no MFA at all (currentLevel=aal1, nextLevel=aal1)
    if (currentLevel !== 'aal2') {
      console.warn(`⚠️  Admin user ${user.email} accessed admin endpoint without MFA (Current: ${currentLevel}, Next: ${nextLevel})`);
      
      if (requireStrictMFA) {
        return res.status(403).json({ 
          message: 'Multi-factor authentication is required for admin operations',
          requiresMFA: true,
          currentAAL: currentLevel,
          nextAAL: nextLevel
        });
      }
    } else {
      console.log(`✓ Admin user ${user.email} has MFA verified (AAL2)`);
    }
  } catch (error) {
    console.error('MFA verification error:', error);
    if (requireStrictMFA) {
      return res.status(500).json({ message: 'Authentication verification failed' });
    }
  }
  
  next();
};

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// Public-safe system setting keys (branding only)
const PUBLIC_SETTINGS_KEYS = ['app_logo_url', 'app_favicon_url', 'app_title'];

// GET /api/system/settings - Get public system settings (authentication required)
router.get('/system/settings', requireAuth, async (req: Request, res: Response) => {
  try {
    const { data, error} = await supabase
      .from('v2_system_settings')
      .select('*')
      .in('key', PUBLIC_SETTINGS_KEYS);

    if (error) {
      console.error('Failed to fetch system settings:', error);
      return res.status(500).json({ message: 'Failed to fetch system settings' });
    }

    // Convert array to key-value object
    const settings: Record<string, string> = {};
    data?.forEach((setting: any) => {
      settings[setting.key] = setting.value;
    });

    res.json(settings);
  } catch (error) {
    console.error('System settings error:', error);
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
      return res.status(400).json({ message: 'Invalid type' });
    }

    // Validate filename length
    const filenameError = validateLength(filename, 'Filename', MAX_LENGTHS.PRESENTATION_TITLE);
    if (filenameError) {
      return res.status(400).json({ message: filenameError.message });
    }

    // Normalize filename - prevent path traversal and malicious filenames
    const normalizedFilename = filename
      .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace special chars
      .replace(/\.{2,}/g, '.') // Remove multiple dots
      .slice(0, 100); // Limit length

    // Strict MIME type validation - only allow safe image types
    const mimeMatch = base64Image.match(/^data:(image\/(png|jpeg|jpg|webp|gif));base64,/);
    if (!mimeMatch) {
      return res.status(400).json({ 
        message: 'Invalid image format. Only PNG, JPEG, WEBP, and GIF are allowed. SVG is not supported for security reasons.' 
      });
    }
    const mimeType = mimeMatch[1];

    // Validate base64 image size (1MB max to prevent DoS)
    const MAX_IMAGE_SIZE = 1 * 1024 * 1024; // 1MB in bytes
    const estimatedSize = base64Image.length * 0.75; // Base64 is ~33% larger than binary
    if (estimatedSize > MAX_IMAGE_SIZE) {
      return res.status(400).json({ 
        message: 'Image size exceeds 1MB limit'
      });
    }

    // Convert base64 to buffer
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Additional validation - check buffer is valid
    if (buffer.length === 0) {
      return res.status(400).json({ message: 'Invalid image data' });
    }

    // Upload to Supabase Storage with normalized filename
    const timestamp = Date.now();
    const storagePath = `system/${type}s/${timestamp}-${normalizedFilename}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('assets')
      .upload(storagePath, buffer, {
        contentType: mimeType,
        upsert: true
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return res.status(500).json({ message: 'Failed to upload file' });
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

