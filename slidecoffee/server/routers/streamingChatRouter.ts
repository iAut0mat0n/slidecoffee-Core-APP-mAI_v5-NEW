import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { invokeLLM, type Message } from "../_core/llm";
import { TRPCError } from "@trpc/server";
import { observable } from "@trpc/server/observable";
import { SYSTEM_PROMPTS, getEncouragingPhrase, EMOJI_LIBRARY } from "../lib/aiPersonality";

/**
 * Streaming Chat Router
 * Provides real-time, word-by-word streaming responses like ChatGPT/Manus
 */

export const streamingChatRouter = router({
  /**
   * Stream chat responses with word-by-word delivery
   * Uses Server-Sent Events (SSE) via tRPC subscriptions
   */
  streamResponse: protectedProcedure
    .input(
      z.object({
        message: z.string().min(1),
        conversationHistory: z.array(
          z.object({
            role: z.enum(["user", "assistant", "system"]),
            content: z.string(),
          })
        ).optional(),
        projectId: z.number().optional(),
        context: z.object({
          brandId: z.number().optional(),
          presentationType: z.string().optional(),
        }).optional(),
      })
    )
    .subscription(async ({ input, ctx }) => {
      return observable<{
        type: "token" | "reasoning" | "research" | "knowledge" | "complete" | "error";
        content: string;
        metadata?: Record<string, any>;
      }>((emit) => {
        (async () => {
          try {
            // Build conversation context
            const messages: Message[] = [
              {
                role: "system",
                content: `${SYSTEM_PROMPTS.mainAssistant}

User: ${ctx.user.name || "there"}
Context: ${input.context ? JSON.stringify(input.context) : "New conversation"}`,
              },
            ];

            // Add conversation history
            if (input.conversationHistory && input.conversationHistory.length > 0) {
              messages.push(...input.conversationHistory);
            }

            // Add current user message
            messages.push({
              role: "user",
              content: input.message,
            });

            // Emit reasoning step
            emit.next({
              type: "reasoning",
              content: "💭 Thinking about your request...",
            });

            // Call LLM (streaming will be added later)
            const response = await invokeLLM({
              messages,
            });

            // Check if streaming is supported
            if (response && typeof response === "object" && "choices" in response) {
              // Non-streaming response - split into tokens for simulation
              const content = response.choices[0]?.message?.content;
              const fullText = typeof content === 'string' ? content : '';
              const words = fullText.split(" ");

              for (let i = 0; i < words.length; i++) {
                emit.next({
                  type: "token",
                  content: words[i] + (i < words.length - 1 ? " " : ""),
                });
                // Small delay to simulate streaming
                await new Promise((resolve) => setTimeout(resolve, 30));
              }
            } else {
              // Handle actual streaming response
              // Note: This depends on the LLM API's streaming implementation
              emit.next({
                type: "token",
                content: "Streaming not yet fully implemented. Using fallback.",
              });
            }

            // Emit completion
            emit.next({
              type: "complete",
              content: "Response complete",
            });

            emit.complete();
          } catch (error: any) {
            console.error("[Streaming Chat] Error:", error);
            emit.next({
              type: "error",
              content: error.message || "An error occurred while processing your request",
            });
            emit.error(error);
          }
        })();
      });
    }),

  /**
   * Regular (non-streaming) chat endpoint for compatibility
   */
  sendMessage: protectedProcedure
    .input(
      z.object({
        message: z.string().min(1),
        conversationHistory: z.array(
          z.object({
            role: z.enum(["user", "assistant", "system"]),
            content: z.string(),
          })
        ).optional(),
        projectId: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const messages: Message[] = [
        {
          role: "system",
          content: `You are SlideCoffee's AI assistant ☕️ - friendly, encouraging, and expert at presentations.`,
        },
      ];

      if (input.conversationHistory) {
        messages.push(...input.conversationHistory);
      }

      messages.push({
        role: "user",
        content: input.message,
      });

      const response = await invokeLLM({ messages });

      return {
        content: response.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.",
        role: "assistant" as const,
      };
    }),
});

