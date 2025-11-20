import { useState } from 'react';

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Topics', icon: '📚' },
    { id: 'getting-started', name: 'Getting Started', icon: '🚀' },
    { id: 'ai-features', name: 'AI Features', icon: '🤖' },
    { id: 'brands', name: 'Brand Management', icon: '🎨' },
    { id: 'collaboration', name: 'Collaboration', icon: '👥' },
    { id: 'export', name: 'Export & Share', icon: '📤' },
    { id: 'billing', name: 'Billing & Plans', icon: '💳' },
  ];

  const articles = [
    {
      id: 1,
      title: 'How to create your first presentation',
      category: 'getting-started',
      views: 1243,
      helpful: 95,
    },
    {
      id: 2,
      title: 'Using AI to generate slide content',
      category: 'ai-features',
      views: 987,
      helpful: 92,
    },
    {
      id: 3,
      title: 'Setting up brand guidelines',
      category: 'brands',
      views: 756,
      helpful: 88,
    },
    {
      id: 4,
      title: 'Inviting team members to your workspace',
      category: 'collaboration',
      views: 654,
      helpful: 90,
    },
    {
      id: 5,
      title: 'Exporting presentations to PowerPoint',
      category: 'export',
      views: 543,
      helpful: 94,
    },
    {
      id: 6,
      title: 'Understanding subscription plans',
      category: 'billing',
      views: 432,
      helpful: 87,
    },
  ];

  const filteredArticles = articles.filter(
    (article) =>
      (selectedCategory === 'all' || article.category === selectedCategory) &&
      (searchQuery === '' || article.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-16">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold mb-4">How can we help you?</h1>
          <p className="text-xl mb-8 opacity-90">Search our knowledge base or browse categories</p>
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for articles..."
                className="w-full px-6 py-4 rounded-lg text-gray-900 text-lg focus:ring-4 focus:ring-white/30 focus:outline-none"
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium">
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        <div className="flex gap-8">
          {/* Sidebar Categories */}
          <div className="w-64 flex-shrink-0">
            <h3 className="font-semibold mb-4">Categories</h3>
            <nav className="space-y-1">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-purple-50 text-purple-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-xl">{category.icon}</span>
                  {category.name}
                </button>
              ))}
            </nav>

            <div className="mt-8 p-6 bg-purple-50 rounded-xl border border-purple-200">
              <h3 className="font-semibold mb-2">Need more help?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Can't find what you're looking for? Contact our support team.
              </p>
              <button className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg">
                Contact Support
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">
                {selectedCategory === 'all'
                  ? 'All Articles'
                  : categories.find((c) => c.id === selectedCategory)?.name}
              </h2>
              <p className="text-gray-600">{filteredArticles.length} articles found</p>
            </div>

            <div className="space-y-4">
              {filteredArticles.map((article) => (
                <div
                  key={article.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <h3 className="text-lg font-semibold mb-2">{article.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>{article.views} views</span>
                    <span>•</span>
                    <span className="text-green-600">{article.helpful}% helpful</span>
                  </div>
                </div>
              ))}
            </div>

            {filteredArticles.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold mb-2">No articles found</h3>
                <p className="text-gray-600">Try adjusting your search or browse all categories</p>
              </div>
            )}
          </div>
        </div>

        {/* Popular Topics */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Popular Topics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Quick Start Guide', icon: '⚡', color: 'purple' },
              { title: 'AI Best Practices', icon: '🧠', color: 'blue' },
              { title: 'Keyboard Shortcuts', icon: '⌨️', color: 'green' },
              { title: 'Template Library', icon: '📚', color: 'orange' },
              { title: 'Video Tutorials', icon: '🎥', color: 'red' },
              { title: 'API Documentation', icon: '🔧', color: 'gray' },
            ].map((topic) => (
              <div
                key={topic.title}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="text-4xl mb-3">{topic.icon}</div>
                <h3 className="font-semibold">{topic.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

