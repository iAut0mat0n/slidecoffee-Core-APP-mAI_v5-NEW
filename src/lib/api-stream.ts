/**
 * Streaming API for AI chat with memory integration
 */
import { getApiUrl } from '../config/env'

export interface StreamEvent {
  type: 'start' | 'chunk' | 'done' | 'error';
  content?: string;
  fullResponse?: string;
  error?: string;
}

export async function* streamChatMessage(
  messages: Array<{ role: string; content: string }>,
  userId: string,
  presentationContext?: any,
  options?: {
    workspaceId?: string;
    enableResearch?: boolean;
  }
): AsyncGenerator<StreamEvent, void, unknown> {
  // Get auth token from localStorage (Supabase session)
  const session = localStorage.getItem('supabase.auth.token');
  const token = session ? JSON.parse(session)?.access_token : null;

  const response = await fetch(getApiUrl('ai-chat-stream'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
    body: JSON.stringify({
      messages,
      presentationContext,
      enableResearch: options?.enableResearch ?? true, // Enable research by default
      // SECURITY NOTE: userId and workspaceId are derived from auth token on backend
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to send message');
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

/**
 * Non-streaming fallback (for compatibility)
 */
export async function sendChatMessageWithMemory(
  messages: Array<{ role: string; content: string }>,
  userId: string,
  presentationContext?: any,
  options?: {
    workspaceId?: string;
    enableResearch?: boolean;
  }
): Promise<string> {
  let fullResponse = '';

  for await (const event of streamChatMessage(messages, userId, presentationContext, options)) {
    if (event.type === 'chunk' && event.content) {
      fullResponse += event.content;
    } else if (event.type === 'done' && event.fullResponse) {
      fullResponse = event.fullResponse;
    } else if (event.type === 'error') {
      throw new Error(event.error || 'Unknown error');
    }
  }

  return fullResponse;
}

