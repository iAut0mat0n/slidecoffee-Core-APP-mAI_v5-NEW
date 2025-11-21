// React Query hooks for API calls
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseQueryOptions } from '@tanstack/react-query';
import { systemAPI, authAPI, brandsAPI, projectsAPI, templatesAPI, workspacesAPI } from './api-client';

// System Settings Hooks
export const useSystemSettings = (options?: UseQueryOptions<Record<string, string>>) => {
  return useQuery({
    queryKey: ['system', 'settings'],
    queryFn: systemAPI.getSettings,
    ...options,
  });
};

export const useUploadLogo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: systemAPI.uploadLogo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system', 'settings'] });
    },
  });
};

// Auth Hooks
export const useAuth = (options?: UseQueryOptions<{ user: any } | null>) => {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authAPI.me,
    ...options,
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authAPI.logout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
  });
};

// Brands Hooks
export const useBrands = (options?: UseQueryOptions<any[]>) => {
  return useQuery({
    queryKey: ['brands'],
    queryFn: brandsAPI.list,
    ...options,
  });
};

export const useBrand = (id: string, options?: UseQueryOptions<any>) => {
  return useQuery({
    queryKey: ['brands', id],
    queryFn: () => brandsAPI.get(id),
    enabled: !!id,
    ...options,
  });
};

export const useCreateBrand = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: brandsAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
    },
  });
};

export const useUpdateBrand = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => brandsAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
    },
  });
};

export const useDeleteBrand = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: brandsAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
    },
  });
};

// Projects Hooks
export const useProjects = (options?: UseQueryOptions<any[]>) => {
  return useQuery({
    queryKey: ['projects'],
    queryFn: projectsAPI.list,
    ...options,
  });
};

export const useProject = (id: string, options?: UseQueryOptions<any>) => {
  return useQuery({
    queryKey: ['projects', id],
    queryFn: () => projectsAPI.get(id),
    enabled: !!id,
    ...options,
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: projectsAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => projectsAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: projectsAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};

// Templates Hooks
export const useTemplates = (options?: UseQueryOptions<any[]>) => {
  return useQuery({
    queryKey: ['templates'],
    queryFn: templatesAPI.list,
    ...options,
  });
};

export const useTemplate = (id: string, options?: UseQueryOptions<any>) => {
  return useQuery({
    queryKey: ['templates', id],
    queryFn: () => templatesAPI.get(id),
    enabled: !!id,
    ...options,
  });
};

// Workspaces Hooks
export const useWorkspaces = (options?: UseQueryOptions<any[]>) => {
  return useQuery({
    queryKey: ['workspaces'],
    queryFn: workspacesAPI.list,
    ...options,
  });
};

export const useCreateWorkspace = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: workspacesAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
  });
};

