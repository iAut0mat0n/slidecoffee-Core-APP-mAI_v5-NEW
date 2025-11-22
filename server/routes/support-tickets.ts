import { Router, Response } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { getAuthenticatedSupabaseClient } from '../utils/supabase-auth.js';

const router = Router();

// Create support ticket
router.post('/create', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { subject, message, priority, category } = req.body;
    const userId = req.user?.id;
    const workspaceId = req.user?.workspaceId;
    const userEmail = req.user?.email;
    const userName = req.user?.name;

    if (!userId || !workspaceId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!subject || !message) {
      return res.status(400).json({ error: 'Subject and message are required' });
    }

    // Get authenticated Supabase client
    const { supabase } = await getAuthenticatedSupabaseClient(req);

    const { data: ticket, error } = await supabase
      .from('v2_support_tickets')
      .insert({
        user_id: userId,
        workspace_id: workspaceId,
        subject,
        message,
        priority: priority || 'medium',
        category: category || 'general',
        user_email: userEmail,
        user_name: userName,
        status: 'open',
      })
      .select()
      .single();

    if (error) throw error;

    res.json({ ticket });
  } catch (error: any) {
    console.error('Create ticket error:', error);
    res.status(500).json({ error: 'Failed to create support ticket' });
  }
});

// Get user's tickets
router.get('/my-tickets', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const workspaceId = req.user?.workspaceId;

    if (!userId || !workspaceId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Get authenticated Supabase client
    const { supabase } = await getAuthenticatedSupabaseClient(req);

    const { data: tickets, error } = await supabase
      .from('v2_support_tickets')
      .select('*')
      .eq('user_id', userId)
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ tickets });
  } catch (error: any) {
    console.error('Get tickets error:', error);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

// Get all tickets (admin only)
router.get('/all', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userRole = req.user?.role;
    const workspaceId = req.user?.workspaceId;

    if (!workspaceId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (userRole !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Get authenticated Supabase client
    const { supabase } = await getAuthenticatedSupabaseClient(req);

    const { status, priority, category } = req.query;
    
    let query = supabase
      .from('v2_support_tickets')
      .select('*')
      .eq('workspace_id', workspaceId) // CRITICAL: workspace scoping
      .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);
    if (priority) query = query.eq('priority', priority);
    if (category) query = query.eq('category', category);

    const { data: tickets, error } = await query;

    if (error) throw error;

    res.json({ tickets });
  } catch (error: any) {
    console.error('Get all tickets error:', error);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

// Update ticket status (admin only)
router.patch('/:ticketId/status', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userRole = req.user?.role;
    const workspaceId = req.user?.workspaceId;
    const { ticketId } = req.params;
    const { status, assigned_to } = req.body;

    if (!workspaceId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (userRole !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Get authenticated Supabase client
    const { supabase } = await getAuthenticatedSupabaseClient(req);

    const updateData: any = { status };
    if (assigned_to !== undefined) updateData.assigned_to = assigned_to;
    if (status === 'resolved' || status === 'closed') {
      updateData.resolved_at = new Date().toISOString();
    }

    // Workspace scoping for admin operations
    const { data: ticket, error } = await supabase
      .from('v2_support_tickets')
      .update(updateData)
      .eq('id', ticketId)
      .eq('workspace_id', workspaceId) // CRITICAL: workspace scoping
      .select()
      .single();

    if (error) throw error;

    res.json({ ticket });
  } catch (error: any) {
    console.error('Update ticket error:', error);
    res.status(500).json({ error: 'Failed to update ticket' });
  }
});

// Add reply to ticket
router.post('/:ticketId/reply', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const userName = req.user?.name;
    const userRole = req.user?.role;
    const workspaceId = req.user?.workspaceId;
    const { ticketId } = req.params;
    const { message } = req.body;

    if (!userId || !workspaceId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get authenticated Supabase client
    const { supabase } = await getAuthenticatedSupabaseClient(req);

    // Verify ticket ownership + workspace scoping
    const { data: ticket } = await supabase
      .from('v2_support_tickets')
      .select('user_id, workspace_id')
      .eq('id', ticketId)
      .single();

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    if (ticket.workspace_id !== workspaceId) {
      return res.status(403).json({ error: 'Access denied: wrong workspace' });
    }

    if (ticket.user_id !== userId && userRole !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to reply to this ticket' });
    }

    const { data: reply, error } = await supabase
      .from('v2_support_ticket_replies')
      .insert({
        ticket_id: ticketId,
        user_id: userId,
        message,
        is_staff: userRole === 'admin',
      })
      .select()
      .single();

    if (error) throw error;

    res.json({ reply });
  } catch (error: any) {
    console.error('Add reply error:', error);
    res.status(500).json({ error: 'Failed to add reply' });
  }
});

// Get ticket replies
router.get('/:ticketId/replies', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { ticketId } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const workspaceId = req.user?.workspaceId;

    if (!userId || !workspaceId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Get authenticated Supabase client
    const { supabase } = await getAuthenticatedSupabaseClient(req);

    // Verify ticket ownership + workspace scoping
    const { data: ticket } = await supabase
      .from('v2_support_tickets')
      .select('user_id, workspace_id')
      .eq('id', ticketId)
      .single();

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    if (ticket.workspace_id !== workspaceId) {
      return res.status(403).json({ error: 'Access denied: wrong workspace' });
    }

    if (ticket.user_id !== userId && userRole !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to view these replies' });
    }

    const { data: replies, error } = await supabase
      .from('v2_support_ticket_replies')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    res.json({ replies });
  } catch (error: any) {
    console.error('Get replies error:', error);
    res.status(500).json({ error: 'Failed to fetch replies' });
  }
});

export default router;
