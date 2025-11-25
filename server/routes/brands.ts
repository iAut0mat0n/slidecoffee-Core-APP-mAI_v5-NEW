import { Router, Response } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { validateLength, MAX_LENGTHS } from '../utils/validation.js';
import { db } from '../db.js';
import { v2Brands } from '../../shared/schema.js';
import { eq, desc, and, sql } from 'drizzle-orm';

const router = Router();

router.get('/brands', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const workspaceId = req.user?.workspaceId;
    if (!workspaceId) {
      return res.status(401).json({ message: 'Workspace not found' });
    }

    const brands = await db
      .select()
      .from(v2Brands)
      .where(eq(v2Brands.workspaceId, workspaceId))
      .orderBy(desc(v2Brands.createdAt));

    res.json(brands);
  } catch (error: any) {
    console.error('Failed to fetch brands:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch brands' });
  }
});

router.get('/brands/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const workspaceId = req.user?.workspaceId;
    if (!workspaceId) {
      return res.status(401).json({ message: 'Workspace not found' });
    }

    const [brand] = await db
      .select()
      .from(v2Brands)
      .where(and(
        eq(v2Brands.id, req.params.id),
        eq(v2Brands.workspaceId, workspaceId)
      ))
      .limit(1);

    if (!brand) {
      return res.status(404).json({ message: 'Brand not found' });
    }

    res.json(brand);
  } catch (error: any) {
    console.error('Failed to fetch brand:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch brand' });
  }
});

router.post('/brands', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const workspaceId = req.user?.workspaceId;
    if (!workspaceId) {
      return res.status(401).json({ message: 'Workspace not found' });
    }

    const userPlan = req.user?.plan || 'espresso';

    const nameError = validateLength(req.body.name, 'Brand name', MAX_LENGTHS.BRAND_NAME, 1);
    if (nameError) {
      return res.status(400).json({ error: nameError.message });
    }

    if (userPlan === 'espresso') {
      const brandCount = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(v2Brands)
        .where(eq(v2Brands.workspaceId, workspaceId));

      const count = brandCount[0]?.count || 0;
      if (count >= 1) {
        return res.status(403).json({
          error: 'Brand limit reached',
          message: 'Free plan limited to 1 brand. Upgrade to create more brands.',
          limit: 1,
          current: count,
          upgradeRequired: true,
        });
      }
    }

    const [newBrand] = await db
      .insert(v2Brands)
      .values({
        workspaceId,
        name: req.body.name,
        primaryColor: req.body.primaryColor || req.body.primary_color || '#7C3AED',
        secondaryColor: req.body.secondaryColor || req.body.secondary_color || '#6EE7B7',
        accentColor: req.body.accentColor || req.body.accent_color || '#FFE5E5',
        fontHeading: req.body.fontHeading || req.body.font_heading || 'Inter',
        fontBody: req.body.fontBody || req.body.font_body || 'Inter',
        logoUrl: req.body.logoUrl || req.body.logo_url,
        guidelines: req.body.guidelines,
      })
      .returning();

    res.status(201).json(newBrand);
  } catch (error: any) {
    console.error('Failed to create brand:', error);
    res.status(500).json({ message: error.message || 'Failed to create brand' });
  }
});

router.put('/brands/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const workspaceId = req.user?.workspaceId;
    if (!workspaceId) {
      return res.status(401).json({ message: 'Workspace not found' });
    }

    const updateData: any = {};
    if (req.body.name !== undefined) updateData.name = req.body.name;
    if (req.body.primaryColor !== undefined || req.body.primary_color !== undefined) 
      updateData.primaryColor = req.body.primaryColor || req.body.primary_color;
    if (req.body.secondaryColor !== undefined || req.body.secondary_color !== undefined) 
      updateData.secondaryColor = req.body.secondaryColor || req.body.secondary_color;
    if (req.body.accentColor !== undefined || req.body.accent_color !== undefined) 
      updateData.accentColor = req.body.accentColor || req.body.accent_color;
    if (req.body.fontHeading !== undefined || req.body.font_heading !== undefined) 
      updateData.fontHeading = req.body.fontHeading || req.body.font_heading;
    if (req.body.fontBody !== undefined || req.body.font_body !== undefined) 
      updateData.fontBody = req.body.fontBody || req.body.font_body;
    if (req.body.logoUrl !== undefined || req.body.logo_url !== undefined) 
      updateData.logoUrl = req.body.logoUrl || req.body.logo_url;
    if (req.body.guidelines !== undefined) updateData.guidelines = req.body.guidelines;
    
    updateData.updatedAt = new Date();

    const [updatedBrand] = await db
      .update(v2Brands)
      .set(updateData)
      .where(and(
        eq(v2Brands.id, req.params.id),
        eq(v2Brands.workspaceId, workspaceId)
      ))
      .returning();

    if (!updatedBrand) {
      return res.status(404).json({ message: 'Brand not found' });
    }

    res.json(updatedBrand);
  } catch (error: any) {
    console.error('Failed to update brand:', error);
    res.status(500).json({ message: error.message || 'Failed to update brand' });
  }
});

router.delete('/brands/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const workspaceId = req.user?.workspaceId;
    if (!workspaceId) {
      return res.status(401).json({ message: 'Workspace not found' });
    }

    const result = await db
      .delete(v2Brands)
      .where(and(
        eq(v2Brands.id, req.params.id),
        eq(v2Brands.workspaceId, workspaceId)
      ))
      .returning();

    if (result.length === 0) {
      return res.status(404).json({ message: 'Brand not found' });
    }

    res.status(204).send();
  } catch (error: any) {
    console.error('Failed to delete brand:', error);
    res.status(500).json({ message: error.message || 'Failed to delete brand' });
  }
});

export const brandsRouter = router;
