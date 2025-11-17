import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { invokeLLM } from "../_core/llm";
import { SYSTEM_PROMPTS, getEncouragingPhrase } from "../lib/aiPersonality";
import { getDb } from "../db";
import { presentations, slides } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { checkRateLimit } from "../security/rateLimit";

/**
 * AI Agent Router
 * Handles streaming chat, research, and intelligent deck generation
 */

// Use centralized personality configuration
const SLIDECOFFEE_PERSONALITY = SYSTEM_PROMPTS.mainAssistant;

export const aiAgentRouter = router({
  /**
   * Streaming chat with AI agent
   */
  chat: protectedProcedure
    .input(
      z.object({
        message: z.string().min(1),
        conversationHistory: z.array(
          z.object({
            role: z.enum(["user", "assistant", "system"]),
            content: z.string(),
          })
        ).optional(),
        presentationId: z.number().optional(),
        researchMode: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Rate limiting: 10 AI requests per minute
      const rateLimit = checkRateLimit(ctx.user.id.toString(), 'aiGeneration');
      if (!rateLimit.allowed) {
        throw new TRPCError({
          code: 'TOO_MANY_REQUESTS',
          message: `AI generation rate limit exceeded. Please wait ${rateLimit.resetIn} seconds. ☕ Take a coffee break!`,
        });
      }

      try {
        // Build conversation context
        const messages: any[] = [
          { role: "system", content: SLIDECOFFEE_PERSONALITY },
        ];

        // Add conversation history
        if (input.conversationHistory && input.conversationHistory.length > 0) {
          messages.push(...input.conversationHistory);
        }

        // Add current user message
        messages.push({ role: "user", content: input.message });

        // If research mode, enhance the prompt
        if (input.researchMode) {
          messages.push({
            role: "system",
            content: "Research mode activated. Provide well-researched, fact-based responses with specific data points and sources when possible.",
          });
        }

        // Call LLM with streaming
        const response = await invokeLLM({
          messages,
        });

        const assistantMessage = response.choices[0].message.content as string;

        return {
          message: assistantMessage,
          suggestions: generateSmartSuggestions(input.message, assistantMessage),
        };
      } catch (error: any) {
        console.error("[AIAgent] Chat error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to process chat message",
        });
      }
    }),

  /**
   * Research a topic for presentation
   */
  researchTopic: protectedProcedure
    .input(
      z.object({
        topic: z.string().min(1),
        depth: z.enum(["quick", "standard", "deep"]).default("standard"),
        focus: z.string().optional(), // Specific aspect to focus on
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Generate research prompt
        const researchPrompt = `Research the topic: "${input.topic}"${
          input.focus ? ` with focus on: ${input.focus}` : ""
        }

Please provide:
1. Key facts and statistics
2. Main concepts and definitions
3. Current trends or recent developments
4. Notable examples or case studies
5. Potential talking points for a presentation

Depth level: ${input.depth}`;

        const response = await invokeLLM({
          messages: [
            { role: "system", content: SLIDECOFFEE_PERSONALITY },
            { role: "user", content: researchPrompt },
          ],
        });

        const researchContent = response.choices[0].message.content as string;

        return {
          content: researchContent,
          suggestions: [
            "Generate slides from this research",
            "Add more specific examples",
            "Find supporting statistics",
            "Create visual diagrams",
          ],
        };
      } catch (error: any) {
        console.error("[AIAgent] Research error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to research topic",
        });
      }
    }),

  /**
   * Generate slide content from research
   */
  generateSlideContent: protectedProcedure
    .input(
      z.object({
        topic: z.string(),
        researchData: z.string().optional(),
        slideCount: z.number().min(1).max(50).default(10),
        style: z.enum(["professional", "creative", "minimal", "data-driven"]).default("professional"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const prompt = `Create ${input.slideCount} presentation slides about: "${input.topic}"

${input.researchData ? `Use this research data:\n${input.researchData}\n\n` : ""}

Style: ${input.style}

For each slide, provide:
1. Slide title
2. Key points (3-5 bullet points)
3. Suggested visual (chart, image, diagram type)
4. Speaker notes

Format as JSON array with structure:
[
  {
    "slideNumber": 1,
    "title": "...",
    "points": ["...", "..."],
    "visualSuggestion": "...",
    "notes": "..."
  }
]`;

        const response = await invokeLLM({
          messages: [
            { role: "system", content: SLIDECOFFEE_PERSONALITY },
            { role: "user", content: prompt },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "slide_content",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  slides: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        slideNumber: { type: "integer" },
                        title: { type: "string" },
                        points: { type: "array", items: { type: "string" } },
                        visualSuggestion: { type: "string" },
                        notes: { type: "string" },
                      },
                      required: ["slideNumber", "title", "points", "visualSuggestion", "notes"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["slides"],
                additionalProperties: false,
              },
            },
          },
        });

        const slideContent = JSON.parse((response.choices[0].message.content as string) || "{}");

        return slideContent;
      } catch (error: any) {
        console.error("[AIAgent] Generate slides error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate slide content",
        });
      }
    }),

  /**
   * Improve existing slide content
   */
  improveSlide: protectedProcedure
    .input(
      z.object({
        slideId: z.number(),
        improvementType: z.enum(["clarity", "engagement", "data", "visuals", "storytelling"]),
        currentContent: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const improvementPrompts = {
          clarity: "Make this slide clearer and easier to understand",
          engagement: "Make this slide more engaging and memorable",
          data: "Add relevant data and statistics to support the points",
          visuals: "Suggest better visual elements and layout",
          storytelling: "Improve the narrative flow and storytelling",
        };

        const prompt = `${improvementPrompts[input.improvementType]}:

Current slide content:
${input.currentContent}

Provide improved version with specific suggestions.`;

        const response = await invokeLLM({
          messages: [
            { role: "system", content: SLIDECOFFEE_PERSONALITY },
            { role: "user", content: prompt },
          ],
        });

        return {
          improvedContent: response.choices[0].message.content as string,
          suggestions: [
            "Apply these improvements",
            "Try a different improvement type",
            "Generate alternative versions",
          ],
        };
      } catch (error: any) {
        console.error("[AIAgent] Improve slide error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to improve slide",
        });
      }
    }),

  /**
   * Get smart suggestions based on context
   */
  getSmartSuggestions: protectedProcedure
    .input(
      z.object({
        presentationId: z.number().optional(),
        currentSlide: z.number().optional(),
        userIntent: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const suggestions: Array<{
        id: string;
        text: string;
        action: string;
        icon: string;
      }> = [];

      // Context-aware suggestions
      if (input.presentationId) {
        suggestions.push(
          {
            id: "research",
            text: "Research this topic",
            action: "research_topic",
            icon: "🔍",
          },
          {
            id: "add_data",
            text: "Add supporting data",
            action: "add_statistics",
            icon: "📊",
          },
          {
            id: "improve_flow",
            text: "Improve narrative flow",
            action: "improve_storytelling",
            icon: "📖",
          }
        );
      }

      suggestions.push(
        {
          id: "generate_slides",
          text: "Generate slides from topic",
          action: "generate_slides",
          icon: "✨",
        },
        {
          id: "apply_brand",
          text: "Apply brand styling",
          action: "apply_brand",
          icon: "🎨",
        },
        {
          id: "export",
          text: "Export presentation",
          action: "export_ppt",
          icon: "📥",
        }
      );

      return suggestions;
    }),
});

/**
 * Helper function to generate smart suggestions from conversation
 */
function generateSmartSuggestions(userMessage: string, assistantResponse: string): string[] {
  const suggestions: string[] = [];

  // Detect user intent and suggest actions
  const lowerMessage = userMessage.toLowerCase();

  if (lowerMessage.includes("create") || lowerMessage.includes("make") || lowerMessage.includes("generate")) {
    suggestions.push("Generate slides from this topic");
  }

  if (lowerMessage.includes("research") || lowerMessage.includes("learn") || lowerMessage.includes("about")) {
    suggestions.push("Deep research on this topic");
  }

  if (lowerMessage.includes("improve") || lowerMessage.includes("better") || lowerMessage.includes("enhance")) {
    suggestions.push("Get improvement suggestions");
  }

  if (lowerMessage.includes("data") || lowerMessage.includes("statistics") || lowerMessage.includes("numbers")) {
    suggestions.push("Find supporting statistics");
  }

  if (lowerMessage.includes("design") || lowerMessage.includes("visual") || lowerMessage.includes("layout")) {
    suggestions.push("Get design recommendations");
  }

  // Default suggestions if none matched
  if (suggestions.length === 0) {
    suggestions.push(
      "Generate slides",
      "Research this topic",
      "Add to presentation"
    );
  }

  return suggestions.slice(0, 3); // Return top 3 suggestions
}

