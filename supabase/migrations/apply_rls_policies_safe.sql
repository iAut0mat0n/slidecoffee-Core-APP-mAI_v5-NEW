-- ============================================================================
-- SLIDECOFFEE: Apply RLS Policies ONLY (Safe Version - Core Tables Only)
-- Applies policies only to verified working tables
-- ============================================================================

-- ============================================================================
-- STEP 1: Enable RLS on core tables only
-- ============================================================================

ALTER TABLE v2_workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE v2_workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE v2_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE v2_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE v2_presentations ENABLE ROW LEVEL SECURITY;
ALTER TABLE v2_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE v2_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE v2_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE v2_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE v2_credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE v2_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE v2_presentation_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE v2_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE v2_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE v2_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE v2_presentation_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE v2_support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE v2_support_ticket_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE v2_ai_settings ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 2: Apply RLS Policies
-- ============================================================================

-- v2_workspace_members policies
DROP POLICY IF EXISTS workspace_members_read_own ON v2_workspace_members;
DROP POLICY IF EXISTS workspace_members_insert_own ON v2_workspace_members;
DROP POLICY IF EXISTS workspace_members_update_admin ON v2_workspace_members;
DROP POLICY IF EXISTS workspace_members_delete_admin ON v2_workspace_members;

CREATE POLICY workspace_members_read_own ON v2_workspace_members 
FOR SELECT USING (user_id = auth.uid() OR workspace_id IN (
  SELECT workspace_id FROM v2_workspace_members WHERE user_id = auth.uid()
));

CREATE POLICY workspace_members_insert_own ON v2_workspace_members 
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY workspace_members_update_admin ON v2_workspace_members 
FOR UPDATE USING (
  workspace_id IN (
    SELECT workspace_id FROM v2_workspace_members 
    WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
  )
);

CREATE POLICY workspace_members_delete_admin ON v2_workspace_members 
FOR DELETE USING (
  workspace_id IN (
    SELECT workspace_id FROM v2_workspace_members 
    WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
  )
);

-- v2_workspaces policies
DROP POLICY IF EXISTS workspaces_read_member ON v2_workspaces;
DROP POLICY IF EXISTS workspaces_insert_own ON v2_workspaces;
DROP POLICY IF EXISTS workspaces_update_admin ON v2_workspaces;
DROP POLICY IF EXISTS workspaces_delete_owner ON v2_workspaces;

CREATE POLICY workspaces_read_member ON v2_workspaces 
FOR SELECT USING (id IN (
  SELECT workspace_id FROM v2_workspace_members WHERE user_id = auth.uid()
));

CREATE POLICY workspaces_insert_own ON v2_workspaces 
FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY workspaces_update_admin ON v2_workspaces 
FOR UPDATE USING (id IN (
  SELECT workspace_id FROM v2_workspace_members 
  WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
));

CREATE POLICY workspaces_delete_owner ON v2_workspaces 
FOR DELETE USING (id IN (
  SELECT workspace_id FROM v2_workspace_members 
  WHERE user_id = auth.uid() AND role = 'owner'
));

-- v2_users policies
DROP POLICY IF EXISTS users_read_own ON v2_users;
DROP POLICY IF EXISTS users_update_own ON v2_users;
DROP POLICY IF EXISTS users_insert_own ON v2_users;

CREATE POLICY users_read_own ON v2_users 
FOR SELECT USING (id = auth.uid());

CREATE POLICY users_update_own ON v2_users 
FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE POLICY users_insert_own ON v2_users 
FOR INSERT WITH CHECK (id = auth.uid());

-- v2_brands policies
DROP POLICY IF EXISTS brands_read_workspace ON v2_brands;
DROP POLICY IF EXISTS brands_insert_workspace ON v2_brands;
DROP POLICY IF EXISTS brands_update_workspace ON v2_brands;
DROP POLICY IF EXISTS brands_delete_workspace ON v2_brands;

CREATE POLICY brands_read_workspace ON v2_brands 
FOR SELECT USING (workspace_id IN (
  SELECT workspace_id FROM v2_workspace_members WHERE user_id = auth.uid()
));

CREATE POLICY brands_insert_workspace ON v2_brands 
FOR INSERT WITH CHECK (workspace_id IN (
  SELECT workspace_id FROM v2_workspace_members WHERE user_id = auth.uid()
));

CREATE POLICY brands_update_workspace ON v2_brands 
FOR UPDATE USING (workspace_id IN (
  SELECT workspace_id FROM v2_workspace_members WHERE user_id = auth.uid()
));

CREATE POLICY brands_delete_workspace ON v2_brands 
FOR DELETE USING (workspace_id IN (
  SELECT workspace_id FROM v2_workspace_members WHERE user_id = auth.uid()
));

-- v2_presentations policies
DROP POLICY IF EXISTS presentations_read_workspace ON v2_presentations;
DROP POLICY IF EXISTS presentations_insert_workspace ON v2_presentations;
DROP POLICY IF EXISTS presentations_update_workspace ON v2_presentations;
DROP POLICY IF EXISTS presentations_delete_workspace ON v2_presentations;

CREATE POLICY presentations_read_workspace ON v2_presentations 
FOR SELECT USING (workspace_id IN (
  SELECT workspace_id FROM v2_workspace_members WHERE user_id = auth.uid()
));

CREATE POLICY presentations_insert_workspace ON v2_presentations 
FOR INSERT WITH CHECK (
  workspace_id IN (
    SELECT workspace_id FROM v2_workspace_members WHERE user_id = auth.uid()
  )
  AND created_by = auth.uid()
);

CREATE POLICY presentations_update_workspace ON v2_presentations 
FOR UPDATE USING (workspace_id IN (
  SELECT workspace_id FROM v2_workspace_members WHERE user_id = auth.uid()
));

CREATE POLICY presentations_delete_workspace ON v2_presentations 
FOR DELETE USING (workspace_id IN (
  SELECT workspace_id FROM v2_workspace_members WHERE user_id = auth.uid()
));

-- v2_folders policies
DROP POLICY IF EXISTS folders_read_workspace ON v2_folders;
DROP POLICY IF EXISTS folders_insert_workspace ON v2_folders;
DROP POLICY IF EXISTS folders_update_workspace ON v2_folders;
DROP POLICY IF EXISTS folders_delete_workspace ON v2_folders;

CREATE POLICY folders_read_workspace ON v2_folders 
FOR SELECT USING (workspace_id IN (
  SELECT workspace_id FROM v2_workspace_members WHERE user_id = auth.uid()
));

CREATE POLICY folders_insert_workspace ON v2_folders 
FOR INSERT WITH CHECK (workspace_id IN (
  SELECT workspace_id FROM v2_workspace_members WHERE user_id = auth.uid()
));

CREATE POLICY folders_update_workspace ON v2_folders 
FOR UPDATE USING (workspace_id IN (
  SELECT workspace_id FROM v2_workspace_members WHERE user_id = auth.uid()
));

CREATE POLICY folders_delete_workspace ON v2_folders 
FOR DELETE USING (workspace_id IN (
  SELECT workspace_id FROM v2_workspace_members WHERE user_id = auth.uid()
));

-- v2_comments policies
DROP POLICY IF EXISTS comments_read_workspace ON v2_comments;
DROP POLICY IF EXISTS comments_insert_workspace ON v2_comments;
DROP POLICY IF EXISTS comments_update_own_or_admin ON v2_comments;
DROP POLICY IF EXISTS comments_delete_own_or_admin ON v2_comments;

CREATE POLICY comments_read_workspace ON v2_comments 
FOR SELECT USING (workspace_id IN (
  SELECT workspace_id FROM v2_workspace_members WHERE user_id = auth.uid()
));

CREATE POLICY comments_insert_workspace ON v2_comments 
FOR INSERT WITH CHECK (
  author_id = auth.uid()
  AND workspace_id IN (
    SELECT workspace_id FROM v2_workspace_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY comments_update_own_or_admin ON v2_comments 
FOR UPDATE USING (
  (author_id = auth.uid() OR EXISTS (
    SELECT 1 FROM v2_workspace_members 
    WHERE workspace_id = v2_comments.workspace_id
    AND user_id = auth.uid()
    AND role IN ('admin', 'owner')
  ))
  AND workspace_id IN (
    SELECT workspace_id FROM v2_workspace_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY comments_delete_own_or_admin ON v2_comments 
FOR DELETE USING (
  (author_id = auth.uid() OR EXISTS (
    SELECT 1 FROM v2_workspace_members 
    WHERE workspace_id = v2_comments.workspace_id
    AND user_id = auth.uid()
    AND role IN ('admin', 'owner')
  ))
  AND workspace_id IN (
    SELECT workspace_id FROM v2_workspace_members WHERE user_id = auth.uid()
  )
);

-- v2_presence policies
DROP POLICY IF EXISTS presence_read_workspace ON v2_presence;
DROP POLICY IF EXISTS presence_insert_own ON v2_presence;
DROP POLICY IF EXISTS presence_update_own ON v2_presence;
DROP POLICY IF EXISTS presence_delete_own ON v2_presence;

CREATE POLICY presence_read_workspace ON v2_presence 
FOR SELECT USING (workspace_id IN (
  SELECT workspace_id FROM v2_workspace_members WHERE user_id = auth.uid()
));

CREATE POLICY presence_insert_own ON v2_presence 
FOR INSERT WITH CHECK (
  user_id = auth.uid()
  AND workspace_id IN (
    SELECT workspace_id FROM v2_workspace_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY presence_update_own ON v2_presence 
FOR UPDATE USING (
  user_id = auth.uid()
  AND workspace_id IN (
    SELECT workspace_id FROM v2_workspace_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY presence_delete_own ON v2_presence 
FOR DELETE USING (
  user_id = auth.uid()
  AND workspace_id IN (
    SELECT workspace_id FROM v2_workspace_members WHERE user_id = auth.uid()
  )
);

-- v2_notifications policies
DROP POLICY IF EXISTS notifications_read_own ON v2_notifications;
DROP POLICY IF EXISTS notifications_update_own ON v2_notifications;
DROP POLICY IF EXISTS notifications_delete_own ON v2_notifications;

CREATE POLICY notifications_read_own ON v2_notifications 
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY notifications_update_own ON v2_notifications 
FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY notifications_delete_own ON v2_notifications 
FOR DELETE USING (user_id = auth.uid());

-- v2_presentation_views policies
DROP POLICY IF EXISTS views_read_workspace ON v2_presentation_views;

CREATE POLICY views_read_workspace ON v2_presentation_views 
FOR SELECT USING (workspace_id IN (
  SELECT workspace_id FROM v2_workspace_members WHERE user_id = auth.uid()
));

-- v2_collaborators policies
DROP POLICY IF EXISTS collaborators_read_presentation ON v2_collaborators;
DROP POLICY IF EXISTS collaborators_insert_admin ON v2_collaborators;
DROP POLICY IF EXISTS collaborators_delete_admin ON v2_collaborators;

CREATE POLICY collaborators_read_presentation ON v2_collaborators 
FOR SELECT USING (
  user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM v2_presentations p
    JOIN v2_workspace_members wm ON p.workspace_id = wm.workspace_id
    WHERE p.id = v2_collaborators.presentation_id
    AND wm.user_id = auth.uid()
  )
);

CREATE POLICY collaborators_insert_admin ON v2_collaborators 
FOR INSERT WITH CHECK (EXISTS (
  SELECT 1 FROM v2_presentations p
  JOIN v2_workspace_members wm ON p.workspace_id = wm.workspace_id
  WHERE p.id = v2_collaborators.presentation_id
  AND wm.user_id = auth.uid()
  AND wm.role IN ('admin', 'owner')
));

CREATE POLICY collaborators_delete_admin ON v2_collaborators 
FOR DELETE USING (EXISTS (
  SELECT 1 FROM v2_presentations p
  JOIN v2_workspace_members wm ON p.workspace_id = wm.workspace_id
  WHERE p.id = v2_collaborators.presentation_id
  AND wm.user_id = auth.uid()
  AND wm.role IN ('admin', 'owner')
));

-- v2_templates policies
DROP POLICY IF EXISTS templates_read_public ON v2_templates;
DROP POLICY IF EXISTS templates_insert_admin ON v2_templates;
DROP POLICY IF EXISTS templates_update_admin ON v2_templates;
DROP POLICY IF EXISTS templates_delete_admin ON v2_templates;

CREATE POLICY templates_read_public ON v2_templates 
FOR SELECT USING (is_public = true OR created_by = auth.uid());

CREATE POLICY templates_insert_admin ON v2_templates 
FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY templates_update_admin ON v2_templates 
FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY templates_delete_admin ON v2_templates 
FOR DELETE USING (created_by = auth.uid());

-- v2_subscriptions policies
DROP POLICY IF EXISTS subscriptions_read_own ON v2_subscriptions;
DROP POLICY IF EXISTS subscriptions_update_own ON v2_subscriptions;

CREATE POLICY subscriptions_read_own ON v2_subscriptions 
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY subscriptions_update_own ON v2_subscriptions 
FOR UPDATE USING (user_id = auth.uid());

-- v2_credit_transactions policies
DROP POLICY IF EXISTS credit_transactions_read_own ON v2_credit_transactions;

CREATE POLICY credit_transactions_read_own ON v2_credit_transactions 
FOR SELECT USING (user_id = auth.uid());

-- v2_analytics policies
DROP POLICY IF EXISTS analytics_read_workspace ON v2_analytics;

CREATE POLICY analytics_read_workspace ON v2_analytics 
FOR SELECT USING (EXISTS (
  SELECT 1 FROM v2_presentations p
  JOIN v2_workspace_members wm ON p.workspace_id = wm.workspace_id
  WHERE p.id = v2_analytics.presentation_id
  AND wm.user_id = auth.uid()
));

-- v2_presentation_plans policies
DROP POLICY IF EXISTS presentation_plans_read_workspace ON v2_presentation_plans;
DROP POLICY IF EXISTS presentation_plans_update_workspace ON v2_presentation_plans;

CREATE POLICY presentation_plans_read_workspace ON v2_presentation_plans 
FOR SELECT USING (EXISTS (
  SELECT 1 FROM v2_presentations p
  JOIN v2_workspace_members wm ON p.workspace_id = wm.workspace_id
  WHERE p.id = v2_presentation_plans.presentation_id
  AND wm.user_id = auth.uid()
));

CREATE POLICY presentation_plans_update_workspace ON v2_presentation_plans 
FOR UPDATE USING (EXISTS (
  SELECT 1 FROM v2_presentations p
  JOIN v2_workspace_members wm ON p.workspace_id = wm.workspace_id
  WHERE p.id = v2_presentation_plans.presentation_id
  AND wm.user_id = auth.uid()
));

-- v2_support_tickets policies
DROP POLICY IF EXISTS support_tickets_read_own_or_admin ON v2_support_tickets;
DROP POLICY IF EXISTS support_tickets_insert_own ON v2_support_tickets;
DROP POLICY IF EXISTS support_tickets_update_own ON v2_support_tickets;

CREATE POLICY support_tickets_read_own_or_admin ON v2_support_tickets 
FOR SELECT USING (
  user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM v2_users WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY support_tickets_insert_own ON v2_support_tickets 
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY support_tickets_update_own ON v2_support_tickets 
FOR UPDATE USING (
  user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM v2_users WHERE id = auth.uid() AND role = 'admin'
  )
);

-- v2_support_ticket_replies policies
DROP POLICY IF EXISTS support_replies_read_ticket_owner_or_admin ON v2_support_ticket_replies;
DROP POLICY IF EXISTS support_replies_insert_ticket_owner_or_admin ON v2_support_ticket_replies;

CREATE POLICY support_replies_read_ticket_owner_or_admin ON v2_support_ticket_replies 
FOR SELECT USING (EXISTS (
  SELECT 1 FROM v2_support_tickets st
  WHERE st.id = v2_support_ticket_replies.ticket_id
  AND (st.user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM v2_users WHERE id = auth.uid() AND role = 'admin'
  ))
));

CREATE POLICY support_replies_insert_ticket_owner_or_admin ON v2_support_ticket_replies 
FOR INSERT WITH CHECK (
  user_id = auth.uid() AND EXISTS (
    SELECT 1 FROM v2_support_tickets st
    WHERE st.id = v2_support_ticket_replies.ticket_id
    AND (st.user_id = auth.uid() OR EXISTS (
      SELECT 1 FROM v2_users WHERE id = auth.uid() AND role = 'admin'
    ))
  )
);

-- v2_ai_settings policies (admin only)
DROP POLICY IF EXISTS ai_settings_read_admin ON v2_ai_settings;
DROP POLICY IF EXISTS ai_settings_update_admin ON v2_ai_settings;

CREATE POLICY ai_settings_read_admin ON v2_ai_settings 
FOR SELECT USING (EXISTS (
  SELECT 1 FROM v2_users WHERE id = auth.uid() AND role = 'admin'
));

CREATE POLICY ai_settings_update_admin ON v2_ai_settings 
FOR UPDATE USING (EXISTS (
  SELECT 1 FROM v2_users WHERE id = auth.uid() AND role = 'admin'
));

-- ============================================================================
-- DEPLOYMENT COMPLETE!
-- Applied RLS policies to all core tables (skipped v2_chat_messages)
-- ============================================================================
