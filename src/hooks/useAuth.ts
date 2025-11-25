import { useQuery } from "@tanstack/react-query";

async function fetchUser() {
  const response = await fetch('/api/auth/me', {
    credentials: 'include', // Include cookies for session
  });
  
  if (!response.ok) {
    if (response.status === 401) {
      return null; // Not authenticated
    }
    throw new Error('Failed to fetch user');
  }
  
  const data = await response.json();
  return data.user || null;
}

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: fetchUser,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
  };
}
