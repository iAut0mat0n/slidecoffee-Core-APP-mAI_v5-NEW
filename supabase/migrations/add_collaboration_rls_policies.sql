-- 🔒 Row Level Security Policies for Real-Time Collaboration Features
-- This migration adds RLS policies for v2_comments, v2_presence, v2_notifications, v2_presentation_views
-- Apply this to production Supabase database for workspace isolation

-- ============================================================================
-- v2_comments: Real-time collaboration comments
-- ============================================================================

-- Enable RLS (if not already enabled)
ALTER TABLE v2_comments ENABLE ROW LEVEL SECURITY;

-- Read: Users can read comments in presentations within their workspace
CREATE POLICY "comments_read_workspace" 
ON v2_comments 
FOR SELECT 
USING (
  workspace_id IN (
    SELECT workspace_id 
    FROM v2_workspace_members 
    WHERE user_id = auth.uid()
  )
);

-- Insert: Users can create comments only in their workspace's presentations (verifies presentation ownership)
CREATE POLICY "comments_insert_workspace" 
ON v2_comments 
FOR INSERT 
WITH CHECK (
  author_id = auth.uid()
  AND workspace_id IN (
    SELECT workspace_id 
    FROM v2_workspace_members 
    WHERE user_id = auth.uid()
  )
  AND EXISTS (
    SELECT 1
    FROM v2_presentations p
    WHERE p.id = v2_comments.presentation_id
    AND p.workspace_id = v2_comments.workspace_id
  )
);

-- Update: Users can update their own comments OR workspace admins/owners can moderate
-- SECURITY: Re-verify workspace membership and presentation ownership to prevent cross-workspace injection
CREATE POLICY "comments_update_own_or_admin" 
ON v2_comments 
FOR UPDATE 
USING (
  (author_id = auth.uid() OR EXISTS (
    SELECT 1 FROM v2_workspace_members 
    WHERE workspace_id = v2_comments.workspace_id
    AND user_id = auth.uid()
    AND role IN ('admin', 'owner')
  ))
  AND workspace_id IN (
    SELECT workspace_id FROM v2_workspace_members 
    WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  (author_id = auth.uid() OR EXISTS (
    SELECT 1 FROM v2_workspace_members 
    WHERE workspace_id = v2_comments.workspace_id
    AND user_id = auth.uid()
    AND role IN ('admin', 'owner')
  ))
  AND workspace_id IN (
    SELECT workspace_id FROM v2_workspace_members 
    WHERE user_id = auth.uid()
  )
  AND EXISTS (
    SELECT 1 FROM v2_presentations p
    WHERE p.id = v2_comments.presentation_id
    AND p.workspace_id = v2_comments.workspace_id
  )
);

-- Delete: Users can delete their own comments OR workspace admins/owners can moderate
-- SECURITY: Re-verify workspace membership to prevent cross-workspace deletion
CREATE POLICY "comments_delete_own_or_admin" 
ON v2_comments 
FOR DELETE 
USING (
  (author_id = auth.uid() OR EXISTS (
    SELECT 1 FROM v2_workspace_members 
    WHERE workspace_id = v2_comments.workspace_id
    AND user_id = auth.uid()
    AND role IN ('admin', 'owner')
  ))
  AND workspace_id IN (
    SELECT workspace_id FROM v2_workspace_members 
    WHERE user_id = auth.uid()
  )
);


-- ============================================================================
-- v2_presence: Live presence tracking
-- ============================================================================

-- Enable RLS
ALTER TABLE v2_presence ENABLE ROW LEVEL SECURITY;

-- Read: Users can see active collaborators in their workspace
CREATE POLICY "presence_read_workspace" 
ON v2_presence 
FOR SELECT 
USING (
  workspace_id IN (
    SELECT workspace_id 
    FROM v2_workspace_members 
    WHERE user_id = auth.uid()
  )
);

-- Insert: Users can only create their own presence records
CREATE POLICY "presence_insert_own" 
ON v2_presence 
FOR INSERT 
WITH CHECK (
  user_id = auth.uid()
  AND workspace_id IN (
    SELECT workspace_id 
    FROM v2_workspace_members 
    WHERE user_id = auth.uid()
  )
);

-- Update: Users can only update their own presence within their workspace
-- SECURITY: Re-verify workspace membership to prevent cross-workspace presence manipulation
CREATE POLICY "presence_update_own" 
ON v2_presence 
FOR UPDATE 
USING (
  user_id = auth.uid()
  AND workspace_id IN (
    SELECT workspace_id FROM v2_workspace_members 
    WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  user_id = auth.uid()
  AND workspace_id IN (
    SELECT workspace_id FROM v2_workspace_members 
    WHERE user_id = auth.uid()
  )
);

-- Delete: Users can only delete their own presence within their workspace
-- SECURITY: Re-verify workspace membership to prevent cross-workspace presence deletion
CREATE POLICY "presence_delete_own" 
ON v2_presence 
FOR DELETE 
USING (
  user_id = auth.uid()
  AND workspace_id IN (
    SELECT workspace_id FROM v2_workspace_members 
    WHERE user_id = auth.uid()
  )
);


-- ============================================================================
-- v2_notifications: @mentions and reply notifications
-- ============================================================================

-- Enable RLS
ALTER TABLE v2_notifications ENABLE ROW LEVEL SECURITY;

-- Read: Users can only read their own notifications
CREATE POLICY "notifications_read_own" 
ON v2_notifications 
FOR SELECT 
USING (user_id = auth.uid());

-- Insert: No user INSERT policy - service role bypasses RLS automatically
-- Backend creates notifications via getServiceRoleClient() which bypasses all RLS

-- Update: Users can mark their own notifications as read
CREATE POLICY "notifications_update_own" 
ON v2_notifications 
FOR UPDATE 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Delete: Users can delete their own notifications
CREATE POLICY "notifications_delete_own" 
ON v2_notifications 
FOR DELETE 
USING (user_id = auth.uid());


-- ============================================================================
-- v2_presentation_views: Viral sharing analytics
-- ============================================================================

-- Enable RLS
ALTER TABLE v2_presentation_views ENABLE ROW LEVEL SECURITY;

-- Read: Users can see view analytics for presentations in their workspace
CREATE POLICY "views_read_workspace" 
ON v2_presentation_views 
FOR SELECT 
USING (
  workspace_id IN (
    SELECT workspace_id 
    FROM v2_workspace_members 
    WHERE user_id = auth.uid()
  )
);

-- Insert: No user INSERT policy - service role bypasses RLS automatically
-- Backend tracks views via getServiceRoleClient() in public /api/present/:token endpoint

-- No UPDATE or DELETE policies - view analytics are immutable


-- ============================================================================
-- Security Comments
-- ============================================================================

COMMENT ON TABLE v2_comments IS 
'Real-time collaboration comments with threaded replies. 
RLS enforced: Users can only read/write comments in their workspace.
Application layer also validates workspace_id in all queries for defense-in-depth.';

COMMENT ON TABLE v2_presence IS 
'Live presence tracking for real-time collaboration. 
RLS enforced: Users can only see/update their own presence and view others in their workspace.
Application layer includes heartbeat system with 30s auto-expire.';

COMMENT ON TABLE v2_notifications IS 
'@mentions and reply notifications. 
RLS enforced: Users can only read/update/delete their own notifications.
Service role creates notifications via backend for mentions and replies.';

COMMENT ON TABLE v2_presentation_views IS 
'Anonymous viewer analytics for viral sharing. 
RLS enforced: Users can only read analytics for their workspace presentations.
Service role tracks views via backend for anonymous visitors.';
