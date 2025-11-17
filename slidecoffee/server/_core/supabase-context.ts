import { inferAsyncReturnType } from '@trpc/server';
import { CreateExpressContextOptions } from '@trpc/server/adapters/express';
import { createClient } from '@supabase/supabase-js';
import * as db from '../db';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[Supabase Context] Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables');
}

// Client for verifying auth tokens
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Hybrid auth context:
 * - Uses Supabase for authentication (JWT verification)
 * - Uses MySQL for user data storage
 * - Maps Supabase auth_id to MySQL user record
 */
export async function createContext({ req, res }: CreateExpressContextOptions) {
  // Get auth token from Authorization header or cookie
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '');

  let user = null;

  if (token) {
    try {
      // Verify the JWT token with Supabase
      const { data: { user: authUser }, error } = await supabase.auth.getUser(token);
      
      if (!error && authUser) {
        // Look up user in MySQL database by email
        // (We'll use email as the bridge between Supabase and MySQL)
        const dbUser = await db.getUserByEmail(authUser.email || '');
        
        if (dbUser) {
          user = dbUser;
        } else {
          // Auto-create user in MySQL if they exist in Supabase but not in our DB
          console.log('[Context] Auto-creating user in MySQL:', authUser.email);
          const newUser = await db.createUserFromSupabase({
            email: authUser.email || '',
            name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
            supabaseId: authUser.id,
          });
          user = newUser;
        }
      }
    } catch (error) {
      console.error('[Context] Error verifying Supabase token:', error);
    }
  }

  return {
    req,
    res,
    user,
  };
}

export type Context = inferAsyncReturnType<typeof createContext>;

