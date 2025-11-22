-- AI Settings Table Setup
-- This script ensures the v2_ai_settings table exists with all required providers

-- Create table if it doesn't exist
CREATE TABLE IF NOT EXISTS v2_ai_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider VARCHAR(50) NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT FALSE,
  api_key TEXT,
  model VARCHAR(100),
  config JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default providers if they don't exist
INSERT INTO v2_ai_settings (provider, is_active, model, config)
VALUES 
  ('manus', TRUE, 'gemini-2.0-flash-exp', '{}'),
  ('claude', FALSE, 'claude-3-5-sonnet-20241022', '{}'),
  ('claude-haiku', FALSE, 'claude-3-5-haiku-20241022', '{}'),
  ('gpt4', FALSE, 'gpt-4-turbo', '{}')
ON CONFLICT (provider) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE v2_ai_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "AI settings are viewable by everyone" ON v2_ai_settings;
DROP POLICY IF EXISTS "AI settings are updatable by admins only" ON v2_ai_settings;

-- Allow everyone to read AI settings (without API keys)
CREATE POLICY "AI settings are viewable by everyone"
  ON v2_ai_settings
  FOR SELECT
  USING (true);

-- Only admins can update AI settings
CREATE POLICY "AI settings are updatable by admins only"
  ON v2_ai_settings
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM v2_users
      WHERE v2_users.id = auth.uid()
      AND v2_users.role = 'admin'
    )
  );

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_ai_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ai_settings_updated_at_trigger ON v2_ai_settings;
CREATE TRIGGER ai_settings_updated_at_trigger
  BEFORE UPDATE ON v2_ai_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_settings_updated_at();
