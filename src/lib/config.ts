export const config = {
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || '',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  },
  manus: {
    apiUrl: import.meta.env.VITE_MANUS_API_URL || '',
    apiKey: import.meta.env.VITE_MANUS_API_KEY || '',
  },
  app: {
    name: 'SlideCoffee',
    url: import.meta.env.VITE_APP_URL || 'http://localhost:5173',
  },
}

