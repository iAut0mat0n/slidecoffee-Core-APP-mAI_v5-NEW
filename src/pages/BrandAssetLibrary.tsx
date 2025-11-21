import { useState } from 'react';

export default function BrandAssetLibrary() {
  const [activeTab, setActiveTab] = useState<'logos' | 'images' | 'icons' | 'fonts'>('logos');

  const assets = {
    logos: [
      { id: 1, name: 'Primary Logo', url: '🏢', size: '1200x400', format: 'PNG' },
      { id: 2, name: 'Logo Icon', url: '⭐', size: '512x512', format: 'SVG' },
      { id: 3, name: 'White Logo', url: '🏢', size: '1200x400', format: 'PNG' },
      { id: 4, name: 'Black Logo', url: '🏢', size: '1200x400', format: 'PNG' },
    ],
    images: [
      { id: 1, name: 'Hero Image', url: '🖼️', size: '1920x1080', format: 'JPG' },
      { id: 2, name: 'Team Photo', url: '👥', size: '1600x900', format: 'JPG' },
      { id: 3, name: 'Office Space', url: '🏢', size: '1920x1080', format: 'JPG' },
      { id: 4, name: 'Product Shot', url: '📱', size: '1200x1200', format: 'PNG' },
    ],
    icons: [
      { id: 1, name: 'Check Icon', url: '✓', size: '64x64', format: 'SVG' },
      { id: 2, name: 'Arrow Icon', url: '→', size: '64x64', format: 'SVG' },
      { id: 3, name: 'Star Icon', url: '⭐', size: '64x64', format: 'SVG' },
      { id: 4, name: 'Heart Icon', url: '❤️', size: '64x64', format: 'SVG' },
    ],
    fonts: [
      { id: 1, name: 'Heading Font', url: 'Aa', family: 'Inter Bold', format: 'TTF' },
      { id: 2, name: 'Body Font', url: 'Aa', family: 'Inter Regular', format: 'TTF' },
      { id: 3, name: 'Display Font', url: 'Aa', family: 'Playfair Display', format: 'TTF' },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Brand Asset Library</h1>
            <p className="text-gray-600 mt-1">Manage your brand assets in one place</p>
          </div>
          <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg">
            + Upload Asset
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            {(['logos', 'images', 'icons', 'fonts'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 font-medium capitalize transition-colors ${
                  activeTab === tab
                    ? 'border-b-2 border-purple-600 text-purple-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {assets[activeTab].map((asset) => (
                <div
                  key={asset.id}
                  className="bg-gray-50 rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow group"
                >
                  {/* Preview */}
                  <div className="aspect-square bg-white rounded-lg flex items-center justify-center mb-4 text-6xl">
                    {asset.url}
                  </div>

                  {/* Info */}
                  <h3 className="font-semibold mb-1">{asset.name}</h3>
                  <div className="text-sm text-gray-600 mb-3">
                    {activeTab === 'fonts' ? (
                      <div>{(asset as typeof assets.fonts[0]).family}</div>
                    ) : (
                      <div>{(asset as typeof assets.logos[0]).size}</div>
                    )}
                    <div>{asset.format}</div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-white">
                      Download
                    </button>
                    <button className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-white">
                      ⋯
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Usage Guidelines */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4">Usage Guidelines</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Logo Usage</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Maintain minimum clear space</li>
                <li>• Don't distort or rotate</li>
                <li>• Use approved color variations</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Color Palette</h3>
              <div className="flex gap-2 mt-2">
                <div className="w-12 h-12 rounded bg-purple-600" title="#8B5CF6"></div>
                <div className="w-12 h-12 rounded bg-blue-600" title="#3B82F6"></div>
                <div className="w-12 h-12 rounded bg-gray-900" title="#111827"></div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Typography</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Headings: Inter Bold</li>
                <li>• Body: Inter Regular</li>
                <li>• Display: Playfair Display</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

