-- ============================================================================
-- SLIDECOFFEE: Drop Remaining Legacy Tables (Final Cleanup)
-- Removes the last 7 unused tables causing RLS warnings in Supabase Advisor
-- ============================================================================
-- 
-- VERIFIED: These tables are not referenced anywhere in the application code
-- Grep search confirmed zero matches in .ts/.tsx files
-- 
-- ============================================================================

-- Drop remaining legacy tables
DROP TABLE IF EXISTS public.aiSuggestions CASCADE;
DROP TABLE IF EXISTS public.chatMessages CASCADE;
DROP TABLE IF EXISTS public.creditTransactions CASCADE;
DROP TABLE IF EXISTS public.manusTasks CASCADE;
DROP TABLE IF EXISTS public.piiTokens CASCADE;
DROP TABLE IF EXISTS public.ticket_responses CASCADE;
DROP TABLE IF EXISTS public.workspaceMembers CASCADE;

-- Verification: List remaining tables (should only show v2_* tables now)
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
