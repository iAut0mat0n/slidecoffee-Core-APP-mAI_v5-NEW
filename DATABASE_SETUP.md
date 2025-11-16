# Database Setup Instructions

## Step 1: Run the Schema in Supabase

1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy the entire contents of `supabase-schema.sql`
5. Paste into the SQL editor
6. Click "Run" (or press Cmd/Ctrl + Enter)

The schema will create:
- ✅ 7 tables (users, workspaces, brands, projects, presentations, messages, ai_settings)
- ✅ Row Level Security (RLS) policies
- ✅ Automatic user profile creation trigger
- ✅ Updated_at triggers
- ✅ Performance indexes
- ✅ Default AI settings (Manus AI active)

## Step 2: Verify Tables Were Created

Run this query to check:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'v2_%';
```

You should see:
- v2_users
- v2_workspaces
- v2_brands
- v2_projects
- v2_presentations
- v2_messages
- v2_ai_settings

## Step 3: Test User Creation

1. Sign up with a test account in the app
2. Go to Supabase → Table Editor → v2_users
3. You should see your new user profile automatically created

## Troubleshooting

### If tables already exist:
The schema uses `CREATE TABLE IF NOT EXISTS` so it's safe to run multiple times.

### If you need to start fresh:
```sql
-- WARNING: This deletes all data!
DROP TABLE IF EXISTS public.v2_messages CASCADE;
DROP TABLE IF EXISTS public.v2_presentations CASCADE;
DROP TABLE IF EXISTS public.v2_projects CASCADE;
DROP TABLE IF EXISTS public.v2_brands CASCADE;
DROP TABLE IF EXISTS public.v2_workspaces CASCADE;
DROP TABLE IF EXISTS public.v2_users CASCADE;
DROP TABLE IF NOT EXISTS public.v2_ai_settings CASCADE;
```

Then run the schema again.

### If RLS policies conflict:
```sql
-- Drop all policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.v2_users;
-- (repeat for each policy)
```

Then run the schema again.

## Next Steps

After the database is set up:
1. Test signup flow
2. Create a workspace
3. Create a brand
4. Create a presentation
5. Verify data appears in Supabase tables

