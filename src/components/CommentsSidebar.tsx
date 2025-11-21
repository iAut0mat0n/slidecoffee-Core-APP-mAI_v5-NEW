import { useState } from 'react';

interface Comment {
  id: number;
  author: string;
  avatar: string;
  content: string;
  timestamp: string;
  slideNumber: number;
  resolved: boolean;
  replies?: Comment[];
}

export default function CommentsSidebar() {
  const [comments] = useState<Comment[]>([
    {
      id: 1,
      author: 'John Doe',
      avatar: 'JD',
      content: 'Can we update the Q3 numbers on this slide?',
      timestamp: '2 hours ago',
      slideNumber: 3,
      resolved: false,
      replies: [
        {
          id: 2,
          author: 'Alice Smith',
          avatar: 'AS',
          content: 'Sure, I\'ll update them now.',
          timestamp: '1 hour ago',
          slideNumber: 3,
          resolved: false,
        },
      ],
    },
    {
      id: 3,
      author: 'Bob Wilson',
      avatar: 'BW',
      content: 'The chart colors look great!',
      timestamp: '3 hours ago',
      slideNumber: 5,
      resolved: true,
    },
  ]);

  const [newComment, setNewComment] = useState('');

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-lg">Comments</h3>
        <p className="text-sm text-gray-600 mt-1">{comments.length} total</p>
      </div>

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className={`${comment.resolved ? 'opacity-60' : ''}`}>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs flex-shrink-0">
                {comment.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{comment.author}</span>
                  <span className="text-xs text-gray-500">{comment.timestamp}</span>
                </div>
                <p className="text-sm text-gray-700 mb-2">{comment.content}</p>
                <div className="flex items-center gap-3 text-xs text-gray-600">
                  <button className="hover:text-purple-600">Reply</button>
                  <button className="hover:text-purple-600">
                    {comment.resolved ? 'Reopen' : 'Resolve'}
                  </button>
                  <span className="text-gray-400">Slide {comment.slideNumber}</span>
                </div>

                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="mt-3 ml-4 pl-4 border-l-2 border-gray-200 space-y-3">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="flex items-start gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs flex-shrink-0">
                          {reply.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-xs">{reply.author}</span>
                            <span className="text-xs text-gray-500">{reply.timestamp}</span>
                          </div>
                          <p className="text-xs text-gray-700">{reply.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* New Comment Input */}
      <div className="p-4 border-t border-gray-200">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          rows={3}
        />
        <div className="flex gap-2 mt-2">
          <button
            disabled={!newComment.trim()}
            className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Comment
          </button>
          <button
            onClick={() => setNewComment('')}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

