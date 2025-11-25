import { Router, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { getAuthenticatedSupabaseClient } from '../utils/supabase-auth.js';
import { getActiveAIProvider } from '../utils/ai-settings.js';
import { STRIPE_CONFIG } from '../config/stripe-plans.js';
import { validateLength, MAX_LENGTHS } from '../utils/validation.js';
import { webSearch } from '../utils/web-search.js';

const router = Router();

// ✅ SECURITY: Rate limiting for streaming generation (prevent spam/abuse)
const streamingRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Max 10 streaming requests per 15 minutes per IP
  message: 'Too many generation requests. Please wait before trying again.',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Sanitize AI response to extract valid JSON
 * Removes markdown code fences, extra whitespace, and other formatting
 */
function sanitizeJSONResponse(text: string): string {
  if (!text) return '{}';
  
  // Remove markdown code fences (```json, ```, etc.)
  let cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '');
  
  // Trim whitespace
  cleaned = cleaned.trim();
  
  // If it starts with { or [, extract just the JSON object/array
  const jsonMatch = cleaned.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  if (jsonMatch) {
    cleaned = jsonMatch[0];
  }
  
  return cleaned;
}

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
router.post('/generate-slides-stream', streamingRateLimiter, requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { topic, brand, enableResearch = true, presentationPlan, projectId, brandId } = req.body;
    const userPlan = req.user?.plan || 'espresso';
    const workspaceId = req.user?.workspaceId;
    const userId = req.user?.id;

    console.log('🎯 Stream generation request:', { 
      topic: topic?.substring(0, 50), 
      projectId, 
      brandId: brandId || brand?.id,
      hasResearch: enableResearch 
    });

    if (!topic && !presentationPlan) {
      return res.status(400).json({ error: 'Topic or presentation plan is required' });
    }

    // ✅ SECURITY: Input validation and sanitization
    if (topic) {
      const topicValidation = validateLength(topic, 'topic', MAX_LENGTHS.PRESENTATION_TITLE, 0, false);
      if (topicValidation) {
        return res.status(400).json({ error: topicValidation.message });
      }
    }

    if (presentationPlan) {
      const planStr = JSON.stringify(presentationPlan);
      if (planStr.length > 10000) {
        return res.status(400).json({ error: 'Presentation plan too large (max 10KB)' });
      }
    }

    // Get authenticated Supabase client
    const { supabase } = await getAuthenticatedSupabaseClient(req);

    // ✅ SECURITY: Validate project ownership if provided
    if (projectId) {
      const { data: projectData, error: projectError } = await supabase
        .from('v2_projects')
        .select('id, workspace_id')
        .eq('id', projectId)
        .eq('workspace_id', workspaceId)
        .single();

      if (projectError || !projectData) {
        console.error('❌ Project ownership validation failed:', projectError);
        return res.status(403).json({ error: 'Project not found or access denied' });
      }
      
      console.log('✅ Project ownership validated:', projectId);
    }
    
    // ✅ SECURITY: Validate brand ownership if provided
    if (brand?.id || brandId) {
      const finalBrandId = brandId || brand?.id;
      const { data: brandData, error: brandError } = await supabase
        .from('v2_brands')
        .select('id, workspace_id')
        .eq('id', finalBrandId)
        .eq('workspace_id', workspaceId)
        .single();

      if (brandError || !brandData) {
        console.error('❌ Brand ownership validation failed:', brandError);
        return res.status(403).json({ error: 'Brand not found or access denied' });
      }
      
      console.log('✅ Brand ownership validated:', finalBrandId);
    }

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

    // ✅ SECURITY: Calculate max slides based on plan remaining capacity
    const remainingSlides = limits.slidesPerMonth - (monthlySlides || 0);
    const maxSlidesForGeneration = Math.min(remainingSlides, 50); // Hard cap at 50 slides per generation
    
    if (remainingSlides <= 0) {
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

    // ✅ SECURITY: Sanitize inputs to prevent prompt injection
    const sanitizedTopic = (topic || presentationPlan?.title || '').substring(0, 500);
    
    const outlinePrompt = `Create a detailed presentation outline for: ${sanitizedTopic}

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
      const sanitizedOutline = sanitizeJSONResponse(outlineText);
      outline = JSON.parse(sanitizedOutline);
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
      const outlineContent = outlineData.choices?.[0]?.message?.content || '{}';
      const sanitizedOutline = sanitizeJSONResponse(outlineContent);
      outline = JSON.parse(sanitizedOutline);
    }

    sendEvent('outline_complete', { 
      outline,
      message: `Outline ready with ${outline.slides?.length || 0} slides`
    });

    // PHASE 3: SLIDE-BY-SLIDE GENERATION (True Streaming)
    sendEvent('slide_start', { message: 'Generating slides...' });

    const slides: any[] = [];
    // ✅ SECURITY: Enforce plan limits during generation (not just pre-check)
    const requestedSlideCount = outline.slides?.length || 8;
    const slideCount = Math.min(requestedSlideCount, maxSlidesForGeneration);
    
    if (requestedSlideCount > slideCount) {
      sendEvent('warning', { 
        message: `Limited to ${slideCount} slides due to plan capacity (requested ${requestedSlideCount})`
      });
    }

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

        if (!slideResponse.ok) {
          const errorText = await slideResponse.text();
          throw new Error(`Failed to generate slide ${i + 1}: ${slideResponse.statusText}`);
        }

        const slideData = await slideResponse.json() as any;
        const slideText = slideData.content?.[0]?.text || '{}';
        const sanitizedSlide = sanitizeJSONResponse(slideText);
        slide = JSON.parse(sanitizedSlide);
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

        if (!slideResponse.ok) {
          const errorText = await slideResponse.text();
          throw new Error(`Failed to generate slide ${i + 1}: ${slideResponse.statusText}`);
        }

        const slideData = await slideResponse.json() as any;
        const slideContent = slideData.choices?.[0]?.message?.content || '{}';
        const sanitizedSlide = sanitizeJSONResponse(slideContent);
        slide = JSON.parse(sanitizedSlide);
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
    const finalBrandId = brandId || brand?.id || null;
    
    console.log('💾 Saving presentation:', {
      title: outline.title || topic,
      projectId,
      brandId: finalBrandId,
      slideCount: slides.length
    });
    
    const { data: presentation, error: saveError } = await supabase
      .from('v2_presentations')
      .insert({
        title: outline.title || topic,
        description: outline.summary || '',
        slides: slides,
        workspace_id: workspaceId,
        created_by: userId,
        project_id: projectId || null,
        brand_id: finalBrandId,
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
