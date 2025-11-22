-- Row Level Security Policies for v2_user_context
-- This file should be run on production Supabase database
-- Development database doesn't have auth schema, so RLS is enforced at application layer

-- Enable Row Level Security
ALTER TABLE v2_user_context ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can only read their own context
CREATE POLICY "user_context_read_own" 
ON v2_user_context 
FOR SELECT 
USING (user_id = auth.uid()::text);

-- Policy 2: Users can only insert their own context
CREATE POLICY "user_context_insert_own" 
ON v2_user_context 
FOR INSERT 
WITH CHECK (user_id = auth.uid()::text);

-- Policy 3: Users can only update their own context
CREATE POLICY "user_context_update_own" 
ON v2_user_context 
FOR UPDATE 
USING (user_id = auth.uid()::text)
WITH CHECK (user_id = auth.uid()::text);

-- Policy 4: Users can only delete their own context
CREATE POLICY "user_context_delete_own" 
ON v2_user_context 
FOR DELETE 
USING (user_id = auth.uid()::text);

-- Additional security: Workspace scoping
-- Users can only access context in their workspace
-- (Requires workspace membership table or function)

COMMENT ON TABLE v2_user_context IS 
'User-specific AI context and preferences. 
RLS enforced: Users can only access their own data via auth.uid().
Application layer also validates user_id in all queries for defense-in-depth.';
