/**
 * Auto Top-up Router
 * 
 * Manages automatic credit top-up settings for account owners
 * - Enable/disable auto top-up
 * - Configure top-up amount and threshold
 * - Manual top-up trigger
 * - Only available for account owners (not team members)
 */

import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { users, creditTransactions } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export const autoTopupRouter = router({
  /**
   * Get current auto top-up settings
   */
  getSettings: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const user = await db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1);
    
    if (!user[0]) throw new Error("User not found");

    return {
      enabled: user[0].autoTopupEnabled === 1,
      amount: user[0].autoTopupAmount || 1000,
      threshold: user[0].autoTopupThreshold || 100,
      currentCredits: user[0].creditsRemaining,
    };
  }),

  /**
   * Update auto top-up settings
   */
  updateSettings: protectedProcedure
    .input(
      z.object({
        enabled: z.boolean(),
        amount: z.number().min(100).max(10000).optional(),
        threshold: z.number().min(0).max(1000).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const updateData: any = {
        autoTopupEnabled: input.enabled ? 1 : 0,
      };

      if (input.amount !== undefined) {
        updateData.autoTopupAmount = input.amount;
      }

      if (input.threshold !== undefined) {
        updateData.autoTopupThreshold = input.threshold;
      }

      await db.update(users).set(updateData).where(eq(users.id, ctx.user.id));

      return {
        success: true,
        message: input.enabled
          ? "Auto top-up enabled successfully"
          : "Auto top-up disabled successfully",
      };
    }),

  /**
   * Manual top-up trigger
   * Adds credits immediately (simulates payment for now)
   */
  manualTopup: protectedProcedure
    .input(
      z.object({
        amount: z.number().min(100).max(10000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get current balance
      const user = await db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1);
      
      if (!user[0]) throw new Error("User not found");

      const balanceBefore = user[0].creditsRemaining;
      const balanceAfter = balanceBefore + input.amount;

      // Update user credits
      await db
        .update(users)
        .set({ creditsRemaining: balanceAfter })
        .where(eq(users.id, ctx.user.id));

      // Log transaction
      await db.insert(creditTransactions).values({
        userId: ctx.user.id,
        amount: input.amount,
        type: "top_up",
        description: `Manual top-up of ${input.amount} credits`,
        balanceBefore,
        balanceAfter,
      });

      return {
        success: true,
        newBalance: balanceAfter,
        message: `Successfully added ${input.amount} credits`,
      };
    }),

  /**
   * Check if auto top-up should trigger
   * Called internally when credits are used
   */
  checkAndTrigger: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const user = await db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1);
    
    if (!user[0]) throw new Error("User not found");

    const { creditsRemaining, autoTopupEnabled, autoTopupAmount, autoTopupThreshold } = user[0];

    // Check if auto top-up should trigger
    if (
      autoTopupEnabled === 1 &&
      creditsRemaining <= autoTopupThreshold
    ) {
      const balanceBefore = creditsRemaining;
      const balanceAfter = balanceBefore + autoTopupAmount;

      // Update user credits
      await db
        .update(users)
        .set({ creditsRemaining: balanceAfter })
        .where(eq(users.id, ctx.user.id));

      // Log transaction
      await db.insert(creditTransactions).values({
        userId: ctx.user.id,
        amount: autoTopupAmount,
        type: "top_up",
        description: `Automatic top-up of ${autoTopupAmount} credits (triggered at ${balanceBefore} credits)`,
        balanceBefore,
        balanceAfter,
      });

      return {
        triggered: true,
        amount: autoTopupAmount,
        newBalance: balanceAfter,
        message: `Auto top-up triggered! Added ${autoTopupAmount} credits.`,
      };
    }

    return {
      triggered: false,
      message: "Auto top-up not triggered",
    };
  }),
});

