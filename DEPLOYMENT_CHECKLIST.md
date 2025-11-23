# SlideCoffee Production Deployment Checklist

## ✅ Completed Steps

### Database Setup
- [x] Created all 22 v2_* tables in production Supabase
- [x] Applied 12 RLS policies for collaboration features
- [x] Migrated schema (project_id → workspace_id)
- [x] Verified policies: v2_comments (4), v2_presence (4), v2_notifications (3), v2_presentation_views (1)

### Build & Configuration
- [x] Production build tested successfully
- [x] Replit Autoscale deployment configured
- [x] Environment variables verified (Supabase, Stripe, OpenAI, etc.)

## 📋 Pre-Launch Checklist

### Step 1: Verify Production Database
Run in Supabase SQL Editor:
```sql
-- Should return 22
SELECT COUNT(*) as table_count
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name LIKE 'v2_%';

-- Should show rowsecurity = true for all 4
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('v2_comments', 'v2_presence', 'v2_notifications', 'v2_presentation_views');
```

### Step 2: Environment Variables
Ensure these production secrets are set in Replit:
- [ ] `SUPABASE_URL` - Production Supabase project URL
- [ ] `SUPABASE_ANON_KEY` - Production anon key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Production service role key
- [ ] `VITE_SUPABASE_URL` - Same as SUPABASE_URL
- [ ] `VITE_SUPABASE_ANON_KEY` - Same as SUPABASE_ANON_KEY
- [ ] `STRIPE_SECRET_KEY` - Production Stripe secret
- [ ] `STRIPE_WEBHOOK_SECRET` - Production webhook secret
- [ ] `JWT_SECRET` - Strong random secret
- [ ] `ANTHROPIC_API_KEY` - Claude API key

### Step 3: Deploy to Replit
1. Click **"Deploy"** button in Replit
2. Select **Autoscale** deployment
3. Confirm configuration:
   - Build: `npm run build`
   - Run: `npm start`
4. Deploy!

### Step 4: Post-Deployment Testing

#### Test Authentication & Workspace Isolation
1. Create two test accounts
2. Each creates a workspace
3. Verify users cannot access each other's data

#### Test Collaboration Features
1. **Comments:**
   - [ ] User can create comment on own presentation
   - [ ] User cannot create comment on other workspace's presentation
   - [ ] Workspace admin can moderate comments
   - [ ] Real-time updates work across browser tabs

2. **Presence Tracking:**
   - [ ] User presence appears when viewing presentation
   - [ ] User cannot see presence from other workspaces
   - [ ] Presence expires after 30 seconds

3. **Notifications:**
   - [ ] @mentions create notifications
   - [ ] User only sees own notifications
   - [ ] Users cannot read other users' notifications

4. **View Analytics:**
   - [ ] Anonymous views are tracked
   - [ ] Users can only see analytics for their workspace

#### Test Stripe Billing
- [ ] Subscription creation works
- [ ] Webhooks process correctly
- [ ] Credit allocation works
- [ ] Plan limits enforced

#### Test AI Features
- [ ] Slide generation works
- [ ] Streaming responses function
- [ ] Research mode retrieves sources
- [ ] AI chat widget responds

### Step 5: Production Monitoring

After launch, monitor:
- Database connection pool
- API response times
- Error rates in logs
- Stripe webhook delivery
- Supabase realtime connections

## 🎯 Launch URL

Once deployed, your app will be live at:
- **Production URL**: `https://app.slidecoffee.ai` (configured via custom domain)
- **Replit URL**: `https://[your-repl-name].[username].replit.app`

## 🔒 Security Checklist

- [x] Row Level Security (RLS) enabled on all collaboration tables
- [x] Multi-tenant data isolation at database level
- [x] Service role operations properly scoped
- [x] MFA enforcement for admin routes (configured)
- [x] File upload security (MIME validation, size limits)
- [x] Rate limiting on public endpoints
- [x] Input validation across all forms
- [x] CORS configured for production domain

## 📝 Rollback Plan

If issues arise:
1. Revert deployment via Replit dashboard
2. Check logs for errors
3. Verify environment variables
4. Test database connectivity
5. Re-deploy after fixes

## ✅ Launch Approval

Once all tests pass:
- [ ] Database verified (22 tables, 12 RLS policies)
- [ ] Build successful
- [ ] Environment variables set
- [ ] Authentication tested
- [ ] Collaboration features tested
- [ ] Billing integration tested
- [ ] AI features tested

**Status**: Ready for production deployment! 🚀
