/**
 * Chat Router
 * 
 * Handles all chat interactions with Café AI (Manus API)
 * Includes PII protection, credit tracking, and context management
 */

import { z } from 'zod';
import { protectedProcedure, router } from '../_core/trpc';
import { sendManusMessage, generateOutline, generateSlide } from '../lib/manusApi';
import { getUserCredits, hasEnoughCredits } from '../lib/credits';
import { TRPCError } from '@trpc/server';
import { checkRateLimit } from '../security/rateLimit';

export const chatRouter = router({
  /**
   * Send a chat message to Café AI
   */
  sendMessage: protectedProcedure
    .input(
      z.object({
        presentationId: z.number(),
        message: z.string().min(1).max(5000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Rate limiting: 30 messages per minute
      const rateLimit = checkRateLimit(ctx.user.id.toString(), 'chatMessages');
      if (!rateLimit.allowed) {
        throw new TRPCError({
          code: 'TOO_MANY_REQUESTS',
          message: `Too many messages. Please wait ${rateLimit.resetIn} seconds before sending another message. ☕`,
        });
      }

      try {
        // Check if user has enough credits (estimate: 10-50 credits per message)
        const hasCredits = await hasEnoughCredits(ctx.user.id, 10);
        if (!hasCredits) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Insufficient credits. Please upgrade your plan.',
          });
        }

        // Send message to Manus API
        const result = await sendManusMessage({
          presentationId: input.presentationId,
          userId: ctx.user.id,
          message: input.message,
        });

        return {
          response: result.response,
          creditsUsed: result.creditsUsed,
          containedPII: result.containedPII,
        };
      } catch (error) {
        console.error('[Chat] Error sending message:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to send message',
        });
      }
    }),

  /**
   * Generate presentation outline
   */
  generateOutline: protectedProcedure
    .input(
      z.object({
        presentationId: z.number(),
        topic: z.string().min(1).max(500),
        slideCount: z.number().min(3).max(50).default(10),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if user has enough credits (estimate: 50 credits for outline)
        const hasCredits = await hasEnoughCredits(ctx.user.id, 50);
        if (!hasCredits) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Insufficient credits. Please upgrade your plan.',
          });
        }

        // Generate outline
        const result = await generateOutline(
          input.presentationId,
          ctx.user.id,
          input.topic,
          input.slideCount
        );

        return {
          outline: result.outline,
          creditsUsed: result.creditsUsed,
        };
      } catch (error) {
        console.error('[Chat] Error generating outline:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to generate outline',
        });
      }
    }),

  /**
   * Generate slide content
   */
  generateSlide: protectedProcedure
    .input(
      z.object({
        presentationId: z.number(),
        slideTitle: z.string().min(1).max(200),
        slideDescription: z.string().min(1).max(1000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if user has enough credits (estimate: 30-50 credits per slide)
        const hasCredits = await hasEnoughCredits(ctx.user.id, 30);
        if (!hasCredits) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Insufficient credits. Please upgrade your plan.',
          });
        }

        // Generate slide
        const result = await generateSlide(
          input.presentationId,
          ctx.user.id,
          input.slideTitle,
          input.slideDescription
        );

        return {
          content: result.content,
          creditsUsed: result.creditsUsed,
        };
      } catch (error) {
        console.error('[Chat] Error generating slide:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to generate slide',
        });
      }
    }),

  /**
   * Get user's current credit balance
   */
  getCredits: protectedProcedure.query(async ({ ctx }) => {
    const balance = await getUserCredits(ctx.user.id);
    return { balance };
  }),
});

