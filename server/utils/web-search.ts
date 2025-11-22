/**
 * Web Search Utility for AI Research Capabilities
 * Provides web search functionality for the AI agent
 */

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  relevance?: number;
}

export interface SearchResponse {
  query: string;
  results: SearchResult[];
  totalResults: number;
  searchTime: number;
}

export class WebSearchService {
  private apiKey: string;
  private searchEndpoint: string;

  constructor() {
    // Using DuckDuckGo HTML API (no key required) or can integrate with Serper/Brave/etc
    this.apiKey = process.env.SEARCH_API_KEY || '';
    this.searchEndpoint = process.env.SEARCH_API_ENDPOINT || 'https://html.duckduckgo.com/html/';
  }

  /**
   * Perform web search
   */
  async search(query: string, maxResults: number = 5): Promise<SearchResponse> {
    const startTime = Date.now();

    // Input validation
    if (!query || typeof query !== 'string') {
      throw new Error('Invalid search query');
    }

    // Limit query length to prevent abuse
    if (query.length > 500) {
      throw new Error('Search query too long (max 500 characters)');
    }

    // Sanitize query to prevent injection attacks
    const sanitizedQuery = query.replace(/[<>]/g, '').trim();
    
    if (!sanitizedQuery) {
      throw new Error('Invalid search query after sanitization');
    }

    // Limit max results to prevent resource exhaustion
    const safeMaxResults = Math.min(Math.max(1, maxResults), 10);

    try {
      // Using DuckDuckGo HTML search with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(
        `https://html.duckduckgo.com/html/?q=${encodeURIComponent(sanitizedQuery)}`,
        { 
          signal: controller.signal,
          headers: {
            'User-Agent': 'SlideCoffee/1.0 (AI Research Bot)',
          }
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Search service returned ${response.status}`);
      }

      const html = await response.text();

      // Limit HTML size to prevent memory issues
      if (html.length > 1000000) { // 1MB limit
        console.warn('[WebSearch] Response too large, truncating');
      }

      // Parse results from HTML (basic extraction)
      const results = this.parseSearchResults(html, safeMaxResults);

      return {
        query: sanitizedQuery,
        results,
        totalResults: results.length,
        searchTime: Date.now() - startTime,
      };
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('[WebSearch] Search timeout');
        throw new Error('Search request timed out');
      }
      console.error('[WebSearch] Search error:', error);
      throw new Error('Failed to perform web search');
    }
  }

  /**
   * Parse search results from DuckDuckGo HTML
   */
  private parseSearchResults(html: string, maxResults: number): SearchResult[] {
    const results: SearchResult[] = [];
    
    // Basic regex-based parsing (can be improved with cheerio/jsdom if needed)
    const resultRegex = /<a class="result__a" href="([^"]+)">([^<]+)<\/a>[\s\S]*?<a class="result__snippet"[^>]*>([^<]+)<\/a>/g;
    
    let match;
    let count = 0;
    
    while ((match = resultRegex.exec(html)) !== null && count < maxResults) {
      results.push({
        url: this.decodeUrl(match[1]),
        title: this.cleanText(match[2]),
        snippet: this.cleanText(match[3]),
      });
      count++;
    }

    return results;
  }

  /**
   * Decode DuckDuckGo redirect URL
   */
  private decodeUrl(url: string): string {
    try {
      const match = url.match(/uddg=([^&]+)/);
      if (match) {
        return decodeURIComponent(match[1]);
      }
      return url;
    } catch {
      return url;
    }
  }

  /**
   * Clean HTML entities and extra whitespace
   */
  private cleanText(text: string): string {
    return text
      .replace(/&quot;/g, '"')
      .replace(/&#x27;/g, "'")
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Format search results for AI consumption
   */
  formatForAI(searchResponse: SearchResponse): string {
    let formatted = `## Web Search Results for: "${searchResponse.query}"\n\n`;
    formatted += `Found ${searchResponse.totalResults} results in ${searchResponse.searchTime}ms\n\n`;

    searchResponse.results.forEach((result, index) => {
      formatted += `### Result ${index + 1}: ${result.title}\n`;
      formatted += `**URL:** ${result.url}\n`;
      formatted += `**Summary:** ${result.snippet}\n\n`;
    });

    return formatted;
  }
}

export const webSearch = new WebSearchService();
