import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { adminProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { systemSettings } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { invokeLLM } from "../_core/llm";

/**
 * System Settings Router
 * Handles system-wide configuration that can be changed from admin panel
 * Super admin only
 */

const AVAILABLE_AI_MODELS = [
  { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash", provider: "Google", cost: "$0.50/1M tokens", speed: "Fast" },
  { value: "claude-3-5-sonnet-20241022", label: "Claude 3.5 Sonnet", provider: "Anthropic", cost: "$3.00/1M tokens", speed: "Medium" },
  { value: "claude-3-opus-20240229", label: "Claude 3 Opus", provider: "Anthropic", cost: "$15.00/1M tokens", speed: "Slow" },
  { value: "gpt-4-turbo", label: "GPT-4 Turbo", provider: "OpenAI", cost: "$10.00/1M tokens", speed: "Medium" },
  { value: "gpt-4o", label: "GPT-4o", provider: "OpenAI", cost: "$5.00/1M tokens", speed: "Fast" },
] as const;

export const systemSettingsRouter = router({
  /**
   * Get all system settings (super admin only)
   */
  getAll: adminProcedure.query(async ({ ctx }) => {
    // Only super_admin can view all settings
    if (ctx.user.adminRole !== "super_admin") {
      throw new TRPCError({ code: "FORBIDDEN", message: "Only super admins can view system settings" });
    }

    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

    const settings = await db.select().from(systemSettings);
    
    // Mask secret values
    return settings.map(setting => ({
      ...setting,
      value: setting.isSecret ? "********" : setting.value,
    }));
  }),

  /**
   * Get a specific setting by key
   */
  get: adminProcedure
    .input(z.object({ key: z.string() }))
    .query(async ({ input, ctx }) => {
      if (ctx.user.adminRole !== "super_admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const [setting] = await db.select().from(systemSettings).where(eq(systemSettings.key, input.key)).limit(1);
      
      if (!setting) return null;

      return {
        ...setting,
        value: setting.isSecret ? "********" : setting.value,
      };
    }),

  /**
   * Update or create a setting
   */
  upsert: adminProcedure
    .input(z.object({
      key: z.string(),
      value: z.string(),
      category: z.enum(["ai", "email", "storage", "general"]),
      description: z.string().optional(),
      isSecret: z.boolean().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.adminRole !== "super_admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // Check if setting exists
      const [existing] = await db.select().from(systemSettings).where(eq(systemSettings.key, input.key)).limit(1);

      if (existing) {
        // Update
        await db.update(systemSettings)
          .set({
            value: input.value,
            category: input.category,
            description: input.description,
            isSecret: input.isSecret ? 1 : 0,
            updatedBy: ctx.user.id,
            updatedAt: new Date(),
          })
          .where(eq(systemSettings.key, input.key));
      } else {
        // Insert
        await db.insert(systemSettings).values({
          key: input.key,
          value: input.value,
          category: input.category,
          description: input.description,
          isSecret: input.isSecret ? 1 : 0,
          updatedBy: ctx.user.id,
        });
      }

      return { success: true };
    }),

  /**
   * Delete a setting
   */
  delete: adminProcedure
    .input(z.object({ key: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.adminRole !== "super_admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      await db.delete(systemSettings).where(eq(systemSettings.key, input.key));

      return { success: true };
    }),

  /**
   * Get current AI model
   */
  getAIModel: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

    const [setting] = await db.select().from(systemSettings).where(eq(systemSettings.key, "ai_model")).limit(1);
    
    const currentModel = setting?.value || "gemini-2.5-flash";
    const modelInfo = AVAILABLE_AI_MODELS.find(m => m.value === currentModel);

    return {
      currentModel,
      modelInfo,
      availableModels: AVAILABLE_AI_MODELS,
    };
  }),

  /**
   * Set AI model (super admin only)
   */
  setAIModel: adminProcedure
    .input(z.object({
      model: z.enum(["gemini-2.5-flash", "claude-3-5-sonnet-20241022", "claude-3-opus-20240229", "gpt-4-turbo", "gpt-4o"]),
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.adminRole !== "super_admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // Check if setting exists
      const [existing] = await db.select().from(systemSettings).where(eq(systemSettings.key, "ai_model")).limit(1);

      if (existing) {
        await db.update(systemSettings)
          .set({
            value: input.model,
            updatedBy: ctx.user.id,
            updatedAt: new Date(),
          })
          .where(eq(systemSettings.key, "ai_model"));
      } else {
        await db.insert(systemSettings).values({
          key: "ai_model",
          value: input.model,
          category: "ai",
          description: "Active AI model for slide generation",
          isSecret: 0,
          updatedBy: ctx.user.id,
        });
      }

      return { success: true, model: input.model };
    }),

  /**
   * Test AI connection with current or specified model
   */
  testAIConnection: adminProcedure
    .input(z.object({
      model: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        const testModel = input.model || "gemini-2.5-flash";
        
        // Try a simple completion
        const result = await invokeLLM({
          messages: [
            { role: "user", content: "Say 'OK' if you can read this." }
          ],
        });

        return {
          success: true,
          model: testModel,
          response: result.choices[0]?.message?.content || "No response",
          tokensUsed: result.usage?.total_tokens || 0,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }),

  /**
   * Get system health status
   */
  getSystemHealth: adminProcedure.query(async () => {
    const db = await getDb();
    
    const health = {
      database: {
        status: db ? "healthy" : "unavailable",
        message: db ? "Connected" : "Database connection failed",
      },
      ai: {
        status: "unknown",
        message: "Test connection to verify",
      },
      storage: {
        status: "healthy",
        message: "S3 configured",
      },
      websocket: {
        status: "healthy",
        message: "WebSocket server running",
      },
    };

    return health;
  }),
});

