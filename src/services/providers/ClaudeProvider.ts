/**
 * Claude AI Provider
 * Implementation for Anthropic Claude API
 * Note: Claude doesn't provide embeddings, so we use Voyage AI for embeddings
 */

import { AIProvider, type ChatMessage, type ChatCompletionOptions, type EmbeddingOptions } from './AIProvider';

export class ClaudeProvider extends AIProvider {
  private defaultChatModel = 'claude-haiku-4-5'; // Primary model: Claude Haiku 4.5 (Latest, fastest)
  private voyageApiKey: string;

  constructor(apiKey?: string, voyageApiKey?: string) {
    const key = apiKey || process.env.ANTHROPIC_API_KEY || '';
    super('https://api.anthropic.com', key);
    this.voyageApiKey = voyageApiKey || process.env.VOYAGE_API_KEY || '';
  }

  getProviderName(): string {
    return 'Claude';
  }

  getSupportedModels() {
    return {
      chat: [
        'claude-haiku-4-5', // Primary: Fastest & most efficient (Oct 2025)
        'claude-haiku-4-5-20251001', // Pinned snapshot
        'claude-3-5-sonnet-20241022', // Alternative: Higher quality
        'claude-3-5-haiku-20241022', // Legacy: Previous version
      ],
      embedding: ['voyage-3', 'voyage-3-lite'], // Via Voyage AI
    };
  }

  /**
   * Generate embedding using Voyage AI (Claude doesn't provide embeddings)
   */
  async generateEmbedding(text: string, options?: EmbeddingOptions): Promise<number[]> {
    try {
      const response = await fetch('https://api.voyageai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.voyageApiKey}`,
        },
        body: JSON.stringify({
          model: options?.model || 'voyage-3',
          input: text,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Voyage AI error: ${error.error?.message || response.statusText}`);
      }

      const data = await response.json();
      return data.data[0].embedding;
    } catch (error) {
      console.error('[ClaudeProvider] Error generating embedding:', error);
      throw error;
    }
  }

  async generateEmbeddings(texts: string[], options?: EmbeddingOptions): Promise<number[][]> {
    try {
      const response = await fetch('https://api.voyageai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.voyageApiKey}`,
        },
        body: JSON.stringify({
          model: options?.model || 'voyage-3',
          input: texts,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Voyage AI error: ${error.error?.message || response.statusText}`);
      }

      const data = await response.json();
      return data.data.map((item: any) => item.embedding);
    } catch (error) {
      console.error('[ClaudeProvider] Error generating embeddings:', error);
      throw error;
    }
  }

  async generateChatCompletion(
    messages: ChatMessage[],
    options?: ChatCompletionOptions
  ): Promise<string> {
    try {
      // Extract system message if present
      const systemMessage = messages.find((m) => m.role === 'system');
      const conversationMessages = messages.filter((m) => m.role !== 'system');

      const response = await fetch(`${this.apiUrl}/v1/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: this.defaultChatModel,
          max_tokens: options?.maxTokens ?? 2000,
          temperature: options?.temperature ?? 0.7,
          system: systemMessage?.content,
          messages: conversationMessages.map((m) => ({
            role: m.role === 'assistant' ? 'assistant' : 'user',
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Claude API error: ${error.error?.message || response.statusText}`);
      }

      const data = await response.json();
      return data.content[0]?.text || '';
    } catch (error) {
      console.error('[ClaudeProvider] Error generating chat completion:', error);
      throw error;
    }
  }

  async *generateStreamingChatCompletion(
    messages: ChatMessage[],
    options?: ChatCompletionOptions
  ): AsyncGenerator<string, void, unknown> {
    try {
      // Extract system message if present
      const systemMessage = messages.find((m) => m.role === 'system');
      const conversationMessages = messages.filter((m) => m.role !== 'system');

      const response = await fetch(`${this.apiUrl}/v1/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: this.defaultChatModel,
          max_tokens: options?.maxTokens ?? 2000,
          temperature: options?.temperature ?? 0.7,
          system: systemMessage?.content,
          messages: conversationMessages.map((m) => ({
            role: m.role === 'assistant' ? 'assistant' : 'user',
            content: m.content,
          })),
          stream: true,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Claude API error: ${error.error?.message || response.statusText}`);
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
                const parsed = JSON.parse(data);
                if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
                  yield parsed.delta.text;
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
      console.error('[ClaudeProvider] Error generating streaming chat completion:', error);
      throw error;
    }
  }
}

