import { Router } from 'express';

const router = Router();

const MANUS_API_URL = process.env.BUILT_IN_FORGE_API_URL || '';
const MANUS_API_KEY = process.env.BUILT_IN_FORGE_API_KEY || '';

router.post('/ai-chat', async (req, res) => {
  try {
    const { messages, presentationContext } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    // Call Manus LLM API
    const response = await fetch(`${MANUS_API_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MANUS_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gemini-2.0-flash-exp',
        messages: [
          {
            role: 'system',
            content: `You are an expert presentation designer and content strategist for SlideCoffee, an AI-powered presentation builder. Your role is to help users create professional, engaging presentations.

Guidelines:
- Be conversational and encouraging (coffee-themed personality)
- Ask clarifying questions to understand the user's needs
- Suggest slide structures and content
- When ready, propose a presentation plan with slide titles and content outlines
- Apply brand guidelines when provided
- Keep responses concise and actionable

Context: ${presentationContext ? JSON.stringify(presentationContext) : 'No context provided'}`
          },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      throw new Error(`Manus API error: ${response.statusText}`);
    }

    const data = await response.json();
    const aiMessage = data.choices[0]?.message?.content || 'Sorry, I could not generate a response.';

    res.json({
      message: aiMessage,
      usage: data.usage
    });
  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({
      error: 'Failed to process AI request',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export { router as aiChatRouter };

