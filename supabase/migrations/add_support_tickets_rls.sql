-- Enable RLS on support tickets tables
ALTER TABLE v2_support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE v2_support_ticket_replies ENABLE ROW LEVEL SECURITY;

-- Users can view their own tickets
CREATE POLICY "users_view_own_tickets" ON v2_support_tickets
  FOR SELECT USING (user_id = auth.uid()::text);

-- Users can create tickets
CREATE POLICY "users_create_tickets" ON v2_support_tickets
  FOR INSERT WITH CHECK (user_id = auth.uid()::text);

-- Admins can view all tickets
CREATE POLICY "admins_view_all_tickets" ON v2_support_tickets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM v2_users
      WHERE id = auth.uid()::text AND role = 'admin'
    )
  );

-- Admins can update all tickets
CREATE POLICY "admins_update_tickets" ON v2_support_tickets
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM v2_users
      WHERE id = auth.uid()::text AND role = 'admin'
    )
  );

-- Users can view replies on their own tickets
CREATE POLICY "users_view_own_replies" ON v2_support_ticket_replies
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM v2_support_tickets
      WHERE id = v2_support_ticket_replies.ticket_id
      AND user_id = auth.uid()::text
    )
  );

-- Users can create replies on their own tickets
CREATE POLICY "users_create_replies" ON v2_support_ticket_replies
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM v2_support_tickets
      WHERE id = ticket_id
      AND user_id = auth.uid()::text
    )
  );

-- Admins can view all replies
CREATE POLICY "admins_view_all_replies" ON v2_support_ticket_replies
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM v2_users
      WHERE id = auth.uid()::text AND role = 'admin'
    )
  );

-- Admins can create replies on any ticket
CREATE POLICY "admins_create_replies" ON v2_support_ticket_replies
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM v2_users
      WHERE id = auth.uid()::text AND role = 'admin'
    )
  );
