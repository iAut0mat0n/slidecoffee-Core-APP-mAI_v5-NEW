import { TRPCError } from "@trpc/server";
import { eq, and, desc } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { notificationQueue } from "../../drizzle/schema";

/**
 * Notification Router
 * Handles real-time notifications for support tickets and system events
 */

export const notificationRouter = router({
  /**
   * Get unread notification count
   */
  getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

    const result = await db
      .select({ count: notificationQueue.id })
      .from(notificationQueue)
      .where(and(eq(notificationQueue.userId, ctx.user.id), eq(notificationQueue.isRead, 0)));

    return { count: result.length };
  }),

  /**
   * Get all notifications for current user
   */
  list: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        unreadOnly: z.boolean().default(false),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const conditions = [eq(notificationQueue.userId, ctx.user.id)];
      if (input.unreadOnly) {
        conditions.push(eq(notificationQueue.isRead, 0));
      }

      const notifications = await db
        .select()
        .from(notificationQueue)
        .where(and(...conditions))
        .orderBy(desc(notificationQueue.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      return notifications;
    }),

  /**
   * Mark notification as read
   */
  markAsRead: protectedProcedure
    .input(z.object({ notificationId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // Verify notification belongs to user
      const notification = await db
        .select()
        .from(notificationQueue)
        .where(eq(notificationQueue.id, input.notificationId))
        .limit(1);

      if (!notification.length || notification[0].userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
      }

      await db
        .update(notificationQueue)
        .set({ isRead: 1, readAt: new Date() })
        .where(eq(notificationQueue.id, input.notificationId));

      return { success: true };
    }),

  /**
   * Mark all notifications as read
   */
  markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

    await db
      .update(notificationQueue)
      .set({ isRead: 1, readAt: new Date() })
      .where(and(eq(notificationQueue.userId, ctx.user.id), eq(notificationQueue.isRead, 0)));

    return { success: true };
  }),

  /**
   * Delete a notification
   */
  delete: protectedProcedure
    .input(z.object({ notificationId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // Verify notification belongs to user
      const notification = await db
        .select()
        .from(notificationQueue)
        .where(eq(notificationQueue.id, input.notificationId))
        .limit(1);

      if (!notification.length || notification[0].userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
      }

      await db.delete(notificationQueue).where(eq(notificationQueue.id, input.notificationId));

      return { success: true };
    }),

  /**
   * Create a notification (internal use - called by other services)
   */
  create: protectedProcedure
    .input(
      z.object({
        userId: z.number(),
        type: z.enum([
          "ticket_created",
          "ticket_updated",
          "ticket_assigned",
          "ticket_response",
          "system_announcement",
          "credit_low",
          "subscription_expiring",
        ]),
        title: z.string().min(1).max(255),
        message: z.string().min(1),
        actionUrl: z.string().optional(),
        metadata: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const [result] = await db.insert(notificationQueue).values({
        userId: input.userId,
        type: input.type,
        title: input.title,
        message: input.message,
        actionUrl: input.actionUrl,
        metadata: input.metadata,
        isRead: 0,
      });

      return { id: result.insertId, success: true };
    }),
});

/**
 * Helper function to create notifications from other services
 */
export async function createNotification(data: {
  userId: number;
  type: string;
  title: string;
  message: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
}) {
  const db = await getDb();
  if (!db) return null;

  try {
    await db.insert(notificationQueue).values({
      userId: data.userId,
      type: data.type as any,
      title: data.title,
      message: data.message,
      actionUrl: data.actionUrl,
      metadata: data.metadata ? JSON.stringify(data.metadata) : undefined,
      isRead: 0,
    });
    return true;
  } catch (error) {
    console.error("[Notification] Failed to create notification:", error);
    return false;
  }
}

