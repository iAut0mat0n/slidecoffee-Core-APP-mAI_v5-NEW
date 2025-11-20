import { useState } from 'react';

export default function Comments() {
  const [newComment, setNewComment] = useState('');
  const [filter, setFilter] = useState<'all' | 'resolved' | 'open'>('all');

  const comments = [
    {
      id: 1,
      author: 'Jane Smith',
      avatar: 'JS',
      slide: 'Slide 3: Revenue Projections',
      content: 'Should we update the Q4 numbers based on the latest forecast?',
      timestamp: '2 hours ago',
      resolved: false,
      replies: [
        {
          id: 11,
          author: 'John Doe',
          avatar: 'JD',
          content: 'Good catch! I will update those now.',
          timestamp: '1 hour ago',
        },
      ],
    },
    {
      id: 2,
      author: 'Bob Johnson',
      avatar: 'BJ',
      slide: 'Slide 5: Market Analysis',
      content: 'The competitor comparison chart looks great. Maybe add one more competitor?',
      timestamp: '5 hours ago',
      resolved: true,
      replies: [],
    },
    {
      id: 3,
      author: 'Alice Williams',
      avatar: 'AW',
      slide: 'Slide 7: Product Roadmap',
      content: 'Can we move the Q3 features to Q2? Timeline seems aggressive.',
      timestamp: '1 day ago',
      resolved: false,
      replies: [
        {
          id: 31,
          author: 'John Doe',
          avatar: 'JD',
          content: 'Let us discuss this in tomorrow meeting.',
          timestamp: '1 day ago',
        },
        {
          id: 32,
          author: 'Alice Williams',
          avatar: 'AW',
            content: 'Sounds good, I will prepare some data to support the timeline adjustment.',
          timestamp: '1 day ago',
        },
      ],
    },
  ];

  const filteredComments = comments.filter((comment) => {
    if (filter === 'all') return true;
    if (filter === 'resolved') return comment.resolved;
    if (filter === 'open') return !comment.resolved;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Comments</h1>
          <p className="text-gray-600 mt-1">Q4 Sales Deck - All feedback and discussions</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: 'all', label: 'All Comments' },
            { id: 'open', label: 'Open' },
            { id: 'resolved', label: 'Resolved' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as typeof filter)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === tab.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* New Comment Box */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex gap-4">
            <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
              JD
            </div>
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              />
              <div className="flex justify-between items-center mt-3">
                <div className="text-sm text-gray-600">
                  Tip: Use @mention to notify team members
                </div>
                <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg">
                  Post Comment
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Comments List */}
        <div className="space-y-6">
          {filteredComments.map((comment) => (
            <div
              key={comment.id}
              className={`bg-white rounded-xl shadow-sm border p-6 ${
                comment.resolved ? 'border-gray-200 opacity-75' : 'border-gray-200'
              }`}
            >
              {/* Main Comment */}
              <div className="flex gap-4 mb-4">
                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                  {comment.avatar}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-semibold">{comment.author}</div>
                      <div className="text-sm text-gray-600">
                        {comment.slide} • {comment.timestamp}
                      </div>
                    </div>
                    {comment.resolved && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                        Resolved
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700 mb-3">{comment.content}</p>
                  <div className="flex gap-3 text-sm">
                    <button className="text-purple-600 hover:underline">Reply</button>
                    {!comment.resolved && (
                      <button className="text-green-600 hover:underline">Mark as Resolved</button>
                    )}
                    <button className="text-gray-600 hover:underline">Edit</button>
                    <button className="text-red-600 hover:underline">Delete</button>
                  </div>
                </div>
              </div>

              {/* Replies */}
              {comment.replies.length > 0 && (
                <div className="ml-14 space-y-4 pt-4 border-t border-gray-100">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="flex gap-4">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                        {reply.avatar}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-sm">{reply.author}</div>
                        <div className="text-xs text-gray-600 mb-2">{reply.timestamp}</div>
                        <p className="text-gray-700 text-sm">{reply.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredComments.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="text-6xl mb-4">💬</div>
            <h3 className="text-xl font-semibold mb-2">No comments yet</h3>
            <p className="text-gray-600">Be the first to leave feedback!</p>
          </div>
        )}
      </div>
    </div>
  );
}

