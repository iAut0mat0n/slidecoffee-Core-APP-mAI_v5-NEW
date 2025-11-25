-- Phase 2: Gamma-Style Workflow Tables
-- Created: 2025-11-25
-- Description: Tables for multi-step presentation creation wizard

-- ============================================
-- v2_outline_drafts: Persist wizard progress
-- ============================================
CREATE TABLE IF NOT EXISTS v2_outline_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES v2_workspaces(id) ON DELETE CASCADE,
  project_id UUID REFERENCES v2_projects(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES v2_users(id) ON DELETE CASCADE,
  
  -- Wizard state
  topic TEXT NOT NULL,
  outline_json JSONB, -- Generated outline structure
  theme_id UUID REFERENCES v2_theme_profiles(id) ON DELETE SET NULL,
  image_profile_id UUID REFERENCES v2_image_profiles(id) ON DELETE SET NULL,
  
  -- Progress tracking
  current_step INTEGER DEFAULT 1, -- 1=topic, 2=outline, 3=theme, 4=images
  status TEXT DEFAULT 'draft', -- draft, generating, completed, failed
  
  -- Link to final presentation
  presentation_id UUID REFERENCES v2_presentations(id) ON DELETE SET NULL,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  deleted_at TIMESTAMP WITH TIME ZONE -- Soft delete
);

CREATE INDEX idx_outline_drafts_workspace ON v2_outline_drafts(workspace_id);
CREATE INDEX idx_outline_drafts_project ON v2_outline_drafts(project_id);
CREATE INDEX idx_outline_drafts_created_by ON v2_outline_drafts(created_by);
CREATE INDEX idx_outline_drafts_status ON v2_outline_drafts(status);

-- ============================================
-- v2_theme_profiles: Standard + custom themes
-- ============================================
CREATE TABLE IF NOT EXISTS v2_theme_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES v2_workspaces(id) ON DELETE CASCADE, -- NULL for global themes
  created_by UUID REFERENCES v2_users(id) ON DELETE SET NULL,
  
  -- Theme metadata
  name TEXT NOT NULL,
  description TEXT,
  source_type TEXT NOT NULL DEFAULT 'standard', -- standard, custom, pptx
  category TEXT, -- minimal, bold, corporate, creative, modern, classic
  
  -- Theme configuration
  palette_json JSONB NOT NULL, -- {primary, secondary, accent, background, text}
  typography_json JSONB NOT NULL, -- {fontFamily, heading, body, sizes}
  layout_tokens JSONB, -- {spacing, borderRadius, shadows}
  
  -- Visual preview
  preview_image_url TEXT,
  thumbnail_url TEXT,
  
  -- PPTX import tracking
  source_file_id UUID, -- Reference to Supabase Storage
  extracted_styles JSONB, -- Raw extracted data from PPTX
  
  -- Visibility
  is_public BOOLEAN DEFAULT FALSE, -- Global themes visible to all
  is_featured BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_theme_profiles_workspace ON v2_theme_profiles(workspace_id);
CREATE INDEX idx_theme_profiles_source_type ON v2_theme_profiles(source_type);
CREATE INDEX idx_theme_profiles_category ON v2_theme_profiles(category);
CREATE INDEX idx_theme_profiles_public ON v2_theme_profiles(is_public) WHERE is_public = TRUE;

-- ============================================
-- v2_template_library: Pre-built slide structures
-- ============================================
CREATE TABLE IF NOT EXISTS v2_template_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES v2_workspaces(id) ON DELETE CASCADE, -- NULL for global templates
  theme_id UUID REFERENCES v2_theme_profiles(id) ON DELETE SET NULL,
  created_by UUID REFERENCES v2_users(id) ON DELETE SET NULL,
  
  -- Template metadata
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- Popular, Sales, Projects, Strategy, Education, Marketing
  
  -- Template structure
  slide_structure JSONB NOT NULL, -- Array of slide layouts with placeholders
  slide_count INTEGER NOT NULL DEFAULT 0,
  
  -- Visual preview
  thumbnail_url TEXT,
  preview_images JSONB, -- Array of preview image URLs
  
  -- Usage tracking
  use_count INTEGER DEFAULT 0,
  
  -- Visibility
  is_public BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_template_library_workspace ON v2_template_library(workspace_id);
CREATE INDEX idx_template_library_theme ON v2_template_library(theme_id);
CREATE INDEX idx_template_library_category ON v2_template_library(category);
CREATE INDEX idx_template_library_public ON v2_template_library(is_public) WHERE is_public = TRUE;
CREATE INDEX idx_template_library_use_count ON v2_template_library(use_count DESC);

-- ============================================
-- v2_image_profiles: Image provider metadata
-- ============================================
CREATE TABLE IF NOT EXISTS v2_image_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES v2_workspaces(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES v2_users(id) ON DELETE CASCADE,
  
  -- Provider info
  provider TEXT NOT NULL, -- pexels, unsplash, ai_generated, upload
  query TEXT, -- Search query used
  style_preference TEXT, -- minimal, bold, abstract, photography, illustration
  
  -- Selected images (per-slide)
  selected_images JSONB NOT NULL, -- [{slideIndex, imageUrl, attribution, downloadUrl}]
  
  -- Caching
  cached_assets JSONB, -- [{original, cached_url, storage_path}]
  
  -- Status
  status TEXT DEFAULT 'pending', -- pending, fetched, cached, failed
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_image_profiles_workspace ON v2_image_profiles(workspace_id);
CREATE INDEX idx_image_profiles_created_by ON v2_image_profiles(created_by);
CREATE INDEX idx_image_profiles_provider ON v2_image_profiles(provider);
CREATE INDEX idx_image_profiles_status ON v2_image_profiles(status);

-- ============================================
-- Update v2_presentations to link outline_drafts
-- ============================================
ALTER TABLE v2_presentations 
  ADD COLUMN IF NOT EXISTS outline_draft_id UUID REFERENCES v2_outline_drafts(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_presentations_outline_draft ON v2_presentations(outline_draft_id);

-- ============================================
-- RLS Policies (Row Level Security)
-- ============================================

-- v2_outline_drafts policies
ALTER TABLE v2_outline_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view outline drafts in their workspace"
  ON v2_outline_drafts FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM v2_users 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create outline drafts in their workspace"
  ON v2_outline_drafts FOR INSERT
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM v2_users 
      WHERE id = auth.uid()
    )
    AND created_by = auth.uid()
  );

CREATE POLICY "Users can update their own outline drafts"
  ON v2_outline_drafts FOR UPDATE
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can delete their own outline drafts"
  ON v2_outline_drafts FOR DELETE
  USING (created_by = auth.uid());

-- v2_theme_profiles policies
ALTER TABLE v2_theme_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view public themes or themes in their workspace"
  ON v2_theme_profiles FOR SELECT
  USING (
    is_public = TRUE
    OR workspace_id IN (
      SELECT workspace_id FROM v2_users 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create themes in their workspace"
  ON v2_theme_profiles FOR INSERT
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM v2_users 
      WHERE id = auth.uid()
    )
    AND created_by = auth.uid()
  );

CREATE POLICY "Users can update their own themes"
  ON v2_theme_profiles FOR UPDATE
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- v2_template_library policies
ALTER TABLE v2_template_library ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view public templates or templates in their workspace"
  ON v2_template_library FOR SELECT
  USING (
    is_public = TRUE
    OR workspace_id IN (
      SELECT workspace_id FROM v2_users 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create templates in their workspace"
  ON v2_template_library FOR INSERT
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM v2_users 
      WHERE id = auth.uid()
    )
    AND created_by = auth.uid()
  );

-- v2_image_profiles policies
ALTER TABLE v2_image_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view image profiles in their workspace"
  ON v2_image_profiles FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM v2_users 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create image profiles in their workspace"
  ON v2_image_profiles FOR INSERT
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM v2_users 
      WHERE id = auth.uid()
    )
    AND created_by = auth.uid()
  );

CREATE POLICY "Users can update their own image profiles"
  ON v2_image_profiles FOR UPDATE
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- ============================================
-- Triggers for updated_at timestamps
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_v2_outline_drafts_updated_at
  BEFORE UPDATE ON v2_outline_drafts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_v2_theme_profiles_updated_at
  BEFORE UPDATE ON v2_theme_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_v2_template_library_updated_at
  BEFORE UPDATE ON v2_template_library
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_v2_image_profiles_updated_at
  BEFORE UPDATE ON v2_image_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
