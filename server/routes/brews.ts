import { Router, Response } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { validateLength } from '../utils/validation.js';
import Anthropic from '@anthropic-ai/sdk';
import { db } from '../db.js';
import { v2OutlineDrafts, v2Projects, v2ThemeProfiles, v2Presentations } from '../../shared/schema.js';
import { eq, and, isNull, or, desc } from 'drizzle-orm';

const router = Router();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

function sanitizeJSONResponse(text: string): string {
  return text
    .replace(/```json\s*/g, '')
    .replace(/```\s*/g, '')
    .trim();
}

// POST /api/brews/generate-outline
router.post('/brews/generate-outline', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { topic, projectId, slideCount = 10 } = req.body;
    const workspaceId = req.user?.workspaceId;
    const userId = req.user?.id;

    if (!workspaceId || !userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const topicError = validateLength(topic, 'Topic', 500, 5);
    if (topicError) {
      return res.status(400).json({ error: topicError.message });
    }

    if (projectId) {
      const [project] = await db
        .select({ id: v2Projects.id })
        .from(v2Projects)
        .where(and(eq(v2Projects.id, projectId), eq(v2Projects.workspaceId, workspaceId)))
        .limit(1);

      if (!project) {
        return res.status(403).json({ error: 'Project not found or access denied' });
      }
    }

    console.log('🎯 Generating outline:', { topic, slideCount, projectId, workspaceId });

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

    if (!outline.title || !outline.slides || !Array.isArray(outline.slides)) {
      throw new Error('Invalid outline structure from AI');
    }

    const [draft] = await db
      .insert(v2OutlineDrafts)
      .values({
        workspaceId,
        projectId: projectId || null,
        createdBy: userId,
        topic,
        outlineJson: outline,
        currentStep: 2,
        status: 'draft'
      })
      .returning();

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

// PATCH /api/brews/outline-drafts/:id
router.patch('/brews/outline-drafts/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { outline_json, current_step, theme_id, image_profile_id, brand_id, image_source, options } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const [existingDraft] = await db
      .select({ id: v2OutlineDrafts.id, createdBy: v2OutlineDrafts.createdBy })
      .from(v2OutlineDrafts)
      .where(eq(v2OutlineDrafts.id, id))
      .limit(1);

    if (!existingDraft) {
      return res.status(404).json({ error: 'Outline draft not found' });
    }

    if (existingDraft.createdBy !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updates: any = {
      updatedAt: new Date()
    };

    if (outline_json !== undefined) updates.outlineJson = outline_json;
    if (current_step !== undefined) updates.currentStep = current_step;
    if (theme_id !== undefined) updates.themeId = theme_id;
    if (image_profile_id !== undefined) updates.imageProfileId = image_profile_id;
    if (brand_id !== undefined) updates.brandId = brand_id;
    if (image_source !== undefined) updates.imageSource = image_source;
    if (options !== undefined) updates.optionsJson = options;

    const [updated] = await db
      .update(v2OutlineDrafts)
      .set(updates)
      .where(eq(v2OutlineDrafts.id, id))
      .returning();

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

// GET /api/brews/outline-drafts/:id
router.get('/brews/outline-drafts/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const workspaceId = req.user?.workspaceId;

    if (!workspaceId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const [draft] = await db
      .select()
      .from(v2OutlineDrafts)
      .where(and(eq(v2OutlineDrafts.id, id), eq(v2OutlineDrafts.workspaceId, workspaceId)))
      .limit(1);

    if (!draft) {
      return res.status(404).json({ error: 'Outline draft not found' });
    }

    let theme = null;
    if (draft.themeId) {
      const [themeResult] = await db
        .select()
        .from(v2ThemeProfiles)
        .where(eq(v2ThemeProfiles.id, draft.themeId))
        .limit(1);
      theme = themeResult;
    }

    let project = null;
    if (draft.projectId) {
      const [projectResult] = await db
        .select({ id: v2Projects.id, name: v2Projects.name, brandId: v2Projects.brandId })
        .from(v2Projects)
        .where(eq(v2Projects.id, draft.projectId))
        .limit(1);
      project = projectResult;
    }

    res.json({ ...draft, theme, project });

  } catch (error: any) {
    console.error('❌ Draft fetch error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch outline draft',
      message: error.message 
    });
  }
});

// GET /api/brews/outline-drafts
router.get('/brews/outline-drafts', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const workspaceId = req.user?.workspaceId;

    if (!workspaceId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const drafts = await db
      .select()
      .from(v2OutlineDrafts)
      .where(and(eq(v2OutlineDrafts.workspaceId, workspaceId), isNull(v2OutlineDrafts.deletedAt)))
      .orderBy(desc(v2OutlineDrafts.updatedAt));

    res.json(drafts || []);

  } catch (error: any) {
    console.error('❌ Drafts list error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch outline drafts',
      message: error.message 
    });
  }
});

// DELETE /api/brews/outline-drafts/:id
router.delete('/brews/outline-drafts/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const workspaceId = req.user?.workspaceId;

    if (!userId || !workspaceId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const [draft] = await db
      .select({ id: v2OutlineDrafts.id, createdBy: v2OutlineDrafts.createdBy, workspaceId: v2OutlineDrafts.workspaceId })
      .from(v2OutlineDrafts)
      .where(and(eq(v2OutlineDrafts.id, id), eq(v2OutlineDrafts.workspaceId, workspaceId)))
      .limit(1);

    if (!draft) {
      return res.status(404).json({ error: 'Outline draft not found' });
    }

    if (draft.createdBy !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await db
      .update(v2OutlineDrafts)
      .set({ deletedAt: new Date() })
      .where(eq(v2OutlineDrafts.id, id));

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

// POST /api/brews/generate-from-outline (SSE)
router.post('/brews/generate-from-outline', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { draftId } = req.body;
    const workspaceId = req.user?.workspaceId;
    const userId = req.user?.id;

    if (!workspaceId || !userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const [draft] = await db
      .select()
      .from(v2OutlineDrafts)
      .where(and(eq(v2OutlineDrafts.id, draftId), eq(v2OutlineDrafts.workspaceId, workspaceId)))
      .limit(1);

    if (!draft) {
      return res.status(404).json({ error: 'Outline draft not found' });
    }

    const outlineJson = draft.outlineJson as any;
    if (!outlineJson || !outlineJson.slides) {
      return res.status(400).json({ error: 'No outline found in draft' });
    }

    let theme = null;
    if (draft.themeId) {
      const [themeResult] = await db
        .select()
        .from(v2ThemeProfiles)
        .where(eq(v2ThemeProfiles.id, draft.themeId))
        .limit(1);
      theme = themeResult;
    }

    console.log('🎨 Generating slides from outline:', {
      draftId,
      slideCount: outlineJson.slides.length,
      themeId: draft.themeId
    });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const sendEvent = (event: string, data: any) => {
      res.write(`event: ${event}\n`);
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    try {
      sendEvent('progress', { step: 'Starting slide generation', progress: 0 });

      await db
        .update(v2OutlineDrafts)
        .set({ status: 'generating', currentStep: 5 })
        .where(eq(v2OutlineDrafts.id, draftId));

      const slides = [];

      for (let i = 0; i < outlineJson.slides.length; i++) {
        const outlineSlide = outlineJson.slides[i];
        const progress = Math.round(((i + 1) / outlineJson.slides.length) * 100);

        sendEvent('progress', {
          step: `Generating slide ${i + 1}/${outlineJson.slides.length}`,
          progress,
          slideNumber: i + 1
        });

        const slide: any = {
          id: `slide-${i + 1}`,
          title: outlineSlide.title,
          type: outlineSlide.type || 'content',
          content: {
            title: outlineSlide.title,
            points: outlineSlide.keyPoints || []
          }
        };

        if (theme) {
          slide.theme = {
            colors: theme.paletteJson,
            typography: theme.typographyJson
          };
        }

        slides.push(slide);

        sendEvent('slide', {
          slideNumber: i + 1,
          slide
        });
      }

      sendEvent('progress', { step: 'Saving presentation', progress: 100 });

      const [presentation] = await db
        .insert(v2Presentations)
        .values({
          title: outlineJson.title || draft.topic,
          description: outlineJson.summary || '',
          slides: slides,
          workspaceId: workspaceId,
          createdBy: userId,
          brandId: draft.brandId || null,
          outlineDraftId: draftId,
          status: 'draft'
        })
        .returning();

      await db
        .update(v2OutlineDrafts)
        .set({
          status: 'completed',
          presentationId: presentation.id,
          completedAt: new Date()
        })
        .where(eq(v2OutlineDrafts.id, draftId));

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

// GET /api/themes
router.get('/themes', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const workspaceId = req.user?.workspaceId;

    if (!workspaceId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const themes = await db
      .select()
      .from(v2ThemeProfiles)
      .where(or(isNull(v2ThemeProfiles.workspaceId), eq(v2ThemeProfiles.workspaceId, workspaceId)))
      .orderBy(v2ThemeProfiles.category, v2ThemeProfiles.name);

    console.log('✅ Fetched themes:', themes?.length || 0);
    res.json(themes || []);

  } catch (error: any) {
    console.error('❌ Themes fetch error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch themes',
      message: error.message 
    });
  }
});

// GET /api/themes/:id
router.get('/themes/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const workspaceId = req.user?.workspaceId;

    if (!workspaceId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const [theme] = await db
      .select()
      .from(v2ThemeProfiles)
      .where(and(
        eq(v2ThemeProfiles.id, id),
        or(isNull(v2ThemeProfiles.workspaceId), eq(v2ThemeProfiles.workspaceId, workspaceId))
      ))
      .limit(1);

    if (!theme) {
      return res.status(404).json({ error: 'Theme not found' });
    }

    res.json(theme);

  } catch (error: any) {
    console.error('❌ Theme fetch error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch theme',
      message: error.message 
    });
  }
});

// POST /api/brews/analyze-content
router.post('/brews/analyze-content', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { content, options = {} } = req.body;
    const workspaceId = req.user?.workspaceId;
    const userId = req.user?.id;

    if (!workspaceId || !userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: 'Content is required' });
    }
    
    const trimmedContent = content.trim();
    if (trimmedContent.length < 50) {
      return res.status(400).json({ error: 'Content must be at least 50 characters' });
    }
    
    if (trimmedContent.length > 50000) {
      return res.status(400).json({ error: 'Content must be less than 50,000 characters' });
    }

    console.log('📝 Analyzing pasted content:', { contentLength: trimmedContent.length, options });

    const response = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 3000,
      temperature: 0.7,
      messages: [{
        role: 'user',
        content: `Analyze the following content and create a presentation outline. Extract the key structure, main points, and organize into slides.

Content to analyze:
"""
${trimmedContent.slice(0, 8000)}
"""

${options.autoDetectHeadings ? 'Detect headings from # symbols or capitalized lines.' : ''}
${options.createTitleSlide ? 'Include a title slide as the first slide.' : ''}
${options.smartFormatting ? 'Optimize bullet points and key messages for slide format.' : ''}

Return ONLY valid JSON (no markdown, no code fences) with this structure:
{
  "title": "Presentation Title (extracted or inferred)",
  "summary": "Brief summary of the content",
  "slides": [
    {
      "slideNumber": 1,
      "title": "Slide Title",
      "type": "title",
      "keyPoints": ["Tagline or subtitle"]
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
Create between 5-15 slides depending on content length.
Include 3-5 key points per content slide.
Extract the most important information from the content.`
      }]
    });

    const contentBlock = response.content[0];
    if (contentBlock.type !== 'text') {
      throw new Error('Unexpected response type from AI');
    }

    const sanitized = sanitizeJSONResponse(contentBlock.text);
    const outline = JSON.parse(sanitized);

    if (!outline.title || !outline.slides || !Array.isArray(outline.slides)) {
      throw new Error('Invalid outline structure from AI');
    }

    const [draft] = await db
      .insert(v2OutlineDrafts)
      .values({
        workspaceId,
        projectId: null,
        createdBy: userId,
        topic: `Pasted: ${outline.title}`,
        outlineJson: outline,
        sourceContent: trimmedContent.slice(0, 10000),
        currentStep: 2,
        status: 'draft'
      })
      .returning();

    console.log('✅ Content analyzed, outline draft created:', { draftId: draft.id, slideCount: outline.slides.length });

    res.json({
      success: true,
      draft,
      outline,
      draft_id: draft.id,
    });

  } catch (error: any) {
    console.error('❌ Content analysis error:', error);
    res.status(500).json({ 
      error: 'Failed to analyze content',
      message: error.message 
    });
  }
});

// POST /api/brews/import-file
router.post('/brews/import-file', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const workspaceId = req.user?.workspaceId;
    const userId = req.user?.id;

    if (!workspaceId || !userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const contentType = req.headers['content-type'] || '';
    
    if (!contentType.includes('multipart/form-data')) {
      return res.status(400).json({ error: 'Expected multipart/form-data' });
    }

    console.log('📁 Processing file import request');

    const placeholderOutline = {
      title: 'Imported Presentation',
      summary: 'Review and customize this outline based on your uploaded content',
      slides: [
        {
          slideNumber: 1,
          title: 'Title Slide',
          type: 'title',
          keyPoints: ['Add your main title and subtitle']
        },
        {
          slideNumber: 2,
          title: 'Introduction',
          type: 'content',
          keyPoints: ['Overview of your topic', 'Key objectives', 'What we will cover']
        },
        {
          slideNumber: 3,
          title: 'Main Content',
          type: 'content',
          keyPoints: ['First main point', 'Second main point', 'Third main point']
        },
        {
          slideNumber: 4,
          title: 'Details',
          type: 'content',
          keyPoints: ['Supporting detail 1', 'Supporting detail 2', 'Examples or evidence']
        },
        {
          slideNumber: 5,
          title: 'Summary & Next Steps',
          type: 'conclusion',
          keyPoints: ['Key takeaways', 'Action items', 'Questions?']
        }
      ]
    };

    const [draft] = await db
      .insert(v2OutlineDrafts)
      .values({
        workspaceId,
        projectId: null,
        createdBy: userId,
        topic: 'Imported: File Upload',
        outlineJson: placeholderOutline,
        currentStep: 2,
        status: 'draft'
      })
      .returning();

    console.log('✅ Import processed, outline draft created:', { draftId: draft.id });

    res.json({
      success: true,
      message: 'File processed. Please review and customize the outline.',
      content: 'Placeholder content - customize in the outline editor',
      outline: placeholderOutline,
      draft,
      draft_id: draft.id,
    });

  } catch (error: any) {
    console.error('❌ File import error:', error);
    res.status(500).json({ 
      error: 'Failed to import file',
      message: error.message 
    });
  }
});

export default router;
