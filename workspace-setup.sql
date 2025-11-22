-- Update the handle_new_user function to create a default workspace
-- Run this in Supabase SQL Editor after running the main schema

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_workspace_id UUID;
BEGIN
  -- Create user profile
  INSERT INTO public.v2_users (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email)
  );
  
  -- Create default workspace for the user
  INSERT INTO public.v2_workspaces (name, owner_id)
  VALUES (
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email) || '''s Workspace',
    NEW.id
  )
  RETURNING id INTO new_workspace_id;
  
  -- Set the default workspace for the user
  UPDATE public.v2_users
  SET default_workspace_id = new_workspace_id
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
