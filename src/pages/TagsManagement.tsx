import { useState } from 'react';

export default function TagsManagement() {
  const [tags] = useState([
    { id: 1, name: 'Sales', count: 24, color: 'purple' },
    { id: 2, name: 'Marketing', count: 18, color: 'blue' },
    { id: 3, name: 'Product', count: 15, color: 'green' },
    { id: 4, name: 'Internal', count: 32, color: 'orange' },
    { id: 5, name: 'Client', count: 12, color: 'red' },
    { id: 6, name: 'Pitch', count: 8, color: 'indigo' },
    { id: 7, name: 'Training', count: 20, color: 'pink' },
    { id: 8, name: 'Quarterly', count: 16, color: 'teal' },
  ]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Tags</h1>
            <p className="text-gray-600 mt-1">Label and categorize your presentations</p>
          </div>
          <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg">
            + Create Tag
          </button>
        </div>

        {/* Tags Grid */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="font-semibold mb-4">All Tags ({tags.length})</h3>
          <div className="flex flex-wrap gap-3">
            {tags.map((tag) => (
              <div
                key={tag.id}
                className={`px-4 py-2 bg-${tag.color}-100 text-${tag.color}-700 rounded-full font-medium cursor-pointer hover:bg-${tag.color}-200 transition-colors flex items-center gap-2`}
              >
                <span>{tag.name}</span>
                <span className="text-sm opacity-75">({tag.count})</span>
                <button className="ml-1 hover:text-red-600">×</button>
              </div>
            ))}
          </div>
        </div>

        {/* Tag Usage Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="font-semibold mb-4">Most Used Tags</h3>
          <div className="space-y-3">
            {tags
              .sort((a, b) => b.count - a.count)
              .slice(0, 5)
              .map((tag) => (
                <div key={tag.id} className="flex items-center gap-4">
                  <div className={`px-3 py-1 bg-${tag.color}-100 text-${tag.color}-700 rounded-full font-medium text-sm`}>
                    {tag.name}
                  </div>
                  <div className="flex-1">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-${tag.color}-500`}
                        style={{ width: `${(tag.count / 32) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 w-16 text-right">{tag.count} uses</div>
                </div>
              ))}
          </div>
        </div>

        {/* Tag Management */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold mb-4">Bulk Actions</h3>
            <div className="space-y-3">
              <button className="w-full p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-left flex items-center gap-3">
                <span className="text-xl">🏷️</span>
                <div>
                  <div className="font-medium">Merge Tags</div>
                  <div className="text-sm text-gray-600">Combine similar tags</div>
                </div>
              </button>
              <button className="w-full p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-left flex items-center gap-3">
                <span className="text-xl">🎨</span>
                <div>
                  <div className="font-medium">Change Colors</div>
                  <div className="text-sm text-gray-600">Update tag appearance</div>
                </div>
              </button>
              <button className="w-full p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-left flex items-center gap-3">
                <span className="text-xl">🗑️</span>
                <div>
                  <div className="font-medium">Delete Unused</div>
                  <div className="text-sm text-gray-600">Clean up empty tags</div>
                </div>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold mb-4">Tag Suggestions</h3>
            <p className="text-sm text-gray-600 mb-4">
              Based on your presentations, we suggest these tags:
            </p>
            <div className="flex flex-wrap gap-2">
              {['Q4 2024', 'Revenue', 'Strategy', 'Roadmap', 'Analytics'].map((suggestion) => (
                <button
                  key={suggestion}
                  className="px-3 py-1 bg-gray-100 hover:bg-purple-100 text-gray-700 hover:text-purple-700 rounded-full text-sm font-medium transition-colors"
                >
                  + {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

