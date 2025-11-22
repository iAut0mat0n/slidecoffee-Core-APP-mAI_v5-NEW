-- Verification Script: Check if RLS is enabled on v2_user_context
-- Run this on production Supabase database to verify security is enabled

-- Check if RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'v2_user_context';

-- Expected result: rls_enabled should be TRUE

-- Check RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd as operation,
    qual as using_expression,
    with_check as with_check_expression
FROM pg_policies 
WHERE tablename = 'v2_user_context'
ORDER BY policyname;

-- Expected result: Should show 4 policies (read, insert, update, delete)

-- Test RLS enforcement (should fail if RLS is working correctly)
-- This should only return the current user's data
SELECT COUNT(*) as my_context_count FROM v2_user_context;

-- If RLS is NOT enabled, this will show ALL users' data (SECURITY RISK!)
-- If RLS IS enabled, this will only show the authenticated user's data (CORRECT!)
