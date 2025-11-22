import { Request } from 'express';
import { createClient } from '@supabase/supabase-js';

/**
 * Extract authentication token from request headers or cookies
 */
export function extractAuthToken(req: Request): string | null {
  // Try Authorization header first
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Fallback to cookies
  if (req.headers.cookie) {
    const cookies = req.headers.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = decodeURIComponent(value);
      return acc;
    }, {} as Record<string, string>);

    // Find Supabase access token cookie
    const accessTokenCookieName = Object.keys(cookies).find(key => 
      key.startsWith('sb-') && key.endsWith('-access-token')
    );
    
    if (accessTokenCookieName) {
      return cookies[accessTokenCookieName];
    }
  }

  return null;
}

/**
 * Create authenticated Supabase client for the current user session
 * This client enforces RLS policies based on the authenticated user
 */
export async function getAuthenticatedSupabaseClient(req: Request) {
  const token = extractAuthToken(req);
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  // Create client with user's auth token for RLS enforcement
  const supabase = createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_ANON_KEY || '',
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    }
  );

  // Verify the session is valid
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    throw new Error('Invalid or expired authentication token');
  }

  return { supabase, user, token };
}

/**
 * Service-role client - ONLY use for admin operations that must bypass RLS
 * WARNING: Never use this for user-scoped operations
 */
export function getServiceRoleClient() {
  return createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );
}
