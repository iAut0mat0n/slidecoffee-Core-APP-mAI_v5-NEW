import { vi, beforeEach } from 'vitest';

process.env.NODE_ENV = 'test';
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
process.env.SUPABASE_ANON_KEY = 'test-anon-key';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.REQUIRE_ADMIN_MFA = 'false';

export const mockSupabaseState = {
  user: null as any,
  dbData: {} as Record<string, any>,
  storageData: {} as Record<string, any>,
};

beforeEach(() => {
  mockSupabaseState.user = null;
  mockSupabaseState.dbData = {};
  mockSupabaseState.storageData = {};
});

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn((table: string) => {
      const chainable = {
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        upsert: vi.fn().mockReturnThis(),
        eq: vi.fn((column: string, value: any) => {
          // Handle v2_users lookup by id
          if (table === 'v2_users' && column === 'id' && mockSupabaseState.user) {
            mockSupabaseState.dbData[table] = { single: mockSupabaseState.user };
          }
          return chainable;
        }),
        in: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockSupabaseState.dbData[table]?.single || mockSupabaseState.user || null,
          error: mockSupabaseState.dbData[table]?.singleError || null,
        }),
      };
      
      (chainable as any).then = vi.fn((resolve: any) => {
        return Promise.resolve({
          data: mockSupabaseState.dbData[table]?.data || [],
          error: mockSupabaseState.dbData[table]?.error || null,
        }).then(resolve);
      });
      
      return chainable;
    }),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(() => Promise.resolve({
          data: mockSupabaseState.storageData.uploadData || { path: 'test/path.png' },
          error: mockSupabaseState.storageData.uploadError || null,
        })),
        getPublicUrl: vi.fn(() => ({
          data: { publicUrl: mockSupabaseState.storageData.publicUrl || 'https://test.supabase.co/storage/test.png' },
        })),
      })),
    },
    auth: {
      getUser: vi.fn(() => Promise.resolve({
        data: mockSupabaseState.user ? { user: mockSupabaseState.user } : { user: null },
        error: mockSupabaseState.user ? null : { message: 'Not authenticated' },
      })),
      mfa: {
        getAuthenticatorAssuranceLevel: vi.fn(() => Promise.resolve({
          data: mockSupabaseState.user?.aal ? {
            currentLevel: mockSupabaseState.user.aal,
            nextLevel: mockSupabaseState.user.aal === 'aal1' ? 'aal2' : 'aal2',
          } : {
            currentLevel: 'aal1',
            nextLevel: 'aal1',
          },
          error: null,
        })),
      },
    },
  })),
}));
