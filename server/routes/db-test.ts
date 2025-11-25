import { Router, Response } from 'express';
import { db } from '../db.js';
import { v2Users, v2Workspaces, v2ThemeProfiles } from '../../shared/schema.js';
import { count } from 'drizzle-orm';

const router = Router();

router.get('/db-test', async (_req, res: Response) => {
  try {
    const [userCount] = await db.select({ count: count() }).from(v2Users);
    const [workspaceCount] = await db.select({ count: count() }).from(v2Workspaces);
    const [themeCount] = await db.select({ count: count() }).from(v2ThemeProfiles);
    
    res.json({
      success: true,
      message: 'Drizzle connection working!',
      counts: {
        users: userCount?.count || 0,
        workspaces: workspaceCount?.count || 0,
        themes: themeCount?.count || 0,
      }
    });
  } catch (error: any) {
    console.error('❌ Database test failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export { router as dbTestRouter };
