import { ENV } from "./_core/env";

interface CreateTaskParams {
  prompt: string;
  attachments?: Array<{
    filename?: string;
    file_id?: string;
    url?: string;
  }>;
  taskMode?: "chat" | "adaptive" | "agent";
  agentProfile?: "speed" | "quality";
  taskId?: string; // For continuing conversations
}

interface TaskResponse {
  task_id: string;
  task_title: string;
  task_url: string;
  share_url?: string;
}

/**
 * Create a task using the external AI API
 */
export async function createAITask(params: CreateTaskParams): Promise<TaskResponse> {
  const apiUrl = process.env.AI_API_URL || "https://api.manus.ai";
  const apiKey = process.env.AI_API_KEY;

  if (!apiKey) {
    throw new Error("AI_API_KEY not configured");
  }

  const response = await fetch(`${apiUrl}/v1/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      API_KEY: apiKey,
    },
    body: JSON.stringify({
      prompt: params.prompt,
      attachments: params.attachments || [],
      taskMode: params.taskMode || "agent",
      agentProfile: params.agentProfile || "quality",
      taskId: params.taskId,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`AI API error: ${error}`);
  }

  return response.json();
}

/**
 * Build a comprehensive prompt for slide generation
 */
export function buildSlideGenerationPrompt(params: {
  projectTitle: string;
  projectDescription?: string;
  brandGuidelines?: {
    name: string;
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    fontPrimary?: string;
    fontSecondary?: string;
    guidelinesText?: string;
  };
  userMessage: string;
}): string {
  const { projectTitle, projectDescription, brandGuidelines, userMessage } = params;

  let prompt = `You are a strategic presentation consultant helping to create a professional PowerPoint presentation.

Project Title: ${projectTitle}
${projectDescription ? `Project Description: ${projectDescription}` : ""}

`;

  if (brandGuidelines) {
    prompt += `Brand Guidelines:
- Brand Name: ${brandGuidelines.name}
${brandGuidelines.primaryColor ? `- Primary Color: ${brandGuidelines.primaryColor}` : ""}
${brandGuidelines.secondaryColor ? `- Secondary Color: ${brandGuidelines.secondaryColor}` : ""}
${brandGuidelines.accentColor ? `- Accent Color: ${brandGuidelines.accentColor}` : ""}
${brandGuidelines.fontPrimary ? `- Primary Font: ${brandGuidelines.fontPrimary}` : ""}
${brandGuidelines.fontSecondary ? `- Secondary Font: ${brandGuidelines.fontSecondary}` : ""}
${brandGuidelines.guidelinesText ? `- Guidelines: ${brandGuidelines.guidelinesText}` : ""}

`;
  }

  prompt += `User Request: ${userMessage}

Please follow these steps:

1. **Research & Analysis**: First, conduct thorough research on the topic. Understand the key concepts, data points, and strategic insights needed.

2. **Create a Plan**: Before generating slides, create a detailed outline showing:
   - The overall narrative arc
   - Key messages for each section
   - Slide titles and main points
   - Visual elements needed
   
   Present this plan to the user and ask: "Does this structure work for you, or would you like me to make changes?"

3. **Generate Slides**: Once the plan is approved, create professional slides that:
   - Follow the 16:9 aspect ratio
   - Use the brand colors and fonts specified
   - Are suitable for executive/board/investor presentations
   - Have clear, concise messaging (not overcomplicated)
   - Include strategic insights, not just information dumps

Remember: You're a strategic partner, not just a slide generator. Think deeply about the message and positioning before creating content.`;

  return prompt;
}

/**
 * Build a prompt for continuing a conversation
 */
export function buildContinuationPrompt(params: {
  userMessage: string;
  context: string;
}): string {
  return `${params.context}

User: ${params.userMessage}

Please respond to the user's request. If they're asking for changes to the slides, make specific, targeted updates while maintaining the overall quality and strategic approach.`;
}

