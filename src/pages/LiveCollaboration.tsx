import { useState } from 'react';

export default function LiveCollaboration() {
  const [activeUsers] = useState([
    { id: 1, name: 'John Doe', avatar: 'JD', color: 'purple', viewing: 'Slide 3', lastActive: 'now' },
    { id: 2, name: 'Jane Smith', avatar: 'JS', color: 'blue', viewing: 'Slide 5', lastActive: 'now' },
    { id: 3, name: 'Bob Johnson', avatar: 'BJ', color: 'green', viewing: 'Slide 1', lastActive: '2m ago' },
  ]);

  const recentChanges = [
    { id: 1, user: 'John Doe', action: 'edited', target: 'Slide 3: Revenue Projections', time: '1 minute ago' },
    { id: 2, user: 'Jane Smith', action: 'commented on', target: 'Slide 5: Market Analysis', time: '3 minutes ago' },
    { id: 3, user: 'Bob Johnson', action: 'added', target: 'Slide 7: Product Roadmap', time: '5 minutes ago' },
    { id: 4, user: 'John Doe', action: 'deleted', target: 'Slide 2: Old Content', time: '10 minutes ago' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Live Collaboration</h1>
          <p className="text-gray-600 mt-1">Q4 Sales Deck - Real-time activity</p>
        </div>

        {/* Active Users */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Active Now ({activeUsers.length})</h2>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium">
              Invite More
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {activeUsers.map((user) => (
              <div key={user.id} className="p-4 border border-gray-200 rounded-lg relative">
                {/* Active Indicator */}
                {user.lastActive === 'now' && (
                  <div className="absolute top-2 right-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                )}
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-12 h-12 bg-${user.color}-600 rounded-full flex items-center justify-center text-white font-semibold`}>
                    {user.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-gray-600">Active {user.lastActive}</div>
                  </div>
                </div>
                <div className="text-sm text-gray-700">
                  <span className="text-gray-500">Viewing:</span> {user.viewing}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {recentChanges.map((change) => (
              <div key={change.id} className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                  {change.user[0]}
                </div>
                <div className="flex-1">
                  <p className="text-gray-700">
                    <span className="font-medium">{change.user}</span> {change.action}{' '}
                    <span className="font-medium">{change.target}</span>
                  </p>
                  <p className="text-sm text-gray-500 mt-1">{change.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Collaboration Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Live Cursors */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold mb-4">Live Cursors</h3>
            <div className="p-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 relative min-h-[200px]">
              <div className="absolute top-12 left-12 flex items-center gap-2">
                <div className="w-4 h-4 bg-purple-600 rounded-full"></div>
                <span className="text-sm font-medium text-purple-600">John Doe</span>
              </div>
              <div className="absolute top-24 right-16 flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
                <span className="text-sm font-medium text-blue-600">Jane Smith</span>
              </div>
              <div className="absolute bottom-12 left-20 flex items-center gap-2">
                <div className="w-4 h-4 bg-green-600 rounded-full"></div>
                <span className="text-sm font-medium text-green-600">Bob Johnson</span>
              </div>
              <div className="text-center text-gray-500 mt-16">
                See where your teammates are working in real-time
              </div>
            </div>
          </div>

          {/* Presence Indicators */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold mb-4">Presence Indicators</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                <span className="text-sm">Editing slide content</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span className="text-sm">Viewing presentation</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <span className="text-sm">Adding comments</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span className="text-sm">Idle</span>
              </div>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 p-6 bg-blue-50 rounded-xl border border-blue-200">
          <div className="flex gap-4">
            <div className="text-3xl">💡</div>
            <div>
              <h3 className="font-semibold mb-1">Real-time Collaboration</h3>
              <p className="text-sm text-gray-700">
                All changes are automatically saved and synced across all team members. You can see who is viewing or editing each slide in real-time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

