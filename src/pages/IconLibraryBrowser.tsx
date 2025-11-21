import { useState } from 'react';

export default function IconLibraryBrowser() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('all');

  const styles = ['All', 'Outline', 'Filled', 'Duotone', 'Color'];

  const icons = [
    { id: 1, name: 'Home', icon: '🏠', style: 'outline', category: 'navigation' },
    { id: 2, name: 'User', icon: '👤', style: 'outline', category: 'people' },
    { id: 3, name: 'Settings', icon: '⚙️', style: 'filled', category: 'interface' },
    { id: 4, name: 'Heart', icon: '❤️', style: 'color', category: 'social' },
    { id: 5, name: 'Star', icon: '⭐', style: 'filled', category: 'rating' },
    { id: 6, name: 'Bell', icon: '🔔', style: 'outline', category: 'notification' },
    { id: 7, name: 'Mail', icon: '✉️', style: 'outline', category: 'communication' },
    { id: 8, name: 'Calendar', icon: '📅', style: 'filled', category: 'time' },
    { id: 9, name: 'Chart', icon: '📊', style: 'color', category: 'data' },
    { id: 10, name: 'Lock', icon: '🔒', style: 'filled', category: 'security' },
    { id: 11, name: 'Search', icon: '🔍', style: 'outline', category: 'interface' },
    { id: 12, name: 'Download', icon: '⬇️', style: 'outline', category: 'action' },
    { id: 13, name: 'Upload', icon: '⬆️', style: 'outline', category: 'action' },
    { id: 14, name: 'Camera', icon: '📷', style: 'filled', category: 'media' },
    { id: 15, name: 'Microphone', icon: '🎤', style: 'filled', category: 'media' },
    { id: 16, name: 'Video', icon: '🎥', style: 'filled', category: 'media' },
    { id: 17, name: 'Image', icon: '🖼️', style: 'outline', category: 'media' },
    { id: 18, name: 'Folder', icon: '📁', style: 'filled', category: 'file' },
    { id: 19, name: 'File', icon: '📄', style: 'outline', category: 'file' },
    { id: 20, name: 'Trash', icon: '🗑️', style: 'outline', category: 'action' },
  ];

  const filteredIcons = icons.filter(icon =>
    (selectedStyle === 'all' || icon.style === selectedStyle.toLowerCase()) &&
    (searchQuery === '' || icon.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Icon Library</h1>
          <p className="text-gray-600 mt-1">Browse thousands of professional icons for your presentations</p>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search icons..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <div className="flex gap-2">
              {styles.map((style) => (
                <button
                  key={style}
                  onClick={() => setSelectedStyle(style.toLowerCase())}
                  className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                    selectedStyle === style.toLowerCase()
                      ? 'bg-purple-600 text-white'
                      : 'border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Icon Grid */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
            {filteredIcons.map((icon) => (
              <div
                key={icon.id}
                className="aspect-square bg-gray-50 rounded-lg border border-gray-200 hover:border-purple-600 hover:bg-purple-50 transition-all cursor-pointer group flex flex-col items-center justify-center p-3"
                title={icon.name}
              >
                <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">
                  {icon.icon}
                </div>
                <div className="text-xs text-gray-600 text-center truncate w-full">
                  {icon.name}
                </div>
              </div>
            ))}
          </div>

          {filteredIcons.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">No icons found</h3>
              <p className="text-gray-600">Try a different search term or style</p>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
            <h3 className="font-semibold mb-2">💡 Tip</h3>
            <p className="text-sm text-gray-700">
              Click any icon to insert it into your presentation. You can resize and recolor icons after insertion.
            </p>
          </div>
          <div className="bg-green-50 rounded-xl border border-green-200 p-6">
            <h3 className="font-semibold mb-2">🎨 Customizable</h3>
            <p className="text-sm text-gray-700">
              All icons are vector-based (SVG) and can be scaled to any size without losing quality.
            </p>
          </div>
          <div className="bg-purple-50 rounded-xl border border-purple-200 p-6">
            <h3 className="font-semibold mb-2">📦 Library</h3>
            <p className="text-sm text-gray-700">
              Access 10,000+ icons across multiple styles and categories, all free to use.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

