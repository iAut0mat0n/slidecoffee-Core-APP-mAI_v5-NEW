import { useState } from 'react';

export default function Notifications() {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const notifications = [
    {
      id: 1,
      type: 'comment',
      icon: '💬',
      title: 'New comment on Q4 Sales Deck',
      message: 'Jane Smith commented: "Great work on the revenue projections!"',
      time: '5 minutes ago',
      read: false,
    },
    {
      id: 2,
      type: 'share',
      icon: '🔗',
      title: 'Presentation shared with you',
      message: 'Bob Johnson shared "Product Launch 2024" with you',
      time: '1 hour ago',
      read: false,
    },
    {
      id: 3,
      type: 'export',
      icon: '📥',
      title: 'Export completed',
      message: 'Your PowerPoint export for "Investor Pitch" is ready',
      time: '2 hours ago',
      read: true,
    },
    {
      id: 4,
      type: 'team',
      icon: '👥',
      title: 'New team member',
      message: 'Alice Williams joined your workspace',
      time: '3 hours ago',
      read: true,
    },
    {
      id: 5,
      type: 'system',
      icon: '⚙️',
      title: 'System update',
      message: 'SlideCoffee has been updated with new AI features',
      time: '1 day ago',
      read: true,
    },
    {
      id: 6,
      type: 'billing',
      icon: '💳',
      title: 'Payment received',
      message: 'Your subscription has been renewed for $29.00',
      time: '2 days ago',
      read: true,
    },
  ];

  const filteredNotifications = notifications.filter(
    (notif) => filter === 'all' || (filter === 'unread' && !notif.read)
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Notifications</h1>
            <p className="text-gray-600 mt-1">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
          <button className="px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg font-medium">
            Mark all as read
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'unread'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            Unread {unreadCount > 0 && `(${unreadCount})`}
          </button>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer ${
                notification.read ? 'border-gray-200' : 'border-purple-200 bg-purple-50/30'
              }`}
            >
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-2xl flex-shrink-0">
                  {notification.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-1">
                    <h3 className="font-semibold">{notification.title}</h3>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-purple-600 rounded-full flex-shrink-0 mt-2" />
                    )}
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{notification.message}</p>
                  <div className="text-xs text-gray-500">{notification.time}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredNotifications.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔔</div>
            <h3 className="text-xl font-semibold mb-2">No notifications</h3>
            <p className="text-gray-600">You're all caught up!</p>
          </div>
        )}

        {/* Settings Link */}
        <div className="mt-8 p-6 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold mb-1">Notification Preferences</h3>
              <p className="text-sm text-gray-600">Manage how you receive notifications</p>
            </div>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">
              Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

