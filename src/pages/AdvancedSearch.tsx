import { useState } from 'react';

export default function AdvancedSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    type: 'all',
    dateRange: 'all',
    tags: [] as string[],
    folders: [] as string[],
    collaborators: [] as string[],
  });

  const searchResults = [
    {
      id: 1,
      title: 'Q4 Sales Deck',
      type: 'Presentation',
      folder: 'Sales Presentations',
      tags: ['Sales', 'Quarterly'],
      lastModified: '2 hours ago',
      collaborators: 3,
    },
    {
      id: 2,
      title: 'Product Launch 2024',
      type: 'Presentation',
      folder: 'Marketing Materials',
      tags: ['Product', 'Marketing'],
      lastModified: '1 day ago',
      collaborators: 5,
    },
    {
      id: 3,
      title: 'Investor Pitch',
      type: 'Presentation',
      folder: 'Client Pitches',
      tags: ['Pitch', 'Client'],
      lastModified: '3 days ago',
      collaborators: 2,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Advanced Search</h1>
          <p className="text-gray-600 mt-1">Find exactly what you are looking for</p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search presentations, comments, or content..."
              className="w-full px-6 py-4 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium">
              Search
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
              <h3 className="font-semibold mb-4">Filters</h3>

              {/* Type Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option>All Types</option>
                  <option>Presentations</option>
                  <option>Templates</option>
                  <option>Brands</option>
                </select>
              </div>

              {/* Date Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option>All Time</option>
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                  <option>Last 90 days</option>
                  <option>Last year</option>
                </select>
              </div>

              {/* Tags */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                <div className="space-y-2">
                  {['Sales', 'Marketing', 'Product', 'Internal'].map((tag) => (
                    <label key={tag} className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">{tag}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Folders */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Folders</label>
                <div className="space-y-2">
                  {['Sales Presentations', 'Marketing Materials', 'Client Pitches'].map((folder) => (
                    <label key={folder} className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">{folder}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              <button className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium">
                Clear All Filters
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-gray-600">
                {searchResults.length} results found
              </div>
              <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option>Sort by: Relevance</option>
                <option>Sort by: Date Modified</option>
                <option>Sort by: Name</option>
                <option>Sort by: Collaborators</option>
              </select>
            </div>

            <div className="space-y-4">
              {searchResults.map((result) => (
                <div
                  key={result.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold mb-1">{result.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>{result.type}</span>
                        <span>•</span>
                        <span>{result.folder}</span>
                        <span>•</span>
                        <span>{result.lastModified}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>👥 {result.collaborators}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {result.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

