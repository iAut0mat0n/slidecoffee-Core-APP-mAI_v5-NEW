/**
 * AI Provider Abstraction Layer
 * 
 * This module provides a unified interface for AI providers (Manus, Claude, OpenAI, etc.)
 * allowing easy switching between providers without changing application code.
 * 
 * Architecture:
 * - Provider interface defines standard methods
 * - Each provider implements the interface
 * - Factory function returns the configured provider
 * - Application code uses only the interface, never direct provider calls
 */

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIGenerationOptions {
  messages: AIMessage[];
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

export interface AIGenerationResult {
  content: string;
  tokensUsed: number;
  model: string;
  provider: string;
}

export interface AIProvider {
  name: string;
  generateText(options: AIGenerationOptions): Promise<AIGenerationResult>;
  chat(messages: AIMessage[]): Promise<AIGenerationResult>;
  estimateCredits(options: AIGenerationOptions): number;
}

/**
 * Manus AI Provider
 * Uses the built-in Manus API for AI generation
 */
class ManusProvider implements AIProvider {
  name = 'manus';

  async generateText(options: AIGenerationOptions): Promise<AIGenerationResult> {
    const { invokeLLM } = await import('../_core/llm');
    
    const response = await invokeLLM({
      messages: options.messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
      max_tokens: options.maxTokens,
    });

    const messageContent = response.choices[0]?.message?.content;
    const content = typeof messageContent === 'string' ? messageContent : '';
    const tokensUsed = response.usage?.total_tokens || 0;

    return {
      content,
      tokensUsed,
      model: response.model || 'unknown',
      provider: 'manus',
    };
  }

  async chat(messages: AIMessage[]): Promise<AIGenerationResult> {
    return this.generateText({ messages });
  }

  estimateCredits(options: AIGenerationOptions): number {
    // Estimate based on message length
    const totalChars = options.messages.reduce((sum, msg) => sum + msg.content.length, 0);
    // Rough estimate: 1 credit per 100 characters
    return Math.ceil(totalChars / 100);
  }
}

/**
 * Claude AI Provider (Anthropic)
 * For future use when we want to use Claude directly
 */
class ClaudeProvider implements AIProvider {
  name = 'claude';
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateText(options: AIGenerationOptions): Promise<AIGenerationResult> {
    // Implementation would use Anthropic SDK
    // For now, throw error as it's not implemented
    throw new Error('Claude provider not yet implemented. Use Manus provider instead.');
    
    // Future implementation:
    // const Anthropic = require('@anthropic-ai/sdk');
    // const anthropic = new Anthropic({ apiKey: this.apiKey });
    // const response = await anthropic.messages.create({
    //   model: options.model || 'claude-3-5-sonnet-20241022',
    //   max_tokens: options.maxTokens || 4096,
    //   messages: options.messages,
    // });
    // return {
    //   content: response.content[0].text,
    //   tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
    //   model: response.model,
    //   provider: 'claude',
    // };
  }

  async chat(messages: AIMessage[]): Promise<AIGenerationResult> {
    return this.generateText({ messages });
  }

  estimateCredits(options: AIGenerationOptions): number {
    const totalChars = options.messages.reduce((sum, msg) => sum + msg.content.length, 0);
    return Math.ceil(totalChars / 100);
  }
}

/**
 * OpenAI Provider
 * For future use when we want to use OpenAI directly
 */
class OpenAIProvider implements AIProvider {
  name = 'openai';
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateText(options: AIGenerationOptions): Promise<AIGenerationResult> {
    throw new Error('OpenAI provider not yet implemented. Use Manus provider instead.');
    
    // Future implementation:
    // const OpenAI = require('openai');
    // const openai = new OpenAI({ apiKey: this.apiKey });
    // const response = await openai.chat.completions.create({
    //   model: options.model || 'gpt-4',
    //   messages: options.messages,
    //   temperature: options.temperature,
    //   max_tokens: options.maxTokens,
    // });
    // return {
    //   content: response.choices[0].message.content || '',
    //   tokensUsed: response.usage?.total_tokens || 0,
    //   model: response.model,
    //   provider: 'openai',
    // };
  }

   async chat(messages: AIMessage[]): Promise<AIGenerationResult> {
    return this.generateText({ messages });
  }

  estimateCredits(options: AIGenerationOptions): number {
    const totalChars = options.messages.reduce((sum, msg) => sum + msg.content.length, 0);
    return Math.ceil(totalChars / 100);
  }
}

/**
 * Factory function to get the configured AI providerder based on environment variables
 */
export function getAIProvider(): AIProvider {
  const providerName = process.env.AI_PROVIDER || 'manus';

  switch (providerName.toLowerCase()) {
    case 'manus':
      return new ManusProvider();
    
    case 'claude':
      const claudeKey = process.env.ANTHROPIC_API_KEY;
      if (!claudeKey) {
        console.warn('[AI Provider] Claude selected but ANTHROPIC_API_KEY not set. Falling back to Manus.');
        return new ManusProvider();
      }
      return new ClaudeProvider(claudeKey);
    
    case 'openai':
      const openaiKey = process.env.OPENAI_API_KEY;
      if (!openaiKey) {
        console.warn('[AI Provider] OpenAI selected but OPENAI_API_KEY not set. Falling back to Manus.');
        return new ManusProvider();
      }
      return new OpenAIProvider(openaiKey);
    
    default:
      console.warn(`[AI Provider] Unknown provider "${providerName}". Falling back to Manus.`);
      return new ManusProvider();
  }
}

/**
 * Convenience function for generating text
 * Uses the default configured provider
 */
export async function generateAIText(options: AIGenerationOptions): Promise<AIGenerationResult> {
  const provider = getAIProvider();
  return provider.generateText(options);
}

/**
 * Convenience function for estimating credits
 * Uses the default configured provider
 */
export function estimateAICredits(options: AIGenerationOptions): number {
  const provider = getAIProvider();
  return provider.estimateCredits(options);
}

