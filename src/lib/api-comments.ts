/**
 * 💬 COLLABORATION: Comments API Client
 */

export interface Comment {
  id: number;
  presentation_id: string;
  slide_index: number;
  workspace_id: string;
  author_id: string;
  author_name: string;
  author_email?: string;
  content: string;
  parent_comment_id?: number | null;
  resolved: boolean;
  resolved_by?: string | null;
  resolved_at?: string | null;
  position_x?: number | null;
  position_y?: number | null;
  created_at: string;
  updated_at: string;
  replies?: Comment[];
}

export interface CreateCommentRequest {
  content: string;
  slideIndex: number;
  parentCommentId?: number;
  positionX?: number;
  positionY?: number;
}

export interface Presence {
  id: number;
  presentation_id: string;
  workspace_id: string;
  user_id: string;
  user_name: string;
  user_email?: string;
  user_avatar?: string;
  activity_type: 'viewing' | 'editing' | 'commenting' | 'idle';
  current_slide_index?: number;
  cursor_x?: number;
  cursor_y?: number;
  last_seen_at: string;
}

export class CommentsAPI {
  private baseUrl = '/api';
  private token: string | null = null;

  constructor() {
    // Get Supabase token from localStorage
    const session = localStorage.getItem('sb-supabase-auth-token');
    if (session) {
      try {
        const parsed = JSON.parse(session);
        this.token = parsed.access_token;
      } catch (e) {
        // Try v1 format
        const v1Session = localStorage.getItem('supabase.auth.token');
        if (v1Session) {
          try {
            const v1Parsed = JSON.parse(v1Session);
            this.token = v1Parsed.currentSession?.access_token;
          } catch (e2) {
            console.error('Failed to parse auth token');
          }
        }
      }
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get all comments for a presentation
   */
  async getComments(presentationId: string): Promise<Comment[]> {
    const response = await this.request<{ success: boolean; comments: Comment[] }>(
      `/presentations/${presentationId}/comments`
    );
    return response.comments;
  }

  /**
   * Create a new comment or reply
   */
  async createComment(presentationId: string, data: CreateCommentRequest): Promise<Comment> {
    const response = await this.request<{ success: boolean; comment: Comment }>(
      `/presentations/${presentationId}/comments`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    return response.comment;
  }

  /**
   * Resolve or unresolve a comment
   */
  async resolveComment(commentId: number, resolved: boolean): Promise<Comment> {
    const response = await this.request<{ success: boolean; comment: Comment }>(
      `/comments/${commentId}/resolve`,
      {
        method: 'PATCH',
        body: JSON.stringify({ resolved }),
      }
    );
    return response.comment;
  }

  /**
   * Delete a comment
   */
  async deleteComment(commentId: number): Promise<void> {
    await this.request<{ success: boolean }>(
      `/comments/${commentId}`,
      {
        method: 'DELETE',
      }
    );
  }

  /**
   * Update presence (heartbeat)
   */
  async updatePresence(
    presentationId: string,
    data: {
      activityType: 'viewing' | 'editing' | 'commenting' | 'idle';
      currentSlideIndex?: number;
      cursorX?: number;
      cursorY?: number;
    }
  ): Promise<Presence> {
    const response = await this.request<{ success: boolean; presence: Presence }>(
      `/presentations/${presentationId}/presence`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    return response.presence;
  }

  /**
   * Get active collaborators
   */
  async getActiveCollaborators(presentationId: string): Promise<Presence[]> {
    const response = await this.request<{ success: boolean; activeUsers: Presence[] }>(
      `/presentations/${presentationId}/presence`
    );
    return response.activeUsers;
  }
}

export const commentsAPI = new CommentsAPI();
