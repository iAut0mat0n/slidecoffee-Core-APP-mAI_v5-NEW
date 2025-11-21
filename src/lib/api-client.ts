// API Client for Express backend

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export class APIError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'APIError';
  }
}

async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
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
  getSettings: () => fetchAPI<Record<string, string>>('/system/settings'),
  
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

