/**
 * Manus AI Provider
 * Implementation for Manus built-in AI APIs
 */

import { AIProvider, type ChatMessage, type ChatCompletionOptions, type EmbeddingOptions } from './AIProvider';

export class ManusProvider extends AIProvider {
  private defaultChatModel = 'gemini-2.0-flash-exp';
  private defaultEmbeddingModel = 'text-embedding-3-small';

  constructor(apiUrl?: string, apiKey?: string) {
    const url = apiUrl || process.env.OPENAI_BASE_URL || process.env.BUILT_IN_FORGE_API_URL || '';
    const key = apiKey || process.env.OPENAI_API_KEY || process.env.BUILT_IN_FORGE_API_KEY || '';
    super(url, key);
  }

  getProviderName(): string {
    return 'Manus';
  }

  getSupportedModels() {
    return {
      chat: ['gemini-2.0-flash-exp', 'gpt-4o-mini', 'claude-3-5-sonnet-20241022'],
      embedding: ['text-embedding-3-small', 'text-embedding-3-large'],
    };
  }

  async generateEmbedding(text: string, options?: EmbeddingOptions): Promise<number[]> {
    try {
      const response = await fetch(`${this.apiUrl}/v1/embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: options?.model || this.defaultEmbeddingModel,
          input: text,
          encoding_format: 'float',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Manus Embeddings API error: ${error.error?.message || response.statusText}`);
      }

      const data = await response.json();
      return data.data[0].embedding;
    } catch (error) {
      console.error('[ManusProvider] Error generating embedding:', error);
      throw error;
    }
  }

  async generateEmbeddings(texts: string[], options?: EmbeddingOptions): Promise<number[][]> {
    try {
      const response = await fetch(`${this.apiUrl}/v1/embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: options?.model || this.defaultEmbeddingModel,
          input: texts,
          encoding_format: 'float',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Manus Embeddings API error: ${error.error?.message || response.statusText}`);
      }

      const data = await response.json();
      return data.data.map((item: any) => item.embedding);
    } catch (error) {
      console.error('[ManusProvider] Error generating embeddings:', error);
      throw error;
    }
  }

  async generateChatCompletion(
    messages: ChatMessage[],
    options?: ChatCompletionOptions
  ): Promise<string> {
    try {
      const response = await fetch(`${this.apiUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.defaultChatModel,
          messages,
          temperature: options?.temperature ?? 0.7,
          max_tokens: options?.maxTokens ?? 2000,
          stream: false,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Manus Chat API error: ${error.error?.message || response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('[ManusProvider] Error generating chat completion:', error);
      throw error;
    }
  }

  async *generateStreamingChatCompletion(
    messages: ChatMessage[],
    options?: ChatCompletionOptions
  ): AsyncGenerator<string, void, unknown> {
    try {
      const response = await fetch(`${this.apiUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.defaultChatModel,
          messages,
          temperature: options?.temperature ?? 0.7,
          max_tokens: options?.maxTokens ?? 2000,
          stream: true,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Manus Chat API error: ${error.error?.message || response.statusText}`);
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
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices[0]?.delta?.content;
                if (content) {
                  yield content;
                }
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      console.error('[ManusProvider] Error generating streaming chat completion:', error);
      throw error;
    }
  }
}

