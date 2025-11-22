import { useState } from 'react';

export default function APIKeysManagement() {
  const [apiKeys] = useState([
    {
      id: 1,
      name: 'Production API Key',
      key: 'sk_live_abc123...xyz789',
      created: '2024-01-15',
      lastUsed: '2 hours ago',
      status: 'active',
    },
    {
      id: 2,
      name: 'Development Key',
      key: 'sk_test_def456...uvw012',
      created: '2024-02-01',
      lastUsed: '1 day ago',
      status: 'active',
    },
    {
      id: 3,
      name: 'Staging Environment',
      key: 'sk_test_ghi789...rst345',
      created: '2024-01-20',
      lastUsed: 'Never',
      status: 'inactive',
    },
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">API Keys</h1>
          <p className="text-gray-600 mt-1">Manage your API keys for programmatic access</p>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-6 mb-6">
          <div className="flex gap-4">
            <div className="text-3xl">🔐</div>
            <div>
              <h3 className="font-semibold mb-1">Keep your keys secure</h3>
              <p className="text-sm text-gray-700">
                API keys provide full access to your account. Never share them publicly or commit them to version control.
              </p>
            </div>
          </div>
        </div>

        {/* API Keys List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Your API Keys</h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg"
            >
              + Create New Key
            </button>
          </div>

          <div className="space-y-4">
            {apiKeys.map((key) => (
              <div
                key={key.id}
                className="p-6 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold mb-1">{key.name}</h3>
                    <div className="flex items-center gap-2">
                      <code className="px-3 py-1 bg-gray-100 rounded font-mono text-sm">
                        {key.key}
                      </code>
                      <button className="px-2 py-1 text-sm text-purple-600 hover:text-purple-700">
                        Copy
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-white">
                      Edit
                    </button>
                    <button className="px-3 py-2 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50">
                      Revoke
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <span>Created: {key.created}</span>
                  <span>Last used: {key.lastUsed}</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    key.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {key.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* API Documentation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold mb-4">Quick Start</h3>
            <div className="space-y-3 text-sm">
              <div>
                <div className="font-medium mb-1">1. Create an API key</div>
                <div className="text-gray-600">Generate a new key from the button above</div>
              </div>
              <div>
                <div className="font-medium mb-1">2. Add to your requests</div>
                <div className="text-gray-600">Include the key in your Authorization header</div>
              </div>
              <div>
                <div className="font-medium mb-1">3. Make API calls</div>
                <div className="text-gray-600">Start creating and managing presentations programmatically</div>
              </div>
            </div>
            <button className="w-full mt-4 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium">
              View Full Documentation
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold mb-4">Example Request</h3>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-xs overflow-x-auto">
              <div className="text-green-400">curl</div>
              <div className="text-blue-400 ml-2">-X POST \</div>
              <div className="ml-2">https://api.slidecoffee.com/v1/presentations \</div>
              <div className="text-blue-400 ml-2">-H</div>
              <div className="ml-2">"Authorization: Bearer YOUR_API_KEY" \</div>
              <div className="text-blue-400 ml-2">-H</div>
              <div className="ml-2">"Content-Type: application/json" \</div>
              <div className="text-blue-400 ml-2">-d</div>
              <div className="ml-2">'{"{"}"title": "My Presentation"{"}"}'</div>
            </div>
          </div>
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <h2 className="text-2xl font-bold mb-4">Create New API Key</h2>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Key Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Production API Key"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    maxLength={100}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Environment
                  </label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                    <option>Production</option>
                    <option>Development</option>
                    <option>Staging</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg">
                  Create Key
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

