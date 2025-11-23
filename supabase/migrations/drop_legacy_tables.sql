-- ============================================================================
-- SLIDECOFFEE: Drop Legacy Tables (Pre-v2 Schema Cleanup)
-- Removes unused tables without RLS policies that trigger Supabase Advisor warnings
-- ============================================================================
-- 
-- SAFETY: All application code uses v2_* tables exclusively.
-- These legacy tables are not referenced anywhere in the codebase.
-- 
-- ============================================================================

-- Drop legacy tables (confirmed unused by architect analysis)
DROP TABLE IF EXISTS public.activity_feed CASCADE;
DROP TABLE IF EXISTS public.aiSuggestions CASCADE;
DROP TABLE IF EXISTS public.brands CASCADE;
DROP TABLE IF EXISTS public.chatMessages CASCADE;
DROP TABLE IF EXISTS public.creditTransactions CASCADE;
DROP TABLE IF EXISTS public.folders CASCADE;
DROP TABLE IF EXISTS public.manusTasks CASCADE;
DROP TABLE IF EXISTS public.memories CASCADE;
DROP TABLE IF EXISTS public.notification_queue CASCADE;
DROP TABLE IF EXISTS public.piiTokens CASCADE;
DROP TABLE IF EXISTS public.plans CASCADE;
DROP TABLE IF EXISTS public.presentations CASCADE;
DROP TABLE IF EXISTS public.slides CASCADE;
DROP TABLE IF EXISTS public.subscription_tiers CASCADE;
DROP TABLE IF EXISTS public.support_tickets CASCADE;

-- Drop any other legacy tables that might exist
DROP TABLE IF EXISTS public.collaborators CASCADE;
DROP TABLE IF EXISTS public.templates CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.workspaces CASCADE;
DROP TABLE IF EXISTS public.workspace_members CASCADE;

-- Verification: List remaining tables in public schema
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
