/**
 * AI Provider Factory
 * Creates the appropriate AI provider based on environment configuration
 * Allows easy switching between Manus, Claude, and other providers
 */

import { AIProvider } from './AIProvider';
import { ManusProvider } from './ManusProvider';
import { ClaudeProvider } from './ClaudeProvider';

export type ProviderType = 'manus' | 'claude';

export class ProviderFactory {
  /**
   * Create AI provider based on environment variable
   * Defaults to Manus if not specified
   */
  static createProvider(providerType?: ProviderType): AIProvider {
    const type = providerType || (process.env.AI_PROVIDER as ProviderType) || 'manus';

    switch (type) {
      case 'claude':
        return new ClaudeProvider();
      
      case 'manus':
      default:
        return new ManusProvider();
    }
  }

  /**
   * Get current provider type from environment
   */
  static getCurrentProviderType(): ProviderType {
    return (process.env.AI_PROVIDER as ProviderType) || 'manus';
  }

  /**
   * Check if a provider is available (has required API keys)
   */
  static isProviderAvailable(providerType: ProviderType): boolean {
    switch (providerType) {
      case 'manus':
        return !!(process.env.BUILT_IN_FORGE_API_KEY && process.env.BUILT_IN_FORGE_API_URL);
      
      case 'claude':
        return !!(process.env.ANTHROPIC_API_KEY && process.env.VOYAGE_API_KEY);
      
      default:
        return false;
    }
  }

  /**
   * Get all available providers
   */
  static getAvailableProviders(): ProviderType[] {
    const providers: ProviderType[] = [];
    
    if (this.isProviderAvailable('manus')) {
      providers.push('manus');
    }
    
    if (this.isProviderAvailable('claude')) {
      providers.push('claude');
    }
    
    return providers;
  }
}

