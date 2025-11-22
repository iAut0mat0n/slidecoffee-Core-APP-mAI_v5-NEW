import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export interface UserContext {
  id?: number;
  userId: string;
  workspaceId?: string;
  contextType: 'preference' | 'conversation' | 'insight' | 'project_info' | 'skill' | 'goal';
  contextKey: string;
  contextValue: any;
  metadata?: any;
  createdAt?: Date;
  updatedAt?: Date;
}

export class UserContextManager {
  /**
   * Store or update user context
   */
  static async setContext(context: UserContext): Promise<void> {
    const { data, error } = await supabase
      .from('v2_user_context')
      .upsert({
        user_id: context.userId,
        workspace_id: context.workspaceId,
        context_type: context.contextType,
        context_key: context.contextKey,
        context_value: context.contextValue,
        metadata: context.metadata || {},
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,workspace_id,context_type,context_key',
      });

    if (error) {
      console.error('[UserContext] Error storing context:', error);
      throw error;
    }
  }

  /**
   * Get user context by type and key
   */
  static async getContext(
    userId: string,
    contextType: string,
    contextKey?: string,
    workspaceId?: string
  ): Promise<UserContext[]> {
    let query = supabase
      .from('v2_user_context')
      .select('*')
      .eq('user_id', userId)
      .eq('context_type', contextType);

    if (contextKey) {
      query = query.eq('context_key', contextKey);
    }

    if (workspaceId) {
      query = query.eq('workspace_id', workspaceId);
    }

    const { data, error } = await query.order('updated_at', { ascending: false });

    if (error) {
      console.error('[UserContext] Error fetching context:', error);
      throw error;
    }

    return (data || []).map(d => ({
      id: d.id,
      userId: d.user_id,
      workspaceId: d.workspace_id,
      contextType: d.context_type,
      contextKey: d.context_key,
      contextValue: d.context_value,
      metadata: d.metadata,
      createdAt: new Date(d.created_at),
      updatedAt: new Date(d.updated_at),
    }));
  }

  /**
   * Get all context for a user (for AI system prompt)
   */
  static async getUserProfile(userId: string, workspaceId?: string): Promise<string> {
    let query = supabase
      .from('v2_user_context')
      .select('*')
      .eq('user_id', userId);

    if (workspaceId) {
      query = query.eq('workspace_id', workspaceId);
    }

    const { data, error } = await query.order('updated_at', { ascending: false });

    if (error) {
      console.error('[UserContext] Error fetching user profile:', error);
      return '';
    }

    if (!data || data.length === 0) {
      return '';
    }

    // Build a comprehensive user profile for AI
    const profile: any = {
      preferences: [],
      insights: [],
      skills: [],
      goals: [],
      projectInfo: [],
      recentConversations: [],
    };

    for (const context of data) {
      const value = context.context_value;
      switch (context.context_type) {
        case 'preference':
          profile.preferences.push({ [context.context_key]: value });
          break;
        case 'insight':
          profile.insights.push({ [context.context_key]: value });
          break;
        case 'skill':
          profile.skills.push({ [context.context_key]: value });
          break;
        case 'goal':
          profile.goals.push({ [context.context_key]: value });
          break;
        case 'project_info':
          profile.projectInfo.push({ [context.context_key]: value });
          break;
        case 'conversation':
          if (profile.recentConversations.length < 5) {
            profile.recentConversations.push(value);
          }
          break;
      }
    }

    // Format as a natural language profile
    let profileText = '## User Profile\n\n';

    if (profile.preferences.length > 0) {
      profileText += '### Preferences\n';
      for (const pref of profile.preferences) {
        profileText += `- ${Object.entries(pref).map(([k, v]) => `${k}: ${v}`).join(', ')}\n`;
      }
      profileText += '\n';
    }

    if (profile.skills.length > 0) {
      profileText += '### Skills & Expertise\n';
      for (const skill of profile.skills) {
        profileText += `- ${Object.entries(skill).map(([k, v]) => `${k}: ${v}`).join(', ')}\n`;
      }
      profileText += '\n';
    }

    if (profile.goals.length > 0) {
      profileText += '### Goals & Objectives\n';
      for (const goal of profile.goals) {
        profileText += `- ${Object.entries(goal).map(([k, v]) => `${k}: ${v}`).join(', ')}\n`;
      }
      profileText += '\n';
    }

    if (profile.insights.length > 0) {
      profileText += '### Key Insights\n';
      for (const insight of profile.insights) {
        profileText += `- ${Object.entries(insight).map(([k, v]) => `${k}: ${v}`).join(', ')}\n`;
      }
      profileText += '\n';
    }

    if (profile.projectInfo.length > 0) {
      profileText += '### Project Information\n';
      for (const info of profile.projectInfo) {
        profileText += `- ${Object.entries(info).map(([k, v]) => `${k}: ${v}`).join(', ')}\n`;
      }
      profileText += '\n';
    }

    return profileText;
  }

  /**
   * Store conversation insights automatically
   */
  static async storeConversationInsight(
    userId: string,
    workspaceId: string | undefined,
    topic: string,
    insight: string
  ): Promise<void> {
    await this.setContext({
      userId,
      workspaceId,
      contextType: 'conversation',
      contextKey: topic,
      contextValue: {
        insight,
        timestamp: new Date().toISOString(),
      },
      metadata: {
        autoGenerated: true,
      },
    });
  }

  /**
   * Delete user context
   */
  static async deleteContext(
    userId: string,
    contextType: string,
    contextKey: string,
    workspaceId?: string
  ): Promise<void> {
    let query = supabase
      .from('v2_user_context')
      .delete()
      .eq('user_id', userId)
      .eq('context_type', contextType)
      .eq('context_key', contextKey);

    if (workspaceId) {
      query = query.eq('workspace_id', workspaceId);
    }

    const { error } = await query;

    if (error) {
      console.error('[UserContext] Error deleting context:', error);
      throw error;
    }
  }
}
