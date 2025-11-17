import { Handler } from '@netlify/functions';
import { VectorMemoryService } from '../../src/services/VectorMemoryService';
import { RAGService } from '../../src/services/RAGService';
import { ProviderFactory } from '../../src/services/providers/ProviderFactory';
import { AI_AGENT } from '../../src/config/aiAgent';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || '';

export const handler: Handler = async (event) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { messages, userId, presentationContext } = JSON.parse(event.body || '{}');

    if (!messages || !Array.isArray(messages)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Messages array is required' }),
      };
    }

    if (!userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'User ID is required' }),
      };
    }

    // Initialize provider-agnostic services
    const provider = ProviderFactory.createProvider();
    const vectorMemory = new VectorMemoryService(SUPABASE_URL, SUPABASE_KEY);
    const ragService = new RAGService(vectorMemory, provider);

    // Get the last user message
    const userMessage = messages[messages.length - 1]?.content || '';

    // Get conversation history (exclude last message)
    const conversationHistory = messages.slice(0, -1).map((m: any) => ({
      role: m.role,
      content: m.content,
    }));

    // Build system prompt with presentation context
    let systemPrompt = AI_AGENT.systemPrompt;
    if (presentationContext) {
      systemPrompt += `\n\n## Current Presentation Context:\n${JSON.stringify(presentationContext, null, 2)}`;
    }

    // Set up streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send initial event with provider info
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            type: 'start',
            provider: provider.getProviderName()
          })}\n\n`));

          let fullResponse = '';

          // Stream the response
          for await (const chunk of ragService.generateStreamingResponse(
            userId,
            userMessage,
            systemPrompt,
            conversationHistory
          )) {
            fullResponse += chunk;
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: 'chunk', content: chunk })}\n\n`)
            );
          }

          // Send completion event
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'done', fullResponse })}\n\n`)
          );

          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ 
                type: 'error', 
                error: error instanceof Error ? error.message : 'Unknown error' 
              })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
      body: stream,
    };
  } catch (error) {
    console.error('AI Chat Stream Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to process AI request',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};

