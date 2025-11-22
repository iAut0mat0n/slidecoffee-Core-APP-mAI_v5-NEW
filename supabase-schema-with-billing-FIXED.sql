-- SlideCoffee v2 Database Schema with Stripe Billing Support - FIXED VERSION
-- Run this in Supabase SQL Editor (https://app.supabase.com)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.v2_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add Stripe billing columns if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='v2_users' AND column_name='plan') THEN
    ALTER TABLE public.v2_users ADD COLUMN plan TEXT DEFAULT 'starter';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='v2_users' AND column_name='stripe_customer_id') THEN
    ALTER TABLE public.v2_users ADD COLUMN stripe_customer_id TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='v2_users' AND column_name='stripe_subscription_id') THEN
    ALTER TABLE public.v2_users ADD COLUMN stripe_subscription_id TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='v2_users' AND column_name='subscription_status') THEN
    ALTER TABLE public.v2_users ADD COLUMN subscription_status TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='v2_users' AND column_name='subscription_current_period_end') THEN
    ALTER TABLE public.v2_users ADD COLUMN subscription_current_period_end TIMESTAMP WITH TIME ZONE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='v2_users' AND column_name='subscription_workspace_id') THEN
    ALTER TABLE public.v2_users ADD COLUMN subscription_workspace_id UUID;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='v2_users' AND column_name='default_workspace_id') THEN
    ALTER TABLE public.v2_users ADD COLUMN default_workspace_id UUID;
  END IF;
END $$;

-- Workspaces table
CREATE TABLE IF NOT EXISTS public.v2_workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES public.v2_users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraints for workspace references (after both tables exist)
ALTER TABLE public.v2_users DROP CONSTRAINT IF EXISTS fk_default_workspace;
ALTER TABLE public.v2_users DROP CONSTRAINT IF EXISTS fk_subscription_workspace;

ALTER TABLE public.v2_users ADD CONSTRAINT fk_default_workspace 
  FOREIGN KEY (default_workspace_id) REFERENCES public.v2_workspaces(id) ON DELETE SET NULL;
ALTER TABLE public.v2_users ADD CONSTRAINT fk_subscription_workspace 
  FOREIGN KEY (subscription_workspace_id) REFERENCES public.v2_workspaces(id) ON DELETE SET NULL;

-- Brands table
CREATE TABLE IF NOT EXISTS public.v2_brands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES public.v2_workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  primary_color TEXT DEFAULT '#7C3AED',
  secondary_color TEXT DEFAULT '#6EE7B7',
  font_heading TEXT DEFAULT 'Inter',
  font_body TEXT DEFAULT 'Inter',
  logo_url TEXT,
  created_by UUID NOT NULL REFERENCES public.v2_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects table
CREATE TABLE IF NOT EXISTS public.v2_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES public.v2_workspaces(id) ON DELETE CASCADE,
  brand_id UUID REFERENCES public.v2_brands(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  slides JSONB DEFAULT '[]'::jsonb,
  created_by UUID NOT NULL REFERENCES public.v2_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Presentations table
CREATE TABLE IF NOT EXISTS public.v2_presentations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.v2_projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slides JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'generating', 'complete', 'error')),
  created_by UUID NOT NULL REFERENCES public.v2_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table (for AI chat history)
CREATE TABLE IF NOT EXISTS public.v2_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  presentation_id UUID NOT NULL REFERENCES public.v2_presentations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Settings table (for admin panel)
CREATE TABLE IF NOT EXISTS public.v2_ai_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider TEXT NOT NULL CHECK (provider IN ('manus', 'claude', 'gpt4')),
  model TEXT NOT NULL,
  is_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Webhook events table (for idempotency protection)
CREATE TABLE IF NOT EXISTS public.v2_webhook_events (
  event_id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default AI settings
INSERT INTO public.v2_ai_settings (provider, model, is_active) VALUES
  ('manus', 'gemini-2.0-flash-exp', TRUE),
  ('claude', 'claude-3-5-sonnet', FALSE),
  ('gpt4', 'gpt-4-turbo', FALSE)
ON CONFLICT DO NOTHING;

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE public.v2_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.v2_workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.v2_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.v2_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.v2_presentations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.v2_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.v2_ai_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.v2_webhook_events ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON public.v2_users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.v2_users;
DROP POLICY IF EXISTS "Users can view their own workspaces" ON public.v2_workspaces;
DROP POLICY IF EXISTS "Users can create workspaces" ON public.v2_workspaces;
DROP POLICY IF EXISTS "Users can update their own workspaces" ON public.v2_workspaces;
DROP POLICY IF EXISTS "Users can delete their own workspaces" ON public.v2_workspaces;
DROP POLICY IF EXISTS "Users can view brands in their workspaces" ON public.v2_brands;
DROP POLICY IF EXISTS "Users can create brands in their workspaces" ON public.v2_brands;
DROP POLICY IF EXISTS "Users can update brands in their workspaces" ON public.v2_brands;
DROP POLICY IF EXISTS "Users can delete brands in their workspaces" ON public.v2_brands;
DROP POLICY IF EXISTS "Users can view projects in their workspaces" ON public.v2_projects;
DROP POLICY IF EXISTS "Users can create projects in their workspaces" ON public.v2_projects;
DROP POLICY IF EXISTS "Users can update projects in their workspaces" ON public.v2_projects;
DROP POLICY IF EXISTS "Users can delete projects in their workspaces" ON public.v2_projects;
DROP POLICY IF EXISTS "Users can view presentations in their projects" ON public.v2_presentations;
DROP POLICY IF EXISTS "Users can create presentations in their projects" ON public.v2_presentations;
DROP POLICY IF EXISTS "Users can update presentations in their projects" ON public.v2_presentations;
DROP POLICY IF EXISTS "Users can delete presentations in their projects" ON public.v2_presentations;
DROP POLICY IF EXISTS "Users can view messages in their presentations" ON public.v2_messages;
DROP POLICY IF EXISTS "Users can create messages in their presentations" ON public.v2_messages;
DROP POLICY IF EXISTS "Anyone can view AI settings" ON public.v2_ai_settings;
DROP POLICY IF EXISTS "Only admins can update AI settings" ON public.v2_ai_settings;
DROP POLICY IF EXISTS "Service role can manage webhook events" ON public.v2_webhook_events;

-- Users policies
CREATE POLICY "Users can view their own profile" ON public.v2_users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.v2_users
  FOR UPDATE USING (auth.uid() = id);

-- Workspaces policies
CREATE POLICY "Users can view their own workspaces" ON public.v2_workspaces
  FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "Users can create workspaces" ON public.v2_workspaces
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update their own workspaces" ON public.v2_workspaces
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Users can delete their own workspaces" ON public.v2_workspaces
  FOR DELETE USING (owner_id = auth.uid());

-- Brands policies
CREATE POLICY "Users can view brands in their workspaces" ON public.v2_brands
  FOR SELECT USING (
    workspace_id IN (
      SELECT id FROM public.v2_workspaces WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can create brands in their workspaces" ON public.v2_brands
  FOR INSERT WITH CHECK (
    workspace_id IN (
      SELECT id FROM public.v2_workspaces WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update brands in their workspaces" ON public.v2_brands
  FOR UPDATE USING (
    workspace_id IN (
      SELECT id FROM public.v2_workspaces WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete brands in their workspaces" ON public.v2_brands
  FOR DELETE USING (
    workspace_id IN (
      SELECT id FROM public.v2_workspaces WHERE owner_id = auth.uid()
    )
  );

-- Projects policies
CREATE POLICY "Users can view projects in their workspaces" ON public.v2_projects
  FOR SELECT USING (
    workspace_id IN (
      SELECT id FROM public.v2_workspaces WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can create projects in their workspaces" ON public.v2_projects
  FOR INSERT WITH CHECK (
    workspace_id IN (
      SELECT id FROM public.v2_workspaces WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update projects in their workspaces" ON public.v2_projects
  FOR UPDATE USING (
    workspace_id IN (
      SELECT id FROM public.v2_workspaces WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete projects in their workspaces" ON public.v2_projects
  FOR DELETE USING (
    workspace_id IN (
      SELECT id FROM public.v2_workspaces WHERE owner_id = auth.uid()
    )
  );

-- Presentations policies
CREATE POLICY "Users can view presentations in their projects" ON public.v2_presentations
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM public.v2_projects WHERE workspace_id IN (
        SELECT id FROM public.v2_workspaces WHERE owner_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create presentations in their projects" ON public.v2_presentations
  FOR INSERT WITH CHECK (
    project_id IN (
      SELECT id FROM public.v2_projects WHERE workspace_id IN (
        SELECT id FROM public.v2_workspaces WHERE owner_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update presentations in their projects" ON public.v2_presentations
  FOR UPDATE USING (
    project_id IN (
      SELECT id FROM public.v2_projects WHERE workspace_id IN (
        SELECT id FROM public.v2_workspaces WHERE owner_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can delete presentations in their projects" ON public.v2_presentations
  FOR DELETE USING (
    project_id IN (
      SELECT id FROM public.v2_projects WHERE workspace_id IN (
        SELECT id FROM public.v2_workspaces WHERE owner_id = auth.uid()
      )
    )
  );

-- Messages policies
CREATE POLICY "Users can view messages in their presentations" ON public.v2_messages
  FOR SELECT USING (
    presentation_id IN (
      SELECT id FROM public.v2_presentations WHERE project_id IN (
        SELECT id FROM public.v2_projects WHERE workspace_id IN (
          SELECT id FROM public.v2_workspaces WHERE owner_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can create messages in their presentations" ON public.v2_messages
  FOR INSERT WITH CHECK (
    presentation_id IN (
      SELECT id FROM public.v2_presentations WHERE project_id IN (
        SELECT id FROM public.v2_projects WHERE workspace_id IN (
          SELECT id FROM public.v2_workspaces WHERE owner_id = auth.uid()
        )
      )
    )
  );

-- AI Settings policies (admin only)
CREATE POLICY "Anyone can view AI settings" ON public.v2_ai_settings
  FOR SELECT USING (true);

CREATE POLICY "Only admins can update AI settings" ON public.v2_ai_settings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.v2_users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Webhook events policies (service role only)
CREATE POLICY "Service role can manage webhook events" ON public.v2_webhook_events
  FOR ALL USING (true);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_v2_users_updated_at ON public.v2_users;
DROP TRIGGER IF EXISTS update_v2_workspaces_updated_at ON public.v2_workspaces;
DROP TRIGGER IF EXISTS update_v2_brands_updated_at ON public.v2_brands;
DROP TRIGGER IF EXISTS update_v2_projects_updated_at ON public.v2_projects;
DROP TRIGGER IF EXISTS update_v2_presentations_updated_at ON public.v2_presentations;
DROP TRIGGER IF EXISTS update_v2_ai_settings_updated_at ON public.v2_ai_settings;

CREATE TRIGGER update_v2_users_updated_at BEFORE UPDATE ON public.v2_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_v2_workspaces_updated_at BEFORE UPDATE ON public.v2_workspaces
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_v2_brands_updated_at BEFORE UPDATE ON public.v2_brands
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_v2_projects_updated_at BEFORE UPDATE ON public.v2_projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_v2_presentations_updated_at BEFORE UPDATE ON public.v2_presentations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_v2_ai_settings_updated_at BEFORE UPDATE ON public.v2_ai_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_workspaces_owner ON public.v2_workspaces(owner_id);
CREATE INDEX IF NOT EXISTS idx_brands_workspace ON public.v2_brands(workspace_id);
CREATE INDEX IF NOT EXISTS idx_projects_workspace ON public.v2_projects(workspace_id);
CREATE INDEX IF NOT EXISTS idx_presentations_project ON public.v2_presentations(project_id);
CREATE INDEX IF NOT EXISTS idx_messages_presentation ON public.v2_messages(presentation_id);
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer ON public.v2_users(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_users_subscription ON public.v2_users(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_processed_at ON public.v2_webhook_events(processed_at);

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.v2_users (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Done!
-- Your Supabase database is now ready for SlideCoffee with Stripe billing support
