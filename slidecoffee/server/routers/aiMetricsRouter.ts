import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { aiUsageMetrics } from "../../drizzle/schema";
import { and, between, desc, eq, sql } from "drizzle-orm";

/**
 * AI Metrics Router
 * Provides analytics and cost tracking for AI model usage
 */
export const aiMetricsRouter = router({
  /**
   * Get aggregated metrics for a time period
   */
  getAggregatedMetrics: protectedProcedure
    .input(
      z.object({
        startDate: z.string(), // ISO date string
        endDate: z.string(),
        groupBy: z.enum(["model", "day", "hour"]).optional().default("day"),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const { startDate, endDate, groupBy } = input;

      // Build aggregation query based on groupBy
      let groupByClause;
      if (groupBy === "model") {
        groupByClause = sql`${aiUsageMetrics.model}`;
      } else if (groupBy === "day") {
        groupByClause = sql`DATE(${aiUsageMetrics.createdAt})`;
      } else {
        groupByClause = sql`DATE_FORMAT(${aiUsageMetrics.createdAt}, '%Y-%m-%d %H:00:00')`;
      }

      const results = await db
        .select({
          groupKey: groupByClause.as("groupKey"),
          totalRequests: sql<number>`COUNT(*)`.as("totalRequests"),
          successfulRequests: sql<number>`SUM(CASE WHEN ${aiUsageMetrics.success} = 1 THEN 1 ELSE 0 END)`.as(
            "successfulRequests"
          ),
          failedRequests: sql<number>`SUM(CASE WHEN ${aiUsageMetrics.success} = 0 THEN 1 ELSE 0 END)`.as(
            "failedRequests"
          ),
          totalTokens: sql<number>`SUM(${aiUsageMetrics.totalTokens})`.as("totalTokens"),
          totalCost: sql<number>`SUM(${aiUsageMetrics.costUsd})`.as("totalCost"),
          avgResponseTime: sql<number>`AVG(${aiUsageMetrics.responseTimeMs})`.as("avgResponseTime"),
        })
        .from(aiUsageMetrics)
        .where(
          and(
            sql`${aiUsageMetrics.createdAt} >= ${startDate}`,
            sql`${aiUsageMetrics.createdAt} <= ${endDate}`
          )
        )
        .groupBy(groupByClause)
        .orderBy(desc(groupByClause));

      return results;
    }),

  /**
   * Get model comparison stats
   */
  getModelComparison: protectedProcedure
    .input(
      z.object({
        startDate: z.string(),
        endDate: z.string(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const { startDate, endDate } = input;

      const results = await db
        .select({
          model: aiUsageMetrics.model,
          totalRequests: sql<number>`COUNT(*)`.as("totalRequests"),
          successRate: sql<number>`(SUM(CASE WHEN ${aiUsageMetrics.success} = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*))`.as(
            "successRate"
          ),
          totalCost: sql<number>`SUM(${aiUsageMetrics.costUsd})`.as("totalCost"),
          avgCostPerRequest: sql<number>`AVG(${aiUsageMetrics.costUsd})`.as("avgCostPerRequest"),
          avgResponseTime: sql<number>`AVG(${aiUsageMetrics.responseTimeMs})`.as("avgResponseTime"),
          totalTokens: sql<number>`SUM(${aiUsageMetrics.totalTokens})`.as("totalTokens"),
        })
        .from(aiUsageMetrics)
        .where(
          and(
            sql`${aiUsageMetrics.createdAt} >= ${startDate}`,
            sql`${aiUsageMetrics.createdAt} <= ${endDate}`
          )
        )
        .groupBy(aiUsageMetrics.model);

      return results;
    }),

  /**
   * Get cost projection based on recent usage
   */
  getCostProjection: protectedProcedure
    .input(
      z.object({
        days: z.number().default(30), // Project for next N days
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get average daily cost from last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const recentUsage = await db
        .select({
          avgDailyCost: sql<number>`SUM(${aiUsageMetrics.costUsd}) / 7`.as("avgDailyCost"),
        })
        .from(aiUsageMetrics)
        .where(sql`${aiUsageMetrics.createdAt} >= ${sevenDaysAgo.toISOString()}`);

      const avgDailyCost = recentUsage[0]?.avgDailyCost || 0;
      const projectedCost = avgDailyCost * input.days;

      return {
        avgDailyCost,
        projectedCost,
        projectionDays: input.days,
      };
    }),

  /**
   * Get recent errors
   */
  getRecentErrors: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(10),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const errors = await db
        .select()
        .from(aiUsageMetrics)
        .where(eq(aiUsageMetrics.success, false))
        .orderBy(desc(aiUsageMetrics.createdAt))
        .limit(input.limit);

      return errors;
    }),

  /**
   * Get system health status
   */
  getSystemHealth: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      return {
        database: "error",
        ai: "unknown",
        storage: "unknown",
        websocket: "unknown",
      };
    }

    // Check last successful AI call
    const recentSuccess = await db
      .select()
      .from(aiUsageMetrics)
      .where(eq(aiUsageMetrics.success, true))
      .orderBy(desc(aiUsageMetrics.createdAt))
      .limit(1);

    const lastSuccessTime = recentSuccess[0]?.createdAt;
    const fiveMinutesAgo = new Date();
    fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);

    const aiStatus =
      lastSuccessTime && new Date(lastSuccessTime) > fiveMinutesAgo ? "healthy" : "degraded";

    return {
      database: "healthy",
      ai: aiStatus,
      storage: "healthy", // TODO: Add actual S3 health check
      websocket: "healthy", // TODO: Add actual WebSocket health check
    };
  }),

  /**
   * Get budget settings for a workspace
   */
  getBudgetSettings: protectedProcedure
    .input(
      z.object({
        workspaceId: z.number(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const { aiBudgetSettings } = await import("../../drizzle/schema");

      const settings = await db
        .select()
        .from(aiBudgetSettings)
        .where(eq(aiBudgetSettings.workspaceId, input.workspaceId));

      return settings;
    }),

  /**
   * Create or update budget setting
   */
  upsertBudgetSetting: protectedProcedure
    .input(
      z.object({
        id: z.number().optional(),
        workspaceId: z.number(),
        budgetType: z.enum(["daily", "monthly"]),
        budgetAmount: z.number().positive(),
        alertThreshold: z.number().min(0).max(1).default(0.8),
        enabled: z.boolean().default(true),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const { aiBudgetSettings } = await import("../../drizzle/schema");

      if (input.id) {
        // Update existing
        await db
          .update(aiBudgetSettings)
          .set({
            budgetAmount: input.budgetAmount,
            alertThreshold: input.alertThreshold,
            enabled: input.enabled,
            updatedAt: new Date(),
          })
          .where(eq(aiBudgetSettings.id, input.id));

        return { success: true, id: input.id };
      } else {
        // Create new
        const result = await db.insert(aiBudgetSettings).values({
          workspaceId: input.workspaceId,
          budgetType: input.budgetType,
          budgetAmount: input.budgetAmount,
          alertThreshold: input.alertThreshold,
          enabled: input.enabled,
        });

        return { success: true, id: result[0].insertId };
      }
    }),

  /**
   * Delete budget setting
   */
  deleteBudgetSetting: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const { aiBudgetSettings } = await import("../../drizzle/schema");

      await db.delete(aiBudgetSettings).where(eq(aiBudgetSettings.id, input.id));

      return { success: true };
    }),

  /**
   * Get current budget status
   */
  getBudgetStatus: protectedProcedure
    .input(
      z.object({
        workspaceId: z.number(),
      })
    )
    .query(async ({ input }) => {
      const { getBudgetStatusForWorkspace } = await import("../services/budgetAlertService");
      return await getBudgetStatusForWorkspace(input.workspaceId);
    }),

  /**
   * Get user-level AI usage breakdown
   */
  getUserLevelBreakdown: protectedProcedure
    .input(
      z.object({
        workspaceId: z.number(),
        startDate: z.string(),
        endDate: z.string(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const { users } = await import("../../drizzle/schema");

      const results = await db
        .select({
          userId: aiUsageMetrics.userId,
          userName: users.name,
          userEmail: users.email,
          totalRequests: sql<number>`COUNT(*)`.as("totalRequests"),
          totalCost: sql<number>`SUM(${aiUsageMetrics.costUsd})`.as("totalCost"),
          totalTokens: sql<number>`SUM(${aiUsageMetrics.totalTokens})`.as("totalTokens"),
          avgResponseTime: sql<number>`AVG(${aiUsageMetrics.responseTimeMs})`.as("avgResponseTime"),
        })
        .from(aiUsageMetrics)
        .leftJoin(users, eq(aiUsageMetrics.userId, users.id))
        .where(
          and(
            eq(aiUsageMetrics.workspaceId, input.workspaceId),
            sql`${aiUsageMetrics.createdAt} >= ${input.startDate}`,
            sql`${aiUsageMetrics.createdAt} <= ${input.endDate}`
          )
        )
        .groupBy(aiUsageMetrics.userId, users.name, users.email)
        .orderBy(desc(sql`totalCost`));

      return results;
    }),

  /**
   * Get model spending limits
   */
  getModelLimits: protectedProcedure
    .input(
      z.object({
        workspaceId: z.number(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const { aiModelLimits } = await import("../../drizzle/schema");

      const limits = await db
        .select()
        .from(aiModelLimits)
        .where(eq(aiModelLimits.workspaceId, input.workspaceId));

      return limits;
    }),

  /**
   * Create or update model spending limit
   */
  upsertModelLimit: protectedProcedure
    .input(
      z.object({
        id: z.number().optional(),
        workspaceId: z.number(),
        model: z.string(),
        dailyLimit: z.number().positive().nullable(),
        monthlyLimit: z.number().positive().nullable(),
        enabled: z.boolean().default(true),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const { aiModelLimits } = await import("../../drizzle/schema");

      if (input.id) {
        // Update existing
        await db
          .update(aiModelLimits)
          .set({
            dailyLimit: input.dailyLimit,
            monthlyLimit: input.monthlyLimit,
            enabled: input.enabled,
            updatedAt: new Date(),
          })
          .where(eq(aiModelLimits.id, input.id));

        return { success: true, id: input.id };
      } else {
        // Create new
        const result = await db.insert(aiModelLimits).values({
          workspaceId: input.workspaceId,
          model: input.model,
          dailyLimit: input.dailyLimit,
          monthlyLimit: input.monthlyLimit,
          enabled: input.enabled,
        });

        return { success: true, id: result[0].insertId };
      }
    }),

  /**
   * Delete model spending limit
   */
  deleteModelLimit: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const { aiModelLimits } = await import("../../drizzle/schema");

      await db.delete(aiModelLimits).where(eq(aiModelLimits.id, input.id));

      return { success: true };
    }),


});

