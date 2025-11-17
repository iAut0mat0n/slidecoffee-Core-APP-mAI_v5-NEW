import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { parseBrandFile, analyzeBrandData } from "../services/brandFileParser";
import { Buffer } from "buffer";
import { checkRateLimit } from "../security/rateLimit";

/**
 * Brand File Parsing Router
 * Handles PowerPoint and PDF brand file uploads and extraction
 */

export const brandFileRouter = router({
  /**
   * Parse brand file (PowerPoint or PDF) and extract brand elements
   */
  parseFile: protectedProcedure
    .input(
      z.object({
        fileUrl: z.string().url(),
        mimeType: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Rate limiting: 5 brand file uploads per hour
      const rateLimit = checkRateLimit(ctx.user.id.toString(), 'brandCreation');
      if (!rateLimit.allowed) {
        throw new TRPCError({
          code: 'TOO_MANY_REQUESTS',
          message: `Brand file upload rate limit exceeded. Please wait ${Math.ceil(rateLimit.resetIn! / 60)} minutes. ☕`,
        });
      }

      try {
        // Validate file type
        const supportedTypes = [
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
          "application/vnd.ms-powerpoint",
          "application/pdf",
        ];

        if (!supportedTypes.includes(input.mimeType)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Unsupported file type. Please upload PowerPoint (.pptx) or PDF files.",
          });
        }

        // Fetch file from URL
        const response = await fetch(input.fileUrl);
        if (!response.ok) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch file",
          });
        }

        const arrayBuffer = await response.arrayBuffer();
        const fileBuffer = Buffer.from(arrayBuffer);

        // Parse the file
        const extracted = await parseBrandFile(fileBuffer, input.mimeType);

        // Analyze the extracted data
        const analysis = analyzeBrandData(extracted);

        return {
          success: true,
          extracted: {
            colors: extracted.colors,
            fonts: extracted.fonts,
            logos: extracted.logos,
            textSample: extracted.textContent.substring(0, 500),
          },
          suggestions: {
            primaryColor: analysis.primaryColor,
            secondaryColors: analysis.secondaryColors,
            suggestedFonts: analysis.suggestedFonts,
            brandTone: analysis.brandTone,
          },
        };
      } catch (error: any) {
        console.error("Brand file parsing error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Failed to parse brand file",
        });
      }
    }),

  /**
   * Extract colors from uploaded file
   */
  extractColors: protectedProcedure
    .input(
      z.object({
        fileUrl: z.string().url(),
        mimeType: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const response = await fetch(input.fileUrl);
        const arrayBuffer = await response.arrayBuffer();
        const fileBuffer = Buffer.from(arrayBuffer);

        const extracted = await parseBrandFile(fileBuffer, input.mimeType);

        return {
          colors: extracted.colors,
          primaryColor: extracted.colors[0] || null,
          secondaryColors: extracted.colors.slice(1, 4),
        };
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to extract colors",
        });
      }
    }),

  /**
   * Extract fonts from uploaded file
   */
  extractFonts: protectedProcedure
    .input(
      z.object({
        fileUrl: z.string().url(),
        mimeType: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const response = await fetch(input.fileUrl);
        const arrayBuffer = await response.arrayBuffer();
        const fileBuffer = Buffer.from(arrayBuffer);

        const extracted = await parseBrandFile(fileBuffer, input.mimeType);

        return {
          fonts: extracted.fonts,
          primaryFont: extracted.fonts[0] || "Inter",
          secondaryFont: extracted.fonts[1] || "Roboto",
        };
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to extract fonts",
        });
      }
    }),
});

