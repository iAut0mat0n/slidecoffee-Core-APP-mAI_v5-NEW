/**
 * RAGService (Retrieval-Augmented Generation)
 * Generates AI responses enhanced with user memory context
 * Provider-agnostic: works with Manus, Claude, or any configured provider
 */
import { ProviderFactory } from './providers/ProviderFactory';
export class RAGService {
    vectorMemory;
    provider;
    constructor(vectorMemory, provider) {
        this.vectorMemory = vectorMemory;
        this.provider = provider || ProviderFactory.createProvider();
    }
    /**
     * Generate AI response with memory-augmented context
     */
    async generateResponse(userId, userMessage, systemPrompt, conversationHistory = []) {
        try {
            // 1. Search for relevant memories
            const relevantMemories = await this.vectorMemory.hybridSearch(userId, userMessage, 0.7, // 70% semantic similarity
            0.3, // 30% recency
            10 // Top 10 memories
            );
            // 2. Build context from memories
            const memoryContext = this.buildMemoryContext(relevantMemories);
            // 3. Construct enhanced system prompt
            const enhancedPrompt = `${systemPrompt}

## User Context (from past interactions):
${memoryContext}

Use this context to provide personalized, context-aware responses. Reference past conversations naturally when relevant.`;
            // 4. Build messages array
            const messages = [
                { role: 'system', content: enhancedPrompt },
                ...conversationHistory,
                { role: 'user', content: userMessage },
            ];
            // 5. Generate response using provider
            const response = await this.provider.generateChatCompletion(messages, {
                temperature: 0.7,
                maxTokens: 2000,
            });
            // 6. Store new memories from this interaction
            await this.storeInteractionMemories(userId, userMessage, response);
            return response;
        }
        catch (error) {
            console.error('[RAGService] Error generating response:', error);
            throw error;
        }
    }
    /**
     * Generate streaming AI response with memory-augmented context
     */
    async *generateStreamingResponse(userId, userMessage, systemPrompt, conversationHistory = []) {
        try {
            // 1. Search for relevant memories
            const relevantMemories = await this.vectorMemory.hybridSearch(userId, userMessage, 0.7, 0.3, 10);
            // 2. Build context from memories
            const memoryContext = this.buildMemoryContext(relevantMemories);
            // 3. Construct enhanced system prompt
            const enhancedPrompt = `${systemPrompt}

## User Context (from past interactions):
${memoryContext}

Use this context to provide personalized, context-aware responses. Reference past conversations naturally when relevant.`;
            // 4. Build messages array
            const messages = [
                { role: 'system', content: enhancedPrompt },
                ...conversationHistory,
                { role: 'user', content: userMessage },
            ];
            // 5. Stream response using provider
            let fullResponse = '';
            for await (const chunk of this.provider.generateStreamingChatCompletion(messages, {
                temperature: 0.7,
                maxTokens: 2000,
            })) {
                fullResponse += chunk;
                yield chunk;
            }
            // 6. Store new memories from this interaction
            await this.storeInteractionMemories(userId, userMessage, fullResponse);
        }
        catch (error) {
            console.error('[RAGService] Error generating streaming response:', error);
            throw error;
        }
    }
    /**
     * Build memory context string from relevant memories
     */
    buildMemoryContext(memories) {
        if (memories.length === 0) {
            return 'No previous context available (first interaction with this user).';
        }
        const contextParts = memories.map((memory, index) => {
            const typeLabel = memory.memory_type.replace('_', ' ');
            return `${index + 1}. [${typeLabel}] ${memory.content}`;
        });
        return contextParts.join('\n');
    }
    /**
     * Store new memories from user interaction
     */
    async storeInteractionMemories(userId, userMessage, aiResponse) {
        try {
            // Store user message as conversation memory
            await this.vectorMemory.storeMemory(userId, `User asked: ${userMessage}`, 'conversation', 0.5, { timestamp: new Date().toISOString() });
            // Extract and store insights from AI response
            // (You can enhance this with more sophisticated extraction logic)
            if (aiResponse.length > 100) {
                await this.vectorMemory.storeMemory(userId, `AI suggested: ${aiResponse.substring(0, 200)}...`, 'insight', 0.6, { timestamp: new Date().toISOString() });
            }
        }
        catch (error) {
            console.error('[RAGService] Error storing interaction memories:', error);
            // Don't throw - memory storage failures shouldn't break the conversation
        }
    }
    /**
     * Get current provider name
     */
    getProviderName() {
        return this.provider.getProviderName();
    }
}
