// Environment configuration
// This allows the app to work on both local dev and production (Render)

const isDev = import.meta.env.DEV
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || ''

export const ENV = {
  // API Configuration
  API_BASE_URL: apiBaseUrl,
  
  // Determine if we're using Netlify Functions (local/Netlify) or direct API (Render)
  USE_NETLIFY_FUNCTIONS: apiBaseUrl.includes('netlify') || isDev,
  
  // Supabase
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  
  // App Info
  APP_NAME: 'SlideCoffee',
  IS_DEV: isDev,
} as const

// Helper to build API endpoint URLs
export function getApiUrl(endpoint: string): string {
  if (ENV.USE_NETLIFY_FUNCTIONS) {
    // Netlify Functions format: /.netlify/functions/endpoint-name
    return `/.netlify/functions/${endpoint}`
  } else {
    // Direct API format: /api/endpoint-name
    return `/api/${endpoint}`
  }
}

