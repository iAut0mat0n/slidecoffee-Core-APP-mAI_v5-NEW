import { TRPCError } from "@trpc/server";
import { eq, and, desc } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { presentationVersions, slides, presentations } from "../../drizzle/schema";

/**
 * Version History Router
 * Handles version snapshots and rollback for collaborative editing
 */

export const versionHistoryRouter = router({
  /**
   * Create a version snapshot
   */
  createSnapshot: protectedProcedure
    .input(
      z.object({
        presentationId: z.number(),
        changeDescription: z.string().optional(),
        isAutoSave: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // Get all slides for this presentation
      const presentationSlides = await db
        .select()
        .from(slides)
        .where(eq(slides.presentationId, input.presentationId));

      // Get current version number
      const versions = await db
        .select()
        .from(presentationVersions)
        .where(eq(presentationVersions.presentationId, input.presentationId))
        .orderBy(desc(presentationVersions.versionNumber))
        .limit(1);

      const nextVersion = versions.length > 0 ? versions[0].versionNumber + 1 : 1;

      // Create snapshot
      const content = JSON.stringify(presentationSlides);
      await db.insert(presentationVersions).values({
        presentationId: input.presentationId,
        versionNumber: nextVersion,
        content,
        authorId: ctx.user.id,
        changeDescription: input.changeDescription,
        isAutoSave: input.isAutoSave ? 1 : 0,
      });

      return { success: true, versionNumber: nextVersion };
    }),

  /**
   * Get version history for a presentation
   */
  getHistory: protectedProcedure
    .input(
      z.object({
        presentationId: z.number(),
        limit: z.number().min(1).max(50).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const versions = await db
        .select()
        .from(presentationVersions)
        .where(eq(presentationVersions.presentationId, input.presentationId))
        .orderBy(desc(presentationVersions.createdAt))
        .limit(input.limit);

      return versions;
    }),

  /**
   * Get a specific version
   */
  getVersion: protectedProcedure
    .input(z.object({ versionId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const version = await db
        .select()
        .from(presentationVersions)
        .where(eq(presentationVersions.id, input.versionId))
        .limit(1);

      if (!version.length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Version not found" });
      }

      return {
        ...version[0],
        content: JSON.parse(version[0].content),
      };
    }),

  /**
   * Rollback to a specific version
   */
  rollback: protectedProcedure
    .input(z.object({ versionId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // Get the version
      const version = await db
        .select()
        .from(presentationVersions)
        .where(eq(presentationVersions.id, input.versionId))
        .limit(1);

      if (!version.length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Version not found" });
      }

      const versionData = version[0];
      const slideData = JSON.parse(versionData.content);

      // Delete current slides
      await db
        .delete(slides)
        .where(eq(slides.presentationId, versionData.presentationId));

      // Restore slides from version
      for (const slide of slideData) {
        await db.insert(slides).values({
          presentationId: versionData.presentationId,
          slideNumber: slide.slideNumber,
          slideId: slide.slideId || `slide_${slide.slideNumber}`,
          title: slide.title || `Slide ${slide.slideNumber}`,
          contentHtml: slide.content,
          status: "completed" as const,
        });
      }

      // Create a new version snapshot after rollback
      await db.insert(presentationVersions).values({
        presentationId: versionData.presentationId,
        versionNumber: versionData.versionNumber + 1000, // Use high number to indicate rollback
        content: versionData.content,
        authorId: ctx.user.id,
        changeDescription: `Rolled back to version ${versionData.versionNumber}`,
        isAutoSave: 0,
      });

      return { success: true, restoredVersion: versionData.versionNumber };
    }),

  /**
   * Compare two versions
   */
  compareVersions: protectedProcedure
    .input(
      z.object({
        versionId1: z.number(),
        versionId2: z.number(),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const [version1, version2] = await Promise.all([
        db.select().from(presentationVersions).where(eq(presentationVersions.id, input.versionId1)).limit(1),
        db.select().from(presentationVersions).where(eq(presentationVersions.id, input.versionId2)).limit(1),
      ]);

      if (!version1.length || !version2.length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "One or both versions not found" });
      }

      return {
        version1: {
          ...version1[0],
          content: JSON.parse(version1[0].content),
        },
        version2: {
          ...version2[0],
          content: JSON.parse(version2[0].content),
        },
      };
    }),

  /**
   * Delete old versions (keep last N versions)
   */
  pruneOldVersions: protectedProcedure
    .input(
      z.object({
        presentationId: z.number(),
        keepCount: z.number().min(5).max(50).default(20),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // Get all versions
      const versions = await db
        .select()
        .from(presentationVersions)
        .where(eq(presentationVersions.presentationId, input.presentationId))
        .orderBy(desc(presentationVersions.createdAt));

      // Delete versions beyond keepCount
      if (versions.length > input.keepCount) {
        const versionsToDelete = versions.slice(input.keepCount);
        for (const version of versionsToDelete) {
          await db.delete(presentationVersions).where(eq(presentationVersions.id, version.id));
        }
      }

      return { success: true, deletedCount: Math.max(0, versions.length - input.keepCount) };
    }),
});

/**
 * Auto-save helper function (called from WebSocket or periodic job)
 */
export async function autoSaveVersion(presentationId: number, authorId: number) {
  const db = await getDb();
  if (!db) return false;

  try {
    // Get all slides
    const presentationSlides = await db
      .select()
      .from(slides)
      .where(eq(slides.presentationId, presentationId));

    // Get current version number
    const versions = await db
      .select()
      .from(presentationVersions)
      .where(eq(presentationVersions.presentationId, presentationId))
      .orderBy(desc(presentationVersions.versionNumber))
      .limit(1);

    const nextVersion = versions.length > 0 ? versions[0].versionNumber + 1 : 1;

    // Create auto-save snapshot
    const content = JSON.stringify(presentationSlides);
    await db.insert(presentationVersions).values({
      presentationId,
      versionNumber: nextVersion,
      content,
      authorId,
      changeDescription: "Auto-save",
      isAutoSave: 1,
    });

    return true;
  } catch (error) {
    console.error("[VersionHistory] Auto-save failed:", error);
    return false;
  }
}

