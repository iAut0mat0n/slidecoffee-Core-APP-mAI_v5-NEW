# 🔐 CRITICAL SECURITY CHECKLIST FOR PRODUCTION DEPLOYMENT

## ⚠️ MANDATORY: Before deploying SlideCoffee to production

### 🚨 CRITICAL: Row-Level Security (RLS)

**STATUS: NOT ENABLED IN DEVELOPMENT** ✋

The v2_user_context table currently has **NO database-level security** because the development database doesn't have Supabase's auth schema. This means application-level security is the ONLY protection.

**YOU MUST enable RLS before going to production!**

#### Step 1: Apply RLS Policies (REQUIRED)

```bash
# Connect to your production Supabase database
# Run the RLS policies file
psql <your-production-db-url> -f server/database/rls-policies.sql
```

Or use the Supabase Dashboard SQL Editor:
1. Navigate to SQL Editor in Supabase Dashboard
2. Copy contents of `server/database/rls-policies.sql`
3. Execute the SQL
4. Verify policies are created

#### Step 2: Verify RLS is Active (REQUIRED)

```bash
# Run verification script
psql <your-production-db-url> -f server/database/verify-rls.sql
```

**Expected output:**
- `rls_enabled` should be `TRUE`
- Should see 4 policies listed
- Query should only return current user's data

#### Step 3: Rotate Service Role Key (RECOMMENDED)

After enabling RLS:
1. Go to Supabase Dashboard → Settings → API
2. Generate a new service role key
3. Update `SUPABASE_SERVICE_ROLE_KEY` in production environment
4. Restart application

**Why?** Even with RLS enabled, the old key may have been exposed during development.

---

## 🔒 Additional Security Checklist

### Environment Variables

- [ ] `JWT_SECRET` - Set to a secure random value (32+ characters)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Server-side only, rotated after RLS
- [ ] `STRIPE_SECRET_KEY` - Never exposed to client
- [ ] `STRIPE_WEBHOOK_SECRET` - Validated on all webhook requests
- [ ] `ANTHROPIC_API_KEY` or `OPENAI_API_KEY` - Secure AI provider keys

### Database Security

- [ ] RLS enabled on `v2_user_context` table ✅
- [ ] RLS policies tested with multiple users ✅
- [ ] Database backup and recovery plan ✅
- [ ] Connection pooling configured ✅

### API Security

- [ ] All sensitive endpoints require authentication ✅
- [ ] Rate limiting enabled (20 req/min per user) ✅
- [ ] Input validation on all endpoints ✅
- [ ] Error messages sanitized (no internal details) ✅
- [ ] CORS configured for production domain ✅

### AI & Search Security

- [ ] Web search queries sanitized ✅
- [ ] Web search timeout (10s) ✅
- [ ] AI payload size limits (100KB) ✅
- [ ] User context size limits (50KB) ✅

### Authentication

- [ ] Supabase auth configured ✅
- [ ] JWT token validation ✅
- [ ] Session management ✅
- [ ] Token refresh handling ✅

### Monitoring

- [ ] Error tracking configured (Sentry, etc.)
- [ ] Performance monitoring
- [ ] Security audit logging
- [ ] RLS policy violation monitoring

---

## 🎯 Current Security Status

### ✅ IMPLEMENTED (Active in all environments)

- **Authentication**: All sensitive endpoints protected with `requireAuth`
- **Authorization**: UserId/WorkspaceId derived from verified sessions
- **Input Validation**: All inputs validated (type, size, format)
- **Rate Limiting**: 20 requests/minute per user
- **Error Sanitization**: No internal details exposed
- **Web Search Security**: Timeout, sanitization, size limits
- **Database Constraints**: CHECK constraints, indexes
- **Service Key Isolation**: Service key server-side only

### ⚠️ PRODUCTION REQUIRED (NOT active in development)

- **Row-Level Security**: RLS policies ready but NOT applied
  - File: `server/database/rls-policies.sql`
  - Documentation: `server/database/SECURITY.md`
  - Verification: `server/database/verify-rls.sql`

---

## 📋 Pre-Deployment Command

Run this command to verify everything is ready:

```bash
# Check if JWT_SECRET is set
echo "JWT_SECRET: ${JWT_SECRET:+SET}"

# Check if service key is configured
echo "SERVICE_KEY: ${SUPABASE_SERVICE_ROLE_KEY:+SET}"

# Remind about RLS
echo ""
echo "⚠️  CRITICAL: Have you enabled RLS on v2_user_context? (Y/N)"
echo "   If NO, run: psql <db-url> -f server/database/rls-policies.sql"
```

---

## 🚀 Deployment Steps

1. **Set all environment variables** (see list above)
2. **Apply RLS policies** (`rls-policies.sql`)
3. **Verify RLS** (`verify-rls.sql`)
4. **Rotate service key** (Supabase Dashboard)
5. **Update environment** with new service key
6. **Deploy application**
7. **Test authentication** with multiple users
8. **Verify RLS isolation** (users should only see their data)
9. **Monitor logs** for any security issues

---

## 📚 Documentation

- **Security Architecture**: `server/database/SECURITY.md`
- **RLS Policies**: `server/database/rls-policies.sql`
- **RLS Verification**: `server/database/verify-rls.sql`
- **Project Overview**: `replit.md`

---

## ⚡ Quick Reference

**Is my data secure right now?**
- Development: Application-level security only
- Production: REQUIRES RLS to be enabled

**What happens if service key leaks?**
- Without RLS: Attacker can access ALL user data 🚨
- With RLS: Attacker cannot bypass user isolation ✅

**Can I skip RLS?**
- **NO!** RLS is MANDATORY for production deployment
- Application-level security is NOT sufficient alone
- Defense-in-depth requires both layers
