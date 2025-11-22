import { Router } from 'express';
import { VectorMemoryService } from '../../src/services/VectorMemoryService.js';
import { RAGService } from '../../src/services/RAGService.js';
import { ProviderFactory } from '../../src/services/providers/ProviderFactory.js';
import { AI_AGENT } from '../../src/config/aiAgent.js';
import { UserContextManager } from '../utils/user-context.js';
import { webSearch } from '../utils/web-search.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';

const router = Router();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || '';

// Rate limiting per user (simple in-memory implementation)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX = 20; // 20 requests per minute per user

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(userId);
  
  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(userId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (userLimit.count >= RATE_LIMIT_MAX) {
    return false;
  }
  
  userLimit.count++;
  return true;
}

// CRITICAL SECURITY: Require authentication to prevent user impersonation
router.post('/ai-chat-stream', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { messages, presentationContext, enableResearch } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    // SECURITY: Get userId and workspaceId from authenticated user (not request body!)
    const userId = req.user!.id;
    const workspaceId = req.user!.workspaceId;

    // Rate limiting check
    if (!checkRateLimit(userId)) {
      return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    }

    // Validate message array size (prevent DoS)
    if (messages.length > 100) {
      return res.status(400).json({ error: 'Too many messages in conversation history' });
    }

    // Validate individual message sizes
    const totalSize = JSON.stringify(messages).length;
    if (totalSize > 100000) { // 100KB limit
      return res.status(400).json({ error: 'Message payload too large' });
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
      // SECURITY: Don't expose internal error details to client
      res.write(`data: ${JSON.stringify({ 
        type: 'error', 
        error: 'Failed to generate response. Please try again.' 
      })}\n\n`);
      res.end();
    }
  } catch (error) {
    console.error('AI Chat Stream Error:', error);
    // SECURITY: Don't expose internal error details to client
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Failed to process AI request. Please try again.',
      });
    }
  }
});

export { router as aiChatStreamRouter };

