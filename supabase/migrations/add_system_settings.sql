-- System settings table for app-wide configuration
CREATE TABLE IF NOT EXISTS public.v2_system_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default logo setting
INSERT INTO public.v2_system_settings (key, value) VALUES
  ('app_logo_url', '/logo.png')
ON CONFLICT (key) DO NOTHING;

-- Enable RLS
ALTER TABLE public.v2_system_settings ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read settings
CREATE POLICY "Anyone can read system settings"
  ON public.v2_system_settings
  FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can update settings
CREATE POLICY "Only admins can update system settings"
  ON public.v2_system_settings
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.v2_users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

