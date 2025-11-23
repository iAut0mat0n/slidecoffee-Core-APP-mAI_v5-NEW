-- ============================================================================
-- SLIDECOFFEE: Fix Remaining RLS Issues (Type-Safe Version)
-- 1. Add RLS policies for v2_user_context with proper text/UUID casting
-- 2. Force drop legacy tables with aggressive CASCADE
-- ============================================================================

-- ============================================================================
-- PART 1: Add RLS policies for v2_user_context
-- ============================================================================

-- Enable RLS on v2_user_context
ALTER TABLE v2_user_context ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS user_context_read_own ON v2_user_context;
DROP POLICY IF EXISTS user_context_insert_own ON v2_user_context;
DROP POLICY IF EXISTS user_context_update_own ON v2_user_context;
DROP POLICY IF EXISTS user_context_delete_own ON v2_user_context;

-- Create policies with explicit type casting (text vs UUID)
CREATE POLICY user_context_read_own ON v2_user_context 
FOR SELECT USING (
  user_id = auth.uid()::text AND workspace_id IN (
    SELECT workspace_id FROM v2_workspace_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY user_context_insert_own ON v2_user_context 
FOR INSERT WITH CHECK (
  user_id = auth.uid()::text AND workspace_id IN (
    SELECT workspace_id FROM v2_workspace_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY user_context_update_own ON v2_user_context 
FOR UPDATE USING (
  user_id = auth.uid()::text AND workspace_id IN (
    SELECT workspace_id FROM v2_workspace_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY user_context_delete_own ON v2_user_context 
FOR DELETE USING (
  user_id = auth.uid()::text AND workspace_id IN (
    SELECT workspace_id FROM v2_workspace_members WHERE user_id = auth.uid()
  )
);

-- ============================================================================
-- PART 2: Force drop legacy tables (case-sensitive names)
-- ============================================================================

-- Disable triggers and constraints temporarily to allow drops
SET session_replication_role = replica;

-- Drop with CASCADE to remove dependencies (try case-sensitive names)
DROP TABLE IF EXISTS public."aiSuggestions" CASCADE;
DROP TABLE IF EXISTS public."chatMessages" CASCADE;
DROP TABLE IF EXISTS public."creditTransactions" CASCADE;
DROP TABLE IF EXISTS public."manusTasks" CASCADE;
DROP TABLE IF EXISTS public."piiTokens" CASCADE;
DROP TABLE IF EXISTS public."workspaceMembers" CASCADE;

-- Also try lowercase versions in case they exist
DROP TABLE IF EXISTS public.aisuggestions CASCADE;
DROP TABLE IF EXISTS public.chatmessages CASCADE;
DROP TABLE IF EXISTS public.credittransactions CASCADE;
DROP TABLE IF EXISTS public.manustasks CASCADE;
DROP TABLE IF EXISTS public.piitokens CASCADE;
DROP TABLE IF EXISTS public.workspacemembers CASCADE;

-- Re-enable triggers and constraints
SET session_replication_role = DEFAULT;

-- ============================================================================
-- VERIFICATION: Show remaining tables and policy count
-- ============================================================================

-- Show all remaining tables
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename NOT LIKE 'pg_%'
  AND tablename NOT LIKE 'sql_%'
ORDER BY tablename;

-- Show policy count for v2_user_context (should be 4)
SELECT COUNT(*) as user_context_policy_count 
FROM pg_policies 
WHERE tablename = 'v2_user_context';
