import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { subscriptionTiers } from "../../drizzle/schema";
import { getDb } from "../db";
import { protectedProcedure, router } from "../_core/trpc";

/**
 * Subscription Tier Management Router
 * Handles CRUD operations for subscription tiers
 */

export const tierRouter = router({
  /**
   * Get all subscription tiers (alias for list)
   */
  getAll: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

    const tiers = await db.select().from(subscriptionTiers);
    return tiers;
  }),

  /**
   * List all subscription tiers
   */
  list: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

    const tiers = await db.select().from(subscriptionTiers);
    return tiers;
  }),

  /**
   * Create a new subscription tier (admin only)
   */
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        slug: z.string().min(1).max(50),
        price: z.number().min(0),
        billingPeriod: z.enum(["monthly", "yearly"]),
        credits: z.number().min(0),
        collaboratorSeats: z.number().min(1).optional(),
        maxBrands: z.number().min(0).optional(),
        maxStorageGB: z.number().min(0).optional(),
        features: z.array(z.string()).optional(),
        isActive: z.boolean().default(true),
        isPublic: z.boolean().default(true),
        sortOrder: z.number().default(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is admin
      if (ctx.user.role !== "admin" && ctx.user.adminRole !== "super_admin" && ctx.user.adminRole !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
      }

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      await db.insert(subscriptionTiers).values({
        name: input.name,
        slug: input.slug,
        price: input.price,
        billingPeriod: input.billingPeriod,
        credits: input.credits,
        features: JSON.stringify(input.features || []),
        limits: JSON.stringify({}),
        maxBrands: input.maxBrands || 1,
        collaboratorSeats: input.collaboratorSeats || 1,
        maxStorageGB: input.maxStorageGB || 5,
        isPublic: input.isPublic ? 1 : 0,
        isActive: input.isActive ? 1 : 0,
      });

      return { success: true };
    }),

  /**
   * Update a subscription tier (admin only)
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).max(100).optional(),
        slug: z.string().min(1).max(50).optional(),
        price: z.number().min(0).optional(),
        billingPeriod: z.enum(["monthly", "yearly"]).optional(),
        credits: z.number().min(0).optional(),
        features: z.string().optional(),
        limits: z.string().optional(),
        maxBrands: z.number().min(0).optional(),
        collaboratorSeats: z.number().min(1).optional(),
        maxStorageGB: z.number().min(0).optional(),
        isPublic: z.boolean().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is admin
      if (ctx.user.role !== "admin" && ctx.user.adminRole !== "super_admin" && ctx.user.adminRole !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
      }

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const { id, ...updates } = input;
      const updateData: any = {};

      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.slug !== undefined) updateData.slug = updates.slug;
      if (updates.price !== undefined) updateData.price = updates.price;
      if (updates.billingPeriod !== undefined) updateData.billingPeriod = updates.billingPeriod;
      if (updates.credits !== undefined) updateData.credits = updates.credits;
      if (updates.features !== undefined) updateData.features = updates.features;
      if (updates.limits !== undefined) updateData.limits = updates.limits;
      if (updates.isActive !== undefined) updateData.isActive = updates.isActive ? 1 : 0;

      await db
        .update(subscriptionTiers)
        .set(updateData)
        .where(eq(subscriptionTiers.id, id));

      return { success: true };
    }),

  /**
   * Delete a subscription tier (admin only)
   */
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // Check if user is admin
      if (ctx.user.role !== "admin" && ctx.user.adminRole !== "super_admin" && ctx.user.adminRole !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
      }

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      await db.delete(subscriptionTiers).where(eq(subscriptionTiers.id, input.id));

      return { success: true };
    }),

  /**
   * Toggle tier active status (admin only)
   */
  toggleActive: protectedProcedure
    .input(z.object({ id: z.number(), isActive: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      // Check if user is admin
      if (ctx.user.role !== "admin" && ctx.user.adminRole !== "super_admin" && ctx.user.adminRole !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
      }

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      await db
        .update(subscriptionTiers)
        .set({ isActive: input.isActive ? 1 : 0 })
        .where(eq(subscriptionTiers.id, input.id));

      return { success: true };
    }),
});

