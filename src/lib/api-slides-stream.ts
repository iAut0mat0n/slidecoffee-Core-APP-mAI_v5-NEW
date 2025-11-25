/**
 * Streaming Slide Generation API Client
 * 
 * Handles Server-Sent Events (SSE) for real-time slide generation
 */

function getApiUrl(endpoint: string): string {
  if (import.meta.env.PROD) {
    return `/api/${endpoint}`;
  }
  return `http://localhost:3001/api/${endpoint}`;
}

export interface StreamEvent {
  type: 'start' | 'research_start' | 'research_source' | 'research_complete' | 'research_error' |
        'outline_start' | 'outline_complete' | 'slide_start' | 'slide_generated' | 
        'slides_complete' | 'complete' | 'error';
  message?: string;
  url?: string;
  title?: string;
  snippet?: string;
  sourceCount?: number;
  outline?: any;
  slideNumber?: number;
  totalSlides?: number;
  slide?: any;
  progress?: number;
  slideCount?: number;
  presentation?: {
    id: string;
    title: string;
    slideCount: number;
  };
  sources?: Array<{ url: string; title: string }>;
}

export interface StreamOptions {
  topic?: string;
  presentationPlan?: any;
  brand?: any;
  enableResearch?: boolean;
  projectId?: string;
  brandId?: string;
}

/**
 * Stream slide generation with real-time events
 * 
 * Events flow:
 * 1. start - Generation begins
 * 2. research_start - Research phase starts
 * 3. research_source - Each source found (with url, title, snippet)
 * 4. research_complete - Research done
 * 5. outline_start - Outline creation starts
 * 6. outline_complete - Outline ready (with full outline data)
 * 7. slide_start - Slide generation starts
 * 8. slide_generated - Each slide generated (with slide data, progress)
 * 9. slides_complete - All slides done
 * 10. complete - Presentation saved to database
 * 11. error - Something went wrong
 */
export async function* streamSlideGeneration(
  options: StreamOptions
): AsyncGenerator<StreamEvent, void, unknown> {
  // Get auth token from localStorage (Supabase session)
  let token = null;
  
  // Try v1 format first
  const sessionV1 = localStorage.getItem('supabase.auth.token');
  if (sessionV1) {
    try {
      token = JSON.parse(sessionV1)?.access_token;
    } catch (e) {
      console.error('Failed to parse v1 Supabase token:', e);
    }
  }
  
  // Fallback to v2 format (sb-<project>-auth-token)
  if (!token) {
    const authKeys = Object.keys(localStorage).filter(key => 
      key.startsWith('sb-') && key.endsWith('-auth-token')
    );
    
    if (authKeys.length > 0) {
      try {
        const sessionV2 = localStorage.getItem(authKeys[0]);
        if (sessionV2) {
          const parsed = JSON.parse(sessionV2);
          token = parsed?.access_token || parsed?.currentSession?.access_token;
        }
      } catch (e) {
        console.error('Failed to parse v2 Supabase token:', e);
      }
    }
  }

  const response = await fetch(getApiUrl('generate-slides-stream'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
    body: JSON.stringify(options),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to generate slides');
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('No response body');
  }

  const decoder = new TextDecoder();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter((line) => line.trim() !== '');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          try {
            const event: StreamEvent = JSON.parse(data);
            yield event;
          } catch (e) {
            console.error('Failed to parse SSE data:', e);
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
