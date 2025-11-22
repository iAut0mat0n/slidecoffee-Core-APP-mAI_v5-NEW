import { Request, Response, NextFunction } from 'express';
import { getAuthenticatedSupabaseClient, getServiceRoleClient } from '../utils/supabase-auth.js';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name?: string;
    role?: string;
    plan?: string;
    subscription_status?: string;
    workspaceId?: string;
  };
}

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    // Get authenticated Supabase client (enforces RLS)
    const { user } = await getAuthenticatedSupabaseClient(req);

    // Use service-role ONLY for fetching user profile metadata
    // (v2_users table requires service-role for cross-workspace admin queries)
    const serviceSupabase = getServiceRoleClient();
    
    const { data: userRecord, error: userError } = await serviceSupabase
      .from('v2_users')
      .select('id, email, name, role, plan, default_workspace_id, subscription_status')
      .eq('id', user.id)
      .single();

    if (userError) {
      console.error('Error fetching user profile:', userError);
    }

    // Get workspace ID from user's membership or default workspace
    let workspaceId = userRecord?.default_workspace_id;
    
    if (!workspaceId) {
      // Find user's workspace from memberships
      const { data: membership } = await serviceSupabase
        .from('v2_workspace_members')
        .select('workspace_id')
        .eq('user_id', user.id)
        .limit(1)
        .single();
      
      workspaceId = membership?.workspace_id;
    }

    // Normalize plan identifier (handle legacy plan names)
    const planMapping: Record<string, string> = {
      'starter': 'americano',
      'professional': 'cappuccino',
      'enterprise': 'frenchPress',
      'free': 'espresso',
      'pro': 'cappuccino',
      'business': 'coldBrew',
    };
    const rawPlan = userRecord?.plan || 'espresso';
    const normalizedPlan = planMapping[rawPlan] || rawPlan;

    // Attach user info to request
    req.user = {
      id: user.id,
      email: user.email || '',
      name: userRecord?.name,
      role: userRecord?.role || 'user',
      plan: normalizedPlan,
      subscription_status: userRecord?.subscription_status,
      workspaceId: workspaceId,
    } as any;

    next();
  } catch (error: any) {
    console.error('Auth middleware error:', error);
    if (error.message?.includes('authentication')) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    res.status(500).json({ error: 'Authentication failed' });
  }
}
