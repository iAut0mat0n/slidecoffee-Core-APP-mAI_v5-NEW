/**
 * EmbeddingService
 * Generates vector embeddings using configured AI provider
 * Provider-agnostic: works with Manus, Claude, or any configured provider
 */

import { ProviderFactory } from './providers/ProviderFactory';
import { AIProvider } from './providers/AIProvider';

export class EmbeddingService {
  private provider: AIProvider;
  private embeddingCache = new Map<string, number[]>();

  constructor(provider?: AIProvider) {
    this.provider = provider || ProviderFactory.createProvider();
  }

  /**
   * Generate embedding for a single text
   * @param text - Text to embed (max ~8000 tokens)
   * @returns 1536-dimensional vector
   */
  async generateEmbedding(text: string): Promise<number[]> {
    return this.provider.generateEmbedding(text);
  }

  /**
   * Generate embeddings for multiple texts in batch (more efficient)
   * @param texts - Array of texts to embed
   * @returns Array of 1536-dimensional vectors
   */
  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    return this.provider.generateEmbeddings(texts);
  }

  /**
   * Generate embedding with caching
   * Useful for frequently embedded texts
   */
  async getCachedEmbedding(text: string): Promise<number[]> {
    if (this.embeddingCache.has(text)) {
      return this.embeddingCache.get(text)!;
    }

    const embedding = await this.generateEmbedding(text);
    this.embeddingCache.set(text, embedding);
    return embedding;
  }

  /**
   * Clear embedding cache
   */
  clearCache(): void {
    this.embeddingCache.clear();
  }

  /**
   * Get current provider name
   */
  getProviderName(): string {
    return this.provider.getProviderName();
  }
}

