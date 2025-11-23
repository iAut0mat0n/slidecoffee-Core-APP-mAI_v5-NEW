-- ============================================================================
-- SLIDECOFFEE: Fix v2_user_context RLS (Correct Type Casting)
-- v2_user_context: user_id=varchar, workspace_id=varchar
-- v2_workspace_members: user_id=uuid, workspace_id=uuid
-- Need to cast varchar to uuid for the subquery comparison
-- ============================================================================

-- Enable RLS
ALTER TABLE v2_user_context ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS user_context_read_own ON v2_user_context;
DROP POLICY IF EXISTS user_context_insert_own ON v2_user_context;
DROP POLICY IF EXISTS user_context_update_own ON v2_user_context;
DROP POLICY IF EXISTS user_context_delete_own ON v2_user_context;

-- Create policies with correct casting
-- Cast v2_user_context.workspace_id (varchar) to uuid for comparison
CREATE POLICY user_context_read_own ON v2_user_context 
FOR SELECT USING (
  user_id = auth.uid()::text 
  AND workspace_id::uuid IN (
    SELECT workspace_id 
    FROM v2_workspace_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY user_context_insert_own ON v2_user_context 
FOR INSERT WITH CHECK (
  user_id = auth.uid()::text 
  AND workspace_id::uuid IN (
    SELECT workspace_id 
    FROM v2_workspace_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY user_context_update_own ON v2_user_context 
FOR UPDATE USING (
  user_id = auth.uid()::text 
  AND workspace_id::uuid IN (
    SELECT workspace_id 
    FROM v2_workspace_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY user_context_delete_own ON v2_user_context 
FOR DELETE USING (
  user_id = auth.uid()::text 
  AND workspace_id::uuid IN (
    SELECT workspace_id 
    FROM v2_workspace_members 
    WHERE user_id = auth.uid()
  )
);

-- ============================================================================
-- PART 2: Drop legacy tables
-- ============================================================================

SET session_replication_role = replica;

DROP TABLE IF EXISTS public."aiSuggestions" CASCADE;
DROP TABLE IF EXISTS public."chatMessages" CASCADE;
DROP TABLE IF EXISTS public."creditTransactions" CASCADE;
DROP TABLE IF EXISTS public."manusTasks" CASCADE;
DROP TABLE IF EXISTS public."piiTokens" CASCADE;
DROP TABLE IF EXISTS public."workspaceMembers" CASCADE;

DROP TABLE IF EXISTS public.aisuggestions CASCADE;
DROP TABLE IF EXISTS public.chatmessages CASCADE;
DROP TABLE IF EXISTS public.credittransactions CASCADE;
DROP TABLE IF EXISTS public.manustasks CASCADE;
DROP TABLE IF EXISTS public.piitokens CASCADE;
DROP TABLE IF EXISTS public.workspacemembers CASCADE;

SET session_replication_role = DEFAULT;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Show policy count (should be 4)
SELECT COUNT(*) as v2_user_context_policies 
FROM pg_policies 
WHERE tablename = 'v2_user_context';

-- Show remaining tables (should be only v2_* tables)
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename NOT LIKE 'pg_%'
  AND tablename NOT LIKE 'sql_%'
ORDER BY tablename;
