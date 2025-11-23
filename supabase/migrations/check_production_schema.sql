-- ============================================================================
-- PRODUCTION SCHEMA DIAGNOSTIC
-- Run this first to see what exists in your production Supabase
-- ============================================================================

-- 1. List all v2_* tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE 'v2_%' 
ORDER BY table_name;

-- 2. Check v2_presentations structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'v2_presentations'
ORDER BY ordinal_position;

-- 3. Check v2_workspaces structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'v2_workspaces'
ORDER BY ordinal_position;

-- 4. Check v2_users structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'v2_users'
ORDER BY ordinal_position;

-- 5. Check if v2_workspace_members exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'v2_workspace_members'
) as workspace_members_exists;

-- 6. Check existing RLS policies
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
