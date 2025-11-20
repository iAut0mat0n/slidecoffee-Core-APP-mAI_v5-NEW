import { useState } from 'react';

export default function WebhookSettings() {
  const [webhooks] = useState([
    {
      id: 1,
      url: 'https://api.example.com/webhooks/slidecoffee',
      events: ['presentation.created', 'presentation.updated'],
      status: 'active',
      lastTriggered: '5 minutes ago',
    },
    {
      id: 2,
      url: 'https://hooks.slack.com/services/T00/B00/XXX',
      events: ['comment.created', 'comment.resolved'],
      status: 'active',
      lastTriggered: '2 hours ago',
    },
  ]);

  const availableEvents = [
    { id: 'presentation.created', label: 'Presentation Created', description: 'When a new presentation is created' },
    { id: 'presentation.updated', label: 'Presentation Updated', description: 'When a presentation is modified' },
    { id: 'presentation.deleted', label: 'Presentation Deleted', description: 'When a presentation is deleted' },
    { id: 'comment.created', label: 'Comment Created', description: 'When a comment is added' },
    { id: 'comment.resolved', label: 'Comment Resolved', description: 'When a comment is marked as resolved' },
    { id: 'user.invited', label: 'User Invited', description: 'When a user is invited to the workspace' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Webhooks</h1>
          <p className="text-gray-600 mt-1">Receive real-time notifications about events in your workspace</p>
        </div>

        {/* Active Webhooks */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Active Webhooks</h2>
            <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg">
              + Add Webhook
            </button>
          </div>

          <div className="space-y-4">
            {webhooks.map((webhook) => (
              <div
                key={webhook.id}
                className="p-6 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <code className="px-3 py-1 bg-gray-100 rounded font-mono text-sm">
                        {webhook.url}
                      </code>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        webhook.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {webhook.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {webhook.events.map((event) => (
                        <span
                          key={event}
                          className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium"
                        >
                          {event}
                        </span>
                      ))}
                    </div>
                    <div className="text-sm text-gray-600">
                      Last triggered: {webhook.lastTriggered}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-white">
                      Test
                    </button>
                    <button className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-white">
                      Edit
                    </button>
                    <button className="px-3 py-2 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Available Events */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold mb-6">Available Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableEvents.map((event) => (
              <div key={event.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="font-medium mb-1">{event.label}</div>
                <div className="text-sm text-gray-600 mb-2">{event.description}</div>
                <code className="text-xs bg-gray-100 px-2 py-1 rounded">{event.id}</code>
              </div>
            ))}
          </div>
        </div>

        {/* Webhook Logs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-6">Recent Deliveries</h2>
          <div className="space-y-3">
            {[
              { event: 'presentation.created', status: 'success', time: '5 minutes ago', code: 200 },
              { event: 'comment.created', status: 'success', time: '15 minutes ago', code: 200 },
              { event: 'presentation.updated', status: 'failed', time: '1 hour ago', code: 500 },
              { event: 'comment.resolved', status: 'success', time: '2 hours ago', code: 200 },
            ].map((log, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${
                    log.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <div>
                    <div className="font-medium">{log.event}</div>
                    <div className="text-sm text-gray-600">{log.time}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    log.status === 'success'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {log.code}
                  </span>
                  <button className="text-sm text-purple-600 hover:text-purple-700">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

