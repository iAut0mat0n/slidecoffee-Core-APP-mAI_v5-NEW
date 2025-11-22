/**
 * AI Provider Factory
 * Creates the appropriate AI provider based on environment configuration
 * Prioritizes Claude (Haiku) as the primary AI provider
 */

import { AIProvider } from './AIProvider';
import { ManusProvider } from './ManusProvider';
import { ClaudeProvider } from './ClaudeProvider';

export type ProviderType = 'claude' | 'manus';

export class ProviderFactory {
  /**
   * Create AI provider based on environment variable
   * Defaults to Claude (Haiku) as the primary provider
   */
  static createProvider(providerType?: ProviderType): AIProvider {
    const type = providerType || (process.env.AI_PROVIDER as ProviderType) || 'claude';

    switch (type) {
      case 'claude':
        return new ClaudeProvider();
      
      case 'manus':
        return new ManusProvider();
      
      default:
        return new ClaudeProvider(); // Default to Claude
    }
  }

  /**
   * Get current provider type from environment
   */
  static getCurrentProviderType(): ProviderType {
    return (process.env.AI_PROVIDER as ProviderType) || 'claude';
  }

  /**
   * Check if a provider is available (has required API keys)
   */
  static isProviderAvailable(providerType: ProviderType): boolean {
    switch (providerType) {
      case 'claude':
        return !!(process.env.ANTHROPIC_API_KEY && process.env.VOYAGE_API_KEY);
      
      case 'manus':
        return !!(
          (process.env.OPENAI_API_KEY && process.env.OPENAI_BASE_URL) ||
          (process.env.BUILT_IN_FORGE_API_KEY && process.env.BUILT_IN_FORGE_API_URL)
        );
      
      default:
        return false;
    }
  }

  /**
   * Get all available providers (Claude prioritized first)
   */
  static getAvailableProviders(): ProviderType[] {
    const providers: ProviderType[] = [];
    
    // Claude is checked first as it's the primary provider
    if (this.isProviderAvailable('claude')) {
      providers.push('claude');
    }
    
    if (this.isProviderAvailable('manus')) {
      providers.push('manus');
    }
    
    return providers;
  }
}

