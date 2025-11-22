import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export interface ActiveAIProvider {
  provider: 'manus' | 'claude' | 'claude-haiku' | 'gpt4';
  apiKey: string;
  apiUrl: string;
  model: string;
  config: any;
}

export async function getActiveAIProvider(): Promise<ActiveAIProvider> {
  try {
    const { data, error } = await supabase
      .from('v2_ai_settings')
      .select('*')
      .eq('is_active', true)
      .single();

    if (error || !data) {
      // Fallback to environment variables if no active provider in database
      return getFallbackProvider();
    }

    return {
      provider: data.provider,
      apiKey: data.api_key || getFallbackApiKey(data.provider),
      apiUrl: getProviderUrl(data.provider),
      model: data.model || getDefaultModel(data.provider),
      config: data.config || {},
    };
  } catch (error) {
    console.error('Error fetching active AI provider:', error);
    return getFallbackProvider();
  }
}

function getFallbackProvider(): ActiveAIProvider {
  // Check if OpenAI/Manus is configured
  if (process.env.OPENAI_API_KEY || process.env.BUILT_IN_FORGE_API_KEY) {
    return {
      provider: 'manus',
      apiKey: process.env.OPENAI_API_KEY || process.env.BUILT_IN_FORGE_API_KEY || '',
      apiUrl: process.env.OPENAI_BASE_URL || process.env.BUILT_IN_FORGE_API_URL || 'https://api.openai.com/v1',
      model: 'gemini-2.0-flash-exp',
      config: {},
    };
  }

  // Check if Claude is configured
  if (process.env.ANTHROPIC_API_KEY) {
    return {
      provider: 'claude',
      apiKey: process.env.ANTHROPIC_API_KEY,
      apiUrl: 'https://api.anthropic.com',
      model: 'claude-3-5-sonnet-20241022',
      config: {},
    };
  }

  // Default to Manus even if not configured (will fail gracefully)
  return {
    provider: 'manus',
    apiKey: '',
    apiUrl: '',
    model: 'gemini-2.0-flash-exp',
    config: {},
  };
}

function getFallbackApiKey(provider: string): string {
  switch (provider) {
    case 'manus':
      return process.env.OPENAI_API_KEY || process.env.BUILT_IN_FORGE_API_KEY || '';
    case 'claude':
    case 'claude-haiku':
      return process.env.ANTHROPIC_API_KEY || '';
    case 'gpt4':
      return process.env.OPENAI_API_KEY || '';
    default:
      return '';
  }
}

function getProviderUrl(provider: string): string {
  switch (provider) {
    case 'manus':
      return process.env.OPENAI_BASE_URL || process.env.BUILT_IN_FORGE_API_URL || 'https://api.openai.com/v1';
    case 'claude':
    case 'claude-haiku':
      return 'https://api.anthropic.com';
    case 'gpt4':
      return 'https://api.openai.com/v1';
    default:
      return '';
  }
}

function getDefaultModel(provider: string): string {
  switch (provider) {
    case 'manus':
      return 'gemini-2.0-flash-exp';
    case 'claude':
      return 'claude-3-5-sonnet-20241022';
    case 'claude-haiku':
      return 'claude-3-5-haiku-20241022';
    case 'gpt4':
      return 'gpt-4-turbo';
    default:
      return '';
  }
}
