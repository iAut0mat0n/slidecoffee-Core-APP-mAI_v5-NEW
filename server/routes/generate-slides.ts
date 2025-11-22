import { Router } from 'express';
import { getActiveAIProvider } from '../utils/ai-settings.js';

const router = Router();

router.post('/generate-slides', async (req, res) => {
  try {
    const { plan, brand } = req.body;

    if (!plan) {
      return res.status(400).json({ error: 'Presentation plan is required' });
    }

    // Get active AI provider from database
    const aiProvider = await getActiveAIProvider();

    if (!aiProvider.apiKey) {
      return res.status(500).json({ 
        error: 'AI service not configured',
        details: `Missing API key for ${aiProvider.provider}`
      });
    }

    const systemPrompt = `You are a professional presentation designer. Generate detailed slide content based on the provided plan.

For each slide, provide:
- Title
- Content (bullet points, paragraphs, or structured data)
- Layout type (title, content, two-column, image-text, etc.)
- Design notes

${brand ? `Apply these brand guidelines:\n- Primary Color: ${brand.primary_color}\n- Secondary Color: ${brand.secondary_color}\n- Font Heading: ${brand.font_heading}\n- Font Body: ${brand.font_body}` : ''}

Return the slides as a JSON array.`;

    const userPrompt = `Generate slides for this presentation plan:\n\n${JSON.stringify(plan, null, 2)}`;

    let slides;
    let usage;

    // Handle different AI providers
    if (aiProvider.provider === 'claude' || aiProvider.provider === 'claude-haiku') {
      // Claude API format
      const response = await fetch(`${aiProvider.apiUrl}/v1/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': aiProvider.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: aiProvider.model,
          max_tokens: 4096,
          system: systemPrompt,
          messages: [
            {
              role: 'user',
              content: userPrompt
            }
          ]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Claude API error: ${response.statusText} - ${errorText}`);
      }

      const data = await response.json() as any;
      const slidesContent = data.content?.[0]?.text || '{}';
      const parsedSlides = JSON.parse(slidesContent);
      slides = parsedSlides.slides || [];
      usage = data.usage;
    } else {
      // OpenAI-compatible API format (Manus, GPT-4)
      const response = await fetch(`${aiProvider.apiUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${aiProvider.apiKey}`
        },
        body: JSON.stringify({
          model: aiProvider.model,
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: userPrompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2000,
          response_format: { type: 'json_object' }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`${aiProvider.provider} API error: ${response.statusText} - ${errorText}`);
      }

      const data = await response.json() as any;
      const slidesContent = data.choices?.[0]?.message?.content || '{}';
      const parsedSlides = JSON.parse(slidesContent);
      slides = parsedSlides.slides || [];
      usage = data.usage;
    }

    res.json({
      slides,
      usage,
      provider: aiProvider.provider,
      model: aiProvider.model
    });
  } catch (error) {
    console.error('Slide Generation Error:', error);
    res.status(500).json({
      error: 'Failed to generate slides',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export { router as generateSlidesRouter };

