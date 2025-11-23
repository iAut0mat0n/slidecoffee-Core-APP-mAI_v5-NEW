import { vi } from 'vitest';

process.env.NODE_ENV = 'test';
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
process.env.SUPABASE_ANON_KEY = 'test-anon-key';
process.env.JWT_SECRET = 'test-jwt-secret';

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        in: vi.fn(() => Promise.resolve({ data: [], error: null })),
        eq: vi.fn(() => Promise.resolve({ data: null, error: null })),
        single: vi.fn(() => Promise.resolve({ data: null, error: null })),
      })),
      upsert: vi.fn(() => Promise.resolve({ error: null })),
    })),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(() => Promise.resolve({ data: { path: 'test/path.png' }, error: null })),
        getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'https://test.supabase.co/storage/v1/object/public/assets/test/path.png' } })),
      })),
    },
    auth: {
      getUser: vi.fn(() => Promise.resolve({
        data: { user: { id: 'test-user-id', email: 'test@example.com' } },
        error: null,
      })),
      mfa: {
        getAuthenticatorAssuranceLevel: vi.fn(() => Promise.resolve({
          data: { currentLevel: 'aal2', nextLevel: 'aal2' },
          error: null,
        })),
      },
    },
  })),
}));
