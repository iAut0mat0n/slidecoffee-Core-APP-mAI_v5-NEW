# 🚨 SlideCoffee Recovery Plan

**Created:** January 14, 2025  
**Status:** CRITICAL - Multiple Systems Broken  
**User:** javian@forthlogic.com

---

## 🔍 DIAGNOSIS SUMMARY

### What's Working ✅
1. User can login via Supabase Auth
2. Admin panel is accessible at `/admin-10e8da8c6b8a1940fbe8d0fbc5dd553e`
3. PostgreSQL database is live on Supabase
4. Railway deployment pipeline works
5. Basic frontend UI loads

### What's Broken ❌
1. **Admin Panel Functionality**
   - Metrics don't load (shows 0 users, $0 revenue)
   - Cannot switch AI providers
   - Activity feed empty
   - System settings not working

2. **Database Configuration**
   - Code uses `mysql2` package but database is PostgreSQL
   - TypeScript compilation errors due to MySQL/PostgreSQL type mismatch
   - `drizzle.config.ts` says PostgreSQL but `package.json` has MySQL2

3. **User Management**
   - User auto-creation on login may be broken
   - Credits display issues
   - Workspace functionality unclear

4. **Build System**
   - TypeScript errors preventing clean builds
   - CORS errors in console logs

---

## 🎯 ROOT CAUSES

### 1. Incomplete MySQL → PostgreSQL Migration
**Problem:** The migration from Railway MySQL to Supabase PostgreSQL was incomplete.

**Evidence:**
- `package.json` still has `mysql2` dependency
- No `pg` (PostgreSQL) package installed
- TypeScript throwing MySQL type compatibility errors
- Code may be trying to use MySQL syntax with PostgreSQL database

**Impact:** Database operations may fail silently, causing admin panel to show empty data.

---

### 2. Missing Admin Role Assignment
**Problem:** User `javian@forthlogic.com` may not have `adminRole='super_admin'` in database.

**Evidence:**
- Admin panel requires `ctx.user.adminRole === 'super_admin'` for system settings
- User was manually created but adminRole may not be set
- System settings queries check for `super_admin` role

**Impact:** API key switching and system settings won't work without super_admin role.

---

### 3. Empty Database Tables
**Problem:** Database tables may exist but have no data.

**Evidence:**
- Admin stats show 0 users, 0 subscriptions
- Activity feed empty
- No metrics loading

**Impact:** Admin panel appears broken because there's no data to display.

---

## 📋 RECOVERY PLAN (6 Phases)

### **Phase 1: Database Configuration Fix** 🔧
**Priority:** CRITICAL  
**Estimated Time:** 30 minutes

**Tasks:**
1. Remove `mysql2` from package.json
2. Add `pg` (PostgreSQL client) to package.json
3. Verify `server/db.ts` uses correct PostgreSQL imports
4. Run `pnpm install` to update dependencies
5. Fix any remaining MySQL-specific code (if any)
6. Verify TypeScript compilation succeeds (0 errors)

**Success Criteria:**
- ✅ No TypeScript errors
- ✅ `pnpm build` succeeds
- ✅ Database connection works in production

---

### **Phase 2: User & Admin Role Setup** 👤
**Priority:** CRITICAL  
**Estimated Time:** 15 minutes

**Tasks:**
1. Query Supabase database to check if `javian@forthlogic.com` exists
2. If user doesn't exist, create user record with:
   - email: javian@forthlogic.com
   - role: admin
   - adminRole: super_admin
   - subscriptionTier: enterprise
   - creditsRemaining: 10000
3. If user exists, UPDATE to set `adminRole='super_admin'`
4. Verify user can access system settings

**SQL to Run:**
```sql
-- Check if user exists
SELECT * FROM users WHERE email = 'javian@forthlogic.com';

-- If exists, update admin role
UPDATE users 
SET "adminRole" = 'super_admin', 
    "subscriptionTier" = 'enterprise',
    "creditsRemaining" = 10000
WHERE email = 'javian@forthlogic.com';

-- If doesn't exist, insert
INSERT INTO users (
  "openId", name, email, role, "adminRole", 
  "subscriptionTier", "creditsRemaining"
) VALUES (
  'javian-forthlogic-admin', 
  'Javian', 
  'javian@forthlogic.com', 
  'admin', 
  'super_admin', 
  'enterprise', 
  10000
);
```

**Success Criteria:**
- ✅ User exists in database
- ✅ adminRole = 'super_admin'
- ✅ Can access System Settings tab in admin panel

---

### **Phase 3: Admin Panel Backend Fixes** 🔌
**Priority:** HIGH  
**Estimated Time:** 45 minutes

**Tasks:**
1. **Fix getStats Query**
   - Verify database connection in adminRouter
   - Add error logging to see why stats return 0
   - Test query directly in Supabase SQL editor

2. **Fix AI Provider Switching**
   - Verify `systemSettings` table exists in database
   - Create table if missing
   - Test setAIModel mutation
   - Add API key management UI

3. **Fix Activity Feed**
   - Check if `adminActivityLogs` table exists
   - Create table if missing
   - Add logging to track admin actions

4. **Add Proper Error Handling**
   - Wrap all admin queries in try-catch
   - Return meaningful error messages
   - Log errors to console for debugging

**Success Criteria:**
- ✅ Admin stats show real numbers (users, revenue)
- ✅ Can switch AI providers (Manus → Claude → GPT-4)
- ✅ Activity feed shows recent actions
- ✅ No silent failures

---

### **Phase 4: API Key Management** 🔑
**Priority:** HIGH  
**Estimated Time:** 30 minutes

**Tasks:**
1. Create `systemSettings` table if missing:
```sql
CREATE TABLE IF NOT EXISTS "systemSettings" (
  id SERIAL PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  value TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  description TEXT,
  "isSecret" INTEGER DEFAULT 0,
  "updatedBy" INTEGER,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);
```

2. Add UI for API key management in SystemSettings component:
   - Input fields for OpenAI API key
   - Input fields for Anthropic API key
   - Test connection buttons
   - Save/update functionality

3. Wire up backend mutations:
   - Save API keys to systemSettings table
   - Mask secrets in UI (show ********)
   - Use keys in aiService.ts

**Success Criteria:**
- ✅ Can add OpenAI API key
- ✅ Can add Anthropic API key
- ✅ Can test connections
- ✅ AI provider switching works end-to-end

---

### **Phase 5: Testing & Verification** ✅
**Priority:** HIGH  
**Estimated Time:** 30 minutes

**Test Checklist:**
1. **Admin Panel Dashboard**
   - [ ] Stats load correctly (users, revenue, tier breakdown)
   - [ ] Numbers match database reality
   - [ ] No console errors

2. **User Management**
   - [ ] Can view all users
   - [ ] Can change user roles
   - [ ] Can change subscription tiers
   - [ ] Can export CSV

3. **AI Provider Management**
   - [ ] Can view current AI model
   - [ ] Can switch to Claude
   - [ ] Can switch to GPT-4
   - [ ] Can test connections
   - [ ] Test succeeds with valid API key

4. **System Settings**
   - [ ] Can view all settings
   - [ ] Can add new API keys
   - [ ] Secrets are masked
   - [ ] System health shows correct status

5. **Activity Feed**
   - [ ] Shows recent admin actions
   - [ ] Updates in real-time
   - [ ] Includes timestamps and user attribution

**Success Criteria:**
- ✅ All 5 test categories pass
- ✅ No TypeScript errors
- ✅ No console errors
- ✅ Admin panel fully functional

---

### **Phase 6: Deployment & Documentation** 🚀
**Priority:** MEDIUM  
**Estimated Time:** 20 minutes

**Tasks:**
1. **Git Commit & Push**
   - Commit all fixes with clear message
   - Push to GitHub main branch
   - Verify Railway auto-deploys

2. **Update Documentation**
   - Document admin panel URL
   - Document super admin credentials
   - Document API key setup process
   - Update FEATURES.md with fixed status

3. **Create Admin User Guide**
   - How to access admin panel
   - How to switch AI providers
   - How to manage users
   - How to view metrics

**Success Criteria:**
- ✅ Changes deployed to production
- ✅ Documentation updated
- ✅ User can self-serve for future admin tasks

---

## 🔧 TECHNICAL DETAILS

### Database Schema Verification Needed

**Tables to Check:**
1. `users` - User accounts
2. `workspaces` - User workspaces
3. `brands` - Brand guidelines
4. `presentations` - Projects/presentations
5. `systemSettings` - System configuration
6. `adminActivityLogs` - Admin action tracking

**SQL to Run:**
```sql
-- Check which tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Count records in each table
SELECT 
  (SELECT COUNT(*) FROM users) as users_count,
  (SELECT COUNT(*) FROM workspaces) as workspaces_count,
  (SELECT COUNT(*) FROM presentations) as presentations_count;
```

---

### MySQL → PostgreSQL Syntax Differences

**Common Issues:**
1. **Auto-increment:** `AUTO_INCREMENT` → `SERIAL`
2. **Boolean:** `TINYINT(1)` → `BOOLEAN`
3. **JSON:** `JSON` type works differently
4. **Enums:** MySQL enum syntax vs PostgreSQL enum types
5. **Insert returning:** MySQL uses `insertId`, PostgreSQL uses `.returning()`

**Already Fixed (per inherited context):**
- ✅ insertId → .returning() conversions
- ✅ Enum type definitions
- ✅ JSON type handling

**May Still Need Fixing:**
- ⚠️ Package dependencies (mysql2 → pg)
- ⚠️ Connection pooling configuration
- ⚠️ Query syntax edge cases

---

## 📊 ESTIMATED TIMELINE

| Phase | Time | Dependencies |
|-------|------|--------------|
| Phase 1: Database Config | 30 min | None |
| Phase 2: User Setup | 15 min | Phase 1 |
| Phase 3: Admin Backend | 45 min | Phase 1, 2 |
| Phase 4: API Keys | 30 min | Phase 3 |
| Phase 5: Testing | 30 min | Phase 1-4 |
| Phase 6: Deployment | 20 min | Phase 5 |
| **TOTAL** | **2h 50min** | Sequential |

**With parallel work:** ~2 hours  
**With testing delays:** ~3-4 hours

---

## 🚨 RISKS & MITIGATION

### Risk 1: Database Connection Fails After Package Change
**Likelihood:** Medium  
**Impact:** High  
**Mitigation:** Test connection locally before deploying to production

### Risk 2: Existing Data Gets Lost
**Likelihood:** Low  
**Impact:** Critical  
**Mitigation:** Take database backup before making changes

### Risk 3: Railway Environment Variables Missing
**Likelihood:** Medium  
**Impact:** High  
**Mitigation:** Verify all env vars are set in Railway dashboard

### Risk 4: API Keys Don't Work
**Likelihood:** Medium  
**Impact:** Medium  
**Mitigation:** Test connections before saving, provide clear error messages

---

## ✅ SUCCESS METRICS

**Admin Panel Must:**
1. Show real user count (at least 1 - javian@forthlogic.com)
2. Show subscription breakdown with correct tiers
3. Allow switching AI providers without errors
4. Display activity feed with recent actions
5. Load system health with all services "healthy"

**User Experience Must:**
1. Login works without errors
2. Credits display correctly
3. Can create presentations
4. AI responds to chat messages
5. No console errors on any page

**Technical Quality Must:**
1. TypeScript compiles with 0 errors
2. `pnpm build` succeeds
3. All tests pass (if tests exist)
4. No CORS errors
5. Database queries execute successfully

---

## 📝 NEXT STEPS AFTER RECOVERY

**Once admin panel is working:**
1. Add more admin users if needed
2. Configure production API keys (OpenAI, Anthropic)
3. Set up monitoring and alerts
4. Create backup/restore procedures
5. Document admin workflows

**Future Enhancements:**
1. Add audit logging for all admin actions
2. Add rate limiting for API calls
3. Add cost tracking per user
4. Add usage analytics dashboard
5. Add automated health checks

---

## 🆘 EMERGENCY CONTACTS

**If recovery fails:**
- Database: Supabase Dashboard (https://supabase.com)
- Deployment: Railway Dashboard (https://railway.app)
- Repository: https://github.com/ForthLogic/slide-coffee-v1

**Rollback Plan:**
- Revert to last known good commit
- Restore database from backup
- Redeploy via Railway

---

**END OF RECOVERY PLAN**

