/**
 * Manus API Integration
 * 
 * Wrapper for Manus AI API with context management, credit tracking, and PII protection.
 * 
 * Architecture:
 * - Each presentation has a persistent conversation context
 * - Context includes: chat history, brand guidelines, previous slides
 * - PII is sanitized before sending to Manus
 * - Credits are tracked per API call
 * - All interactions logged to database
 * 
 * Flow:
 * 1. User sends message
 * 2. Sanitize PII → store tokens
 * 3. Build context (history + brand + slides)
 * 4. Call Manus API
 * 5. Track credits used
 * 6. Log to manusTasks table
 * 7. Return response
 */

import { generateAIText, estimateAICredits, type AIMessage } from './aiProvider';
import { sanitizeForAI, deanonymizeText, type PIIToken } from './pii';
import { deductCredits } from './credits';
import { getDb } from '../db';
import { manusTasks, piiTokens, presentations, chatMessages, brands } from '../../drizzle/schema';
import { eq, and, desc } from 'drizzle-orm';

export interface ManusContext {
  presentationId: number;
  userId: number;
  brandId?: number;
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
  brandGuidelines?: string;
  existingSlides?: string[];
}

export interface ManusChatRequest {
  presentationId: number;
  userId: number;
  message: string;
  context?: Partial<ManusContext>;
}

export interface ManusChatResponse {
  response: string;
  creditsUsed: number;
  taskId: number;
  containedPII: boolean;
}

/**
 * Build full context for Manus API call
 * Includes conversation history, brand guidelines, and existing slides
 */
async function buildContext(presentationId: number, userId: number): Promise<ManusContext> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  // Get presentation details
  const presentationResult = await db
    .select()
    .from(presentations)
    .where(eq(presentations.id, presentationId))
    .limit(1);

  const presentation = presentationResult[0];
  if (!presentation) {
    throw new Error('Presentation not found');
  }

  // Get conversation history (last 20 messages)
  const history = await db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.projectId, presentationId))
    .orderBy(desc(chatMessages.createdAt))
    .limit(20);

  const conversationHistory = history
    .reverse()
    .map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }));

  // Get brand guidelines if brand is set
  let brandGuidelines: string | undefined;
  if (presentation.brandId) {
    const brandResult = await db
      .select()
      .from(brands)
      .where(eq(brands.id, presentation.brandId))
      .limit(1);

    const brand = brandResult[0];
    if (brand) {
      const colors = [brand.primaryColor, brand.secondaryColor, brand.accentColor].filter(Boolean).join(', ');
      const fonts = [brand.fontPrimary, brand.fontSecondary].filter(Boolean).join(', ');
      brandGuidelines = `Brand: ${brand.name}\nColors: ${colors}\nFonts: ${fonts}\nGuidelines: ${brand.guidelinesText || 'None'}`;
    }
  }

  // Get existing slides (if any)
  // TODO: Implement slides retrieval when slides table is populated

  return {
    presentationId,
    userId,
    brandId: presentation.brandId || undefined,
    conversationHistory,
    brandGuidelines,
    existingSlides: [],
  };
}

/**
 * Build system prompt with context
 */
function buildSystemPrompt(context: ManusContext): string {
  let prompt = `You are Café, an AI assistant specialized in creating professional presentation slides.

Your role:
- Help users create strategic, board-ready presentations
- Provide slide outlines, content suggestions, and design guidance
- Ask clarifying questions to understand the presentation goal
- Suggest appropriate slide structures and narratives

`;

  if (context.brandGuidelines) {
    prompt += `\nBrand Guidelines:\n${context.brandGuidelines}\n`;
  }

  if (context.existingSlides && context.existingSlides.length > 0) {
    prompt += `\nExisting Slides:\n${context.existingSlides.join('\n')}\n`;
  }

  prompt += `\nAlways maintain a professional, helpful tone. Focus on creating impactful presentations.`;

  return prompt;
}

/**
 * Send message to Manus API with full context
 */
export async function sendManusMessage(request: ManusChatRequest): Promise<ManusChatResponse> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  // 1. Sanitize PII from user message
  const { safe: sanitizedMessage, tokens: piiTokensFound } = sanitizeForAI(request.message);
  const containedPII = piiTokensFound.length > 0;

  // 2. Build context
  const context = await buildContext(request.presentationId, request.userId);

  // 3. Build messages array
  const systemPrompt = buildSystemPrompt(context);
  const messages: AIMessage[] = [
    { role: 'system', content: systemPrompt },
    ...context.conversationHistory.map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    })),
    { role: 'user', content: sanitizedMessage },
  ];

  // 4. Estimate credits
  const estimatedCredits = estimateAICredits({ messages });

  // 5. Check if user has enough credits
  const hasCredits = await deductCredits(
    request.userId,
    estimatedCredits,
    request.presentationId,
    'Chat message with Café AI'
  );

  // 6. Call Manus API
  const result = await generateAIText({ messages, maxTokens: 2000 });

  // 7. Store PII tokens if any were found
  if (containedPII && piiTokensFound.length > 0) {
    for (const piiToken of piiTokensFound) {
      await db.insert(piiTokens).values({
        presentationId: request.presentationId,
        token: piiToken.token,
        tokenType: piiToken.type,
        originalValue: piiToken.encryptedValue,
      });
    }
  }

  // 8. Log to manusTasks table
  const taskResult = await db.insert(manusTasks).values({
    presentationId: request.presentationId,
    taskId: `chat_${Date.now()}`, // Generate unique task ID
    taskType: 'outline', // Using 'outline' as closest match for chat
    creditsUsed: result.tokensUsed,
    status: 'completed',
    requestPayload: { message: sanitizedMessage },
    responsePayload: { response: result.content },
  });

  // Get the inserted task ID
  const taskId = 0; // Will be populated by database auto-increment

  // 9. Save chat messages to database
  await db.insert(chatMessages).values({
    projectId: request.presentationId, // Schema uses projectId for backward compatibility
    role: 'user',
    content: sanitizedMessage,
    originalContent: containedPII ? request.message : null,
  });

  await db.insert(chatMessages).values({
    projectId: request.presentationId,
    role: 'assistant',
    content: result.content,
    originalContent: null,
  });

  // 10. Return response
  return {
    response: result.content,
    creditsUsed: result.tokensUsed,
    taskId,
    containedPII,
  };
}

/**
 * Generate slide outline using Manus API
 */
export async function generateOutline(
  presentationId: number,
  userId: number,
  topic: string,
  slideCount: number = 10
): Promise<{ outline: string; creditsUsed: number }> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  // Build context
  const context = await buildContext(presentationId, userId);
  const systemPrompt = buildSystemPrompt(context);

  const messages: AIMessage[] = [
    { role: 'system', content: systemPrompt },
    {
      role: 'user',
      content: `Create a ${slideCount}-slide presentation outline for: ${topic}

Please provide:
1. A compelling title
2. ${slideCount} slide titles with brief descriptions
3. Suggested narrative flow

Format as a structured outline.`,
    },
  ];

  // Estimate and deduct credits
  const estimatedCredits = estimateAICredits({ messages });
  await deductCredits(userId, estimatedCredits, presentationId, 'Generate presentation outline');

  // Call AI
  const result = await generateAIText({ messages, maxTokens: 1500 });

  // Log task
  await db.insert(manusTasks).values({
    presentationId,
    taskId: `outline_${Date.now()}`,
    taskType: 'outline',
    creditsUsed: result.tokensUsed,
    status: 'completed',
    requestPayload: { topic, slideCount },
    responsePayload: { outline: result.content },
  });

  return {
    outline: result.content,
    creditsUsed: result.tokensUsed,
  };
}

/**
 * Generate slide content using Manus API
 */
export async function generateSlide(
  presentationId: number,
  userId: number,
  slideTitle: string,
  slideDescription: string
): Promise<{ content: string; creditsUsed: number }> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  // Build context
  const context = await buildContext(presentationId, userId);
  const systemPrompt = buildSystemPrompt(context);

  const messages: AIMessage[] = [
    { role: 'system', content: systemPrompt },
    {
      role: 'user',
      content: `Generate detailed content for this slide:

Title: ${slideTitle}
Description: ${slideDescription}

Provide:
- Key talking points (3-5 bullets)
- Supporting details
- Suggested visuals or data

Keep it concise and impactful.`,
    },
  ];

  // Estimate and deduct credits
  const estimatedCredits = estimateAICredits({ messages });
  await deductCredits(userId, estimatedCredits, presentationId, 'Generate slide content');

  // Call AI
  const result = await generateAIText({ messages, maxTokens: 1000 });

  // Log task
  await db.insert(manusTasks).values({
    presentationId,
    taskId: `slide_${Date.now()}`,
    taskType: 'slide_generation',
    creditsUsed: result.tokensUsed,
    status: 'completed',
    requestPayload: { slideTitle, slideDescription },
    responsePayload: { content: result.content },
  });

  return {
    content: result.content,
    creditsUsed: result.tokensUsed,
  };
}

