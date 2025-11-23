# SlideCoffee Production Deployment Guide

## 🔒 Critical: Apply RLS Migration to Production Supabase

**IMPORTANT:** The RLS policies in `supabase/migrations/add_collaboration_rls_policies.sql` MUST be applied to your production Supabase database before launch. The development database doesn't have Supabase's auth schema.

### How to Apply RLS Migration

1. **Login to Supabase Dashboard:**
   - Go to https://supabase.com/dashboard
   - Select your SlideCoffee project

2. **Open SQL Editor:**
   - Navigate to "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy & Paste Migration:**
   - Open `supabase/migrations/add_collaboration_rls_policies.sql`
   - Copy the entire file contents
   - Paste into the SQL Editor
   - Click "Run"

4. **Verify Policies Were Created:**
   ```sql
   -- Check RLS is enabled
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE tablename IN ('v2_comments', 'v2_presence', 'v2_notifications', 'v2_presentation_views');
   
   -- Should show rowsecurity = true for all 4 tables
   
   -- Check policies exist
   SELECT tablename, policyname 
   FROM pg_policies 
   WHERE tablename IN ('v2_comments', 'v2_presence', 'v2_notifications', 'v2_presentation_views')
   ORDER BY tablename, policyname;
   
   -- Should show 12 total policies (4 for comments, 4 for presence, 3 for notifications, 1 for views)
   ```

### Expected Results

After successful migration:
- `v2_comments`: 4 policies (read_workspace, insert_workspace, update_own_or_admin, delete_own_or_admin)
- `v2_presence`: 4 policies (read_workspace, insert_own, update_own, delete_own)
- `v2_notifications`: 3 policies (read_own, update_own, delete_own)
- `v2_presentation_views`: 1 policy (read_workspace)

## ⚠️ Pre-Launch Verification Checklist

After applying RLS migration, test these critical workflows:

### Test 1: User Authentication
- [ ] User can sign up with email
- [ ] User can login
- [ ] User cannot access other workspaces' data

### Test 2: Comments
- [ ] User can create comment on their presentation
- [ ] User cannot create comment on other workspace's presentation
- [ ] Workspace admin can moderate any comment
- [ ] Real-time updates work across browser tabs

### Test 3: Presence
- [ ] User presence appears when viewing presentation
- [ ] User cannot see presence from other workspaces
- [ ] Presence expires after 30 seconds of inactivity

### Test 4: Notifications
- [ ] @mentions create notifications
- [ ] User only sees their own notifications
- [ ] Users cannot read other users' notifications

### Test 5: View Analytics
- [ ] Anonymous views are tracked
- [ ] Users can only see analytics for their workspace
- [ ] Users cannot see other workspaces' analytics

## 🚀 Launch Readiness

Once RLS migration is applied and tested:
1. All workspace data is isolated at database level
2. Real-time collaboration is secure
3. Ready for production traffic

## 📝 Notes

- **Development Environment:** Uses application-layer security (no RLS policies applied)
- **Production Environment:** Requires RLS policies for database-level security
- **Service Role Operations:** Notifications and analytics use service role client (bypasses RLS)
