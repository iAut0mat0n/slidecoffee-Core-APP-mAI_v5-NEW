-- SlideCoffee Supabase Migration
-- This script creates all necessary tables and sets up row-level security

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email VARCHAR(320),
  avatar_url TEXT,
  role VARCHAR(64) DEFAULT 'user' NOT NULL,
  subscription_tier VARCHAR(64) DEFAULT 'starter' NOT NULL,
  subscription_status VARCHAR(64) DEFAULT 'active' NOT NULL,
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  credits_remaining INTEGER DEFAULT 75 NOT NULL,
  credits_used_this_month INTEGER DEFAULT 0 NOT NULL,
  billing_cycle_start TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  last_signed_in TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(auth_id),
  UNIQUE(email)
);

-- Workspaces table
CREATE TABLE IF NOT EXISTS workspaces (
  id BIGSERIAL PRIMARY KEY,
  owner_id BIGINT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_default BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Workspace members table
CREATE TABLE IF NOT EXISTS workspace_members (
  id BIGSERIAL PRIMARY KEY,
  workspace_id BIGINT REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  role VARCHAR(64) DEFAULT 'member' NOT NULL,
  invited_by BIGINT REFERENCES users(id),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(workspace_id, user_id)
);

-- Brands table
CREATE TABLE IF NOT EXISTS brands (
  id BIGSERIAL PRIMARY KEY,
  workspace_id BIGINT REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  logo_url TEXT,
  primary_color VARCHAR(7),
  secondary_color VARCHAR(7),
  accent_color VARCHAR(7),
  font_primary VARCHAR(255),
  font_secondary VARCHAR(255),
  guidelines_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Folders table
CREATE TABLE IF NOT EXISTS folders (
  id BIGSERIAL PRIMARY KEY,
  workspace_id BIGINT REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  color VARCHAR(7),
  icon VARCHAR(64),
  position INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Presentations table
CREATE TABLE IF NOT EXISTS presentations (
  id BIGSERIAL PRIMARY KEY,
  workspace_id BIGINT REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  brand_id BIGINT REFERENCES brands(id) ON DELETE SET NULL,
  folder_id BIGINT REFERENCES folders(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  is_favorite BOOLEAN DEFAULT FALSE NOT NULL,
  status VARCHAR(64) DEFAULT 'draft' NOT NULL,
  manus_task_id TEXT,
  manus_version_id TEXT,
  outline_json JSONB,
  slides_data JSONB,
  export_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  last_viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id BIGSERIAL PRIMARY KEY,
  presentation_id BIGINT REFERENCES presentations(id) ON DELETE CASCADE NOT NULL,
  role VARCHAR(64) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Credit transactions table
CREATE TABLE IF NOT EXISTS credit_transactions (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  presentation_id BIGINT REFERENCES presentations(id) ON DELETE SET NULL,
  amount INTEGER NOT NULL,
  type VARCHAR(64) NOT NULL,
  description TEXT,
  balance_before INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Brand files table
CREATE TABLE IF NOT EXISTS brand_files (
  id BIGSERIAL PRIMARY KEY,
  brand_id BIGINT REFERENCES brands(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type VARCHAR(64) NOT NULL,
  file_size BIGINT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Templates table
CREATE TABLE IF NOT EXISTS templates (
  id BIGSERIAL PRIMARY KEY,
  workspace_id BIGINT REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  template_data JSONB NOT NULL,
  is_public BOOLEAN DEFAULT FALSE NOT NULL,
  created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Activity log table
CREATE TABLE IF NOT EXISTS activity_log (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  workspace_id BIGINT REFERENCES workspaces(id) ON DELETE CASCADE,
  action VARCHAR(255) NOT NULL,
  entity_type VARCHAR(64),
  entity_id BIGINT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(64) DEFAULT 'info' NOT NULL,
  is_read BOOLEAN DEFAULT FALSE NOT NULL,
  action_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON users(auth_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_workspaces_owner ON workspaces(owner_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_workspace ON workspace_members(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_user ON workspace_members(user_id);
CREATE INDEX IF NOT EXISTS idx_brands_workspace ON brands(workspace_id);
CREATE INDEX IF NOT EXISTS idx_folders_workspace ON folders(workspace_id);
CREATE INDEX IF NOT EXISTS idx_presentations_workspace ON presentations(workspace_id);
CREATE INDEX IF NOT EXISTS idx_presentations_brand ON presentations(brand_id);
CREATE INDEX IF NOT EXISTS idx_presentations_folder ON presentations(folder_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_presentation ON chat_messages(presentation_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_user ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_workspace ON activity_log(workspace_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE presentations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = auth_id);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = auth_id);

-- RLS Policies for workspaces table
CREATE POLICY "Users can view their own workspaces" ON workspaces
  FOR SELECT USING (
    owner_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    OR id IN (SELECT workspace_id FROM workspace_members WHERE user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()))
  );

CREATE POLICY "Users can create workspaces" ON workspaces
  FOR INSERT WITH CHECK (owner_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Workspace owners can update their workspaces" ON workspaces
  FOR UPDATE USING (owner_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Workspace owners can delete their workspaces" ON workspaces
  FOR DELETE USING (owner_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- RLS Policies for brands table
CREATE POLICY "Users can view brands in their workspaces" ON brands
  FOR SELECT USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
      OR id IN (SELECT workspace_id FROM workspace_members WHERE user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()))
    )
  );

CREATE POLICY "Users can create brands in their workspaces" ON brands
  FOR INSERT WITH CHECK (
    workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    )
  );

CREATE POLICY "Users can update brands in their workspaces" ON brands
  FOR UPDATE USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    )
  );

CREATE POLICY "Users can delete brands in their workspaces" ON brands
  FOR DELETE USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    )
  );

-- RLS Policies for presentations table
CREATE POLICY "Users can view presentations in their workspaces" ON presentations
  FOR SELECT USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
      OR id IN (SELECT workspace_id FROM workspace_members WHERE user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()))
    )
  );

CREATE POLICY "Users can create presentations in their workspaces" ON presentations
  FOR INSERT WITH CHECK (
    workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
      OR id IN (SELECT workspace_id FROM workspace_members WHERE user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()))
    )
  );

CREATE POLICY "Users can update presentations in their workspaces" ON presentations
  FOR UPDATE USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
      OR id IN (SELECT workspace_id FROM workspace_members WHERE user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()))
    )
  );

CREATE POLICY "Users can delete presentations in their workspaces" ON presentations
  FOR DELETE USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    )
  );

-- RLS Policies for credit_transactions table
CREATE POLICY "Users can view their own credit transactions" ON credit_transactions
  FOR SELECT USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- RLS Policies for notifications table
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (auth_id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workspaces_updated_at BEFORE UPDATE ON workspaces
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_brands_updated_at BEFORE UPDATE ON brands
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_folders_updated_at BEFORE UPDATE ON folders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_presentations_updated_at BEFORE UPDATE ON presentations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

