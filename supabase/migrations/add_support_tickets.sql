-- Support Tickets Table
CREATE TABLE IF NOT EXISTS public.v2_support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  workspace_id TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  priority TEXT DEFAULT 'medium',
  category TEXT DEFAULT 'general',
  assigned_to TEXT,
  user_email TEXT,
  user_name TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT support_tickets_status_check CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  CONSTRAINT support_tickets_priority_check CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  CONSTRAINT support_tickets_category_check CHECK (category IN ('general', 'billing', 'technical', 'feature_request', 'bug_report'))
);

-- Support Ticket Replies Table
CREATE TABLE IF NOT EXISTS public.v2_support_ticket_replies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES public.v2_support_tickets(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  message TEXT NOT NULL,
  is_staff BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON public.v2_support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_workspace_id ON public.v2_support_tickets(workspace_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.v2_support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON public.v2_support_tickets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_ticket_replies_ticket_id ON public.v2_support_ticket_replies(ticket_id);

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_support_tickets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER support_tickets_updated_at
  BEFORE UPDATE ON public.v2_support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_support_tickets_updated_at();
