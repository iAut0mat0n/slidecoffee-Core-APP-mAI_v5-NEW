-- ============================================================================
-- SLIDECOFFEE PRODUCTION DEPLOYMENT
-- Safe deployment: DROP existing tables if needed, then recreate everything
-- WARNING: This will delete existing data! Only use for initial deployment.
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables in reverse dependency order (if they exist)
DROP TABLE IF EXISTS public.v2_support_ticket_replies CASCADE;
DROP TABLE IF EXISTS public.v2_support_tickets CASCADE;
DROP TABLE IF EXISTS public.v2_analytics CASCADE;
DROP TABLE IF EXISTS public.v2_credit_transactions CASCADE;
DROP TABLE IF EXISTS public.v2_chat_messages CASCADE;
DROP TABLE IF EXISTS public.v2_presentation_plans CASCADE;
DROP TABLE IF EXISTS public.v2_collaborators CASCADE;
DROP TABLE IF EXISTS public.v2_comments CASCADE;
DROP TABLE IF EXISTS public.v2_presence CASCADE;
DROP TABLE IF EXISTS public.v2_notifications CASCADE;
DROP TABLE IF EXISTS public.v2_presentation_views CASCADE;
DROP TABLE IF EXISTS public.v2_presentations CASCADE;
DROP TABLE IF EXISTS public.v2_folders CASCADE;
DROP TABLE IF EXISTS public.v2_brands CASCADE;
DROP TABLE IF EXISTS public.v2_templates CASCADE;
DROP TABLE IF EXISTS public.v2_subscriptions CASCADE;
DROP TABLE IF EXISTS public.v2_workspace_members CASCADE;
DROP TABLE IF EXISTS public.v2_user_context CASCADE;
DROP TABLE IF EXISTS public.v2_users CASCADE;
DROP TABLE IF EXISTS public.v2_workspaces CASCADE;
DROP TABLE IF EXISTS public.v2_ai_settings CASCADE;
DROP TABLE IF EXISTS public.v2_system_settings CASCADE;

-- Drop sequences if they exist
DROP SEQUENCE IF EXISTS public.v2_comments_id_seq CASCADE;
DROP SEQUENCE IF EXISTS public.v2_notifications_id_seq CASCADE;
DROP SEQUENCE IF EXISTS public.v2_presence_id_seq CASCADE;
DROP SEQUENCE IF EXISTS public.v2_presentation_views_id_seq CASCADE;
DROP SEQUENCE IF EXISTS public.v2_user_context_id_seq CASCADE;

-- Drop trigger function if exists
DROP FUNCTION IF EXISTS public.update_support_tickets_updated_at() CASCADE;

-- ============================================================================
-- CREATE TABLES
-- ============================================================================

CREATE TABLE public.v2_workspaces (
    id uuid DEFAULT uuid_generate_v4() NOT NULL,
    name text NOT NULL,
    owner_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT v2_workspaces_pkey PRIMARY KEY (id)
);

CREATE TABLE public.v2_users (
    id uuid DEFAULT uuid_generate_v4() NOT NULL,
    email text NOT NULL,
    name text,
    avatar_url text,
    role text DEFAULT 'user'::text,
    credits integer DEFAULT 75,
    plan text DEFAULT 'starter'::text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT v2_users_plan_check CHECK ((plan = ANY (ARRAY['starter'::text, 'professional'::text, 'enterprise'::text, 'free'::text, 'pro'::text, 'business'::text]))),
    CONSTRAINT v2_users_role_check CHECK ((role = ANY (ARRAY['user'::text, 'admin'::text]))),
    CONSTRAINT v2_users_pkey PRIMARY KEY (id),
    CONSTRAINT v2_users_email_key UNIQUE (email)
);

CREATE SEQUENCE public.v2_user_context_id_seq AS integer START WITH 1 INCREMENT BY 1;

CREATE TABLE public.v2_user_context (
    id integer DEFAULT nextval('v2_user_context_id_seq'::regclass) NOT NULL,
    user_id character varying(255) NOT NULL,
    workspace_id character varying(255),
    context_type character varying(50) NOT NULL,
    context_key character varying(255) NOT NULL,
    context_value jsonb NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT context_key_length_limit CHECK (((length((context_key)::text) > 0) AND (length((context_key)::text) <= 255))),
    CONSTRAINT context_type_valid CHECK (((context_type)::text = ANY ((ARRAY['preference'::character varying, 'conversation'::character varying, 'insight'::character varying, 'project_info'::character varying, 'skill'::character varying, 'goal'::character varying])::text[]))),
    CONSTRAINT v2_user_context_pkey PRIMARY KEY (id),
    CONSTRAINT v2_user_context_user_id_workspace_id_context_type_context_k_key UNIQUE (user_id, workspace_id, context_type, context_key)
);

CREATE TABLE public.v2_workspace_members (
    id uuid DEFAULT uuid_generate_v4() NOT NULL,
    workspace_id uuid,
    user_id uuid,
    role text DEFAULT 'member'::text,
    credits_allocated integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT v2_workspace_members_role_check CHECK ((role = ANY (ARRAY['owner'::text, 'admin'::text, 'member'::text]))),
    CONSTRAINT v2_workspace_members_pkey PRIMARY KEY (id),
    CONSTRAINT v2_workspace_members_workspace_id_user_id_key UNIQUE (workspace_id, user_id),
    CONSTRAINT v2_workspace_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.v2_users(id) ON DELETE CASCADE,
    CONSTRAINT v2_workspace_members_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.v2_workspaces(id) ON DELETE CASCADE
);

CREATE TABLE public.v2_subscriptions (
    id uuid DEFAULT uuid_generate_v4() NOT NULL,
    user_id uuid,
    plan text NOT NULL,
    status text DEFAULT 'active'::text,
    credits_per_month integer NOT NULL,
    price_monthly numeric(10,2),
    started_at timestamp with time zone DEFAULT now(),
    expires_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT v2_subscriptions_status_check CHECK ((status = ANY (ARRAY['active'::text, 'cancelled'::text, 'expired'::text]))),
    CONSTRAINT v2_subscriptions_pkey PRIMARY KEY (id),
    CONSTRAINT v2_subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.v2_users(id) ON DELETE CASCADE
);

CREATE TABLE public.v2_brands (
    id uuid DEFAULT uuid_generate_v4() NOT NULL,
    workspace_id uuid,
    name text NOT NULL,
    primary_color text DEFAULT '#7C3AED'::text,
    secondary_color text DEFAULT '#6EE7B7'::text,
    accent_color text DEFAULT '#FFE5E5'::text,
    font_heading text DEFAULT 'Inter'::text,
    font_body text DEFAULT 'Inter'::text,
    logo_url text,
    guidelines text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT v2_brands_pkey PRIMARY KEY (id),
    CONSTRAINT v2_brands_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.v2_workspaces(id) ON DELETE CASCADE
);

CREATE TABLE public.v2_folders (
    id uuid DEFAULT uuid_generate_v4() NOT NULL,
    workspace_id uuid,
    name text NOT NULL,
    color text DEFAULT '#7C3AED'::text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT v2_folders_pkey PRIMARY KEY (id),
    CONSTRAINT v2_folders_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.v2_workspaces(id) ON DELETE CASCADE
);

CREATE TABLE public.v2_presentations (
    id uuid DEFAULT uuid_generate_v4() NOT NULL,
    workspace_id uuid,
    brand_id uuid,
    title text NOT NULL,
    description text,
    slides jsonb DEFAULT '[]'::jsonb,
    status text DEFAULT 'draft'::text,
    is_favorite boolean DEFAULT false,
    folder_id uuid,
    last_viewed_at timestamp with time zone,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    share_token character varying(255),
    share_settings jsonb DEFAULT '{"access": "unlimited", "enabled": false, "password": null, "expiresAt": null}'::jsonb,
    is_public boolean DEFAULT false,
    CONSTRAINT v2_presentations_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'generating'::text, 'completed'::text, 'archived'::text]))),
    CONSTRAINT v2_presentations_pkey PRIMARY KEY (id),
    CONSTRAINT v2_presentations_share_token_key UNIQUE (share_token),
    CONSTRAINT v2_presentations_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.v2_brands(id) ON DELETE SET NULL,
    CONSTRAINT v2_presentations_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.v2_users(id),
    CONSTRAINT v2_presentations_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.v2_workspaces(id) ON DELETE CASCADE
);

CREATE SEQUENCE public.v2_comments_id_seq AS integer START WITH 1 INCREMENT BY 1;

CREATE TABLE public.v2_comments (
    id integer DEFAULT nextval('v2_comments_id_seq'::regclass) NOT NULL,
    presentation_id uuid NOT NULL,
    slide_index integer NOT NULL,
    workspace_id uuid NOT NULL,
    author_id uuid NOT NULL,
    author_name character varying(255) NOT NULL,
    author_email character varying(255),
    content text NOT NULL,
    parent_comment_id integer,
    resolved boolean DEFAULT false,
    resolved_by uuid,
    resolved_at timestamp with time zone,
    position_x numeric(5,2),
    position_y numeric(5,2),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT v2_comments_content_check CHECK ((char_length(content) <= 5000)),
    CONSTRAINT v2_comments_pkey PRIMARY KEY (id),
    CONSTRAINT v2_comments_parent_comment_id_fkey FOREIGN KEY (parent_comment_id) REFERENCES public.v2_comments(id) ON DELETE CASCADE
);

CREATE SEQUENCE public.v2_presence_id_seq AS integer START WITH 1 INCREMENT BY 1;

CREATE TABLE public.v2_presence (
    id integer DEFAULT nextval('v2_presence_id_seq'::regclass) NOT NULL,
    presentation_id uuid NOT NULL,
    workspace_id uuid NOT NULL,
    user_id uuid NOT NULL,
    user_name character varying(255) NOT NULL,
    user_email character varying(255),
    user_avatar character varying(500),
    activity_type character varying(50) NOT NULL,
    current_slide_index integer,
    cursor_x numeric(5,2),
    cursor_y numeric(5,2),
    last_seen_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT v2_presence_activity_type_check CHECK (((activity_type)::text = ANY ((ARRAY['viewing'::character varying, 'editing'::character varying, 'commenting'::character varying, 'idle'::character varying])::text[]))),
    CONSTRAINT v2_presence_pkey PRIMARY KEY (id)
);

CREATE SEQUENCE public.v2_notifications_id_seq AS integer START WITH 1 INCREMENT BY 1;

CREATE TABLE public.v2_notifications (
    id integer DEFAULT nextval('v2_notifications_id_seq'::regclass) NOT NULL,
    workspace_id uuid NOT NULL,
    user_id uuid NOT NULL,
    type character varying(50) NOT NULL,
    title character varying(255) NOT NULL,
    message text NOT NULL,
    link character varying(500),
    read boolean DEFAULT false,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT v2_notifications_type_check CHECK (((type)::text = ANY ((ARRAY['mention'::character varying, 'reply'::character varying, 'comment'::character varying, 'presentation_shared'::character varying, 'system'::character varying])::text[]))),
    CONSTRAINT v2_notifications_pkey PRIMARY KEY (id)
);

CREATE SEQUENCE public.v2_presentation_views_id_seq AS integer START WITH 1 INCREMENT BY 1;

CREATE TABLE public.v2_presentation_views (
    id integer DEFAULT nextval('v2_presentation_views_id_seq'::regclass) NOT NULL,
    presentation_id uuid NOT NULL,
    workspace_id uuid NOT NULL,
    viewer_type character varying(50) NOT NULL,
    user_id uuid,
    share_token text,
    ip_address text,
    user_agent text,
    referrer text,
    view_duration_seconds integer,
    slides_viewed integer DEFAULT 1,
    converted_to_signup boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT v2_presentation_views_viewer_type_check CHECK (((viewer_type)::text = ANY ((ARRAY['anonymous'::character varying, 'authenticated'::character varying, 'member'::character varying])::text[]))),
    CONSTRAINT v2_presentation_views_pkey PRIMARY KEY (id)
);

CREATE TABLE public.v2_collaborators (
    id uuid DEFAULT uuid_generate_v4() NOT NULL,
    presentation_id uuid,
    user_id uuid,
    permission text DEFAULT 'view'::text,
    invited_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT v2_collaborators_permission_check CHECK ((permission = ANY (ARRAY['view'::text, 'comment'::text, 'edit'::text]))),
    CONSTRAINT v2_collaborators_pkey PRIMARY KEY (id),
    CONSTRAINT v2_collaborators_presentation_id_user_id_key UNIQUE (presentation_id, user_id),
    CONSTRAINT v2_collaborators_invited_by_fkey FOREIGN KEY (invited_by) REFERENCES public.v2_users(id),
    CONSTRAINT v2_collaborators_presentation_id_fkey FOREIGN KEY (presentation_id) REFERENCES public.v2_presentations(id) ON DELETE CASCADE,
    CONSTRAINT v2_collaborators_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.v2_users(id) ON DELETE CASCADE
);

CREATE TABLE public.v2_presentation_plans (
    id uuid DEFAULT uuid_generate_v4() NOT NULL,
    presentation_id uuid,
    plan jsonb NOT NULL,
    status text DEFAULT 'pending'::text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT v2_presentation_plans_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text]))),
    CONSTRAINT v2_presentation_plans_pkey PRIMARY KEY (id),
    CONSTRAINT v2_presentation_plans_presentation_id_fkey FOREIGN KEY (presentation_id) REFERENCES public.v2_presentations(id) ON DELETE CASCADE
);

CREATE TABLE public.v2_chat_messages (
    id uuid DEFAULT uuid_generate_v4() NOT NULL,
    presentation_id uuid,
    role text NOT NULL,
    content text NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT v2_chat_messages_role_check CHECK ((role = ANY (ARRAY['user'::text, 'assistant'::text, 'system'::text]))),
    CONSTRAINT v2_chat_messages_pkey PRIMARY KEY (id),
    CONSTRAINT v2_chat_messages_presentation_id_fkey FOREIGN KEY (presentation_id) REFERENCES public.v2_presentations(id) ON DELETE CASCADE
);

CREATE TABLE public.v2_credit_transactions (
    id uuid DEFAULT uuid_generate_v4() NOT NULL,
    user_id uuid,
    amount integer NOT NULL,
    type text NOT NULL,
    description text,
    presentation_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT v2_credit_transactions_type_check CHECK ((type = ANY (ARRAY['purchase'::text, 'usage'::text, 'refund'::text, 'bonus'::text]))),
    CONSTRAINT v2_credit_transactions_pkey PRIMARY KEY (id),
    CONSTRAINT v2_credit_transactions_presentation_id_fkey FOREIGN KEY (presentation_id) REFERENCES public.v2_presentations(id) ON DELETE SET NULL,
    CONSTRAINT v2_credit_transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.v2_users(id) ON DELETE CASCADE
);

CREATE TABLE public.v2_analytics (
    id uuid DEFAULT uuid_generate_v4() NOT NULL,
    presentation_id uuid,
    event_type text NOT NULL,
    user_id uuid,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT v2_analytics_event_type_check CHECK ((event_type = ANY (ARRAY['view'::text, 'share'::text, 'export'::text, 'edit'::text]))),
    CONSTRAINT v2_analytics_pkey PRIMARY KEY (id),
    CONSTRAINT v2_analytics_presentation_id_fkey FOREIGN KEY (presentation_id) REFERENCES public.v2_presentations(id) ON DELETE CASCADE,
    CONSTRAINT v2_analytics_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.v2_users(id)
);

CREATE TABLE public.v2_support_tickets (
    id uuid DEFAULT uuid_generate_v4() NOT NULL,
    user_id text NOT NULL,
    workspace_id text NOT NULL,
    subject text NOT NULL,
    message text NOT NULL,
    status text DEFAULT 'open'::text NOT NULL,
    priority text DEFAULT 'medium'::text,
    category text DEFAULT 'general'::text,
    assigned_to text,
    user_email text,
    user_name text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    resolved_at timestamp with time zone,
    CONSTRAINT support_tickets_category_check CHECK ((category = ANY (ARRAY['general'::text, 'billing'::text, 'technical'::text, 'feature_request'::text, 'bug_report'::text]))),
    CONSTRAINT support_tickets_priority_check CHECK ((priority = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'urgent'::text]))),
    CONSTRAINT support_tickets_status_check CHECK ((status = ANY (ARRAY['open'::text, 'in_progress'::text, 'resolved'::text, 'closed'::text]))),
    CONSTRAINT v2_support_tickets_pkey PRIMARY KEY (id)
);

CREATE TABLE public.v2_support_ticket_replies (
    id uuid DEFAULT uuid_generate_v4() NOT NULL,
    ticket_id uuid NOT NULL,
    user_id text NOT NULL,
    message text NOT NULL,
    is_staff boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT v2_support_ticket_replies_pkey PRIMARY KEY (id),
    CONSTRAINT v2_support_ticket_replies_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES public.v2_support_tickets(id) ON DELETE CASCADE
);

CREATE TABLE public.v2_templates (
    id uuid DEFAULT uuid_generate_v4() NOT NULL,
    name text NOT NULL,
    description text,
    thumbnail_url text,
    category text,
    slides jsonb DEFAULT '[]'::jsonb,
    is_public boolean DEFAULT true,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT v2_templates_pkey PRIMARY KEY (id)
);

CREATE TABLE public.v2_ai_settings (
    id uuid DEFAULT uuid_generate_v4() NOT NULL,
    provider text NOT NULL,
    is_active boolean DEFAULT false,
    api_key text,
    model text,
    config jsonb DEFAULT '{}'::jsonb,
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT v2_ai_settings_provider_check CHECK ((provider = ANY (ARRAY['manus'::text, 'claude'::text, 'gpt4'::text]))),
    CONSTRAINT v2_ai_settings_pkey PRIMARY KEY (id)
);

CREATE TABLE public.v2_system_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    key text NOT NULL,
    value text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT v2_system_settings_pkey PRIMARY KEY (id),
    CONSTRAINT v2_system_settings_key_key UNIQUE (key)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX idx_workspaces_owner ON public.v2_workspaces USING btree (owner_id);
CREATE INDEX idx_user_context_user ON public.v2_user_context USING btree (user_id);
CREATE INDEX idx_user_context_workspace ON public.v2_user_context USING btree (workspace_id);
CREATE INDEX idx_user_context_type ON public.v2_user_context USING btree (context_type);
CREATE INDEX idx_user_context_composite ON public.v2_user_context USING btree (user_id, workspace_id, context_type);
CREATE INDEX idx_user_context_updated ON public.v2_user_context USING btree (user_id, updated_at DESC);
CREATE INDEX idx_workspace_members_workspace ON public.v2_workspace_members USING btree (workspace_id);
CREATE INDEX idx_workspace_members_user ON public.v2_workspace_members USING btree (user_id);
CREATE INDEX idx_subscriptions_user ON public.v2_subscriptions USING btree (user_id);
CREATE INDEX idx_brands_workspace ON public.v2_brands USING btree (workspace_id);
CREATE INDEX idx_folders_workspace ON public.v2_folders USING btree (workspace_id);
CREATE INDEX idx_presentations_workspace ON public.v2_presentations USING btree (workspace_id);
CREATE INDEX idx_presentations_brand ON public.v2_presentations USING btree (brand_id);
CREATE INDEX idx_presentations_status ON public.v2_presentations USING btree (status);
CREATE INDEX idx_presentations_favorite ON public.v2_presentations USING btree (is_favorite);
CREATE INDEX idx_comments_presentation_id ON public.v2_comments USING btree (presentation_id);
CREATE INDEX idx_comments_workspace_id ON public.v2_comments USING btree (workspace_id);
CREATE INDEX idx_comments_slide_index ON public.v2_comments USING btree (slide_index);
CREATE INDEX idx_comments_parent_id ON public.v2_comments USING btree (parent_comment_id);
CREATE INDEX idx_comments_resolved ON public.v2_comments USING btree (resolved);
CREATE INDEX idx_presence_presentation_id ON public.v2_presence USING btree (presentation_id);
CREATE INDEX idx_presence_user_id ON public.v2_presence USING btree (user_id);
CREATE INDEX idx_presence_last_seen ON public.v2_presence USING btree (last_seen_at);
CREATE INDEX idx_notifications_user_id ON public.v2_notifications USING btree (user_id);
CREATE INDEX idx_notifications_workspace_id ON public.v2_notifications USING btree (workspace_id);
CREATE INDEX idx_notifications_read ON public.v2_notifications USING btree (read);
CREATE INDEX idx_notifications_created_at ON public.v2_notifications USING btree (created_at);
CREATE INDEX idx_presentation_views_presentation_id ON public.v2_presentation_views USING btree (presentation_id);
CREATE INDEX idx_presentation_views_workspace_id ON public.v2_presentation_views USING btree (workspace_id);
CREATE INDEX idx_presentation_views_viewer_type ON public.v2_presentation_views USING btree (viewer_type);
CREATE INDEX idx_presentation_views_created_at ON public.v2_presentation_views USING btree (created_at);
CREATE INDEX idx_collaborators_presentation ON public.v2_collaborators USING btree (presentation_id);
CREATE INDEX idx_presentation_plans_presentation ON public.v2_presentation_plans USING btree (presentation_id);
CREATE INDEX idx_chat_messages_presentation ON public.v2_chat_messages USING btree (presentation_id);
CREATE INDEX idx_credit_transactions_user ON public.v2_credit_transactions USING btree (user_id);
CREATE INDEX idx_analytics_presentation ON public.v2_analytics USING btree (presentation_id);
CREATE INDEX idx_support_tickets_user_id ON public.v2_support_tickets USING btree (user_id);
CREATE INDEX idx_support_tickets_workspace_id ON public.v2_support_tickets USING btree (workspace_id);
CREATE INDEX idx_support_tickets_status ON public.v2_support_tickets USING btree (status);
CREATE INDEX idx_support_tickets_created_at ON public.v2_support_tickets USING btree (created_at DESC);
CREATE INDEX idx_support_ticket_replies_ticket_id ON public.v2_support_ticket_replies USING btree (ticket_id);

-- ============================================================================
-- TRIGGER FUNCTION FOR SUPPORT TICKETS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_support_tickets_updated_at()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER support_tickets_updated_at 
BEFORE UPDATE ON public.v2_support_tickets 
FOR EACH ROW EXECUTE FUNCTION public.update_support_tickets_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on collaboration tables
ALTER TABLE v2_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE v2_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE v2_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE v2_presentation_views ENABLE ROW LEVEL SECURITY;

-- v2_comments policies
CREATE POLICY "comments_read_workspace" ON v2_comments FOR SELECT 
USING (workspace_id IN (SELECT workspace_id FROM v2_workspace_members WHERE user_id = auth.uid()));

CREATE POLICY "comments_insert_workspace" ON v2_comments FOR INSERT 
WITH CHECK (
  author_id = auth.uid()
  AND workspace_id IN (SELECT workspace_id FROM v2_workspace_members WHERE user_id = auth.uid())
  AND EXISTS (SELECT 1 FROM v2_presentations p WHERE p.id = v2_comments.presentation_id AND p.workspace_id = v2_comments.workspace_id)
);

CREATE POLICY "comments_update_own_or_admin" ON v2_comments FOR UPDATE 
USING (
  (author_id = auth.uid() OR EXISTS (SELECT 1 FROM v2_workspace_members WHERE workspace_id = v2_comments.workspace_id AND user_id = auth.uid() AND role IN ('admin', 'owner')))
  AND workspace_id IN (SELECT workspace_id FROM v2_workspace_members WHERE user_id = auth.uid())
)
WITH CHECK (
  (author_id = auth.uid() OR EXISTS (SELECT 1 FROM v2_workspace_members WHERE workspace_id = v2_comments.workspace_id AND user_id = auth.uid() AND role IN ('admin', 'owner')))
  AND workspace_id IN (SELECT workspace_id FROM v2_workspace_members WHERE user_id = auth.uid())
  AND EXISTS (SELECT 1 FROM v2_presentations p WHERE p.id = v2_comments.presentation_id AND p.workspace_id = v2_comments.workspace_id)
);

CREATE POLICY "comments_delete_own_or_admin" ON v2_comments FOR DELETE 
USING (
  (author_id = auth.uid() OR EXISTS (SELECT 1 FROM v2_workspace_members WHERE workspace_id = v2_comments.workspace_id AND user_id = auth.uid() AND role IN ('admin', 'owner')))
  AND workspace_id IN (SELECT workspace_id FROM v2_workspace_members WHERE user_id = auth.uid())
);

-- v2_presence policies
CREATE POLICY "presence_read_workspace" ON v2_presence FOR SELECT 
USING (workspace_id IN (SELECT workspace_id FROM v2_workspace_members WHERE user_id = auth.uid()));

CREATE POLICY "presence_insert_own" ON v2_presence FOR INSERT 
WITH CHECK (user_id = auth.uid() AND workspace_id IN (SELECT workspace_id FROM v2_workspace_members WHERE user_id = auth.uid()));

CREATE POLICY "presence_update_own" ON v2_presence FOR UPDATE 
USING (user_id = auth.uid() AND workspace_id IN (SELECT workspace_id FROM v2_workspace_members WHERE user_id = auth.uid()))
WITH CHECK (user_id = auth.uid() AND workspace_id IN (SELECT workspace_id FROM v2_workspace_members WHERE user_id = auth.uid()));

CREATE POLICY "presence_delete_own" ON v2_presence FOR DELETE 
USING (user_id = auth.uid() AND workspace_id IN (SELECT workspace_id FROM v2_workspace_members WHERE user_id = auth.uid()));

-- v2_notifications policies
CREATE POLICY "notifications_read_own" ON v2_notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "notifications_update_own" ON v2_notifications FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "notifications_delete_own" ON v2_notifications FOR DELETE USING (user_id = auth.uid());

-- v2_presentation_views policies
CREATE POLICY "views_read_workspace" ON v2_presentation_views FOR SELECT 
USING (workspace_id IN (SELECT workspace_id FROM v2_workspace_members WHERE user_id = auth.uid()));

-- ============================================================================
-- TABLE COMMENTS
-- ============================================================================

COMMENT ON TABLE v2_comments IS 'Real-time collaboration comments with threaded replies. RLS enforced: Users can only read/write comments in their workspace.';
COMMENT ON TABLE v2_presence IS 'Live presence tracking for real-time collaboration. RLS enforced: Users can only see/update their own presence and view others in their workspace.';
COMMENT ON TABLE v2_notifications IS '@mentions and reply notifications. RLS enforced: Users can only read/update/delete their own notifications.';
COMMENT ON TABLE v2_presentation_views IS 'Anonymous viewer analytics for viral sharing. RLS enforced: Users can only read analytics for their workspace presentations.';

-- ============================================================================
-- DEPLOYMENT COMPLETE!
-- ============================================================================
