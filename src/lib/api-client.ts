// API Client for Express backend
import { supabase } from './supabase';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export class APIError extends Error {
  status: number;
  
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'APIError';
  }
}

async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Get current Supabase session to include access token in requests
  const { data: { session } } = await supabase.auth.getSession();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options?.headers as Record<string, string>,
  };
  
  // Add Authorization header if session exists
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }
  
  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new APIError(response.status, error.message || 'An error occurred');
  }

  return response.json();
}

// System Settings API
export const systemAPI = {
  // Public branding - no auth required (logo, favicon, title only)
  getSettings: () => fetchAPI<Record<string, string>>('/system/public-branding'),
  
  uploadLogo: (data: { base64Image: string; filename: string }) =>
    fetchAPI<{ logoUrl: string }>('/system/upload-logo', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Auth API
export const authAPI = {
  me: () => fetchAPI<{ user: any } | null>('/auth/me'),
  logout: () => fetchAPI<{ success: boolean }>('/auth/logout', { method: 'POST' }),
};

// Brands API
export const brandsAPI = {
  list: () => fetchAPI<any[]>('/brands'),
  get: (id: string) => fetchAPI<any>(`/brands/${id}`),
  create: (data: any) => fetchAPI<any>('/brands', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => fetchAPI<any>(`/brands/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => fetchAPI<void>(`/brands/${id}`, {
    method: 'DELETE',
  }),
};

// Projects API
export const projectsAPI = {
  list: () => fetchAPI<any[]>('/projects'),
  get: (id: string) => fetchAPI<any>(`/projects/${id}`),
  create: (data: any) => fetchAPI<any>('/projects', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => fetchAPI<any>(`/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => fetchAPI<void>(`/projects/${id}`, {
    method: 'DELETE',
  }),
};

// Templates API
export const templatesAPI = {
  list: () => fetchAPI<any[]>('/templates'),
  get: (id: string) => fetchAPI<any>(`/templates/${id}`),
};

// Workspaces API
export const workspacesAPI = {
  list: () => fetchAPI<any[]>('/workspaces'),
  create: (data: any) => fetchAPI<any>('/workspaces', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

// Admin API
export const adminAPI = {
  getUsers: () => fetchAPI<any[]>('/admin/users'),
  getSubscriptions: () => fetchAPI<any[]>('/admin/subscriptions'),
  getStats: () => fetchAPI<any>('/admin/stats'),
  updateUserRole: (userId: string, role: string) => fetchAPI<any>(`/admin/users/${userId}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
  }),
  updateAISettings: (settingId: string, data: { api_key?: string; model?: string; config?: any }) => 
    fetchAPI<any>(`/admin/ai-settings/${settingId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  uploadLogo: (base64Image: string, filename: string, type: 'logo' | 'favicon') =>
    fetchAPI<{ logoUrl?: string; faviconUrl?: string }>('/system/upload-logo', {
      method: 'POST',
      body: JSON.stringify({ base64Image, filename, type }),
    }),
};

