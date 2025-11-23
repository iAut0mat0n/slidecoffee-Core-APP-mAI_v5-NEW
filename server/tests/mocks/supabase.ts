import { vi } from 'vitest';

export interface MockUser {
  id: string;
  email: string;
  role?: string;
  aal?: 'aal1' | 'aal2';
}

export function createMockSupabaseAuth(user: MockUser | null = null) {
  return {
    getUser: vi.fn().mockResolvedValue({
      data: user ? { user } : { user: null },
      error: user ? null : { message: 'Not authenticated' }
    }),
    mfa: {
      getAuthenticatorAssuranceLevel: vi.fn().mockResolvedValue({
        data: user?.aal ? {
          currentLevel: user.aal,
          nextLevel: user.aal === 'aal1' ? 'aal2' : 'aal2'
        } : {
          currentLevel: 'aal1',
          nextLevel: 'aal1'
        },
        error: null
      })
    }
  };
}

export function createMockSupabaseDatabase(mockData: Record<string, any> = {}) {
  const chainable = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({
      data: mockData.singleResult || null,
      error: mockData.singleError || null
    }),
    then: vi.fn().mockResolvedValue({
      data: mockData.queryResult || [],
      error: mockData.queryError || null
    })
  };

  return {
    from: vi.fn().mockReturnValue(chainable)
  };
}

export function createMockSupabaseStorage(mockData: Record<string, any> = {}) {
  return {
    from: vi.fn().mockReturnValue({
      upload: vi.fn().mockResolvedValue({
        data: mockData.uploadData || { path: 'test-path.png' },
        error: mockData.uploadError || null
      }),
      getPublicUrl: vi.fn().mockReturnValue({
        data: { publicUrl: mockData.publicUrl || 'https://test.supabase.co/storage/test.png' }
      })
    })
  };
}

export function createMockSupabaseClient(options: {
  user?: MockUser | null;
  dbData?: Record<string, any>;
  storageData?: Record<string, any>;
} = {}) {
  return {
    auth: createMockSupabaseAuth(options.user || null),
    from: createMockSupabaseDatabase(options.dbData).from,
    storage: createMockSupabaseStorage(options.storageData)
  };
}

export const mockAdminUser: MockUser = {
  id: 'admin-123',
  email: 'admin@test.com',
  role: 'admin',
  aal: 'aal2'
};

export const mockAdminUserNoMFA: MockUser = {
  id: 'admin-456',
  email: 'admin-nomfa@test.com',
  role: 'admin',
  aal: 'aal1'
};

export const mockRegularUser: MockUser = {
  id: 'user-789',
  email: 'user@test.com',
  role: 'user',
  aal: 'aal1'
};
