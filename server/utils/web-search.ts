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

    try {
      // Using DuckDuckGo HTML search (no API key required)
      const response = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`);
      const html = await response.text();

      // Parse results from HTML (basic extraction)
      const results = this.parseSearchResults(html, maxResults);

      return {
        query,
        results,
        totalResults: results.length,
        searchTime: Date.now() - startTime,
      };
    } catch (error) {
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
