import { useState } from 'react';

export default function ActivityFeed() {
  const [filter, setFilter] = useState<'all' | 'presentations' | 'comments' | 'team'>('all');

  const activities = [
    {
      id: 1,
      type: 'presentation',
      icon: '📊',
      user: 'John Doe',
      action: 'created',
      target: 'Q4 Sales Deck',
      time: '5 minutes ago',
    },
    {
      id: 2,
      type: 'comment',
      icon: '💬',
      user: 'Jane Smith',
      action: 'commented on',
      target: 'Product Launch Presentation',
      time: '15 minutes ago',
    },
    {
      id: 3,
      type: 'team',
      icon: '👥',
      user: 'Bob Johnson',
      action: 'joined the workspace',
      target: '',
      time: '1 hour ago',
    },
    {
      id: 4,
      type: 'presentation',
      icon: '📤',
      user: 'Alice Williams',
      action: 'shared',
      target: 'Investor Pitch Deck',
      time: '2 hours ago',
    },
    {
      id: 5,
      type: 'presentation',
      icon: '✏️',
      user: 'John Doe',
      action: 'edited',
      target: 'Team Update Slides',
      time: '3 hours ago',
    },
    {
      id: 6,
      type: 'comment',
      icon: '✅',
      user: 'Jane Smith',
      action: 'resolved a comment on',
      target: 'Q4 Sales Deck',
      time: '5 hours ago',
    },
    {
      id: 7,
      type: 'presentation',
      icon: '🎨',
      user: 'Bob Johnson',
      action: 'applied brand guidelines to',
      target: 'Marketing Presentation',
      time: '1 day ago',
    },
    {
      id: 8,
      type: 'team',
      icon: '🔑',
      user: 'Alice Williams',
      action: 'updated workspace settings',
      target: '',
      time: '2 days ago',
    },
  ];

  const filteredActivities = activities.filter((activity) => {
    if (filter === 'all') return true;
    if (filter === 'presentations') return activity.type === 'presentation';
    if (filter === 'comments') return activity.type === 'comment';
    if (filter === 'team') return activity.type === 'team';
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Activity Feed</h1>
          <p className="text-gray-600 mt-1">Stay updated with your team's work</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: 'all', label: 'All Activity' },
            { id: 'presentations', label: 'Presentations' },
            { id: 'comments', label: 'Comments' },
            { id: 'team', label: 'Team' },
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

        {/* Activity List */}
        <div className="space-y-3">
          {filteredActivities.map((activity) => (
            <div
              key={activity.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-2xl flex-shrink-0">
                  {activity.icon}
                </div>
                <div className="flex-1">
                  <p className="text-gray-700 mb-1">
                    <span className="font-medium">{activity.user}</span> {activity.action}{' '}
                    {activity.target && <span className="font-medium">{activity.target}</span>}
                  </p>
                  <p className="text-sm text-gray-500">{activity.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredActivities.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold mb-2">No activity yet</h3>
            <p className="text-gray-600">Activity will appear here as your team works</p>
          </div>
        )}

        {/* Stats Summary */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-1">24</div>
            <div className="text-sm text-gray-600">Actions Today</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-1">156</div>
            <div className="text-sm text-gray-600">This Week</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-1">8</div>
            <div className="text-sm text-gray-600">Active Members</div>
          </div>
        </div>
      </div>
    </div>
  );
}

