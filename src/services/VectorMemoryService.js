/**
 * VectorMemoryService
 * Stores and retrieves user memories using vector embeddings
 * Enables semantic search and personalized AI responses
 */
import { createClient } from '@supabase/supabase-js';
import { EmbeddingService } from './EmbeddingService';
export class VectorMemoryService {
    supabase;
    embeddingService;
    constructor(supabaseUrl, supabaseKey) {
        this.supabase = createClient(supabaseUrl, supabaseKey);
        this.embeddingService = new EmbeddingService();
    }
    /**
     * Store a new memory with vector embedding
     */
    async storeMemory(userId, content, memoryType, importanceScore = 0.5, metadata = {}) {
        try {
            // Generate embedding
            const embedding = await this.embeddingService.generateEmbedding(content);
            // Store in database
            const { data, error } = await this.supabase
                .from('memories')
                .insert({
                user_id: userId,
                content,
                embedding,
                memory_type: memoryType,
                importance_score: importanceScore,
                metadata,
            })
                .select()
                .single();
            if (error) {
                console.error('[VectorMemory] Error storing memory:', error);
                return null;
            }
            return data;
        }
        catch (error) {
            console.error('[VectorMemory] Exception storing memory:', error);
            return null;
        }
    }
    /**
     * Search for relevant memories using semantic similarity
     */
    async searchMemories(userId, query, limit = 10, memoryTypes) {
        try {
            // Generate query embedding
            const queryEmbedding = await this.embeddingService.generateEmbedding(query);
            // Build query
            let queryBuilder = this.supabase
                .from('memories')
                .select('*')
                .eq('user_id', userId);
            // Filter by memory types if specified
            if (memoryTypes && memoryTypes.length > 0) {
                queryBuilder = queryBuilder.in('memory_type', memoryTypes);
            }
            // Perform vector similarity search using pgvector
            // Note: We'll use RPC function for proper vector search
            const { data, error } = await this.supabase.rpc('match_memories', {
                query_embedding: queryEmbedding,
                match_user_id: userId,
                match_threshold: 0.5,
                match_count: limit,
            });
            if (error) {
                console.error('[VectorMemory] Error searching memories:', error);
                return [];
            }
            // Update access tracking
            if (data && data.length > 0) {
                await this.updateAccessTracking(data.map((m) => m.id));
            }
            return data || [];
        }
        catch (error) {
            console.error('[VectorMemory] Exception searching memories:', error);
            return [];
        }
    }
    /**
     * Get recent memories (time-based)
     */
    async getRecentMemories(userId, limit = 20) {
        try {
            const { data, error } = await this.supabase
                .from('memories')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(limit);
            if (error) {
                console.error('[VectorMemory] Error getting recent memories:', error);
                return [];
            }
            return data || [];
        }
        catch (error) {
            console.error('[VectorMemory] Exception getting recent memories:', error);
            return [];
        }
    }
    /**
     * Hybrid search: Combine semantic similarity + recency
     */
    async hybridSearch(userId, query, semanticWeight = 0.7, recencyWeight = 0.3, limit = 10) {
        try {
            // Get semantic matches
            const semanticResults = await this.searchMemories(userId, query, limit * 2);
            // Get recent memories
            const recentResults = await this.getRecentMemories(userId, limit * 2);
            // Combine and score
            const combined = this.combineResults(semanticResults, recentResults, semanticWeight, recencyWeight);
            return combined.slice(0, limit);
        }
        catch (error) {
            console.error('[VectorMemory] Exception in hybrid search:', error);
            return [];
        }
    }
    /**
     * Combine semantic and recency results with weighted scoring
     */
    combineResults(semanticResults, recentResults, semanticWeight, recencyWeight) {
        const scoreMap = new Map();
        // Score semantic results
        semanticResults.forEach((memory, index) => {
            const semanticScore = (semanticResults.length - index) / semanticResults.length;
            scoreMap.set(memory.id, {
                memory,
                score: semanticScore * semanticWeight,
            });
        });
        // Add recency scores
        recentResults.forEach((memory, index) => {
            const recencyScore = (recentResults.length - index) / recentResults.length;
            const existing = scoreMap.get(memory.id);
            if (existing) {
                existing.score += recencyScore * recencyWeight;
            }
            else {
                scoreMap.set(memory.id, {
                    memory,
                    score: recencyScore * recencyWeight,
                });
            }
        });
        // Sort by combined score
        return Array.from(scoreMap.values())
            .sort((a, b) => b.score - a.score)
            .map((item) => item.memory);
    }
    /**
     * Update access tracking for memory reinforcement
     */
    async updateAccessTracking(memoryIds) {
        try {
            await this.supabase
                .from('memories')
                .update({
                last_accessed_at: new Date().toISOString(),
            })
                .in('id', memoryIds);
        }
        catch (error) {
            console.error('[VectorMemory] Error updating access tracking:', error);
        }
    }
    /**
     * Delete old, low-importance memories (memory pruning)
     */
    async pruneOldMemories(userId, retentionDays = 90) {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
            const { data, error } = await this.supabase
                .from('memories')
                .delete()
                .eq('user_id', userId)
                .lt('created_at', cutoffDate.toISOString())
                .lt('importance_score', 0.3)
                .lt('access_count', 2)
                .select();
            if (error) {
                console.error('[VectorMemory] Error pruning memories:', error);
                return 0;
            }
            return data?.length || 0;
        }
        catch (error) {
            console.error('[VectorMemory] Exception pruning memories:', error);
            return 0;
        }
    }
}
