import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { generateImage } from "../_core/imageGeneration";
import { checkRateLimit } from "../security/rateLimit";
import { TRPCError } from "@trpc/server";

export const imageGenerationRouter = router({
  generate: protectedProcedure
    .input(z.object({
      prompt: z.string().min(1).max(1000),
      originalImages: z.array(z.object({
        url: z.string(),
        mimeType: z.string(),
      })).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Rate limiting: 10 image generations per minute
      const rateLimit = checkRateLimit(ctx.user.id.toString(), 'aiGeneration');
      if (!rateLimit.allowed) {
        throw new TRPCError({
          code: 'TOO_MANY_REQUESTS',
          message: `Image generation rate limit exceeded. Please wait ${rateLimit.resetIn} seconds. ☕`,
        });
      }

      const result = await generateImage({
        prompt: input.prompt,
        originalImages: input.originalImages,
      });
      
      return { url: result.url };
    }),
});

