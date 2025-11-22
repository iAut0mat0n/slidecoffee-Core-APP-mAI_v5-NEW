# Database Security Documentation

## v2_user_context Table Security

### Defense-in-Depth Approach

We implement multiple layers of security for the `v2_user_context` table:

#### 1. Application-Level Security (ACTIVE in all environments)

**Location:** `server/utils/user-context.ts`

- ✅ **UserId Validation:** All methods validate `userId` is a non-empty string
- ✅ **REQUIRED Filter:** All queries MUST include `.eq('user_id', userId)`
- ✅ **Type Whitelist:** Only allowed context types can be stored
- ✅ **Size Limits:** Keys ≤ 255 chars, values ≤ 50KB
- ✅ **Result Limits:** Maximum 100 items per query

**Location:** `server/routes/user-context.ts`

- ✅ **Authentication Required:** `requireAuth` middleware on all endpoints
- ✅ **UserId from Session:** Derived from `req.user.id` (authenticated session)
- ✅ **Input Validation:** All inputs validated before DB operations
- ✅ **Error Sanitization:** No internal details exposed to clients

**Location:** `server/routes/ai-chat-stream.ts`

- ✅ **Authentication Required:** `requireAuth` middleware enforced
- ✅ **UserId from Session:** Never trusted from request body
- ✅ **Rate Limiting:** 20 requests/minute per user
- ✅ **Payload Limits:** Max 100 messages, 100KB total

#### 2. Database-Level Security (REQUIRED for production)

**Status:**
- ❌ **Development Database:** RLS policies cannot be applied (no auth schema)
- ✅ **Production Deployment:** RLS policies MUST be applied via `rls-policies.sql`

**RLS Policies (Production Supabase):**

```sql
-- Enable RLS
ALTER TABLE v2_user_context ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "user_context_read_own" ON v2_user_context
FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "user_context_insert_own" ON v2_user_context
FOR INSERT WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "user_context_update_own" ON v2_user_context
FOR UPDATE USING (user_id = auth.uid()::text);

CREATE POLICY "user_context_delete_own" ON v2_user_context
FOR DELETE USING (user_id = auth.uid()::text);
```

#### 3. Database Constraints (ACTIVE)

**Location:** Database schema

- ✅ **CHECK Constraint:** `context_type` must be in allowed list
- ✅ **CHECK Constraint:** `context_key` length 1-255 characters
- ✅ **NOT NULL Constraint:** `user_id` cannot be null
- ✅ **Composite Indexes:** Performance optimization on common queries

### Production Deployment Checklist

Before deploying to production Supabase:

1. ✅ Verify all application-level security is in place
2. ⚠️ **CRITICAL:** Run `rls-policies.sql` on production database
3. ✅ Ensure `SUPABASE_SERVICE_ROLE_KEY` is server-side only (never exposed to client)
4. ✅ Verify all API endpoints use `requireAuth` middleware
5. ⚠️ Consider implementing Redis-based rate limiting for horizontal scaling
6. ✅ Test RLS policies with different user accounts
7. ✅ Rotate service role key after RLS is enabled

### Service Key Security

**Critical Requirements:**

- ✅ Service role key stored in server environment variables only
- ✅ Never bundled in client-side code or exposed via API
- ✅ Only used in backend routes and utilities
- ✅ Should be rotated regularly (especially after enabling RLS)

**Locations where service key is used:**
- `server/utils/user-context.ts` (backend only)
- `server/routes/user-context.ts` (backend only)
- `server/middleware/auth.ts` (backend only)

### Risk Assessment

**Without RLS (Development):**
- ⚠️ **Risk:** If service key is leaked, all user data can be accessed
- ✅ **Mitigation:** Application-level validation enforces user isolation
- ✅ **Mitigation:** Service key never exposed to client
- ✅ **Mitigation:** All endpoints require authentication

**With RLS (Production):**
- ✅ **Defense-in-depth:** Database layer enforces isolation even if app has bugs
- ✅ **Service key leak protected:** RLS policies prevent cross-tenant access
- ✅ **Application + Database security:** Multiple layers of protection

### Testing RLS Policies

After deploying to production:

```sql
-- Test as user A (should only see their data)
SET request.jwt.claim.sub = 'user-a-id';
SELECT * FROM v2_user_context; -- Should only return user A's data

-- Test as user B (should only see their data)
SET request.jwt.claim.sub = 'user-b-id';
SELECT * FROM v2_user_context; -- Should only return user B's data

-- Verify cross-user access is blocked
SET request.jwt.claim.sub = 'user-a-id';
SELECT * FROM v2_user_context WHERE user_id = 'user-b-id'; -- Should return 0 rows
```

### Monitoring & Alerts

Recommended monitoring:

1. **Service Key Access:** Monitor for unusual access patterns
2. **Failed Auth Attempts:** Track 401/403 responses
3. **Rate Limit Triggers:** Monitor 429 responses
4. **Large Queries:** Alert on queries returning 100+ items
5. **RLS Policy Violations:** Monitor Supabase logs for policy denials
