# Revert to Supabase Auth (Keep Replit PostgreSQL)

If you decide Replit Auth's UX isn't suitable, follow these steps to revert back to Supabase Auth while keeping your data in Replit PostgreSQL.

## Step 1: Restore Auth Routes

### Restore `server/routes/auth.ts`
```bash
git checkout HEAD~1 -- server/routes/auth.ts
```

Or manually restore this content:
- Use Supabase `getUser()` for token validation
- Query Replit DB for user data using Supabase user.id
- Keep the `/api/auth/me` endpoint structure

### Restore `server/middleware/auth.ts`
```bash
git checkout HEAD~1 -- server/middleware/auth.ts
```

Or manually restore:
- Extract JWT token from Authorization header or cookies
- Validate with `supabase.auth.getUser(token)`
- Query Replit DB with the authenticated user ID

## Step 2: Remove Replit Auth Files

```bash
rm server/replitAuth.ts
```

## Step 3: Update server/index.ts

Remove this line:
```typescript
import { setupAuth } from './replitAuth.js';
await setupAuth(app);
```

Remove the `await` from the top level and restore normal Express setup.

## Step 4: Uninstall Replit Auth Packages

```bash
npm uninstall passport openid-client express-session connect-pg-simple memoizee @types/passport @types/express-session @types/connect-pg-simple @types/memoizee
```

## Step 5: Update Frontend Routing

In `src/App.tsx`, change back to:
```typescript
<Route path="/signup" element={<Signup />} />
<Route path="/login" element={<Login />} />
```

Remove:
```typescript
import LoginReplit from './pages/LoginReplit'
```

## Step 6: Database Cleanup (Optional)

These columns can stay without hurting anything, but if you want to clean up:

```sql
-- Remove Replit Auth specific columns
ALTER TABLE v2_users DROP COLUMN IF EXISTS replit_auth_id;
ALTER TABLE v2_users DROP COLUMN IF EXISTS first_name;
ALTER TABLE v2_users DROP COLUMN IF EXISTS last_name;
ALTER TABLE v2_users DROP COLUMN IF EXISTS profile_image_url;

-- Drop sessions table
DROP TABLE IF EXISTS sessions;
```

## Step 7: Verify Environment Variables

Ensure these Supabase secrets are still set:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_ANON_KEY`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Step 8: Restart and Test

```bash
npm run dev
```

Test the flow:
1. Visit `/login` - should see your custom UI ✅
2. Sign up with email - should send TOTP code ✅
3. Verify email - should see your verification screen ✅
4. Complete onboarding - should create workspace in Replit DB ✅

---

## What You Keep:

✅ **Replit PostgreSQL for all data storage**
✅ **Your beautiful custom login/signup UI**
✅ **TOTP email verification screen**
✅ **All existing data and users**

## What Changes:

❌ Still need Supabase subscription for Auth (~$25/month)
✅ But Supabase is ONLY used for auth, not data storage

---

## Quick Revert Commands

```bash
# 1. Remove Replit Auth file
rm server/replitAuth.ts

# 2. Restore auth files (adjust HEAD~X to the right commit)
git checkout HEAD~5 -- server/routes/auth.ts
git checkout HEAD~5 -- server/middleware/auth.ts  
git checkout HEAD~5 -- server/index.ts
git checkout HEAD~5 -- src/App.tsx

# 3. Uninstall packages
npm uninstall passport openid-client express-session connect-pg-simple memoizee @types/passport @types/express-session @types/connect-pg-simple @types/memoizee

# 4. Restart
npm run dev
```

---

**Estimated Time:** 10 minutes
**Complexity:** Low
**Risk:** None - data is preserved in Replit DB
