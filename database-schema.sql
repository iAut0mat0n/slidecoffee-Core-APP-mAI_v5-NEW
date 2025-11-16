-- SlideCoffee v2 Database Schema
-- Clean schema with v2_ prefix to avoid conflicts

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE v2_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  credits INTEGER DEFAULT 75,
  plan TEXT DEFAULT 'starter' CHECK (plan IN ('starter', 'professional', 'enterprise', 'free', 'pro', 'business')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workspaces table
CREATE TABLE v2_workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  owner_id UUID REFERENCES v2_users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workspace members table
CREATE TABLE v2_workspace_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES v2_workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES v2_users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  credits_allocated INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(workspace_id, user_id)
);

-- Brands table
CREATE TABLE v2_brands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES v2_workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  primary_color TEXT DEFAULT '#7C3AED',
  secondary_color TEXT DEFAULT '#6EE7B7',
  accent_color TEXT DEFAULT '#FFE5E5',
  font_heading TEXT DEFAULT 'Inter',
  font_body TEXT DEFAULT 'Inter',
  logo_url TEXT,
  guidelines TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Presentations table
CREATE TABLE v2_presentations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES v2_workspaces(id) ON DELETE CASCADE,
  brand_id UUID REFERENCES v2_brands(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  slides JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'generating', 'completed', 'archived')),
  is_favorite BOOLEAN DEFAULT FALSE,
  folder_id UUID,
  last_viewed_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES v2_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat messages table
CREATE TABLE v2_chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  presentation_id UUID REFERENCES v2_presentations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Presentation plans table (for human-in-the-loop approval)
CREATE TABLE v2_presentation_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  presentation_id UUID REFERENCES v2_presentations(id) ON DELETE CASCADE,
  plan JSONB NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Folders table
CREATE TABLE v2_folders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES v2_workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#7C3AED',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Templates table
CREATE TABLE v2_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  category TEXT,
  slides JSONB DEFAULT '[]'::jsonb,
  is_public BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES v2_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE v2_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES v2_users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  credits_per_month INTEGER NOT NULL,
  price_monthly DECIMAL(10,2),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Credit transactions table
CREATE TABLE v2_credit_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES v2_users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('purchase', 'usage', 'refund', 'bonus')),
  description TEXT,
  presentation_id UUID REFERENCES v2_presentations(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics table
CREATE TABLE v2_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  presentation_id UUID REFERENCES v2_presentations(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('view', 'share', 'export', 'edit')),
  user_id UUID REFERENCES v2_users(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Collaborators table
CREATE TABLE v2_collaborators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  presentation_id UUID REFERENCES v2_presentations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES v2_users(id) ON DELETE CASCADE,
  permission TEXT DEFAULT 'view' CHECK (permission IN ('view', 'comment', 'edit')),
  invited_by UUID REFERENCES v2_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(presentation_id, user_id)
);

-- AI provider settings table (for admin panel)
CREATE TABLE v2_ai_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider TEXT NOT NULL CHECK (provider IN ('manus', 'claude', 'gpt4')),
  is_active BOOLEAN DEFAULT FALSE,
  api_key TEXT,
  model TEXT,
  config JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_workspaces_owner ON v2_workspaces(owner_id);
CREATE INDEX idx_workspace_members_workspace ON v2_workspace_members(workspace_id);
CREATE INDEX idx_workspace_members_user ON v2_workspace_members(user_id);
CREATE INDEX idx_brands_workspace ON v2_brands(workspace_id);
CREATE INDEX idx_presentations_workspace ON v2_presentations(workspace_id);
CREATE INDEX idx_presentations_brand ON v2_presentations(brand_id);
CREATE INDEX idx_presentations_status ON v2_presentations(status);
CREATE INDEX idx_presentations_favorite ON v2_presentations(is_favorite);
CREATE INDEX idx_chat_messages_presentation ON v2_chat_messages(presentation_id);
CREATE INDEX idx_presentation_plans_presentation ON v2_presentation_plans(presentation_id);
CREATE INDEX idx_folders_workspace ON v2_folders(workspace_id);
CREATE INDEX idx_subscriptions_user ON v2_subscriptions(user_id);
CREATE INDEX idx_credit_transactions_user ON v2_credit_transactions(user_id);
CREATE INDEX idx_analytics_presentation ON v2_analytics(presentation_id);
CREATE INDEX idx_collaborators_presentation ON v2_collaborators(presentation_id);

-- Enable Row Level Security
ALTER TABLE v2_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE v2_workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE v2_workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE v2_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE v2_presentations ENABLE ROW LEVEL SECURITY;
ALTER TABLE v2_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE v2_presentation_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE v2_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE v2_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE v2_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE v2_credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE v2_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE v2_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE v2_ai_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view own profile" ON v2_users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON v2_users FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for workspaces
CREATE POLICY "Users can view own workspaces" ON v2_workspaces FOR SELECT USING (
  owner_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM v2_workspace_members WHERE workspace_id = id AND user_id = auth.uid())
);
CREATE POLICY "Users can create workspaces" ON v2_workspaces FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Owners can update workspaces" ON v2_workspaces FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY "Owners can delete workspaces" ON v2_workspaces FOR DELETE USING (owner_id = auth.uid());

-- RLS Policies for brands
CREATE POLICY "Users can view workspace brands" ON v2_brands FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM v2_workspaces w 
    WHERE w.id = workspace_id AND (
      w.owner_id = auth.uid() OR 
      EXISTS (SELECT 1 FROM v2_workspace_members WHERE workspace_id = w.id AND user_id = auth.uid())
    )
  )
);
CREATE POLICY "Users can create brands in their workspaces" ON v2_brands FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM v2_workspaces w 
    WHERE w.id = workspace_id AND w.owner_id = auth.uid()
  )
);
CREATE POLICY "Users can update brands in their workspaces" ON v2_brands FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM v2_workspaces w 
    WHERE w.id = workspace_id AND w.owner_id = auth.uid()
  )
);
CREATE POLICY "Users can delete brands in their workspaces" ON v2_brands FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM v2_workspaces w 
    WHERE w.id = workspace_id AND w.owner_id = auth.uid()
  )
);

-- RLS Policies for presentations
CREATE POLICY "Users can view workspace presentations" ON v2_presentations FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM v2_workspaces w 
    WHERE w.id = workspace_id AND (
      w.owner_id = auth.uid() OR 
      EXISTS (SELECT 1 FROM v2_workspace_members WHERE workspace_id = w.id AND user_id = auth.uid())
    )
  ) OR
  EXISTS (SELECT 1 FROM v2_collaborators WHERE presentation_id = id AND user_id = auth.uid())
);
CREATE POLICY "Users can create presentations in their workspaces" ON v2_presentations FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM v2_workspaces w 
    WHERE w.id = workspace_id AND (
      w.owner_id = auth.uid() OR 
      EXISTS (SELECT 1 FROM v2_workspace_members WHERE workspace_id = w.id AND user_id = auth.uid())
    )
  )
);
CREATE POLICY "Users can update their presentations" ON v2_presentations FOR UPDATE USING (
  created_by = auth.uid() OR
  EXISTS (SELECT 1 FROM v2_collaborators WHERE presentation_id = id AND user_id = auth.uid() AND permission IN ('edit'))
);
CREATE POLICY "Users can delete their presentations" ON v2_presentations FOR DELETE USING (created_by = auth.uid());

-- RLS Policies for chat messages
CREATE POLICY "Users can view presentation chat" ON v2_chat_messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM v2_presentations p
    JOIN v2_workspaces w ON p.workspace_id = w.id
    WHERE p.id = presentation_id AND (
      w.owner_id = auth.uid() OR 
      EXISTS (SELECT 1 FROM v2_workspace_members WHERE workspace_id = w.id AND user_id = auth.uid())
    )
  )
);
CREATE POLICY "Users can create chat messages" ON v2_chat_messages FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM v2_presentations p
    JOIN v2_workspaces w ON p.workspace_id = w.id
    WHERE p.id = presentation_id AND (
      w.owner_id = auth.uid() OR 
      EXISTS (SELECT 1 FROM v2_workspace_members WHERE workspace_id = w.id AND user_id = auth.uid())
    )
  )
);

-- RLS Policies for AI settings (admin only)
CREATE POLICY "Admins can manage AI settings" ON v2_ai_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM v2_users WHERE id = auth.uid() AND role = 'admin')
);

-- Insert default AI provider
INSERT INTO v2_ai_settings (provider, is_active, model) VALUES ('manus', TRUE, 'gemini-2.5-flash');

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_v2_users_updated_at BEFORE UPDATE ON v2_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_v2_workspaces_updated_at BEFORE UPDATE ON v2_workspaces FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_v2_brands_updated_at BEFORE UPDATE ON v2_brands FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_v2_presentations_updated_at BEFORE UPDATE ON v2_presentations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_v2_presentation_plans_updated_at BEFORE UPDATE ON v2_presentation_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_v2_ai_settings_updated_at BEFORE UPDATE ON v2_ai_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

