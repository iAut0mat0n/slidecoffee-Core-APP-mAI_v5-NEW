import { useState } from 'react';

export default function IntegrationMarketplace() {
  const [filter, setFilter] = useState('all');

  const integrations = [
    {
      id: 1,
      name: 'Slack',
      description: 'Get notifications when presentations are shared or commented on',
      icon: '💬',
      category: 'communication',
      installed: true,
    },
    {
      id: 2,
      name: 'Google Drive',
      description: 'Import presentations from Google Drive and sync automatically',
      icon: '📁',
      category: 'storage',
      installed: true,
    },
    {
      id: 3,
      name: 'Dropbox',
      description: 'Store and sync your presentations with Dropbox',
      icon: '📦',
      category: 'storage',
      installed: false,
    },
    {
      id: 4,
      name: 'Zapier',
      description: 'Connect SlideCoffee to 5000+ apps with automated workflows',
      icon: '⚡',
      category: 'automation',
      installed: false,
    },
    {
      id: 5,
      name: 'Figma',
      description: 'Import designs from Figma directly into your presentations',
      icon: '🎨',
      category: 'design',
      installed: false,
    },
    {
      id: 6,
      name: 'Unsplash',
      description: 'Access millions of high-quality stock photos',
      icon: '📷',
      category: 'assets',
      installed: true,
    },
    {
      id: 7,
      name: 'Giphy',
      description: 'Add animated GIFs to make your presentations more engaging',
      icon: '🎬',
      category: 'assets',
      installed: false,
    },
    {
      id: 8,
      name: 'Calendly',
      description: 'Embed scheduling links in your presentations',
      icon: '📅',
      category: 'productivity',
      installed: false,
    },
  ];

  const categories = [
    { id: 'all', label: 'All Integrations', count: integrations.length },
    { id: 'communication', label: 'Communication', count: integrations.filter(i => i.category === 'communication').length },
    { id: 'storage', label: 'Storage', count: integrations.filter(i => i.category === 'storage').length },
    { id: 'automation', label: 'Automation', count: integrations.filter(i => i.category === 'automation').length },
    { id: 'design', label: 'Design', count: integrations.filter(i => i.category === 'design').length },
    { id: 'assets', label: 'Assets', count: integrations.filter(i => i.category === 'assets').length },
    { id: 'productivity', label: 'Productivity', count: integrations.filter(i => i.category === 'productivity').length },
  ];

  const filteredIntegrations = filter === 'all'
    ? integrations
    : integrations.filter(i => i.category === filter);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Integration Marketplace</h1>
          <p className="text-gray-600 mt-1">Connect SlideCoffee with your favorite tools</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setFilter(category.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      filter === category.id
                        ? 'bg-purple-100 text-purple-700 font-medium'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{category.label}</span>
                      <span className="text-xs text-gray-500">{category.count}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Integrations Grid */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredIntegrations.map((integration) => (
                <div
                  key={integration.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="text-4xl">{integration.icon}</div>
                      <div>
                        <h3 className="font-semibold text-lg">{integration.name}</h3>
                        <span className="text-xs text-gray-500 capitalize">{integration.category}</span>
                      </div>
                    </div>
                    {integration.installed && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                        Installed
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{integration.description}</p>
                  <button
                    className={`w-full px-4 py-2 rounded-lg font-medium ${
                      integration.installed
                        ? 'border border-gray-300 hover:bg-gray-50'
                        : 'bg-purple-600 hover:bg-purple-700 text-white'
                    }`}
                  >
                    {integration.installed ? 'Configure' : 'Install'}
                  </button>
                </div>
              ))}
            </div>

            {filteredIntegrations.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold mb-2">No integrations found</h3>
                <p className="text-gray-600">Try selecting a different category</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

