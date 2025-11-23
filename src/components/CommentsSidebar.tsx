import { useState, useEffect, useCallback } from 'react';
import { MessageCircle, Check, Trash2, Send } from 'lucide-react';
import { commentsAPI, type Comment } from '../lib/api-comments';
import { createClient } from '@supabase/supabase-js';
import { formatDistanceToNow } from 'date-fns';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

interface CommentsSidebarProps {
  presentationId: string;
  currentSlideIndex: number;
  onClose?: () => void;
}

export default function CommentsSidebar({ 
  presentationId, 
  currentSlideIndex,
  onClose 
}: CommentsSidebarProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔥 REALTIME: Load comments and subscribe to changes
  const loadComments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await commentsAPI.getComments(presentationId);
      setComments(data);
    } catch (err: any) {
      console.error('Error loading comments:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [presentationId]);

  useEffect(() => {
    loadComments();

    // 🔥 REALTIME: Subscribe to comment changes via Supabase
    if (!supabaseUrl || !supabaseKey) {
      console.warn('Supabase not configured, realtime comments disabled');
      return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const channel = supabase
      .channel(`comments:${presentationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'v2_comments',
          filter: `presentation_id=eq.${presentationId}`
        },
        (payload) => {
          console.log('💬 Realtime comment update:', payload);
          // Reload comments on any change
          loadComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [presentationId, loadComments]);

  const handleCreateComment = async () => {
    if (!newComment.trim()) return;

    try {
      setSubmitting(true);
      setError(null);
      
      await commentsAPI.createComment(presentationId, {
        content: newComment.trim(),
        slideIndex: currentSlideIndex
      });

      setNewComment('');
      // Comments will reload via Realtime subscription
    } catch (err: any) {
      console.error('Error creating comment:', err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (parentId: number) => {
    if (!replyContent.trim()) return;

    try {
      setSubmitting(true);
      setError(null);

      await commentsAPI.createComment(presentationId, {
        content: replyContent.trim(),
        slideIndex: currentSlideIndex,
        parentCommentId: parentId
      });

      setReplyContent('');
      setReplyingTo(null);
      // Comments will reload via Realtime subscription
    } catch (err: any) {
      console.error('Error creating reply:', err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolve = async (commentId: number, currentlyResolved: boolean) => {
    try {
      await commentsAPI.resolveComment(commentId, !currentlyResolved);
      // Comments will reload via Realtime subscription
    } catch (err: any) {
      console.error('Error resolving comment:', err);
      setError(err.message);
    }
  };

  const handleDelete = async (commentId: number) => {
    if (!confirm('Delete this comment? This action cannot be undone.')) return;

    try {
      await commentsAPI.deleteComment(commentId);
      // Comments will reload via Realtime subscription
    } catch (err: any) {
      console.error('Error deleting comment:', err);
      setError(err.message);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return timestamp;
    }
  };

  // Filter comments by current slide or show all
  const [showAllSlides, setShowAllSlides] = useState(false);
  const displayedComments = showAllSlides 
    ? comments 
    : comments.filter(c => c.slide_index === currentSlideIndex);

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Comments
          </h3>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          )}
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {displayedComments.length} {showAllSlides ? 'total' : 'on this slide'}
          </p>
          <button
            onClick={() => setShowAllSlides(!showAllSlides)}
            className="text-xs text-purple-600 hover:text-purple-700"
          >
            {showAllSlides ? 'Current slide' : 'All slides'}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border-b border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && comments.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-500">Loading comments...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Comments List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {displayedComments.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">
                  No comments yet
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Be the first to comment on this slide
                </p>
              </div>
            ) : (
              displayedComments.map((comment) => (
                <div key={comment.id} className={`${comment.resolved ? 'opacity-60' : ''}`}>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs flex-shrink-0">
                      {getInitials(comment.author_name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{comment.author_name}</span>
                        <span className="text-xs text-gray-500">{formatTimestamp(comment.created_at)}</span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2 whitespace-pre-wrap">{comment.content}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-600">
                        <button
                          onClick={() => setReplyingTo(comment.id)}
                          className="hover:text-purple-600 flex items-center gap-1"
                        >
                          Reply
                        </button>
                        <button
                          onClick={() => handleResolve(comment.id, comment.resolved)}
                          className="hover:text-purple-600 flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          {comment.resolved ? 'Reopen' : 'Resolve'}
                        </button>
                        <button
                          onClick={() => handleDelete(comment.id)}
                          className="hover:text-red-600 flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                        {showAllSlides && (
                          <span className="text-gray-400">Slide {comment.slide_index + 1}</span>
                        )}
                      </div>

                      {/* Reply Input */}
                      {replyingTo === comment.id && (
                        <div className="mt-3 space-y-2">
                          <textarea
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder="Write a reply..."
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            rows={2}
                            autoFocus
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleReply(comment.id)}
                              disabled={!replyContent.trim() || submitting}
                              className="px-3 py-1 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {submitting ? 'Sending...' : 'Reply'}
                            </button>
                            <button
                              onClick={() => {
                                setReplyingTo(null);
                                setReplyContent('');
                              }}
                              className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Replies */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="mt-3 ml-4 pl-4 border-l-2 border-gray-200 space-y-3">
                          {comment.replies.map((reply) => (
                            <div key={reply.id} className="flex items-start gap-2">
                              <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs flex-shrink-0">
                                {getInitials(reply.author_name)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-xs">{reply.author_name}</span>
                                  <span className="text-xs text-gray-500">{formatTimestamp(reply.created_at)}</span>
                                </div>
                                <p className="text-xs text-gray-700 whitespace-pre-wrap">{reply.content}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* New Comment Input */}
          <div className="p-4 border-t border-gray-200">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment on this slide..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              rows={3}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                  handleCreateComment();
                }
              }}
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleCreateComment}
                disabled={!newComment.trim() || submitting}
                className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                {submitting ? 'Sending...' : 'Comment'}
              </button>
              <button
                onClick={() => setNewComment('')}
                disabled={submitting}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Clear
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Tip: Use Ctrl+Enter to send
            </p>
          </div>
        </>
      )}
    </div>
  );
}
