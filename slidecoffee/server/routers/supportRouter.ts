import { TRPCError } from "@trpc/server";
import { and, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { supportTickets, ticketResponses } from "../../drizzle/schema";
import { getDb } from "../db";
import { withPermission } from "../lib/rbac";
import { protectedProcedure, router } from "../_core/trpc";

/**
 * Support Ticketing Router
 * Handles customer support tickets with admin assignment and responses
 */

export const supportRouter = router({
  /**
   * Create a new support ticket (user-facing)
   */
  create: protectedProcedure
    .input(
      z.object({
        subject: z.string().min(1).max(200),
        description: z.string().min(1),
        priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
        category: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const [ticket] = await db.insert(supportTickets).values({
        userId: ctx.user.id,
        subject: input.subject,
        description: input.description,
        priority: input.priority,
        category: input.category || null,
        status: "open",
      });

      return {
        success: true,
        ticketId: ticket.insertId,
        message: "Support ticket created successfully. Our team will respond soon.",
      };
    }),

  /**
   * List all tickets (admin view with filters)
   */
  list: protectedProcedure
    .use(withPermission("view_support_tickets"))
    .input(
      z.object({
        status: z.enum(["open", "in_progress", "resolved", "closed"]).optional(),
        priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
        assignedTo: z.number().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const conditions = [];
      if (input.status) conditions.push(eq(supportTickets.status, input.status));
      if (input.priority) conditions.push(eq(supportTickets.priority, input.priority));
      if (input.assignedTo) conditions.push(eq(supportTickets.assignedToId, input.assignedTo));

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const tickets = await db
        .select({
          id: supportTickets.id,
          userId: supportTickets.userId,
          subject: supportTickets.subject,
          description: supportTickets.description,
          status: supportTickets.status,
          priority: supportTickets.priority,
          category: supportTickets.category,
          assignedTo: supportTickets.assignedToId,
          createdAt: supportTickets.createdAt,
          updatedAt: supportTickets.updatedAt,
        })
        .from(supportTickets)
        .where(whereClause)
        .orderBy(desc(supportTickets.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      // Get total count for pagination
      const [{ count }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(supportTickets)
        .where(whereClause);

      return {
        tickets,
        total: count,
        hasMore: input.offset + input.limit < count,
      };
    }),

  /**
   * Get user's own tickets
   */
  myTickets: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

    const tickets = await db
      .select()
      .from(supportTickets)
      .where(eq(supportTickets.userId, ctx.user.id))
      .orderBy(desc(supportTickets.createdAt));

    return tickets;
  }),

  /**
   * Get ticket details with responses
   */
  get: protectedProcedure
    .input(z.object({ ticketId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const [ticket] = await db
        .select()
        .from(supportTickets)
        .where(eq(supportTickets.id, input.ticketId))
        .limit(1);

      if (!ticket) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Ticket not found" });
      }

      // Check permissions: user can view own tickets, admins can view all
      const isAdmin = ctx.user.adminRole && ["super_admin", "admin", "support"].includes(ctx.user.adminRole);
      if (ticket.userId !== ctx.user.id && !isAdmin) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
      }

      // Get all responses
      const responses = await db
        .select()
        .from(ticketResponses)
        .where(eq(ticketResponses.ticketId, input.ticketId))
        .orderBy(ticketResponses.createdAt);

      return {
        ticket,
        responses,
      };
    }),

  /**
   * Update ticket status (admin only)
   */
  updateStatus: protectedProcedure
    .use(withPermission("manage_support_tickets"))
    .input(
      z.object({
        ticketId: z.number(),
        status: z.enum(["open", "in_progress", "resolved", "closed"]),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      await db
        .update(supportTickets)
        .set({ status: input.status, updatedAt: new Date() })
        .where(eq(supportTickets.id, input.ticketId));

      return { success: true };
    }),

  /**
   * Assign ticket to admin (admin only)
   */
  assign: protectedProcedure
    .use(withPermission("manage_support_tickets"))
    .input(
      z.object({
        ticketId: z.number(),
        assignedTo: z.number().nullable(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      await db
        .update(supportTickets)
        .set({ assignedToId: input.assignedTo ?? undefined, updatedAt: new Date() })
        .where(eq(supportTickets.id, input.ticketId));

      return { success: true };
    }),

  /**
   * Add response to ticket
   */
  addResponse: protectedProcedure
    .input(
      z.object({
        ticketId: z.number(),
        message: z.string().min(1),
        isInternal: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // Verify ticket exists and user has access
      const [ticket] = await db
        .select()
        .from(supportTickets)
        .where(eq(supportTickets.id, input.ticketId))
        .limit(1);

      if (!ticket) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Ticket not found" });
      }

      const isAdmin = ctx.user.adminRole && ["super_admin", "admin", "support"].includes(ctx.user.adminRole);
      if (ticket.userId !== ctx.user.id && !isAdmin) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
      }

      // Only admins can create internal notes
      if (input.isInternal && !isAdmin) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only admins can create internal notes" });
      }

      await db.insert(ticketResponses).values({
        ticketId: input.ticketId,
        userId: ctx.user.id,
        message: input.message,
        isInternal: input.isInternal ? 1 : 0,
      });

      // Update ticket's updatedAt timestamp
      await db
        .update(supportTickets)
        .set({ updatedAt: new Date() })
        .where(eq(supportTickets.id, input.ticketId));

      return { success: true };
    }),

  /**
   * Get ticket statistics (admin only)
   */
  getStats: protectedProcedure
    .use(withPermission("view_support_tickets"))
    .query(async () => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const [stats] = await db
        .select({
          total: sql<number>`count(*)`,
          open: sql<number>`sum(case when status = 'open' then 1 else 0 end)`,
          inProgress: sql<number>`sum(case when status = 'in_progress' then 1 else 0 end)`,
          resolved: sql<number>`sum(case when status = 'resolved' then 1 else 0 end)`,
          closed: sql<number>`sum(case when status = 'closed' then 1 else 0 end)`,
          urgent: sql<number>`sum(case when priority = 'urgent' then 1 else 0 end)`,
          high: sql<number>`sum(case when priority = 'high' then 1 else 0 end)`,
          unassigned: sql<number>`sum(case when assignedToId is null then 1 else 0 end)`,
        })
        .from(supportTickets);

      return stats;
    }),
});

