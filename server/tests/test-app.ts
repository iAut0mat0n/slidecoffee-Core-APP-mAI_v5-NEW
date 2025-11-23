import express from 'express';
import cors from 'cors';
import { systemSettingsRouter } from '../routes/system-settings.js';
import { adminRouter } from '../routes/admin.js';

export function createTestApp() {
  const app = express();
  
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  
  app.use('/api', systemSettingsRouter);
  app.use('/api', adminRouter);
  
  return app;
}
