import { invokeLLM } from "../_core/llm";
import * as manusApi from "../lib/manusApi";
import { getAIProvider } from "../lib/aiProvider";

/**
 * Slide layout types matching professional presentation patterns
 */
export type SlideLayout =
  | "title"
  | "title-content"
  | "two-column"
  | "image-text"
  | "full-image"
  | "quote"
  | "section-header"
  | "bullet-points"
  | "comparison";

/**
 * Structured slide data
 */
export interface Slide {
  id: string;
  layout: SlideLayout;
  title?: string;
  subtitle?: string;
  content?: string;
  bulletPoints?: string[];
  leftColumn?: string;
  rightColumn?: string;
  imageUrl?: string;
  imageCaption?: string;
  quote?: string;
  quoteAuthor?: string;
  backgroundColor?: string;
  textColor?: string;
  notes?: string; // Speaker notes
}

/**
 * Presentation plan structure (for human-in-the-loop approval)
 */
export interface PresentationPlan {
  title: string;
  objective: string;
  targetAudience: string;
  keyMessages: string[];
  slideOutline: Array<{
    slideNumber: number;
    title: string;
    purpose: string;
    layout: SlideLayout;
    keyPoints: string[];
  }>;
  estimatedSlideCount: number;
}

/**
 * Brand guidelines for AI context
 */
export interface BrandGuidelines {
  name: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  fontPrimary?: string;
  fontSecondary?: string;
  guidelinesText?: string;
}

/**
 * Generate a presentation plan based on user requirements
 * This is the first step - user approves before we generate actual slides
 */
export async function generatePresentationPlan(params: {
  userPrompt: string;
  projectTitle: string;
  projectDescription?: string;
  brandGuidelines?: BrandGuidelines;
}): Promise<PresentationPlan> {
  const { userPrompt, projectTitle, projectDescription, brandGuidelines } = params;

  // TODO: Integrate Manus API here (see manusApi.ts)
  // For now, using built-in LLM for stability
  const systemPrompt = `You are an expert presentation strategist helping create professional, board-ready presentations.

Your job is to create a detailed presentation plan that:
1. Understands the core message and objective
2. Structures information for maximum impact
3. Follows proven presentation frameworks (e.g., problem-solution, storytelling arc)
4. Keeps slides focused and uncluttered (one idea per slide)
5. Uses appropriate layouts for different content types

${brandGuidelines ? `Brand Guidelines:\n- Brand: ${brandGuidelines.name}\n${brandGuidelines.guidelinesText || ""}` : ""}`;

  const userMessage = `Create a presentation plan for:

Project: ${projectTitle}
${projectDescription ? `Description: ${projectDescription}` : ""}

User Request: ${userPrompt}

Analyze this request and create a strategic presentation plan. Think about:
- What story are we telling?
- Who is the audience?
- What action do we want them to take?
- What's the logical flow of information?

Return a detailed plan following the specified JSON schema.`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "presentation_plan",
        strict: true,
        schema: {
          type: "object",
          properties: {
            title: { type: "string", description: "Presentation title" },
            objective: { type: "string", description: "Main objective of the presentation" },
            targetAudience: { type: "string", description: "Who this is for" },
            keyMessages: {
              type: "array",
              description: "3-5 key takeaways",
              items: { type: "string" },
            },
            slideOutline: {
              type: "array",
              description: "Detailed outline of each slide",
              items: {
                type: "object",
                properties: {
                  slideNumber: { type: "integer" },
                  title: { type: "string" },
                  purpose: { type: "string", description: "Why this slide exists" },
                  layout: {
                    type: "string",
                    enum: [
                      "title",
                      "title-content",
                      "two-column",
                      "image-text",
                      "full-image",
                      "quote",
                      "section-header",
                      "bullet-points",
                      "comparison",
                    ],
                  },
                  keyPoints: { type: "array", items: { type: "string" } },
                },
                required: ["slideNumber", "title", "purpose", "layout", "keyPoints"],
                additionalProperties: false,
              },
            },
            estimatedSlideCount: { type: "integer" },
          },
          required: ["title", "objective", "targetAudience", "keyMessages", "slideOutline", "estimatedSlideCount"],
          additionalProperties: false,
        },
      },
    },
  });

  const content = response.choices[0].message.content;
  if (!content || typeof content !== 'string') {
    throw new Error("No response from AI");
  }

  return JSON.parse(content) as PresentationPlan;
}

/**
 * Generate actual slides based on approved plan
 */
export async function generateSlides(params: {
  plan: PresentationPlan;
  brandGuidelines?: BrandGuidelines;
}): Promise<Slide[]> {
  const { plan, brandGuidelines } = params;

  const systemPrompt = `You are a professional presentation designer creating executive-quality slides.

Design principles:
- One idea per slide (avoid clutter)
- Use clear, concise language
- Headlines should be action-oriented
- Bullet points: max 5 per slide, max 10 words each
- Use storytelling and emotional connection
- 16:9 aspect ratio
- Professional, business-appropriate tone

${
  brandGuidelines
    ? `Brand Guidelines:
- Brand: ${brandGuidelines.name}
- Primary Color: ${brandGuidelines.primaryColor || "#1a1a1a"}
- Secondary Color: ${brandGuidelines.secondaryColor || "#4a4a4a"}
- Accent Color: ${brandGuidelines.accentColor || "#0066cc"}
${brandGuidelines.guidelinesText || ""}`
    : ""
}`;

  const userMessage = `Generate slides for this presentation:

Title: ${plan.title}
Objective: ${plan.objective}
Audience: ${plan.targetAudience}

Slide Outline:
${plan.slideOutline.map((s) => `${s.slideNumber}. ${s.title} (${s.layout})\n   Purpose: ${s.purpose}\n   Key Points: ${s.keyPoints.join(", ")}`).join("\n\n")}

Create complete slide content following the outline. Make it compelling and professional.`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "slides",
        strict: true,
        schema: {
          type: "object",
          properties: {
            slides: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  layout: {
                    type: "string",
                    enum: [
                      "title",
                      "title-content",
                      "two-column",
                      "image-text",
                      "full-image",
                      "quote",
                      "section-header",
                      "bullet-points",
                      "comparison",
                    ],
                  },
                  title: { type: "string" },
                  subtitle: { type: "string" },
                  content: { type: "string" },
                  bulletPoints: { type: "array", items: { type: "string" } },
                  leftColumn: { type: "string" },
                  rightColumn: { type: "string" },
                  imageUrl: { type: "string" },
                  imageCaption: { type: "string" },
                  quote: { type: "string" },
                  quoteAuthor: { type: "string" },
                  backgroundColor: { type: "string" },
                  textColor: { type: "string" },
                  notes: { type: "string" },
                },
                required: ["id", "layout"],
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

  const content = response.choices[0].message.content;
  if (!content || typeof content !== 'string') {
    throw new Error("No response from AI");
  }

  const result = JSON.parse(content);
  return result.slides as Slide[];
}

/**
 * Edit specific slides based on user feedback
 */
export async function editSlides(params: {
  slides: Slide[];
  userFeedback: string;
  brandGuidelines?: BrandGuidelines;
}): Promise<Slide[]> {
  const { slides, userFeedback, brandGuidelines } = params;

  const systemPrompt = `You are a presentation editor making targeted improvements based on user feedback.

Maintain the overall structure unless explicitly asked to change it.
Keep the professional quality and brand consistency.

${brandGuidelines ? `Brand: ${brandGuidelines.name}` : ""}`;

  const userMessage = `Current slides:
${JSON.stringify(slides, null, 2)}

User feedback: ${userFeedback}

Update the slides based on this feedback. Return the complete updated slide deck.`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "updated_slides",
        strict: true,
        schema: {
          type: "object",
          properties: {
            slides: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  layout: {
                    type: "string",
                    enum: [
                      "title",
                      "title-content",
                      "two-column",
                      "image-text",
                      "full-image",
                      "quote",
                      "section-header",
                      "bullet-points",
                      "comparison",
                    ],
                  },
                  title: { type: "string" },
                  subtitle: { type: "string" },
                  content: { type: "string" },
                  bulletPoints: { type: "array", items: { type: "string" } },
                  leftColumn: { type: "string" },
                  rightColumn: { type: "string" },
                  imageUrl: { type: "string" },
                  imageCaption: { type: "string" },
                  quote: { type: "string" },
                  quoteAuthor: { type: "string" },
                  backgroundColor: { type: "string" },
                  textColor: { type: "string" },
                  notes: { type: "string" },
                },
                required: ["id", "layout"],
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

  const content = response.choices[0].message.content;
  if (!content || typeof content !== 'string') {
    throw new Error("No response from AI");
  }

  const result = JSON.parse(content);
  return result.slides as Slide[];
}



/**
 * Handle dashboard AI commands
 * Interprets natural language commands and executes appropriate actions
 */
export async function handleDashboardCommand(params: {
  message: string;
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }>;
  userContext?: {
    recentProjects?: Array<{ id: number; title: string; updatedAt: Date }>;
    brands?: Array<{ id: number; name: string }>;
    userName?: string;
  };
}): Promise<{
  response: string;
  action?: {
    type: "create_project" | "list_projects" | "open_project" | "manage_brands" | "search_templates";
    data?: any;
  };
}> {
  const { message, conversationHistory, userContext } = params;
  const provider = getAIProvider();

  // Build context-aware system prompt
  let contextInfo = "";
  if (userContext) {
    if (userContext.userName) {
      contextInfo += `User's name: ${userContext.userName}\n`;
    }
    if (userContext.recentProjects && userContext.recentProjects.length > 0) {
      contextInfo += `\nRecent projects:\n${userContext.recentProjects.map(p => `- "${p.title}" (ID: ${p.id})`).join("\n")}\n`;
    }
    if (userContext.brands && userContext.brands.length > 0) {
      contextInfo += `\nBrands: ${userContext.brands.map(b => b.name).join(", ")}\n`;
    }
  }

  const systemPrompt = `You are Café, the friendly AI assistant for SlideCoffee - a presentation creation platform.

${contextInfo ? `Context about this user:\n${contextInfo}\n` : ""}
Your role is to help users with natural language commands.

You can help users:
1. Create new presentations (e.g., "Create a sales pitch", "Make a 10-slide investor deck")
2. Find and open existing projects (e.g., "Open my investor pitch", "Show my recent projects")
3. Manage brands (e.g., "Update my brand colors", "Show my brands")
4. Search templates (e.g., "Find tech startup templates")

When a user wants to CREATE a presentation, respond with enthusiasm and confirm you'll help them create it.
When a user wants to OPEN a project, reference their actual project names if available.
When a user wants to manage BRANDS, guide them to the brands page.

Be conversational, helpful, and concise (2-3 sentences max).

Analyze the user's intent and respond appropriately. If they want to create something, be enthusiastic and helpful.`;

  try {
    const messages = [
      { role: "system" as const, content: systemPrompt },
      ...conversationHistory,
      { role: "user" as const, content: message }
    ];

    const response = await provider.chat(messages);
    const assistantMessage = response.content || "I'm here to help! What would you like to do?";

    // Detect intent from user message
    const lowerMessage = message.toLowerCase();
    
    // Create project intent
    if (
      lowerMessage.includes("create") ||
      lowerMessage.includes("make") ||
      lowerMessage.includes("build") ||
      lowerMessage.includes("new presentation") ||
      lowerMessage.includes("new deck")
    ) {
      return {
        response: assistantMessage,
        action: {
          type: "create_project",
          data: { prompt: message }
        }
      };
    }

    // List/show projects intent
    if (
      lowerMessage.includes("show") && (lowerMessage.includes("project") || lowerMessage.includes("presentation")) ||
      lowerMessage.includes("my projects") ||
      lowerMessage.includes("recent projects")
    ) {
      return {
        response: assistantMessage,
        action: {
          type: "list_projects"
        }
      };
    }

    // Manage brands intent
    if (
      lowerMessage.includes("brand") ||
      lowerMessage.includes("color") && lowerMessage.includes("update") ||
      lowerMessage.includes("logo")
    ) {
      return {
        response: assistantMessage,
        action: {
          type: "manage_brands"
        }
      };
    }

    // Search templates intent
    if (
      lowerMessage.includes("template") ||
      lowerMessage.includes("find") && lowerMessage.includes("design")
    ) {
      return {
        response: assistantMessage,
        action: {
          type: "search_templates",
          data: { query: message }
        }
      };
    }

    // No specific action, just conversation
    return {
      response: assistantMessage
    };
  } catch (error) {
    console.error("[Dashboard Chat] Error:", error);
    return {
      response: "I'm having trouble connecting right now. Could you try again?"
    };
  }
}

