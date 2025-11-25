import { Router, Response } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { generateAllTemplates, TEMPLATE_CONFIGS } from '../utils/pptx-generator.js';
import path from 'path';
import fs from 'fs';

const router = Router();

const TEMPLATES_DIR = path.join(process.cwd(), 'public', 'templates');

router.get('/templates', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const templates = TEMPLATE_CONFIGS.map((config, index) => ({
      id: `template-${index + 1}`,
      name: config.name,
      category: config.category,
      description: config.description,
      slideCount: config.slides.length,
      fileName: config.name.toLowerCase().replace(/\s+/g, '-') + '.pptx',
      colors: config.colors
    }));

    res.json(templates);
  } catch (error: any) {
    console.error('❌ Failed to list templates:', error);
    res.status(500).json({ error: 'Failed to list templates' });
  }
});

router.get('/templates/categories', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const categoryMap = new Map<string, number>();
    
    for (const config of TEMPLATE_CONFIGS) {
      const count = categoryMap.get(config.category) || 0;
      categoryMap.set(config.category, count + 1);
    }

    const categories = Array.from(categoryMap.entries()).map(([name, count]) => ({
      name,
      count
    }));

    res.json(categories);
  } catch (error: any) {
    console.error('❌ Failed to list categories:', error);
    res.status(500).json({ error: 'Failed to list categories' });
  }
});

router.get('/templates/:id/download', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const templateIndex = parseInt(id.replace('template-', '')) - 1;
    
    if (templateIndex < 0 || templateIndex >= TEMPLATE_CONFIGS.length) {
      return res.status(404).json({ error: 'Template not found' });
    }

    const config = TEMPLATE_CONFIGS[templateIndex];
    const fileName = config.name.toLowerCase().replace(/\s+/g, '-') + '.pptx';
    const filePath = path.join(TEMPLATES_DIR, fileName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Template file not found. Please generate templates first.' });
    }

    res.download(filePath, fileName);
  } catch (error: any) {
    console.error('❌ Failed to download template:', error);
    res.status(500).json({ error: 'Failed to download template' });
  }
});

router.post('/templates/generate-all', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;

    if (role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    console.log('🚀 Starting template generation...');
    const generatedFiles = await generateAllTemplates(TEMPLATES_DIR);
    
    console.log(`✅ Generated ${generatedFiles.length} templates`);

    res.json({
      success: true,
      message: `Generated ${generatedFiles.length} templates`,
      files: generatedFiles
    });
  } catch (error: any) {
    console.error('❌ Template generation failed:', error);
    res.status(500).json({ error: 'Failed to generate templates' });
  }
});

export default router;
