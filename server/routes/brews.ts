import { Router, Response } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { getAuthenticatedSupabaseClient } from '../utils/supabase-auth.js';
import { validateLength, MAX_LENGTHS } from '../utils/validation.js';
import Anthropic from '@anthropic-ai/sdk';

const router = Router();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Helper function to sanitize JSON responses (remove markdown code fences)
function sanitizeJSONResponse(text: string): string {
  return text
    .replace(/```json\s*/g, '')
    .replace(/```\s*/g, '')
    .trim();
}

// ============================================
// POST /api/brews/generate-outline
// Generate outline only (no full slides)
// ============================================
router.post('/brews/generate-outline', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { topic, projectId, slideCount = 10 } = req.body;
    const workspaceId = req.user?.workspaceId;
    const userId = req.user?.id;

    if (!workspaceId || !userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Validate topic
    const topicError = validateLength(topic, 'Topic', 500, 5);
    if (topicError) {
      return res.status(400).json({ error: topicError.message });
    }

    // Validate project ownership if provided
    const { supabase } = await getAuthenticatedSupabaseClient(req);
    
    if (projectId) {
      const { data: project, error: projectError } = await supabase
        .from('v2_projects')
        .select('id, workspace_id')
        .eq('id', projectId)
        .eq('workspace_id', workspaceId)
        .single();

      if (projectError || !project) {
        return res.status(403).json({ error: 'Project not found or access denied' });
      }
    }

    console.log('🎯 Generating outline:', { topic, slideCount, projectId, workspaceId });

    // Generate outline using Claude
    const response = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 2000,
      temperature: 0.7,
      messages: [{
        role: 'user',
        content: `Create a presentation outline for: "${topic}"

Generate an outline with ${slideCount} slides. Return ONLY valid JSON (no markdown, no code fences) with this structure:

{
  "title": "Presentation Title",
  "summary": "Brief description of what this presentation covers",
  "slides": [
    {
      "slideNumber": 1,
      "title": "Slide Title",
      "type": "title",
      "keyPoints": ["Main point or tagline"]
    },
    {
      "slideNumber": 2,
      "title": "Slide Title",
      "type": "content",
      "keyPoints": ["First point", "Second point", "Third point"]
    }
  ]
}

Slide types: "title", "content", "quote", "image", "chart", "timeline", "comparison", "conclusion"
Include 3-5 key points per content slide.`
      }]
    });

    const contentBlock = response.content[0];
    if (contentBlock.type !== 'text') {
      throw new Error('Unexpected response type from AI');
    }

    const sanitized = sanitizeJSONResponse(contentBlock.text);
    const outline = JSON.parse(sanitized);

    // Validate outline structure
    if (!outline.title || !outline.slides || !Array.isArray(outline.slides)) {
      throw new Error('Invalid outline structure from AI');
    }

    // Create outline draft in database
    const { data: draft, error: draftError } = await supabase
      .from('v2_outline_drafts')
      .insert({
        workspace_id: workspaceId,
        project_id: projectId || null,
        created_by: userId,
        topic,
        outline_json: outline,
        current_step: 2, // Move to outline editing step
        status: 'draft'
      })
      .select()
      .single();

    if (draftError) {
      console.error('❌ Failed to create outline draft:', draftError);
      throw draftError;
    }

    console.log('✅ Outline generated and saved:', { draftId: draft.id, slideCount: outline.slides.length });

    res.json({
      success: true,
      draft,
      outline
    });

  } catch (error: any) {
    console.error('❌ Outline generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate outline',
      message: error.message 
    });
  }
});

// ============================================
// PATCH /api/brews/outline-drafts/:id
// Update outline draft during editing
// ============================================
router.patch('/brews/outline-drafts/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { outline_json, current_step, theme_id, image_profile_id } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { supabase } = await getAuthenticatedSupabaseClient(req);

    // Verify ownership
    const { data: existingDraft, error: fetchError } = await supabase
      .from('v2_outline_drafts')
      .select('id, created_by')
      .eq('id', id)
      .single();

    if (fetchError || !existingDraft) {
      return res.status(404).json({ error: 'Outline draft not found' });
    }

    if (existingDraft.created_by !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Build update object
    const updates: any = {
      updated_at: new Date().toISOString()
    };

    if (outline_json !== undefined) updates.outline_json = outline_json;
    if (current_step !== undefined) updates.current_step = current_step;
    if (theme_id !== undefined) updates.theme_id = theme_id;
    if (image_profile_id !== undefined) updates.image_profile_id = image_profile_id;

    // Update draft
    const { data: updated, error: updateError } = await supabase
      .from('v2_outline_drafts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Failed to update draft:', updateError);
      throw updateError;
    }

    console.log('✅ Outline draft updated:', { draftId: id, step: current_step });

    res.json({
      success: true,
      draft: updated
    });

  } catch (error: any) {
    console.error('❌ Draft update error:', error);
    res.status(500).json({ 
      error: 'Failed to update outline draft',
      message: error.message 
    });
  }
});

// ============================================
// GET /api/brews/outline-drafts/:id
// Get single outline draft
// ============================================
router.get('/brews/outline-drafts/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const workspaceId = req.user?.workspaceId;

    if (!workspaceId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { supabase } = await getAuthenticatedSupabaseClient(req);

    const { data: draft, error } = await supabase
      .from('v2_outline_drafts')
      .select(`
        *,
        theme:v2_theme_profiles(id, name, category, palette_json, typography_json),
        project:v2_projects(id, name, brand_id)
      `)
      .eq('id', id)
      .eq('workspace_id', workspaceId)
      .single();

    if (error || !draft) {
      return res.status(404).json({ error: 'Outline draft not found' });
    }

    res.json(draft);

  } catch (error: any) {
    console.error('❌ Draft fetch error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch outline draft',
      message: error.message 
    });
  }
});

// ============================================
// GET /api/brews/outline-drafts
// List all outline drafts for workspace
// ============================================
router.get('/brews/outline-drafts', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const workspaceId = req.user?.workspaceId;

    if (!workspaceId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { supabase } = await getAuthenticatedSupabaseClient(req);

    const { data: drafts, error } = await supabase
      .from('v2_outline_drafts')
      .select(`
        *,
        theme:v2_theme_profiles(id, name, category),
        project:v2_projects(id, name)
      `)
      .eq('workspace_id', workspaceId)
      .is('deleted_at', null)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('❌ Failed to fetch drafts:', error);
      throw error;
    }

    res.json(drafts || []);

  } catch (error: any) {
    console.error('❌ Drafts list error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch outline drafts',
      message: error.message 
    });
  }
});

// ============================================
// DELETE /api/brews/outline-drafts/:id
// Soft delete outline draft
// ============================================
router.delete('/brews/outline-drafts/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { supabase } = await getAuthenticatedSupabaseClient(req);

    // Verify ownership
    const { data: draft, error: fetchError } = await supabase
      .from('v2_outline_drafts')
      .select('id, created_by')
      .eq('id', id)
      .single();

    if (fetchError || !draft) {
      return res.status(404).json({ error: 'Outline draft not found' });
    }

    if (draft.created_by !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Soft delete
    const { error: deleteError } = await supabase
      .from('v2_outline_drafts')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (deleteError) {
      console.error('❌ Failed to delete draft:', deleteError);
      throw deleteError;
    }

    console.log('✅ Outline draft deleted:', { draftId: id });

    res.json({ success: true });

  } catch (error: any) {
    console.error('❌ Draft deletion error:', error);
    res.status(500).json({ 
      error: 'Failed to delete outline draft',
      message: error.message 
    });
  }
});

// ============================================
// POST /api/brews/generate-from-outline
// Generate slides from edited outline (Server-Sent Events)
// ============================================
router.post('/brews/generate-from-outline', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { draftId } = req.body;
    const workspaceId = req.user?.workspaceId;
    const userId = req.user?.id;

    if (!workspaceId || !userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { supabase } = await getAuthenticatedSupabaseClient(req);

    // Fetch outline draft
    const { data: draft, error: draftError } = await supabase
      .from('v2_outline_drafts')
      .select(`
        *,
        theme:v2_theme_profiles(*),
        project:v2_projects(*)
      `)
      .eq('id', draftId)
      .eq('workspace_id', workspaceId)
      .single();

    if (draftError || !draft) {
      return res.status(404).json({ error: 'Outline draft not found' });
    }

    if (!draft.outline_json || !draft.outline_json.slides) {
      return res.status(400).json({ error: 'No outline found in draft' });
    }

    console.log('🎨 Generating slides from outline:', {
      draftId,
      slideCount: draft.outline_json.slides.length,
      themeId: draft.theme_id
    });

    // Set up Server-Sent Events
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const sendEvent = (event: string, data: any) => {
      res.write(`event: ${event}\n`);
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    try {
      sendEvent('progress', { step: 'Starting slide generation', progress: 0 });

      // Update draft status
      await supabase
        .from('v2_outline_drafts')
        .update({ status: 'generating', current_step: 5 })
        .eq('id', draftId);

      const outline = draft.outline_json;
      const slides = [];

      // Generate slides based on outline
      for (let i = 0; i < outline.slides.length; i++) {
        const outlineSlide = outline.slides[i];
        const progress = Math.round(((i + 1) / outline.slides.length) * 100);

        sendEvent('progress', {
          step: `Generating slide ${i + 1}/${outline.slides.length}`,
          progress,
          slideNumber: i + 1
        });

        // Create slide based on outline and theme
        const slide: any = {
          id: `slide-${i + 1}`,
          title: outlineSlide.title,
          type: outlineSlide.type || 'content',
          content: {
            title: outlineSlide.title,
            points: outlineSlide.keyPoints || []
          }
        };

        // Apply theme if available
        if (draft.theme) {
          slide.theme = {
            colors: draft.theme.palette_json,
            typography: draft.theme.typography_json
          };
        }

        slides.push(slide);

        sendEvent('slide', {
          slideNumber: i + 1,
          slide
        });
      }

      sendEvent('progress', { step: 'Saving presentation', progress: 100 });

      // Save presentation to database
      const { data: presentation, error: saveError } = await supabase
        .from('v2_presentations')
        .insert({
          title: outline.title || draft.topic,
          description: outline.summary || '',
          slides: slides,
          workspace_id: workspaceId,
          created_by: userId,
          project_id: draft.project_id,
          brand_id: draft.project?.brand_id || null,
          outline_draft_id: draftId,
          status: 'draft',
          thumbnail: null
        })
        .select()
        .single();

      if (saveError) {
        throw saveError;
      }

      // Update draft with presentation link
      await supabase
        .from('v2_outline_drafts')
        .update({
          status: 'completed',
          presentation_id: presentation.id,
          completed_at: new Date().toISOString()
        })
        .eq('id', draftId);

      sendEvent('complete', {
        presentationId: presentation.id,
        slideCount: slides.length
      });

      res.end();

    } catch (error: any) {
      console.error('❌ Slide generation error:', error);
      sendEvent('error', {
        message: error.message || 'Failed to generate slides'
      });
      res.end();
    }

  } catch (error: any) {
    console.error('❌ Generate from outline error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Failed to generate slides from outline',
        message: error.message
      });
    }
  }
});

export default router;
