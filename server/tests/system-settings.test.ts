import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { createTestApp } from './test-app.js';

describe('System Settings API - Integration Tests', () => {
  let app: any;

  beforeEach(() => {
    app = createTestApp();
  });

  describe('GET /api/system/public-branding', () => {
    it('should return public branding without authentication', async () => {
      const response = await request(app).get('/api/system/public-branding');
      
      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
    });

    it('should only return whitelisted branding keys', async () => {
      const response = await request(app).get('/api/system/public-branding');
      
      if (response.status === 200) {
        const allowedKeys = ['app_logo_url', 'app_favicon_url', 'app_title'];
        const returnedKeys = Object.keys(response.body);
        
        returnedKeys.forEach(key => {
          expect(allowedKeys).toContain(key);
        });
      }
    });

    it('should enforce rate limiting after 60 requests', async () => {
      const requests = Array(65).fill(null).map(() => 
        request(app).get('/api/system/public-branding')
      );

      const responses = await Promise.all(requests);
      const rateLimited = responses.filter(r => r.status === 429);
      
      expect(rateLimited.length).toBeGreaterThan(0);
      if (rateLimited.length > 0) {
        expect(rateLimited[0].body).toHaveProperty('message');
        expect(rateLimited[0].body.message).toMatch(/too many requests/i);
      }
    }, 30000);
  });

  describe('GET /api/system/settings', () => {
    it('should require authentication', async () => {
      const response = await request(app).get('/api/system/settings');
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should require admin role', async () => {
      const response = await request(app)
        .get('/api/system/settings')
        .set('Authorization', 'Bearer test-token');
      
      expect([401, 403]).toContain(response.status);
    });
  });

  describe('POST /api/system/upload-logo - File Upload Security', () => {
    const validImageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const testAuthToken = 'test-admin-token';

    it('should reject uploads without authentication', async () => {
      const uploadData = {
        base64Image: validImageBase64,
        filename: 'test-logo.png',
        type: 'logo',
      };

      const response = await request(app)
        .post('/api/system/upload-logo')
        .send(uploadData);
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should reject uploads without admin role', async () => {
      const uploadData = {
        base64Image: validImageBase64,
        filename: 'test-logo.png',
        type: 'logo',
      };

      const response = await request(app)
        .post('/api/system/upload-logo')
        .set('Authorization', `Bearer ${testAuthToken}`)
        .send(uploadData);
      
      expect([401, 403]).toContain(response.status);
    });

    it('should reject SVG files', async () => {
      const svgBase64 = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjwvc3ZnPg==';
      
      const uploadData = {
        base64Image: svgBase64,
        filename: 'test-logo.svg',
        type: 'logo',
      };

      const response = await request(app)
        .post('/api/system/upload-logo')
        .set('Authorization', `Bearer ${testAuthToken}`)
        .send(uploadData);
      
      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/SVG|invalid|not allowed|security/i);
    });

    it('should reject files exceeding 1MB limit', async () => {
      const largeBase64 = 'data:image/png;base64,' + 'A'.repeat(2 * 1024 * 1024);
      
      const uploadData = {
        base64Image: largeBase64,
        filename: 'large-logo.png',
        type: 'logo',
      };

      const response = await request(app)
        .post('/api/system/upload-logo')
        .set('Authorization', `Bearer ${testAuthToken}`)
        .send(uploadData);
      
      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/size|1MB|limit/i);
    });

    it('should reject invalid base64 data', async () => {
      const uploadData = {
        base64Image: 'data:image/png;base64,invalid!!!',
        filename: 'test-logo.png',
        type: 'logo',
      };

      const response = await request(app)
        .post('/api/system/upload-logo')
        .set('Authorization', `Bearer ${testAuthToken}`)
        .send(uploadData);
      
      expect(response.status).toBe(400);
    });

    it('should normalize filenames to prevent path traversal', async () => {
      const maliciousFilename = '../../../etc/passwd.png';
      
      const uploadData = {
        base64Image: validImageBase64,
        filename: maliciousFilename,
        type: 'logo',
      };

      const response = await request(app)
        .post('/api/system/upload-logo')
        .set('Authorization', `Bearer ${testAuthToken}`)
        .send(uploadData);
      
      // Should either reject or normalize (not 500 error)
      expect(response.status).not.toBe(500);
    });

    it('should enforce upload rate limiting', async () => {
      const requests = Array(12).fill(null).map(() => 
        request(app)
          .post('/api/system/upload-logo')
          .set('Authorization', `Bearer ${testAuthToken}`)
          .send({
            base64Image: validImageBase64,
            filename: 'test-logo.png',
            type: 'logo',
          })
      );

      const responses = await Promise.all(requests);
      const rateLimited = responses.filter(r => r.status === 429);
      
      expect(rateLimited.length).toBeGreaterThan(0);
    }, 30000);
  });

  describe('Admin Endpoints Authorization', () => {
    it('should reject GET /api/admin/users without auth', async () => {
      const response = await request(app).get('/api/admin/users');
      
      expect(response.status).toBe(401);
    });

    it('should reject GET /api/admin/subscriptions without auth', async () => {
      const response = await request(app).get('/api/admin/subscriptions');
      
      expect(response.status).toBe(401);
    });

    it('should reject GET /api/admin/stats without auth', async () => {
      const response = await request(app).get('/api/admin/stats');
      
      expect(response.status).toBe(401);
    });
  });
});
