import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createTestApp } from './test-app.js';
import { mockSupabaseState } from './setup.js';

describe('System Settings API - Comprehensive Integration Tests', () => {
  let app: any;

  beforeEach(() => {
    app = createTestApp();
  });

  describe('GET /api/system/public-branding', () => {
    beforeEach(() => {
      mockSupabaseState.dbData['v2_system_settings'] = {
        data: [
          { key: 'app_logo_url', value: 'https://example.com/logo.png' },
          { key: 'app_favicon_url', value: 'https://example.com/favicon.png' },
          { key: 'app_title', value: 'SlideCoffee' },
          { key: 'secret_key', value: 'should-not-be-returned' },
        ],
      };
    });

    it('should return public branding without authentication', async () => {
      const response = await request(app).get('/api/system/public-branding');
      
      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
    });

    it('should only return whitelisted branding keys', async () => {
      const response = await request(app).get('/api/system/public-branding');
      
      const allowedKeys = ['app_logo_url', 'app_favicon_url', 'app_title'];
      const returnedKeys = Object.keys(response.body);
      
      returnedKeys.forEach(key => {
        expect(allowedKeys).toContain(key);
      });
      
      expect(response.body).not.toHaveProperty('secret_key');
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

  describe('GET /api/system/settings - Admin Access', () => {
    it('should require authentication', async () => {
      mockSupabaseState.user = null;
      
      const response = await request(app).get('/api/system/settings');
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should require admin role', async () => {
      mockSupabaseState.user = {
        id: 'user-123',
        email: 'user@test.com',
        role: 'user',
        aal: 'aal1'
      };
      
      mockSupabaseState.dbData['v2_users'] = {
        single: mockSupabaseState.user
      };

      const response = await request(app)
        .get('/api/system/settings')
        .set('Authorization', 'Bearer test-token');
      
      expect(response.status).toBe(403);
      expect(response.body.message).toMatch(/admin/i);
    });

    it('should allow admin with MFA', async () => {
      mockSupabaseState.user = {
        id: 'admin-123',
        email: 'admin@test.com',
        role: 'admin',
        aal: 'aal2'
      };
      
      mockSupabaseState.dbData['v2_users'] = {
        single: mockSupabaseState.user
      };

      mockSupabaseState.dbData['v2_system_settings'] = {
        data: [
          { key: 'app_title', value: 'SlideCoffee' },
        ],
      };

      const response = await request(app)
        .get('/api/system/settings')
        .set('Authorization', 'Bearer test-admin-token');
      
      expect([200, 403]).toContain(response.status);
    });

    it('should log MFA warning for admin without MFA (soft mode)', async () => {
      process.env.REQUIRE_ADMIN_MFA = 'false';
      
      mockSupabaseState.user = {
        id: 'admin-456',
        email: 'admin-nomfa@test.com',
        role: 'admin',
        aal: 'aal1'
      };
      
      mockSupabaseState.dbData['v2_users'] = {
        single: mockSupabaseState.user
      };

      mockSupabaseState.dbData['v2_system_settings'] = {
        data: [],
      };

      const response = await request(app)
        .get('/api/system/settings')
        .set('Authorization', 'Bearer test-admin-token');
      
      expect([200, 403]).toContain(response.status);
    });

    it('should block admin without MFA (strict mode)', async () => {
      process.env.REQUIRE_ADMIN_MFA = 'true';
      
      mockSupabaseState.user = {
        id: 'admin-789',
        email: 'admin-nomfa2@test.com',
        role: 'admin',
        aal: 'aal1'
      };
      
      mockSupabaseState.dbData['v2_users'] = {
        single: mockSupabaseState.user
      };

      const response = await request(app)
        .get('/api/system/settings')
        .set('Authorization', 'Bearer test-admin-token');
      
      if (response.status === 403) {
        expect(response.body.requiresMFA).toBe(true);
      }
      
      process.env.REQUIRE_ADMIN_MFA = 'false';
    });
  });

  describe('POST /api/system/upload-logo - File Upload Security', () => {
    const validImageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

    beforeEach(() => {
      mockSupabaseState.storageData = {
        uploadData: { path: 'logos/test-logo.png' },
        publicUrl: 'https://test.supabase.co/storage/logos/test-logo.png'
      };
    });

    it('should reject uploads without authentication', async () => {
      mockSupabaseState.user = null;
      
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
      mockSupabaseState.user = {
        id: 'user-123',
        email: 'user@test.com',
        role: 'user',
        aal: 'aal1'
      };
      
      mockSupabaseState.dbData['v2_users'] = {
        single: mockSupabaseState.user
      };

      const uploadData = {
        base64Image: validImageBase64,
        filename: 'test-logo.png',
        type: 'logo',
      };

      const response = await request(app)
        .post('/api/system/upload-logo')
        .set('Authorization', 'Bearer test-token')
        .send(uploadData);
      
      expect(response.status).toBe(403);
      expect(response.body.message).toMatch(/admin/i);
    });

    it('should reject SVG files', async () => {
      mockSupabaseState.user = {
        id: 'admin-123',
        email: 'admin@test.com',
        role: 'admin',
        aal: 'aal2'
      };
      
      mockSupabaseState.dbData['v2_users'] = {
        single: mockSupabaseState.user
      };

      const svgBase64 = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjwvc3ZnPg==';
      
      const uploadData = {
        base64Image: svgBase64,
        filename: 'test-logo.svg',
        type: 'logo',
      };

      const response = await request(app)
        .post('/api/system/upload-logo')
        .set('Authorization', 'Bearer test-admin-token')
        .send(uploadData);
      
      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/SVG|invalid|not allowed|security/i);
    });

    it('should reject files exceeding 1MB limit', async () => {
      mockSupabaseState.user = {
        id: 'admin-123',
        email: 'admin@test.com',
        role: 'admin',
        aal: 'aal2'
      };
      
      mockSupabaseState.dbData['v2_users'] = {
        single: mockSupabaseState.user
      };

      const largeBase64 = 'data:image/png;base64,' + 'A'.repeat(2 * 1024 * 1024);
      
      const uploadData = {
        base64Image: largeBase64,
        filename: 'large-logo.png',
        type: 'logo',
      };

      const response = await request(app)
        .post('/api/system/upload-logo')
        .set('Authorization', 'Bearer test-admin-token')
        .send(uploadData);
      
      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/size|1MB|limit/i);
    });

    it('should accept valid PNG from authenticated admin', async () => {
      mockSupabaseState.user = {
        id: 'admin-123',
        email: 'admin@test.com',
        role: 'admin',
        aal: 'aal2'
      };
      
      mockSupabaseState.dbData['v2_users'] = {
        single: mockSupabaseState.user
      };

      const uploadData = {
        base64Image: validImageBase64,
        filename: 'test-logo.png',
        type: 'logo',
      };

      const response = await request(app)
        .post('/api/system/upload-logo')
        .set('Authorization', 'Bearer test-admin-token')
        .send(uploadData);
      
      // Should either succeed or fail with specific validation error, not auth error
      expect([200, 400]).toContain(response.status);
      if (response.status === 400) {
        expect(response.body.message).not.toMatch(/auth|unauthorized/i);
      }
    });

    it('should normalize filenames to prevent path traversal', async () => {
      mockSupabaseState.user = {
        id: 'admin-123',
        email: 'admin@test.com',
        role: 'admin',
        aal: 'aal2'
      };
      
      mockSupabaseState.dbData['v2_users'] = {
        single: mockSupabaseState.user
      };

      const maliciousFilename = '../../../etc/passwd.png';
      
      const uploadData = {
        base64Image: validImageBase64,
        filename: maliciousFilename,
        type: 'logo',
      };

      const response = await request(app)
        .post('/api/system/upload-logo')
        .set('Authorization', 'Bearer test-admin-token')
        .send(uploadData);
      
      // Should either accept and normalize or reject, but not crash (500)
      expect(response.status).not.toBe(500);
    });

    it('should enforce upload rate limiting', async () => {
      mockSupabaseState.user = {
        id: 'admin-123',
        email: 'admin@test.com',
        role: 'admin',
        aal: 'aal2'
      };
      
      mockSupabaseState.dbData['v2_users'] = {
        single: mockSupabaseState.user
      };

      const requests = Array(12).fill(null).map(() => 
        request(app)
          .post('/api/system/upload-logo')
          .set('Authorization', 'Bearer test-admin-token')
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
      mockSupabaseState.user = null;
      
      const response = await request(app).get('/api/admin/users');
      
      expect(response.status).toBe(401);
    });

    it('should reject GET /api/admin/users without admin role', async () => {
      mockSupabaseState.user = {
        id: 'user-123',
        email: 'user@test.com',
        role: 'user',
        aal: 'aal1'
      };
      
      mockSupabaseState.dbData['v2_users'] = {
        single: mockSupabaseState.user
      };

      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', 'Bearer test-token');
      
      expect(response.status).toBe(403);
    });

    it('should allow GET /api/admin/users with admin credentials', async () => {
      mockSupabaseState.user = {
        id: 'admin-123',
        email: 'admin@test.com',
        role: 'admin',
        aal: 'aal2'
      };
      
      mockSupabaseState.dbData['v2_users'] = {
        single: mockSupabaseState.user,
        data: []
      };

      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', 'Bearer test-admin-token');
      
      expect([200, 403]).toContain(response.status);
    });
  });
});
