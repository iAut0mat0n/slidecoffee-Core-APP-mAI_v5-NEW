-- ============================================================================
-- SLIDECOFFEE: Fix v2_user_context RLS (Final - Type-Safe)
-- First check schema, then apply correct policies based on actual types
-- ============================================================================

-- ============================================================================
-- STEP 1: Check column types
-- ============================================================================
DO $$
DECLARE
  user_id_type text;
  workspace_id_type text;
BEGIN
  -- Get the actual data types
  SELECT data_type INTO user_id_type
  FROM information_schema.columns 
  WHERE table_schema = 'public' 
    AND table_name = 'v2_user_context'
    AND column_name = 'user_id';
  
  SELECT data_type INTO workspace_id_type
  FROM information_schema.columns 
  WHERE table_schema = 'public' 
    AND table_name = 'v2_user_context'
    AND column_name = 'workspace_id';
  
  RAISE NOTICE 'v2_user_context.user_id type: %', user_id_type;
  RAISE NOTICE 'v2_user_context.workspace_id type: %', workspace_id_type;
END $$;

-- ============================================================================
-- STEP 2: Enable RLS
-- ============================================================================
ALTER TABLE v2_user_context ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 3: Drop existing policies
-- ============================================================================
DROP POLICY IF EXISTS user_context_read_own ON v2_user_context;
DROP POLICY IF EXISTS user_context_insert_own ON v2_user_context;
DROP POLICY IF EXISTS user_context_update_own ON v2_user_context;
DROP POLICY IF EXISTS user_context_delete_own ON v2_user_context;

-- ============================================================================
-- STEP 4: Create policies with full type casting
-- Assumes: user_id is text/varchar, workspace_id is UUID
-- ============================================================================

-- Read policy
CREATE POLICY user_context_read_own ON v2_user_context 
FOR SELECT USING (
  user_id = auth.uid()::text 
  AND workspace_id IN (
    SELECT workspace_id 
    FROM v2_workspace_members 
    WHERE user_id = auth.uid()
  )
);

-- Insert policy
CREATE POLICY user_context_insert_own ON v2_user_context 
FOR INSERT WITH CHECK (
  user_id = auth.uid()::text 
  AND workspace_id IN (
    SELECT workspace_id 
    FROM v2_workspace_members 
    WHERE user_id = auth.uid()
  )
);

-- Update policy  
CREATE POLICY user_context_update_own ON v2_user_context 
FOR UPDATE USING (
  user_id = auth.uid()::text 
  AND workspace_id IN (
    SELECT workspace_id 
    FROM v2_workspace_members 
    WHERE user_id = auth.uid()
  )
);

-- Delete policy
CREATE POLICY user_context_delete_own ON v2_user_context 
FOR DELETE USING (
  user_id = auth.uid()::text 
  AND workspace_id IN (
    SELECT workspace_id 
    FROM v2_workspace_members 
    WHERE user_id = auth.uid()
  )
);

-- ============================================================================
-- VERIFICATION
-- ============================================================================
SELECT COUNT(*) as policy_count 
FROM pg_policies 
WHERE tablename = 'v2_user_context';
