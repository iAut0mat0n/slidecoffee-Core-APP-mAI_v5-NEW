import { Router, Response } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { getAuthenticatedSupabaseClient } from '../utils/supabase-auth.js';
import { getActiveAIProvider } from '../utils/ai-settings.js';
import { STRIPE_CONFIG } from '../config/stripe-plans.js';
import { validateLength, MAX_LENGTHS } from '../utils/validation.js';
import { webSearch } from '../utils/web-search.js';

const router = Router();

/**
 * STREAMING SLIDE GENERATION - True Real-Time Magic ✨
 * 
 * Streams events in order:
 * 1. research_start - Beginning research phase
 * 2. research_source - Each source found (with URL, title)
 * 3. research_complete - Research phase done
 * 4. outline_start - Beginning outline creation
 * 5. outline_progress - Outline being built
 * 6. outline_complete - Outline ready
 * 7. slide_start - Beginning slide generation
 * 8. slide_generated - Each slide as it's created (real-time)
 * 9. slide_complete - All slides done
 * 10. complete - Presentation saved
 */
router.post('/generate-slides-stream', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { topic, brand, enableResearch = true, presentationPlan } = req.body;
    const userPlan = req.user?.plan || 'espresso';
    const workspaceId = req.user?.workspaceId;
    const userId = req.user?.id;

    if (!topic && !presentationPlan) {
      return res.status(400).json({ error: 'Topic or presentation plan is required' });
    }

    // Get authenticated Supabase client
    const { supabase } = await getAuthenticatedSupabaseClient(req);

    // Get plan limits
    const planConfig = STRIPE_CONFIG.plans[userPlan as keyof typeof STRIPE_CONFIG.plans];
    const limits = planConfig?.limits || STRIPE_CONFIG.plans.espresso.limits;

    // Check monthly slide limits
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const { count: monthlySlides } = await supabase
      .from('v2_slides')
      .select('*', { count: 'exact', head: true })
      .eq('workspace_id', workspaceId)
      .gte('created_at', startOfMonth.toISOString());

    const estimatedSlideCount = 10; // Default estimate
    
    if (monthlySlides !== null && (monthlySlides + estimatedSlideCount) > limits.slidesPerMonth) {
      return res.status(403).json({
        error: 'Monthly slide limit reached',
        message: `Your ${planConfig.name} plan allows ${limits.slidesPerMonth} slides per month.`,
        limit: limits.slidesPerMonth,
        current: monthlySlides,
        upgradeRequired: true,
      });
    }

    // Check monthly presentation limits
    const { count: monthlyPresentations } = await supabase
      .from('v2_presentations')
      .select('*', { count: 'exact', head: true })
      .eq('workspace_id', workspaceId)
      .gte('created_at', startOfMonth.toISOString());

    if (monthlyPresentations !== null && monthlyPresentations >= limits.presentationsPerMonth) {
      return res.status(403).json({
        error: 'Monthly presentation limit reached',
        message: `Your ${planConfig.name} plan allows ${limits.presentationsPerMonth} presentations per month.`,
        limit: limits.presentationsPerMonth,
        current: monthlyPresentations,
        upgradeRequired: true,
      });
    }

    // Get active AI provider
    const aiProvider = await getActiveAIProvider();

    if (!aiProvider.apiKey) {
      return res.status(500).json({ 
        error: 'AI service not configured',
        details: `Missing API key for ${aiProvider.provider}`
      });
    }

    // Set up Server-Sent Events (SSE) streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Helper to send SSE events
    const sendEvent = (type: string, data: any) => {
      res.write(`data: ${JSON.stringify({ type, ...data })}\n\n`);
    };

    sendEvent('start', { message: 'Starting presentation generation...' });

    let searchResults = '';
    let sources: Array<{url: string, title: string, snippet: string}> = [];

    // PHASE 1: RESEARCH (if enabled)
    if (enableResearch && topic) {
      try {
        sendEvent('research_start', { message: 'Researching your topic...' });
        
        const search = await webSearch.search(topic, 5);
        sources = search.results;
        
        // Stream each source as it's found
        for (const source of sources) {
          sendEvent('research_source', {
            url: source.url,
            title: source.title,
            snippet: source.snippet
          });
          // Small delay to make it feel more realistic
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        searchResults = webSearch.formatForAI(search);
        sendEvent('research_complete', { 
          message: `Found ${sources.length} sources`,
          sourceCount: sources.length 
        });
      } catch (error) {
        console.error('Research error:', error);
        sendEvent('research_error', { message: 'Research failed, continuing without sources' });
      }
    }

    // PHASE 2: OUTLINE GENERATION
    sendEvent('outline_start', { message: 'Creating presentation outline...' });

    const outlinePrompt = `Create a detailed presentation outline for: ${topic || presentationPlan?.title}

${searchResults ? `Research Context:\n${searchResults}\n` : ''}

${presentationPlan ? `User's Plan:\n${JSON.stringify(presentationPlan, null, 2)}\n` : ''}

Generate a JSON outline with:
{
  "title": "Presentation Title",
  "summary": "Brief summary",
  "slideCount": 8,
  "slides": [
    {"title": "Slide 1", "keyPoints": ["Point 1", "Point 2"]},
    ...
  ]
}`;

    let outline: any;

    if (aiProvider.provider === 'claude' || aiProvider.provider === 'claude-haiku') {
      const outlineResponse = await fetch(`${aiProvider.apiUrl}/v1/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': aiProvider.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: aiProvider.model,
          max_tokens: 2048,
          system: 'You are a presentation expert. Return only valid JSON.',
          messages: [{
            role: 'user',
            content: outlinePrompt
          }]
        })
      });

      if (!outlineResponse.ok) {
        throw new Error('Failed to generate outline');
      }

      const outlineData = await outlineResponse.json() as any;
      const outlineText = outlineData.content?.[0]?.text || '{}';
      outline = JSON.parse(outlineText);
    } else {
      // OpenAI-compatible
      const outlineResponse = await fetch(`${aiProvider.apiUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${aiProvider.apiKey}`
        },
        body: JSON.stringify({
          model: aiProvider.model,
          messages: [
            { role: 'system', content: 'You are a presentation expert. Return only valid JSON.' },
            { role: 'user', content: outlinePrompt }
          ],
          response_format: { type: 'json_object' },
          max_tokens: 2048
        })
      });

      if (!outlineResponse.ok) {
        throw new Error('Failed to generate outline');
      }

      const outlineData = await outlineResponse.json() as any;
      outline = JSON.parse(outlineData.choices?.[0]?.message?.content || '{}');
    }

    sendEvent('outline_complete', { 
      outline,
      message: `Outline ready with ${outline.slides?.length || 0} slides`
    });

    // PHASE 3: SLIDE-BY-SLIDE GENERATION (True Streaming)
    sendEvent('slide_start', { message: 'Generating slides...' });

    const slides: any[] = [];
    const slideCount = outline.slides?.length || 8;

    for (let i = 0; i < slideCount; i++) {
      const slideOutline = outline.slides?.[i];
      
      const slidePrompt = `Generate detailed content for slide ${i + 1}:

Title: ${slideOutline?.title || `Slide ${i + 1}`}
Key Points: ${JSON.stringify(slideOutline?.keyPoints || [])}

${brand ? `Brand Guidelines:
- Primary Color: ${brand.primary_color}
- Secondary Color: ${brand.secondary_color}
- Font Heading: ${brand.font_heading}
- Font Body: ${brand.font_body}` : ''}

Return JSON:
{
  "title": "Slide Title",
  "content": "Detailed content with bullet points",
  "layout": "content|two-column|image-text|title",
  "designNotes": "Visual suggestions",
  "speakerNotes": "What to say"
}`;

      let slide: any;

      if (aiProvider.provider === 'claude' || aiProvider.provider === 'claude-haiku') {
        const slideResponse = await fetch(`${aiProvider.apiUrl}/v1/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': aiProvider.apiKey,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: aiProvider.model,
            max_tokens: 1024,
            system: 'You are a presentation designer. Return only valid JSON.',
            messages: [{
              role: 'user',
              content: slidePrompt
            }]
          })
        });

        const slideData = await slideResponse.json() as any;
        const slideText = slideData.content?.[0]?.text || '{}';
        slide = JSON.parse(slideText);
      } else {
        const slideResponse = await fetch(`${aiProvider.apiUrl}/v1/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${aiProvider.apiKey}`
          },
          body: JSON.stringify({
            model: aiProvider.model,
            messages: [
              { role: 'system', content: 'You are a presentation designer. Return only valid JSON.' },
              { role: 'user', content: slidePrompt }
            ],
            response_format: { type: 'json_object' },
            max_tokens: 1024
          })
        });

        const slideData = await slideResponse.json() as any;
        slide = JSON.parse(slideData.choices?.[0]?.message?.content || '{}');
      }

      slides.push(slide);

      // Stream each slide immediately as it's generated
      sendEvent('slide_generated', {
        slideNumber: i + 1,
        totalSlides: slideCount,
        slide,
        progress: ((i + 1) / slideCount) * 100
      });

      // Small delay between slides for visual effect
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    sendEvent('slides_complete', { 
      message: `Generated ${slides.length} slides`,
      slideCount: slides.length
    });

    // PHASE 4: SAVE TO DATABASE
    const { data: presentation, error: saveError } = await supabase
      .from('v2_presentations')
      .insert({
        title: outline.title || topic,
        description: outline.summary || '',
        slides: slides,
        workspace_id: workspaceId,
        created_by: userId,
        brand_id: brand?.id || null,
        status: 'draft',
        thumbnail: null
      })
      .select()
      .single();

    if (saveError) {
      throw saveError;
    }

    sendEvent('complete', {
      message: 'Presentation created successfully!',
      presentation: {
        id: presentation.id,
        title: presentation.title,
        slideCount: slides.length
      },
      sources: sources.map(s => ({ url: s.url, title: s.title }))
    });

    res.end();
  } catch (error) {
    console.error('Streaming generation error:', error);
    res.write(`data: ${JSON.stringify({ 
      type: 'error',
      message: error instanceof Error ? error.message : 'Generation failed'
    })}\n\n`);
    res.end();
  }
});

export { router as generateSlidesStreamRouter };
