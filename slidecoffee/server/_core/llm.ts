import { ENV } from "./env";
import { getDb } from '../db';
import { systemSettings, aiUsageMetrics } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

/**
 * Get AI model from database settings, fallback to default
 */
async function getAIModel(): Promise<string> {
  try {
    const db = await getDb();
    if (!db) return "gemini-2.5-flash"; // Fallback if DB unavailable
    
    const [setting] = await db.select().from(systemSettings).where(eq(systemSettings.key, "ai_model")).limit(1);
    return setting?.value || "gemini-2.5-flash";
  } catch (error) {
    console.warn("Failed to get AI model from database, using default:", error);
    return "gemini-2.5-flash";
  }
}

export type Role = "system" | "user" | "assistant" | "tool" | "function";

export type TextContent = {
  type: "text";
  text: string;
};

export type ImageContent = {
  type: "image_url";
  image_url: {
    url: string;
    detail?: "auto" | "low" | "high";
  };
};

export type FileContent = {
  type: "file_url";
  file_url: {
    url: string;
    mime_type?: "audio/mpeg" | "audio/wav" | "application/pdf" | "audio/mp4" | "video/mp4" ;
  };
};

export type MessageContent = string | TextContent | ImageContent | FileContent;

export type Message = {
  role: Role;
  content: MessageContent | MessageContent[];
  name?: string;
  tool_call_id?: string;
};

export type Tool = {
  type: "function";
  function: {
    name: string;
    description?: string;
    parameters?: Record<string, unknown>;
  };
};

export type ToolChoicePrimitive = "none" | "auto" | "required";
export type ToolChoiceByName = { name: string };
export type ToolChoiceExplicit = {
  type: "function";
  function: {
    name: string;
  };
};

export type ToolChoice =
  | ToolChoicePrimitive
  | ToolChoiceByName
  | ToolChoiceExplicit;

export type InvokeParams = {
  messages: Message[];
  tools?: Tool[];
  toolChoice?: ToolChoice;
  tool_choice?: ToolChoice;
  maxTokens?: number;
  max_tokens?: number;
  outputSchema?: OutputSchema;
  output_schema?: OutputSchema;
  responseFormat?: ResponseFormat;
  response_format?: ResponseFormat;
};

export type ToolCall = {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
};

export type InvokeResult = {
  id: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: Role;
      content: string | Array<TextContent | ImageContent | FileContent>;
      tool_calls?: ToolCall[];
    };
    finish_reason: string | null;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
};

export type JsonSchema = {
  name: string;
  schema: Record<string, unknown>;
  strict?: boolean;
};

export type OutputSchema = JsonSchema;

export type ResponseFormat =
  | { type: "text" }
  | { type: "json_object" }
  | { type: "json_schema"; json_schema: JsonSchema };

const ensureArray = (
  value: MessageContent | MessageContent[]
): MessageContent[] => (Array.isArray(value) ? value : [value]);

const normalizeContentPart = (
  part: MessageContent
): TextContent | ImageContent | FileContent => {
  if (typeof part === "string") {
    return { type: "text", text: part };
  }

  if (part.type === "text") {
    return part;
  }

  if (part.type === "image_url") {
    return part;
  }

  if (part.type === "file_url") {
    return part;
  }

  throw new Error("Unsupported message content part");
};

const normalizeMessage = (message: Message) => {
  const { role, name, tool_call_id } = message;

  if (role === "tool" || role === "function") {
    const content = ensureArray(message.content)
      .map(part => (typeof part === "string" ? part : JSON.stringify(part)))
      .join("\n");

    return {
      role,
      name,
      tool_call_id,
      content,
    };
  }

  const contentParts = ensureArray(message.content).map(normalizeContentPart);

  // If there's only text content, collapse to a single string for compatibility
  if (contentParts.length === 1 && contentParts[0].type === "text") {
    return {
      role,
      name,
      content: contentParts[0].text,
    };
  }

  return {
    role,
    name,
    content: contentParts,
  };
};

const normalizeToolChoice = (
  toolChoice: ToolChoice | undefined,
  tools: Tool[] | undefined
): "none" | "auto" | ToolChoiceExplicit | undefined => {
  if (!toolChoice) return undefined;

  if (toolChoice === "none" || toolChoice === "auto") {
    return toolChoice;
  }

  if (toolChoice === "required") {
    if (!tools || tools.length === 0) {
      throw new Error(
        "tool_choice 'required' was provided but no tools were configured"
      );
    }

    if (tools.length > 1) {
      throw new Error(
        "tool_choice 'required' needs a single tool or specify the tool name explicitly"
      );
    }

    return {
      type: "function",
      function: { name: tools[0].function.name },
    };
  }

  if ("name" in toolChoice) {
    return {
      type: "function",
      function: { name: toolChoice.name },
    };
  }

  return toolChoice;
};

const resolveApiUrl = () =>
  ENV.forgeApiUrl && ENV.forgeApiUrl.trim().length > 0
    ? `${ENV.forgeApiUrl.replace(/\/$/, "")}/v1/chat/completions`
    : "https://forge.manus.im/v1/chat/completions";

const assertApiKey = () => {
  if (!ENV.forgeApiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }
};

const normalizeResponseFormat = ({
  responseFormat,
  response_format,
  outputSchema,
  output_schema,
}: {
  responseFormat?: ResponseFormat;
  response_format?: ResponseFormat;
  outputSchema?: OutputSchema;
  output_schema?: OutputSchema;
}):
  | { type: "json_schema"; json_schema: JsonSchema }
  | { type: "text" }
  | { type: "json_object" }
  | undefined => {
  const explicitFormat = responseFormat || response_format;
  if (explicitFormat) {
    if (
      explicitFormat.type === "json_schema" &&
      !explicitFormat.json_schema?.schema
    ) {
      throw new Error(
        "responseFormat json_schema requires a defined schema object"
      );
    }
    return explicitFormat;
  }

  const schema = outputSchema || output_schema;
  if (!schema) return undefined;

  if (!schema.name || !schema.schema) {
    throw new Error("outputSchema requires both name and schema");
  }

  return {
    type: "json_schema",
    json_schema: {
      name: schema.name,
      schema: schema.schema,
      ...(typeof schema.strict === "boolean" ? { strict: schema.strict } : {}),
    },
  };
};

export async function invokeLLM(params: InvokeParams, context?: { userId?: number; workspaceId?: number }): Promise<InvokeResult> {
  assertApiKey();

  const startTime = Date.now();
  const model = await getAIModel();
  let success = false;
  let errorMessage: string | null = null;
  let result: InvokeResult | null = null;

  // Check spending limits before making the call
  if (context?.workspaceId) {
    await checkSpendingLimits(context.workspaceId, model);
  }

  try {
    const {
      messages,
      tools,
      toolChoice,
      tool_choice,
      outputSchema,
      output_schema,
      responseFormat,
      response_format,
    } = params;

    const payload: Record<string, unknown> = {
      model,
      messages: messages.map(normalizeMessage),
    };

  if (tools && tools.length > 0) {
    payload.tools = tools;
  }

  const normalizedToolChoice = normalizeToolChoice(
    toolChoice || tool_choice,
    tools
  );
  if (normalizedToolChoice) {
    payload.tool_choice = normalizedToolChoice;
  }

  payload.max_tokens = 32768
  payload.thinking = {
    "budget_tokens": 128
  }

  const normalizedResponseFormat = normalizeResponseFormat({
    responseFormat,
    response_format,
    outputSchema,
    output_schema,
  });

  if (normalizedResponseFormat) {
    payload.response_format = normalizedResponseFormat;
  }

  const response = await fetch(resolveApiUrl(), {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${ENV.forgeApiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `LLM invoke failed: ${response.status} ${response.statusText} – ${errorText}`
    );
  }

    result = (await response.json()) as InvokeResult;
    success = true;
    return result;
  } catch (error) {
    success = false;
    errorMessage = error instanceof Error ? error.message : String(error);
    throw error;
  } finally {
    // Track usage metrics
    const responseTimeMs = Date.now() - startTime;
    await trackAIUsage({
      model,
      success,
      responseTimeMs,
      promptTokens: result?.usage?.prompt_tokens || 0,
      completionTokens: result?.usage?.completion_tokens || 0,
      totalTokens: result?.usage?.total_tokens || 0,
      errorMessage,
      userId: context?.userId,
      workspaceId: context?.workspaceId,
    });
  }
}

/**
 * Track AI usage metrics in database
 */
async function trackAIUsage(data: {
  model: string;
  success: boolean;
  responseTimeMs: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  errorMessage: string | null;
  userId?: number;
  workspaceId?: number;
}) {
  try {
    const db = await getDb();
    if (!db) return; // Skip if DB unavailable

    // Calculate cost based on model
    const costPer1MTokens = getCostPerMillionTokens(data.model);
    const costUsd = (data.totalTokens / 1_000_000) * costPer1MTokens;

    await db.insert(aiUsageMetrics).values({
      model: data.model,
      promptTokens: data.promptTokens,
      completionTokens: data.completionTokens,
      totalTokens: data.totalTokens,
      costUsd,
      responseTimeMs: data.responseTimeMs,
      success: data.success,
      errorMessage: data.errorMessage,
      userId: data.userId,
      workspaceId: data.workspaceId,
    });
  } catch (error) {
    console.error("Failed to track AI usage:", error);
    // Don't throw - tracking failure shouldn't break AI calls
  }
}

/**
 * Get cost per million tokens for each model
 */
function getCostPerMillionTokens(model: string): number {
  const costs: Record<string, number> = {
    "gemini-2.5-flash": 0.5,
    "claude-3-5-sonnet-20241022": 3.0,
    "claude-3-opus-20240229": 15.0,
    "gpt-4": 30.0,
    "gpt-4-turbo": 10.0,
    "gpt-4o": 5.0,
  };
  return costs[model] || 1.0; // Default to $1 if unknown
}


/**
 * Check if spending limits are exceeded before making AI call
 */
async function checkSpendingLimits(workspaceId: number, model: string): Promise<void> {
  try {
    const db = await getDb();
    if (!db) return; // Skip check if DB unavailable

    const { aiModelLimits } = await import("../../drizzle/schema");
    const { and, eq, gte, sql } = await import("drizzle-orm");

    // Get model limit settings
    const limits = await db
      .select()
      .from(aiModelLimits)
      .where(
        and(
          eq(aiModelLimits.workspaceId, workspaceId),
          eq(aiModelLimits.model, model),
          eq(aiModelLimits.enabled, true)
        )
      )
      .limit(1);

    if (!limits.length) return; // No limits configured

    const limit = limits[0];
    const now = new Date();

    // Check daily limit
    if (limit.dailyLimit) {
      const startOfDay = new Date(now);
      startOfDay.setHours(0, 0, 0, 0);

      const dailySpend = await db
        .select({
          totalCost: sql<number>`COALESCE(SUM(${aiUsageMetrics.costUsd}), 0)`.as("totalCost"),
        })
        .from(aiUsageMetrics)
        .where(
          and(
            eq(aiUsageMetrics.workspaceId, workspaceId),
            eq(aiUsageMetrics.model, model),
            gte(aiUsageMetrics.createdAt, startOfDay)
          )
        );

      const currentDailySpend = dailySpend[0]?.totalCost || 0;
      if (currentDailySpend >= limit.dailyLimit) {
        throw new Error(
          `Daily spending limit exceeded for ${model}. Limit: $${limit.dailyLimit.toFixed(2)}, Current: $${currentDailySpend.toFixed(2)}. ☕ Time to take a coffee break!`
        );
      }
    }

    // Check monthly limit
    if (limit.monthlyLimit) {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const monthlySpend = await db
        .select({
          totalCost: sql<number>`COALESCE(SUM(${aiUsageMetrics.costUsd}), 0)`.as("totalCost"),
        })
        .from(aiUsageMetrics)
        .where(
          and(
            eq(aiUsageMetrics.workspaceId, workspaceId),
            eq(aiUsageMetrics.model, model),
            gte(aiUsageMetrics.createdAt, startOfMonth)
          )
        );

      const currentMonthlySpend = monthlySpend[0]?.totalCost || 0;
      if (currentMonthlySpend >= limit.monthlyLimit) {
        throw new Error(
          `Monthly spending limit exceeded for ${model}. Limit: $${limit.monthlyLimit.toFixed(2)}, Current: $${currentMonthlySpend.toFixed(2)}. ☕ Consider upgrading your plan!`
        );
      }
    }
  } catch (error) {
    // If it's a limit exceeded error, rethrow it
    if (error instanceof Error && error.message.includes("spending limit exceeded")) {
      throw error;
    }
    // Otherwise log and continue (don't block AI calls due to check failures)
    console.error("Failed to check spending limits:", error);
  }
}

