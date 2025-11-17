/**
 * RAGService (Retrieval-Augmented Generation)
 * Generates AI responses enhanced with user memory context
 * Makes AI truly personalized and context-aware
 */

import { VectorMemoryService, Memory } from './VectorMemoryService';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export class RAGService {
  private vectorMemory: VectorMemoryService;
  private openaiApiKey: string;
  private apiUrl: string = 'https://api.openai.com/v1/chat/completions';

  constructor(vectorMemory: VectorMemoryService, openaiApiKey: string) {
    this.vectorMemory = vectorMemory;
    this.openaiApiKey = openaiApiKey;
  }

  /**
   * Generate AI response with memory-augmented context
   */
  async generateResponse(
    userId: string,
    userMessage: string,
    systemPrompt: string,
    conversationHistory: ChatMessage[] = []
  ): Promise<string> {
    try {
      // 1. Search for relevant memories
      const relevantMemories = await this.vectorMemory.hybridSearch(
        userId,
        userMessage,
        0.7, // 70% semantic similarity
        0.3, // 30% recency
        10   // Top 10 memories
      );

      // 2. Build context from memories
      const memoryContext = this.buildMemoryContext(relevantMemories);

      // 3. Construct enhanced system prompt
      const enhancedPrompt = `${systemPrompt}

## User Context (from past interactions):
${memoryContext}

Use this context to provide personalized, context-aware responses. Reference past conversations naturally when relevant.`;

      // 4. Build messages array
      const messages: ChatMessage[] = [
        { role: 'system', content: enhancedPrompt },
        ...conversationHistory,
        { role: 'user', content: userMessage },
      ];

      // 5. Generate response
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openaiApiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages,
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0].message.content || '';

      // 6. Store this interaction as a memory
      await this.vectorMemory.storeMemory(
        userId,
        `User: ${userMessage}\nAI: ${aiResponse}`,
        'conversation',
        0.5,
        {
          user_message: userMessage,
          ai_response: aiResponse,
          timestamp: new Date().toISOString(),
        }
      );

      return aiResponse;
    } catch (error) {
      console.error('[RAGService] Error generating response:', error);
      throw error;
    }
  }

  /**
   * Generate streaming response with memory context
   */
  async *generateStreamingResponse(
    userId: string,
    userMessage: string,
    systemPrompt: string,
    conversationHistory: ChatMessage[] = []
  ): AsyncGenerator<string, void, unknown> {
    try {
      // 1. Search for relevant memories
      const relevantMemories = await this.vectorMemory.hybridSearch(
        userId,
        userMessage,
        0.7,
        0.3,
        10
      );

      // 2. Build context from memories
      const memoryContext = this.buildMemoryContext(relevantMemories);

      // 3. Construct enhanced system prompt
      const enhancedPrompt = `${systemPrompt}

## User Context (from past interactions):
${memoryContext}

Use this context to provide personalized, context-aware responses.`;

      // 4. Build messages array
      const messages: ChatMessage[] = [
        { role: 'system', content: enhancedPrompt },
        ...conversationHistory,
        { role: 'user', content: userMessage },
      ];

      // 5. Generate streaming response
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openaiApiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages,
          temperature: 0.7,
          max_tokens: 1000,
          stream: true,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let fullResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter((line) => line.trim() !== '');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content;
              if (content) {
                fullResponse += content;
                yield content;
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }

      // 6. Store the complete interaction as a memory
      await this.vectorMemory.storeMemory(
        userId,
        `User: ${userMessage}\nAI: ${fullResponse}`,
        'conversation',
        0.5,
        {
          user_message: userMessage,
          ai_response: fullResponse,
          timestamp: new Date().toISOString(),
        }
      );
    } catch (error) {
      console.error('[RAGService] Error in streaming response:', error);
      throw error;
    }
  }

  /**
   * Build readable context from memories
   */
  private buildMemoryContext(memories: Memory[]): string {
    if (memories.length === 0) {
      return 'This is a new user. No previous context available.';
    }

    const grouped = this.groupByType(memories);
    const sections: string[] = [];

    // Preferences
    if (grouped.preference && grouped.preference.length > 0) {
      sections.push(`**User Preferences**: ${grouped.preference.map((m) => m.content).join('; ')}`);
    }

    // Design Preferences
    if (grouped.design_preference && grouped.design_preference.length > 0) {
      sections.push(`**Design Preferences**: ${grouped.design_preference.map((m) => m.content).join('; ')}`);
    }

    // Presentation Topics
    if (grouped.presentation_topic && grouped.presentation_topic.length > 0) {
      sections.push(`**Past Presentation Topics**: ${grouped.presentation_topic.map((m) => m.content).join('; ')}`);
    }

    // Goals
    if (grouped.goal && grouped.goal.length > 0) {
      sections.push(`**User Goals**: ${grouped.goal.map((m) => m.content).join('; ')}`);
    }

    // Recent Conversations
    if (grouped.conversation && grouped.conversation.length > 0) {
      const recent = grouped.conversation.slice(0, 3);
      sections.push(`**Recent Conversations**: ${recent.map((m) => m.content.substring(0, 150) + '...').join(' | ')}`);
    }

    // Insights
    if (grouped.insight && grouped.insight.length > 0) {
      sections.push(`**Key Insights**: ${grouped.insight.map((m) => m.content).join('; ')}`);
    }

    return sections.join('\n\n');
  }

  /**
   * Group memories by type
   */
  private groupByType(memories: Memory[]): Record<string, Memory[]> {
    return memories.reduce((acc, memory) => {
      if (!acc[memory.memory_type]) {
        acc[memory.memory_type] = [];
      }
      acc[memory.memory_type].push(memory);
      return acc;
    }, {} as Record<string, Memory[]>);
  }

  /**
   * Extract insights from conversation using LLM
   */
  async extractInsights(
    userId: string,
    conversation: string
  ): Promise<Memory[]> {
    try {
      const prompt = `Analyze this conversation and extract key insights about the user:

Conversation:
${conversation}

Extract:
1. User preferences (things they like/dislike about presentations)
2. Design preferences (colors, fonts, styles mentioned)
3. Presentation topics they're interested in
4. Goals they mentioned
5. Important insights about their work or industry

Return as JSON array with format: [{"content": "...", "type": "preference|design_preference|presentation_topic|goal|insight", "importance": 0-1}]

Only extract meaningful, specific insights. Skip generic statements.`;

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openaiApiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
          response_format: { type: 'json_object' },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to extract insights');
      }

      const data = await response.json();
      const insights = JSON.parse(data.choices[0].message.content || '{"insights": []}');

      // Store each insight as a memory
      const memories: Memory[] = [];
      for (const insight of insights.insights || []) {
        const memory = await this.vectorMemory.storeMemory(
          userId,
          insight.content,
          insight.type,
          insight.importance || 0.7,
          { extracted_at: new Date().toISOString() }
        );
        if (memory) {
          memories.push(memory);
        }
      }

      return memories;
    } catch (error) {
      console.error('[RAGService] Error extracting insights:', error);
      return [];
    }
  }
}

