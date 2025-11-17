/**
 * EmbeddingService
 * Generates vector embeddings using OpenAI's text-embedding-3-small model
 * Cost: ~$0.02 per 1M tokens (~750K words)
 */

export class EmbeddingService {
  private apiKey: string;
  private apiUrl: string = 'https://api.openai.com/v1/embeddings';
  private model: string = 'text-embedding-3-small';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Generate embedding for a single text
   * @param text - Text to embed (max ~8000 tokens)
   * @returns 1536-dimensional vector
   */
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          input: text,
          encoding_format: 'float',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
      }

      const data = await response.json();
      return data.data[0].embedding;
    } catch (error) {
      console.error('[EmbeddingService] Error generating embedding:', error);
      throw error;
    }
  }

  /**
   * Generate embeddings for multiple texts in batch (more efficient)
   * @param texts - Array of texts to embed
   * @returns Array of 1536-dimensional vectors
   */
  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          input: texts,
          encoding_format: 'float',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
      }

      const data = await response.json();
      return data.data.map((item: any) => item.embedding);
    } catch (error) {
      console.error('[EmbeddingService] Error generating embeddings:', error);
      throw error;
    }
  }

  /**
   * Generate embedding with caching
   * Useful for frequently embedded texts
   */
  private embeddingCache = new Map<string, number[]>();

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
}

