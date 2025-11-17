import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { adminProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * Admin Router
 * Handles admin-only operations like user management, stats, exports
 */

export const adminRouter = router({
  /**
   * Get admin dashboard stats
   */
  getStats: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

    const allUsers = await db.select().from(users);
    const totalUsers = allUsers.length;
    const activeSubscriptions = allUsers.filter(u => u.subscriptionTier !== "starter").length;
    const monthlyRevenue = activeSubscriptions * 29;

    const tierBreakdown = [
      { tier: "Starter", count: allUsers.filter(u => u.subscriptionTier === "starter").length },
      { tier: "Pro", count: allUsers.filter(u => u.subscriptionTier === "pro").length },
      { tier: "Business", count: allUsers.filter(u => u.subscriptionTier === "business").length },
      { tier: "Enterprise", count: allUsers.filter(u => u.subscriptionTier === "enterprise").length },
    ];

    return { totalUsers, activeSubscriptions, monthlyRevenue, tierBreakdown };
  }),

  /**
   * Change user admin role
   */
  changeUserRole: adminProcedure
    .input(z.object({ 
      userId: z.number(), 
      role: z.enum(["admin", "super_admin", "support", "viewer"]).nullable() 
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      await db.update(users).set({ adminRole: input.role }).where(eq(users.id, input.userId));
      return { success: true };
    }),

  /**
   * Change user subscription tier
   */
  changeUserTier: adminProcedure
    .input(z.object({ 
      userId: z.number(), 
      tier: z.enum(["starter", "pro", "pro_plus", "team", "business", "enterprise"]) 
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      await db.update(users).set({ subscriptionTier: input.tier }).where(eq(users.id, input.userId));
      return { success: true };
    }),

  /**
   * Get all users (admin only)
   */
  getUsers: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const usersList = await db
        .select()
        .from(users)
        .limit(input.limit)
        .offset(input.offset);

      return usersList;
    }),

  /**
   * Update user role (admin only)
   */
  updateUserRole: adminProcedure
    .input(
      z.object({
        userId: z.number(),
        role: z.enum(["user", "admin"]),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      await db
        .update(users)
        .set({ role: input.role })
        .where(eq(users.id, input.userId));

      return { success: true };
    }),

  /**
   * Update user subscription tier (admin only)
   */
  updateUserTier: adminProcedure
    .input(
      z.object({
        userId: z.number(),
        tier: z.enum(["starter", "pro", "pro_plus", "team", "business", "enterprise"]),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      await db
        .update(users)
        .set({ subscriptionTier: input.tier })
        .where(eq(users.id, input.userId));

      return { success: true };
    }),

  /**
   * Export users as CSV (admin only)
   */
  exportUsersCSV: adminProcedure.mutation(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

    const usersList = await db.select().from(users);

    // Generate CSV
    const headers = ["ID", "Name", "Email", "Role", "Tier", "Credits", "Created At"];
    const rows = usersList.map((user) => [
      user.id,
      user.name || "",
      user.email || "",
      user.role,
      user.subscriptionTier,
      user.creditsRemaining,
      user.createdAt.toISOString(),
    ]);

    const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

    return { csv };
  }),
});

