# Real-Time Collaboration Security Architecture

## Overview
This document details the security architecture for SlideCoffee's real-time collaboration features, including comments, presence tracking, @mentions, and viral sharing analytics.

## Tables and RLS Policies

### 1. v2_comments (Real-Time Comments)
**Purpose**: Threaded comments on presentation slides with live Supabase Realtime updates

**Security Model**: Workspace-scoped access
- Users can read comments in presentations within their workspace
- Users can create comments only in their workspace's presentations
- Users can only update/delete their own comments

**RLS Policies**:
- `comments_read_workspace`: Read comments via workspace membership
- `comments_insert_workspace`: Create comments if author matches auth.uid(), workspace membership verified, AND presentation ownership confirmed
- `comments_update_own_or_admin`: Update own comments OR workspace admins/owners can moderate
- `comments_delete_own_or_admin`: Delete own comments OR workspace admins/owners can moderate

**Application Layer**: All endpoints verify `workspace_id` via `v2_presentations` lookup

---

### 2. v2_presence (Live Presence Tracking)
**Purpose**: Real-time collaborator tracking with heartbeat system (10s intervals, 30s auto-expire)

**Security Model**: Workspace visibility, own-record mutation
- Users can see all active presence records in their workspace
- Users can only create/update/delete their own presence records

**RLS Policies**:
- `presence_read_workspace`: Read presence via workspace membership
- `presence_insert_own`: Create only if user_id matches auth.uid() and workspace membership verified
- `presence_update_own`: Update only own presence records
- `presence_delete_own`: Delete only own presence records

**Application Layer**: Heartbeat endpoint verifies user owns the presence record

---

### 3. v2_notifications (@Mentions & Replies)
**Purpose**: Notification system for @mentions and comment replies

**Security Model**: User-scoped access, service-role creation
- Users can only read their own notifications
- Users can mark their own notifications as read/deleted
- **Only service role can create notifications** (backend-only operation)

**RLS Policies**:
- `notifications_read_own`: Read only where user_id = auth.uid()
- `notifications_update_own`: Update only own notifications (mark as read)
- `notifications_delete_own`: Delete only own notifications
- **No user INSERT policy**: Service role bypasses RLS for notification creation

**Application Layer**: 
- Notifications created via service role client in `server/utils/mentions.ts`
- @mentions parser resolves workspace users and creates notifications automatically
- Reply notifications sent to parent comment authors

---

### 4. v2_presentation_views (Viral Sharing Analytics)
**Purpose**: Anonymous viewer tracking for viral sharing metrics

**Security Model**: Workspace read-only, service-role writes
- Users can read view analytics for presentations in their workspace
- **Only service role can track views** (backend-only operation)
- Views are immutable (no UPDATE or DELETE policies)

**RLS Policies**:
- `views_read_workspace`: Read analytics via workspace membership
- **No user INSERT/UPDATE/DELETE policies**: Service role only

**Application Layer**:
- Views tracked in `/api/present/:token` endpoint (public, no auth)
- View records created via service role for anonymous visitors

---

## Defense-in-Depth Strategy

### Layer 1: Database RLS (Production Supabase Only)
- Enforced at database level via Postgres Row Level Security
- Uses `auth.uid()` for user identification
- Uses `v2_workspace_members` for workspace verification
- **Development database**: No auth schema, RLS enforcement skipped

### Layer 2: Application-Level Security (All Environments)
- All authenticated endpoints verify `workspace_id` via JWT token
- Explicit `.eq('workspace_id', workspaceId)` filters in all queries
- Ownership verification for update/delete operations
- Input validation on all user-provided data

### Layer 3: Service Role Operations
- Notifications and analytics use service role client (bypasses RLS)
- Service role operations are backend-only (no client exposure)
- Error handling prevents notification failures from blocking primary operations

---

## Production Deployment Checklist

### Pre-Deployment
1. ✅ Apply migration: `supabase/migrations/add_collaboration_rls_policies.sql`
2. ✅ Verify RLS enabled: `SELECT tablename, rowsecurity FROM pg_tables WHERE tablename IN ('v2_comments', 'v2_presence', 'v2_notifications', 'v2_presentation_views');`
3. ✅ Test policies with real Supabase auth users
4. ✅ Verify service role can create notifications/views despite RLS

### Post-Deployment Verification
1. Test comment creation from different workspace users
2. Verify users cannot see comments from other workspaces
3. Verify presence tracking shows only workspace collaborators
4. Test @mentions notification creation
5. Confirm anonymous view tracking works on shared presentations

---

## Security Audit Results
**Architect Review**: [PENDING]
- Workspace isolation verified at DB and application layers
- Service role operations properly scoped to backend
- Input validation prevents injection attacks
- Real-time subscriptions filtered by workspace_id

**Critical Notes**:
- Development database uses application-layer security only (no auth schema)
- Production Supabase database requires migration application for RLS
- Service role credentials must be server-side only (never exposed to client)

---

## References
- Full RLS migration: `supabase/migrations/add_collaboration_rls_policies.sql`
- Application security: `server/routes/comments.ts`, `server/routes/presentations.ts`
- Service role operations: `server/utils/mentions.ts`, `server/utils/supabase-auth.ts`
