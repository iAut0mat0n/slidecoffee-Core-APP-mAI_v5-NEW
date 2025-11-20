import { useState } from 'react';

export default function WorkspaceSettings() {
  const [activeTab, setActiveTab] = useState('general');
  const [workspaceName, setWorkspaceName] = useState('My Workspace');
  const [teamMembers] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Owner', avatar: 'JD' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Admin', avatar: 'JS' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Member', avatar: 'BJ' },
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold">Workspace Settings</h1>
          <p className="text-gray-600 mt-1">Manage your workspace and team</p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Sidebar Navigation */}
          <div className="w-64 flex-shrink-0">
            <nav className="space-y-1">
              {[
                { id: 'general', label: 'General', icon: '⚙️' },
                { id: 'team', label: 'Team Members', icon: '👥' },
                { id: 'billing', label: 'Billing', icon: '💳' },
                { id: 'integrations', label: 'Integrations', icon: '🔌' },
                { id: 'security', label: 'Security', icon: '🔒' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-purple-50 text-purple-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-xl">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              {/* General Tab */}
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-6">General Settings</h2>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Workspace Name
                    </label>
                    <input
                      type="text"
                      value={workspaceName}
                      onChange={(e) => setWorkspaceName(e.target.value)}
                      className="w-full max-w-md px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Workspace ID
                    </label>
                    <div className="flex gap-2 max-w-md">
                      <input
                        type="text"
                        value="ws_abc123def456"
                        readOnly
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                      />
                      <button className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                        Copy
                      </button>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg">
                      Save Changes
                    </button>
                  </div>

                  <div className="border-t border-gray-200 pt-6 mt-8">
                    <h3 className="text-lg font-semibold text-red-600 mb-2">Danger Zone</h3>
                    <p className="text-gray-600 mb-4">
                      Once you delete a workspace, there is no going back. Please be certain.
                    </p>
                    <button className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg">
                      Delete Workspace
                    </button>
                  </div>
                </div>
              )}

              {/* Team Tab */}
              {activeTab === 'team' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold">Team Members</h2>
                      <p className="text-gray-600 mt-1">{teamMembers.length} members</p>
                    </div>
                    <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg">
                      + Invite Member
                    </button>
                  </div>

                  <div className="space-y-3">
                    {teamMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {member.avatar}
                          </div>
                          <div>
                            <div className="font-medium">{member.name}</div>
                            <div className="text-sm text-gray-600">{member.email}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <select
                            value={member.role}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          >
                            <option value="Owner">Owner</option>
                            <option value="Admin">Admin</option>
                            <option value="Member">Member</option>
                            <option value="Viewer">Viewer</option>
                          </select>
                          {member.role !== 'Owner' && (
                            <button className="p-2 text-red-600 hover:bg-red-50 rounded">
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Billing Tab */}
              {activeTab === 'billing' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-6">Billing & Subscription</h2>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">Pro Plan</h3>
                        <p className="text-gray-600 mt-1">$29/month • Renews on Jan 1, 2025</p>
                        <div className="mt-4 space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-green-600">✓</span>
                            Unlimited presentations
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-green-600">✓</span>
                            AI-powered generation
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-green-600">✓</span>
                            Team collaboration
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-green-600">✓</span>
                            Priority support
                          </div>
                        </div>
                      </div>
                      <button className="px-4 py-2 border border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white font-medium rounded-lg transition-colors">
                        Manage Plan
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Payment Method</h3>
                    <div className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">💳</div>
                        <div>
                          <div className="font-medium">•••• •••• •••• 4242</div>
                          <div className="text-sm text-gray-600">Expires 12/2025</div>
                        </div>
                      </div>
                      <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium">
                        Update
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Billing History</h3>
                    <div className="space-y-2">
                      {[
                        { date: 'Dec 1, 2024', amount: '$29.00', status: 'Paid' },
                        { date: 'Nov 1, 2024', amount: '$29.00', status: 'Paid' },
                        { date: 'Oct 1, 2024', amount: '$29.00', status: 'Paid' },
                      ].map((invoice, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                        >
                          <div className="flex items-center gap-4">
                            <div className="text-sm">{invoice.date}</div>
                            <div className="font-medium">{invoice.amount}</div>
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                              {invoice.status}
                            </span>
                          </div>
                          <button className="text-sm text-purple-600 hover:underline">
                            Download
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Integrations Tab */}
              {activeTab === 'integrations' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Integrations</h2>
                    <p className="text-gray-600">Connect SlideCoffee with your favorite tools</p>
                  </div>

                  <div className="grid gap-4">
                    {[
                      { name: 'Google Drive', icon: '📁', connected: true },
                      { name: 'Dropbox', icon: '📦', connected: false },
                      { name: 'Slack', icon: '💬', connected: true },
                      { name: 'Microsoft Teams', icon: '👥', connected: false },
                      { name: 'Figma', icon: '🎨', connected: false },
                    ].map((integration) => (
                      <div
                        key={integration.name}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
                            {integration.icon}
                          </div>
                          <div>
                            <div className="font-medium">{integration.name}</div>
                            <div className="text-sm text-gray-600">
                              {integration.connected ? 'Connected' : 'Not connected'}
                            </div>
                          </div>
                        </div>
                        <button
                          className={`px-4 py-2 rounded-lg font-medium ${
                            integration.connected
                              ? 'border border-gray-300 hover:bg-gray-50'
                              : 'bg-purple-600 hover:bg-purple-700 text-white'
                          }`}
                        >
                          {integration.connected ? 'Disconnect' : 'Connect'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-6">Security</h2>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Two-Factor Authentication</h3>
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <div className="font-medium">2FA Status</div>
                        <div className="text-sm text-gray-600">Add an extra layer of security</div>
                      </div>
                      <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg">
                        Enable 2FA
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Active Sessions</h3>
                    <div className="space-y-2">
                      {[
                        { device: 'MacBook Pro', location: 'San Francisco, US', current: true },
                        { device: 'iPhone 14', location: 'San Francisco, US', current: false },
                      ].map((session, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                        >
                          <div>
                            <div className="font-medium">
                              {session.device}
                              {session.current && (
                                <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                                  Current
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-600">{session.location}</div>
                          </div>
                          {!session.current && (
                            <button className="text-sm text-red-600 hover:underline">
                              Revoke
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

