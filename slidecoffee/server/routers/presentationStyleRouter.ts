import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { brands, slides } from "../../drizzle/schema";
import {
  applyBrandStyle,
  generatePresentationTemplate,
  generateBrandPreviewCSS,
} from "../services/brandStyleApplicator";

/**
 * Presentation Style Router
 * Handles auto-application of brand styles to presentations
 */

export const presentationStyleRouter = router({
  /**
   * Apply brand style to presentation
   */
  applyBrandStyle: protectedProcedure
    .input(
      z.object({
        presentationId: z.number(),
        brandId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // Get brand
      const brand = await db.select().from(brands).where(eq(brands.id, input.brandId)).limit(1);
      if (!brand.length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Brand not found" });
      }

      // Get presentation slides
      const presentationSlides = await db
        .select()
        .from(slides)
        .where(eq(slides.presentationId, input.presentationId));

      // Extract brand style
      const brandData = brand[0];
      const brandStyle = {
        colors: {
          primary: brandData.primaryColor || undefined,
          secondary: brandData.secondaryColor || undefined,
          accent: brandData.accentColor || undefined,
        },
        fonts: {
          heading: brandData.fontPrimary || undefined,
          body: brandData.fontSecondary || undefined,
        },
        logo: brandData.logoUrl
          ? {
              url: brandData.logoUrl,
              position: "top-right" as const,
              size: "small" as const,
            }
          : undefined,
      };

      // Apply brand style
      const styledSlides = applyBrandStyle(presentationSlides as any, brandStyle);

      // Update slides in database
      for (const slide of styledSlides) {
        await db
          .update(slides)
          .set({ contentHtml: slide.content })
          .where(eq(slides.id, slide.id));
      }

      return { success: true, slidesUpdated: styledSlides.length };
    }),

  /**
   * Generate template from brand
   */
  generateTemplate: protectedProcedure
    .input(z.object({ brandId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // Get brand
      const brand = await db.select().from(brands).where(eq(brands.id, input.brandId)).limit(1);
      if (!brand.length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Brand not found" });
      }

      const brandData = brand[0];
      const brandStyle = {
        colors: {
          primary: brandData.primaryColor || undefined,
          secondary: brandData.secondaryColor || undefined,
          accent: brandData.accentColor || undefined,
          background: "#FFFFFF",
          text: "#333333",
        },
        fonts: {
          heading: brandData.fontPrimary || "Arial",
          body: brandData.fontSecondary || "Arial",
        },
        logo: brandData.logoUrl
          ? {
              url: brandData.logoUrl,
              position: "top-right" as const,
              size: "small" as const,
            }
          : undefined,
      };

      const template = generatePresentationTemplate(brandStyle);
      return template;
    }),

  /**
   * Preview brand styles as CSS
   */
  previewBrandCSS: protectedProcedure
    .input(z.object({ brandId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // Get brand
      const brand = await db.select().from(brands).where(eq(brands.id, input.brandId)).limit(1);
      if (!brand.length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Brand not found" });
      }

      const brandData = brand[0];
      const brandStyle = {
        colors: {
          primary: brandData.primaryColor || "#000000",
          secondary: brandData.secondaryColor || "#666666",
          accent: brandData.accentColor || "#0066CC",
          background: "#FFFFFF",
          text: "#333333",
        },
        fonts: {
          heading: brandData.fontPrimary || "Arial",
          body: brandData.fontSecondary || "Arial",
        },
      };

      const css = generateBrandPreviewCSS(brandStyle);
      return { css };
    }),
});

