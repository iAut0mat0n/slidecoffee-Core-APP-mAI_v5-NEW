/**
 * AI Provider Interface
 * Defines the contract for all AI providers (Manus, Claude, OpenAI, etc.)
 * Enables easy switching between providers via configuration
 */

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionOptions {
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface EmbeddingOptions {
  model?: string;
}

/**
 * Abstract AI Provider
 * All providers must implement these methods
 */
export abstract class AIProvider {
  protected apiUrl: string;
  protected apiKey: string;

  constructor(apiUrl: string, apiKey: string) {
    this.apiUrl = apiUrl;
    this.apiKey = apiKey;
  }

  /**
   * Generate text embedding (vector representation)
   * @param text - Text to embed
   * @param options - Provider-specific options
   * @returns 1536-dimensional vector
   */
  abstract generateEmbedding(text: string, options?: EmbeddingOptions): Promise<number[]>;

  /**
   * Generate embeddings for multiple texts
   * @param texts - Array of texts to embed
   * @param options - Provider-specific options
   * @returns Array of 1536-dimensional vectors
   */
  abstract generateEmbeddings(texts: string[], options?: EmbeddingOptions): Promise<number[][]>;

  /**
   * Generate chat completion (non-streaming)
   * @param messages - Conversation messages
   * @param options - Completion options
   * @returns AI response text
   */
  abstract generateChatCompletion(
    messages: ChatMessage[],
    options?: ChatCompletionOptions
  ): Promise<string>;

  /**
   * Generate streaming chat completion
   * @param messages - Conversation messages
   * @param options - Completion options
   * @returns Async generator yielding text chunks
   */
  abstract generateStreamingChatCompletion(
    messages: ChatMessage[],
    options?: ChatCompletionOptions
  ): AsyncGenerator<string, void, unknown>;

  /**
   * Get provider name
   */
  abstract getProviderName(): string;

  /**
   * Get supported models
   */
  abstract getSupportedModels(): {
    chat: string[];
    embedding: string[];
  };
}

