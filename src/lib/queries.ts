// React Query hooks for API calls
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseQueryOptions } from '@tanstack/react-query';
import { systemAPI, authAPI, brandsAPI, projectsAPI, templatesAPI, workspacesAPI, brewsAPI, themesAPI } from './api-client';

// Type definitions
interface Project {
  id: string;
  name: string;
  description?: string;
  workspace_id: string;
  brand_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

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
  return useMutation<Project, Error, any>({
    mutationFn: async (data: any): Promise<Project> => {
      try {
        // Call API
        const result = await projectsAPI.create(data);
        
        // Check for error response pattern {error, message}
        if (result && (result as any).error) {
          const errorMsg = (result as any).message || 'Project creation failed';
          console.error('❌ API returned error:', result);
          throw new Error(errorMsg);
        }
        
        // Handle both direct response and {data, error} wrapper
        // Backend returns data directly, but defensively handle both patterns
        const project = (result as any)?.data || result;
        
        // Validate we have a proper project object with ID
        if (!project || typeof project !== 'object' || !project.id) {
          console.error('❌ Invalid project response:', result);
          throw new Error('Project creation did not return valid data');
        }
        
        // Type-safe validation: ensure required fields exist
        if (!project.workspace_id) {
          console.error('❌ Project missing workspace_id:', project);
          throw new Error('Project creation returned incomplete data');
        }
        
        console.log('✅ useCreateProject: validated and returning clean project:', {
          id: project.id,
          name: project.name,
          workspace_id: project.workspace_id,
          brand_id: project.brand_id
        });
        
        return project;
      } catch (error: any) {
        console.error('❌ useCreateProject error:', error);
        // Re-throw with clear message
        throw new Error(error.message || 'Failed to create project');
      }
    },
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

// Brews Hooks (Gamma-style workflow)
export const useGenerateOutline = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: brewsAPI.generateOutline,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outline-drafts'] });
    },
  });
};

export const useOutlineDraft = (id: string, options?: UseQueryOptions<any>) => {
  return useQuery({
    queryKey: ['outline-drafts', id],
    queryFn: () => brewsAPI.getOutlineDraft(id),
    enabled: !!id,
    ...options,
  });
};

export const useUpdateOutlineDraft = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { outline_structure: any } }) =>
      brewsAPI.updateOutlineDraft(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outline-drafts'] });
    },
  });
};

export const useDeleteOutlineDraft = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: brewsAPI.deleteOutlineDraft,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outline-drafts'] });
    },
  });
};

// Themes Hooks
export const useThemes = (options?: UseQueryOptions<any[]>) => {
  return useQuery({
    queryKey: ['themes'],
    queryFn: themesAPI.list,
    ...options,
  });
};

export const useTheme = (id: string, options?: UseQueryOptions<any>) => {
  return useQuery({
    queryKey: ['themes', id],
    queryFn: () => themesAPI.get(id),
    enabled: !!id,
    ...options,
  });
};
