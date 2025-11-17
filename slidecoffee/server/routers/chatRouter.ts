import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { invokeLLM } from "../_core/llm";

/**
 * Chat Router
 * Handles AI-powered conversation for slide creation
 */

const slideOutlineSchema = z.object({
  number: z.number(),
  title: z.string(),
  description: z.string(),
});

const presentationPlanSchema = z.object({
  title: z.string(),
  slideCount: z.number(),
  slides: z.array(slideOutlineSchema),
  audience: z.string().optional(),
  tone: z.string().optional(),
  goal: z.string().optional(),
});

export const chatRouter = router({
  /**
   * Send a message and get AI response
   */
  sendMessage: protectedProcedure
    .input(z.object({
      message: z.string(),
      conversationHistory: z.array(z.object({
        role: z.enum(["user", "assistant", "system"]),
        content: z.string(),
      })),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const messages = [
          {
            role: "system" as const,
            content: `You are a helpful AI assistant for SlideCoffee, a presentation creation tool. 
Your job is to help users create amazing presentations through natural conversation.

Guidelines:
- Be friendly, encouraging, and use coffee-themed language occasionally (☕)
- Ask clarifying questions to understand their needs
- After gathering enough information (topic, audience, tone), generate a presentation plan
- Keep responses concise and conversational
- Don't be overly formal - be like a helpful colleague

When you have enough information to create a presentation plan, respond with a JSON object in this format:
{
  "type": "plan",
  "plan": {
    "title": "Presentation Title",
    "slideCount": 12,
    "audience": "Target audience",
    "tone": "Professional/Casual/etc",
    "slides": [
      { "number": 1, "title": "Slide Title", "description": "Brief description" },
      ...
    ]
  }
}

Otherwise, just respond conversationally to gather more information.`
          },
          ...input.conversationHistory,
          {
            role: "user" as const,
            content: input.message
          }
        ];

        const response = await invokeLLM({
          messages,
        });

        const aiResponse = response.choices[0]?.message?.content || "I'm not sure how to respond to that.";

        // Check if response contains a plan
        try {
          const jsonMatch = aiResponse.match(/\{[\s\S]*"type":\s*"plan"[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            if (parsed.type === "plan" && parsed.plan) {
              return {
                type: "plan" as const,
                content: "I've created a presentation plan for you!",
                plan: parsed.plan
              };
            }
          }
        } catch (e) {
          // Not a plan, just a regular message
        }

        return {
          type: "text" as const,
          content: aiResponse,
          plan: null
        };
      } catch (error) {
        console.error("[Chat] Error sending message:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get AI response"
        });
      }
    }),

  /**
   * Generate a presentation plan from a prompt
   */
  generatePlan: protectedProcedure
    .input(z.object({
      prompt: z.string(),
      audience: z.string().optional(),
      tone: z.string().optional(),
      slideCount: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        const messages = [
          {
            role: "system" as const,
            content: `You are an expert presentation planner. Generate a detailed presentation outline based on the user's requirements.

Return ONLY a JSON object (no markdown, no extra text) in this exact format:
{
  "title": "Presentation Title",
  "slideCount": 12,
  "audience": "Target audience",
  "tone": "Professional",
  "slides": [
    { "number": 1, "title": "Title Slide", "description": "Introduction and overview" },
    { "number": 2, "title": "Problem Statement", "description": "Define the challenge" },
    ...
  ]
}

Make the outline comprehensive, logical, and tailored to the topic.`
          },
          {
            role: "user" as const,
            content: `Create a presentation about: ${input.prompt}
${input.audience ? `Audience: ${input.audience}` : ""}
${input.tone ? `Tone: ${input.tone}` : ""}
${input.slideCount ? `Number of slides: ${input.slideCount}` : "Suggest an appropriate number of slides"}`
          }
        ];

        const response = await invokeLLM({
          messages,
        });

        const aiResponse = response.choices[0]?.message?.content || "{}";
        
        // Try to parse JSON from response
        let planData;
        try {
          // Remove markdown code blocks if present
          const cleanedResponse = aiResponse.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
          planData = JSON.parse(cleanedResponse);
        } catch (e) {
          console.error("[Chat] Failed to parse plan JSON:", aiResponse);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to generate presentation plan"
          });
        }

        // Validate the plan
        const validatedPlan = presentationPlanSchema.parse(planData);

        return validatedPlan;
      } catch (error) {
        console.error("[Chat] Error generating plan:", error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate presentation plan"
        });
      }
    }),
});

// Force rebuild Sat Nov 15 00:37:36 EST 2025
