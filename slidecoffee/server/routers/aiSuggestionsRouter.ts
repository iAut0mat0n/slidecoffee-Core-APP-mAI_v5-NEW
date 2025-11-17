import { TRPCError } from "@trpc/server";
import { eq, and, desc } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { aiSuggestions } from "../../drizzle/schema";

/**
 * AI Suggestions Router
 * Manages AI-generated suggestions for presentations
 */

export const aiSuggestionsRouter = router({
  /**
   * List suggestions for a project
   */
  list: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const suggestions = await db
        .select()
        .from(aiSuggestions)
        .where(eq(aiSuggestions.presentationId, input.projectId))
        .orderBy(desc(aiSuggestions.createdAt));

      return suggestions;
    }),

  /**
   * Accept and apply a suggestion
   */
  accept: protectedProcedure
    .input(z.object({ suggestionId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // Update suggestion status
      await db
        .update(aiSuggestions)
        .set({
          status: "accepted",
          appliedAt: new Date(),
          appliedBy: ctx.user.id,
        })
        .where(eq(aiSuggestions.id, input.suggestionId));

      return { success: true };
    }),

  /**
   * Reject/dismiss a suggestion
   */
  reject: protectedProcedure
    .input(z.object({ suggestionId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      await db
        .update(aiSuggestions)
        .set({ status: "rejected" })
        .where(eq(aiSuggestions.id, input.suggestionId));

      return { success: true };
    }),

  /**
   * Generate new suggestions for a presentation
   */
  generate: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // TODO: Implement AI suggestion generation logic
      // For now, return mock suggestions
      const mockSuggestions = [
        {
          presentationId: input.projectId,
          type: "content" as const,
          title: "Add more context to slide 3",
          description: "Consider adding specific examples or data points to support your main argument on slide 3.",
          targetSlide: 3,
          priority: "medium" as const,
          confidence: 0.85,
          status: "pending" as const,
        },
        {
          presentationId: input.projectId,
          type: "design" as const,
          title: "Improve visual hierarchy",
          description: "The title on slide 5 could be more prominent. Consider increasing font size or using a bolder weight.",
          targetSlide: 5,
          priority: "low" as const,
          confidence: 0.72,
          status: "pending" as const,
        },
      ];

      for (const suggestion of mockSuggestions) {
        await db.insert(aiSuggestions).values(suggestion);
      }

      return { success: true, count: mockSuggestions.length };
    }),
});

