import { useState } from 'react';

export default function StockImageBrowser() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['All', 'Business', 'Technology', 'Nature', 'People', 'Abstract', 'Food'];

  const images = [
    { id: 1, category: 'business', url: '💼', title: 'Business Meeting', author: 'John Doe' },
    { id: 2, category: 'technology', url: '💻', title: 'Laptop Workspace', author: 'Jane Smith' },
    { id: 3, category: 'nature', url: '🌄', title: 'Mountain Landscape', author: 'Bob Wilson' },
    { id: 4, category: 'people', url: '👥', title: 'Team Collaboration', author: 'Alice Brown' },
    { id: 5, category: 'abstract', url: '🎨', title: 'Colorful Abstract', author: 'Chris Lee' },
    { id: 6, category: 'food', url: '☕', title: 'Coffee and Laptop', author: 'Emma Davis' },
    { id: 7, category: 'business', url: '📊', title: 'Data Analytics', author: 'Mike Johnson' },
    { id: 8, category: 'technology', url: '📱', title: 'Mobile App Design', author: 'Sarah White' },
    { id: 9, category: 'nature', url: '🌊', title: 'Ocean Waves', author: 'Tom Green' },
    { id: 10, category: 'people', url: '🤝', title: 'Handshake Deal', author: 'Lisa Taylor' },
    { id: 11, category: 'abstract', url: '🌈', title: 'Gradient Background', author: 'David Chen' },
    { id: 12, category: 'food', url: '🍕', title: 'Pizza Party', author: 'Maria Garcia' },
  ];

  const filteredImages = images.filter(img =>
    (selectedCategory === 'all' || img.category === selectedCategory.toLowerCase()) &&
    (searchQuery === '' || img.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Stock Images</h1>
          <p className="text-gray-600 mt-1">Browse millions of high-quality, royalty-free images</p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex gap-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for images..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <button className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg">
              Search
            </button>
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category.toLowerCase())}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedCategory === category.toLowerCase()
                  ? 'bg-purple-600 text-white'
                  : 'bg-white border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Image Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredImages.map((image) => (
            <div
              key={image.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer"
            >
              {/* Image Preview */}
              <div className="aspect-square bg-gray-100 flex items-center justify-center text-6xl relative">
                {image.url}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <button className="opacity-0 group-hover:opacity-100 px-4 py-2 bg-white rounded-lg font-medium shadow-lg transition-opacity">
                    Insert
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="p-3">
                <h3 className="font-medium text-sm mb-1 truncate">{image.title}</h3>
                <p className="text-xs text-gray-600">by {image.author}</p>
              </div>
            </div>
          ))}
        </div>

        {filteredImages.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">No images found</h3>
            <p className="text-gray-600">Try a different search term or category</p>
          </div>
        )}

        {/* Powered By */}
        <div className="mt-8 text-center text-sm text-gray-500">
          Powered by Unsplash • All images are free to use
        </div>
      </div>
    </div>
  );
}

