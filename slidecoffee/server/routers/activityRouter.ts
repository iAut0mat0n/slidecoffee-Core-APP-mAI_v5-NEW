import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { activityFeed } from "../../drizzle/schema";
import { desc, eq, and, gte } from "drizzle-orm";

export const activityRouter = router({
  /**
   * Get recent activity feed (admin only)
   */
  getRecent: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin access required",
        });
      }

      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const activities = await db
        .select()
        .from(activityFeed)
        .orderBy(desc(activityFeed.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      return activities;
    }),

  /**
   * Get activity for a specific user
   */
  getByUser: protectedProcedure
    .input(
      z.object({
        userId: z.number(),
        limit: z.number().min(1).max(100).default(50),
      })
    )
    .query(async ({ input, ctx }) => {
      // Users can only see their own activity, admins can see anyone's
      if (ctx.user.role !== "admin" && ctx.user.id !== input.userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot view other users' activity",
        });
      }

      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const activities = await db
        .select()
        .from(activityFeed)
        .where(eq(activityFeed.userId, input.userId))
        .orderBy(desc(activityFeed.createdAt))
        .limit(input.limit);

      return activities;
    }),

  /**
   * Get activity statistics
   */
  getStats: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Admin access required",
      });
    }

    const db = await getDb();
    if (!db) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database not available",
      });
    }

    // Get activity counts for the last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const recentActivity = await db
      .select()
      .from(activityFeed)
      .where(gte(activityFeed.createdAt, oneDayAgo));

    // Count by action type
    const actionCounts: Record<string, number> = {};
    recentActivity.forEach((activity) => {
      actionCounts[activity.action] = (actionCounts[activity.action] || 0) + 1;
    });

    return {
      total24h: recentActivity.length,
      actionCounts,
      topActions: Object.entries(actionCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([action, count]) => ({ action, count })),
    };
  }),
});

