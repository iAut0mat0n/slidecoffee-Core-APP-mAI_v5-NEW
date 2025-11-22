import { Router } from 'express';
import { VectorMemoryService } from '../../src/services/VectorMemoryService.js';
import { RAGService } from '../../src/services/RAGService.js';
import { ProviderFactory } from '../../src/services/providers/ProviderFactory.js';
import { AI_AGENT } from '../../src/config/aiAgent.js';
import { UserContextManager } from '../utils/user-context.js';
import { webSearch } from '../utils/web-search.js';

const router = Router();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || '';

router.post('/ai-chat-stream', async (req, res) => {
  try {
    const { messages, userId, presentationContext, workspaceId, enableResearch } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
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

    // Load user context for personalization
    const userProfile = await UserContextManager.getUserProfile(userId, workspaceId);

    // Perform web search if research mode is enabled
    let searchResults = '';
    if (enableResearch && userMessage.length > 10) {
      try {
        const search = await webSearch.search(userMessage, 5);
        searchResults = webSearch.formatForAI(search);
      } catch (error) {
        console.error('Web search error:', error);
        // Continue without search results
      }
    }

    // Build enhanced system prompt with user context and search results
    let systemPrompt = AI_AGENT.systemPrompt;
    
    if (userProfile) {
      systemPrompt += `\n\n${userProfile}`;
    }
    
    if (searchResults) {
      systemPrompt += `\n\n## Web Search Results\n${searchResults}`;
      systemPrompt += `\n\nUse the above web search results to provide accurate, up-to-date information in your response.`;
    }
    
    if (presentationContext) {
      systemPrompt += `\n\n## Current Presentation Context:\n${JSON.stringify(presentationContext, null, 2)}`;
    }

    // Set up Server-Sent Events (SSE) streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Send initial event with provider info
    res.write(`data: ${JSON.stringify({ 
      type: 'start',
      provider: provider.getProviderName()
    })}\n\n`);

    let fullResponse = '';

    try {
      // Stream the response
      for await (const chunk of ragService.generateStreamingResponse(
        userId,
        userMessage,
        systemPrompt,
        conversationHistory
      )) {
        fullResponse += chunk;
        res.write(`data: ${JSON.stringify({ type: 'chunk', content: chunk })}\n\n`);
      }

      // Send completion event
      res.write(`data: ${JSON.stringify({ type: 'done', fullResponse })}\n\n`);
      res.end();
    } catch (streamError) {
      console.error('Streaming error:', streamError);
      res.write(`data: ${JSON.stringify({ 
        type: 'error', 
        error: streamError instanceof Error ? streamError.message : 'Unknown error' 
      })}\n\n`);
      res.end();
    }
  } catch (error) {
    console.error('AI Chat Stream Error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Failed to process AI request',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
});

export { router as aiChatStreamRouter };

