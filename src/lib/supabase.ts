import { createClient } from '@supabase/supabase-js'
import { config } from './config'

export const supabase = createClient(
  config.supabase.url,
  config.supabase.anonKey
)

// Database Types
export type User = {
  id: string
  email: string
  name: string | null
  avatar_url: string | null
  role: 'user' | 'admin'
  credits: number
  plan: 'starter' | 'professional' | 'enterprise' | 'free' | 'pro' | 'business'
  default_workspace_id?: string | null
  subscription_status?: string | null
  created_at: string
  updated_at: string
}

export type Workspace = {
  id: string
  name: string
  owner_id: string
  created_at: string
  updated_at: string
}

export type Brand = {
  id: string
  workspace_id: string
  name: string
  primary_color: string
  secondary_color: string
  accent_color: string
  font_heading: string
  font_body: string
  logo_url: string | null
  guidelines: string | null
  created_at: string
  updated_at: string
}

export type Presentation = {
  id: string
  workspace_id: string
  brand_id: string | null
  title: string
  description: string | null
  slides: any[]
  status: 'draft' | 'generating' | 'completed' | 'archived'
  is_favorite: boolean
  folder_id: string | null
  last_viewed_at: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export type ChatMessage = {
  id: string
  presentation_id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  metadata: any
  created_at: string
}

export type PresentationPlan = {
  id: string
  presentation_id: string
  plan: any
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  updated_at: string
}

export type Folder = {
  id: string
  workspace_id: string
  name: string
  color: string
  created_at: string
}

export type Template = {
  id: string
  name: string
  description: string | null
  thumbnail_url: string | null
  category: string | null
  slides: any[]
  is_public: boolean
  created_by: string | null
  created_at: string
}

export type Subscription = {
  id: string
  user_id: string
  plan: string
  status: 'active' | 'cancelled' | 'expired'
  credits_per_month: number
  price_monthly: number
  started_at: string
  expires_at: string | null
  created_at: string
}

export type CreditTransaction = {
  id: string
  user_id: string
  amount: number
  type: 'purchase' | 'usage' | 'refund' | 'bonus'
  description: string | null
  presentation_id: string | null
  created_at: string
}

export type Analytics = {
  id: string
  presentation_id: string
  event_type: 'view' | 'share' | 'export' | 'edit'
  user_id: string | null
  metadata: any
  created_at: string
}

export type Collaborator = {
  id: string
  presentation_id: string
  user_id: string
  permission: 'view' | 'comment' | 'edit'
  invited_by: string | null
  created_at: string
}

export type AISettings = {
  id: string
  provider: 'manus' | 'claude' | 'gpt4'
  is_active: boolean
  api_key: string | null
  model: string | null
  config: any
  updated_at: string
}

// Helper functions
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  
  const { data } = await supabase
    .from('v2_users')
    .select('*')
    .eq('id', user.id)
    .single()
  
  return data as User | null
}

export const getUserWorkspaces = async (userId: string) => {
  const { data } = await supabase
    .from('v2_workspaces')
    .select('*')
    .eq('owner_id', userId)
    .order('created_at', { ascending: false })
  
  return data as Workspace[] || []
}

export const getWorkspaceBrands = async (workspaceId: string) => {
  const { data } = await supabase
    .from('v2_brands')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })
  
  return data as Brand[] || []
}

export const getWorkspacePresentations = async (workspaceId: string) => {
  const { data } = await supabase
    .from('v2_presentations')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('updated_at', { ascending: false })
  
  return data as Presentation[] || []
}

