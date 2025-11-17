import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('[Supabase] Missing environment variables');
}

// Server-side Supabase client with service role key
export const supabase = createClient(supabaseUrl, supabaseServiceKey);

// User operations
export async function getUserByAuthId(authId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('auth_id', authId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('[Supabase] Error fetching user:', error);
  }

  return data;
}

export async function getUserById(id: number) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('[Supabase] Error fetching user:', error);
  }

  return data;
}

export async function createUser(user: {
  auth_id: string;
  email: string;
  name?: string;
  avatar_url?: string;
}) {
  const { data, error } = await supabase
    .from('users')
    .insert(user)
    .select()
    .single();

  if (error) {
    console.error('[Supabase] Error creating user:', error);
    throw error;
  }

  return data;
}

export async function updateUser(id: number, updates: any) {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('[Supabase] Error updating user:', error);
    throw error;
  }

  return data;
}

// Workspace operations
export async function getUserWorkspaces(userId: number) {
  const { data, error } = await supabase
    .from('workspaces')
    .select('*')
    .eq('owner_id', userId)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[Supabase] Error fetching workspaces:', error);
    return [];
  }

  return data || [];
}

export async function getWorkspaceById(id: number) {
  const { data, error } = await supabase
    .from('workspaces')
    .select('*')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('[Supabase] Error fetching workspace:', error);
  }

  return data;
}

export async function createWorkspace(workspace: {
  owner_id: number;
  name: string;
  description?: string;
  is_default?: boolean;
}) {
  const { data, error } = await supabase
    .from('workspaces')
    .insert(workspace)
    .select()
    .single();

  if (error) {
    console.error('[Supabase] Error creating workspace:', error);
    throw error;
  }

  return data;
}

// Brand operations
export async function getWorkspaceBrands(workspaceId: number) {
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[Supabase] Error fetching brands:', error);
    return [];
  }

  return data || [];
}

export async function getBrandById(id: number) {
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('[Supabase] Error fetching brand:', error);
  }

  return data;
}

export async function createBrand(brand: {
  workspace_id: number;
  name: string;
  logo_url?: string;
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
  font_primary?: string;
  font_secondary?: string;
  guidelines_text?: string;
}) {
  const { data, error } = await supabase
    .from('brands')
    .insert(brand)
    .select()
    .single();

  if (error) {
    console.error('[Supabase] Error creating brand:', error);
    throw error;
  }

  return data;
}

export async function updateBrand(id: number, updates: any) {
  const { data, error } = await supabase
    .from('brands')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('[Supabase] Error updating brand:', error);
    throw error;
  }

  return data;
}

export async function deleteBrand(id: number) {
  const { error } = await supabase
    .from('brands')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[Supabase] Error deleting brand:', error);
    throw error;
  }
}

// Presentation operations
export async function getWorkspacePresentations(workspaceId: number) {
  const { data, error } = await supabase
    .from('presentations')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('last_viewed_at', { ascending: false });

  if (error) {
    console.error('[Supabase] Error fetching presentations:', error);
    return [];
  }

  return data || [];
}

export async function getPresentationById(id: number) {
  const { data, error } = await supabase
    .from('presentations')
    .select('*')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('[Supabase] Error fetching presentation:', error);
  }

  return data;
}

export async function createPresentation(presentation: {
  workspace_id: number;
  brand_id?: number;
  folder_id?: number;
  title: string;
  description?: string;
  status?: string;
}) {
  const { data, error } = await supabase
    .from('presentations')
    .insert(presentation)
    .select()
    .single();

  if (error) {
    console.error('[Supabase] Error creating presentation:', error);
    throw error;
  }

  return data;
}

export async function updatePresentation(id: number, updates: any) {
  const { data, error } = await supabase
    .from('presentations')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('[Supabase] Error updating presentation:', error);
    throw error;
  }

  return data;
}

export async function deletePresentation(id: number) {
  const { error } = await supabase
    .from('presentations')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[Supabase] Error deleting presentation:', error);
    throw error;
  }
}

