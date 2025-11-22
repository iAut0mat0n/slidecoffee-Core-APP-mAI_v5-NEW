# Supabase Database Setup Guide

## 🚨 CRITICAL: Database Schema Must Be Created

Your SlideCoffee application **requires database tables to be set up in Supabase** before it can function properly. The backend code is ready, but the database schema needs to be created.

---

## ⚡ Quick Setup (5 minutes)

### Step 1: Open Supabase SQL Editor

1. Go to https://app.supabase.com
2. Select your SlideCoffee project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Run the Schema Script

1. Open the file `supabase-schema-with-billing.sql` in this project
2. Copy the entire contents
3. Paste into the Supabase SQL Editor
4. Click **Run** (or press Cmd/Ctrl + Enter)

### Step 3: Verify Tables Were Created

Run this query to check:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

You should see:
- ✅ v2_users
- ✅ v2_workspaces
- ✅ v2_brands
- ✅ v2_projects
- ✅ v2_presentations
- ✅ v2_messages
- ✅ v2_ai_settings
- ✅ v2_system_settings (if already created)

---

## 📋 What the Schema Includes

### Core Tables
- **v2_users** - User profiles with Stripe billing data
- **v2_workspaces** - Workspace organization (personal/team/company)
- **v2_brands** - Brand guidelines (logos, colors, fonts)
- **v2_projects** - Presentation projects with slides
- **v2_presentations** - Individual presentations within projects
- **v2_messages** - AI chat history for BREW assistant

### Stripe Billing Columns (v2_users)
- `plan` - Current subscription plan (starter/pro/enterprise)
- `stripe_customer_id` - Stripe customer ID
- `stripe_subscription_id` - Stripe subscription ID
- `subscription_status` - Active/canceled/past_due
- `subscription_current_period_end` - Billing period end date
- `subscription_workspace_id` - Workspace tied to subscription

### Security Features
- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Policies ensure users can only access their own data
- ✅ Automatic user profile creation on signup
- ✅ Updated_at triggers for all tables
- ✅ Database indexes for performance

---

## 🔐 Authentication Flow

The schema includes a trigger that automatically creates a user profile when someone signs up:

1. User signs up via Supabase Auth
2. `on_auth_user_created` trigger fires
3. Profile created in `v2_users` table
4. User can immediately use the app

---

## 🎯 Testing the Setup

After running the schema, test the complete flow:

1. **Sign Up**: Create a new account
2. **Check User**: Verify profile was created in v2_users
3. **Create Workspace**: Onboarding should create default workspace
4. **AI Generation**: Test BREW assistant to create presentation
5. **Stripe Checkout**: Test subscription flow (uses test mode keys)

---

## 🐛 Troubleshooting

### "relation v2_users does not exist"

**Problem**: Schema hasn't been run in Supabase yet

**Solution**: Follow Step 1-2 above to run the schema script

### "permission denied for schema public"

**Problem**: Using anon key instead of service role key

**Solution**: Make sure backend uses `SUPABASE_SERVICE_ROLE_KEY`, not `SUPABASE_ANON_KEY`

### "duplicate key value violates unique constraint"

**Problem**: Running schema multiple times

**Solution**: The script uses `IF NOT EXISTS` - safe to re-run. If issues persist, drop tables and re-run:

```sql
DROP TABLE IF EXISTS public.v2_messages CASCADE;
DROP TABLE IF EXISTS public.v2_presentations CASCADE;
DROP TABLE IF EXISTS public.v2_projects CASCADE;
DROP TABLE IF EXISTS public.v2_brands CASCADE;
DROP TABLE IF EXISTS public.v2_workspaces CASCADE;
DROP TABLE IF EXISTS public.v2_users CASCADE;
DROP TABLE IF EXISTS public.v2_ai_settings CASCADE;
```

Then run the full schema script again.

### "insert or update on table violates foreign key constraint"

**Problem**: Tables created in wrong order

**Solution**: Re-run the entire schema script - it creates tables in the correct dependency order

---

## 🚀 Next Steps After Setup

Once your database is ready:

1. ✅ **Test Authentication**: Sign up and verify user profile is created
2. ✅ **Test AI Generation**: Create a presentation with BREW
3. ✅ **Test Stripe Billing**: Subscribe to Pro plan (test mode)
4. ✅ **Test Project Editor**: Edit slides with autosave
5. ✅ **Review Admin Panel**: Configure AI settings, manage users

---

## 📊 Database Management

### Viewing Data

Use Supabase Table Editor:
1. Go to **Table Editor** in Supabase dashboard
2. Select a table (e.g., v2_users, v2_projects)
3. View, edit, or delete rows

### Backup & Export

1. Go to **Database** → **Backups** in Supabase
2. Configure daily backups (recommended)
3. Export data via SQL Editor:

```sql
-- Export all users
SELECT * FROM public.v2_users;

-- Export all projects
SELECT * FROM public.v2_projects;
```

### Monitoring

- Check **Database** → **Logs** for errors
- Review **Auth** → **Users** for signup/login issues
- Monitor **Storage** usage for uploaded logos

---

## 🔄 Schema Updates

If you need to modify the schema later:

1. Make changes in `supabase-schema-with-billing.sql`
2. Run the modified script in SQL Editor
3. Use `ALTER TABLE` for adding columns:

```sql
-- Example: Add new column
ALTER TABLE public.v2_users 
ADD COLUMN IF NOT EXISTS new_field TEXT;
```

4. Drop and recreate policies if needed:

```sql
-- Example: Update RLS policy
DROP POLICY IF EXISTS "Policy name" ON public.table_name;
CREATE POLICY "Policy name" ON public.table_name
  FOR SELECT USING (auth.uid() = user_id);
```

---

## ✅ Checklist

Before marking the database as ready:

- [ ] Schema script ran successfully
- [ ] All 7+ tables exist in Supabase
- [ ] RLS policies are enabled
- [ ] Trigger creates user profile on signup
- [ ] Backend can connect to database (check logs)
- [ ] Test signup creates v2_users row
- [ ] Test workspace creation works
- [ ] Test project creation works

---

## 🆘 Need Help?

- **Supabase Docs**: https://supabase.com/docs
- **SQL Editor Guide**: https://supabase.com/docs/guides/database/sql-editor
- **RLS Policies**: https://supabase.com/docs/guides/auth/row-level-security
- **Schema Migrations**: https://supabase.com/docs/guides/database/migrations

---

**Ready to proceed?** Run the schema script in Supabase SQL Editor, then test the signup flow! 🚀
