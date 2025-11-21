import { useState } from 'react';

interface Font {
  id: number;
  name: string;
  family: string;
  style: 'regular' | 'bold' | 'italic' | 'bold-italic';
  format: 'ttf' | 'otf' | 'woff' | 'woff2';
  size: string;
  uploadedAt: string;
  usageCount: number;
}

export default function FontManagement() {
  const [fonts, setFonts] = useState<Font[]>([
    {
      id: 1,
      name: 'Montserrat Regular',
      family: 'Montserrat',
      style: 'regular',
      format: 'woff2',
      size: '156 KB',
      uploadedAt: '2024-01-15',
      usageCount: 12,
    },
    {
      id: 2,
      name: 'Montserrat Bold',
      family: 'Montserrat',
      style: 'bold',
      format: 'woff2',
      size: '164 KB',
      uploadedAt: '2024-01-15',
      usageCount: 8,
    },
    {
      id: 3,
      name: 'Roboto Regular',
      family: 'Roboto',
      style: 'regular',
      format: 'ttf',
      size: '245 KB',
      uploadedAt: '2024-01-10',
      usageCount: 5,
    },
  ]);

  const [selectedFont, setSelectedFont] = useState<Font | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStyle, setFilterStyle] = useState<string>('all');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // Handle font file upload
      console.log('Uploading fonts:', files);
    }
  };

  const filteredFonts = fonts.filter((font) => {
    const matchesSearch = font.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      font.family.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStyle = filterStyle === 'all' || font.style === filterStyle;
    return matchesSearch && matchesStyle;
  });

  const groupedFonts = filteredFonts.reduce((acc, font) => {
    if (!acc[font.family]) {
      acc[font.family] = [];
    }
    acc[font.family].push(font);
    return acc;
  }, {} as Record<string, Font[]>);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Font Management</h1>
              <p className="text-gray-600 mt-1">Upload and manage custom fonts for your presentations</p>
            </div>
            <div>
              <input
                type="file"
                accept=".ttf,.otf,.woff,.woff2"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                id="font-upload"
              />
              <label
                htmlFor="font-upload"
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg cursor-pointer inline-block"
              >
                + Upload Fonts
              </label>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mt-6 flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search fonts..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterStyle}
              onChange={(e) => setFilterStyle(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Styles</option>
              <option value="regular">Regular</option>
              <option value="bold">Bold</option>
              <option value="italic">Italic</option>
              <option value="bold-italic">Bold Italic</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Font List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow border border-gray-200">
              {/* Stats */}
              <div className="p-6 border-b border-gray-200">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-2xl font-bold">{fonts.length}</div>
                    <div className="text-sm text-gray-600">Total Fonts</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{Object.keys(groupedFonts).length}</div>
                    <div className="text-sm text-gray-600">Font Families</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {fonts.reduce((sum, f) => sum + f.usageCount, 0)}
                    </div>
                    <div className="text-sm text-gray-600">Total Usage</div>
                  </div>
                </div>
              </div>

              {/* Font Groups */}
              <div className="divide-y divide-gray-200">
                {Object.entries(groupedFonts).map(([family, familyFonts]) => (
                  <div key={family} className="p-6">
                    <h3 className="text-lg font-semibold mb-4">{family}</h3>
                    <div className="space-y-3">
                      {familyFonts.map((font) => (
                        <div
                          key={font.id}
                          onClick={() => setSelectedFont(font)}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            selectedFont?.id === font.id
                              ? 'border-purple-600 bg-purple-50'
                              : 'border-gray-200 hover:border-purple-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="font-medium">{font.name}</span>
                                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                  {font.format.toUpperCase()}
                                </span>
                                <span className="text-sm text-gray-500">{font.size}</span>
                              </div>
                              <div
                                className="text-2xl mb-2"
                                style={{ fontFamily: font.family }}
                              >
                                The quick brown fox jumps over the lazy dog
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span>📊 Used in {font.usageCount} presentations</span>
                                <span>📅 {font.uploadedAt}</span>
                              </div>
                            </div>
                            <button className="ml-4 text-gray-400 hover:text-red-600">
                              🗑️
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {filteredFonts.length === 0 && (
                  <div className="p-12 text-center text-gray-500">
                    <div className="text-6xl mb-4">🔤</div>
                    <p className="text-lg">No fonts found</p>
                    <p className="text-sm mt-2">Try adjusting your search or filters</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upload Instructions */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <h3 className="font-semibold mb-4">Upload Instructions</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex gap-3">
                  <span>✅</span>
                  <span>Supported formats: TTF, OTF, WOFF, WOFF2</span>
                </div>
                <div className="flex gap-3">
                  <span>✅</span>
                  <span>Maximum file size: 5MB per font</span>
                </div>
                <div className="flex gap-3">
                  <span>✅</span>
                  <span>Upload multiple fonts at once</span>
                </div>
                <div className="flex gap-3">
                  <span>⚠️</span>
                  <span>Ensure you have proper licensing for uploaded fonts</span>
                </div>
              </div>
            </div>

            {/* Font Preview */}
            {selectedFont && (
              <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                <h3 className="font-semibold mb-4">Font Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-600">Font Name</label>
                    <div className="font-medium">{selectedFont.name}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Family</label>
                    <div className="font-medium">{selectedFont.family}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Style</label>
                    <div className="font-medium capitalize">{selectedFont.style.replace('-', ' ')}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Format</label>
                    <div className="font-medium">{selectedFont.format.toUpperCase()}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">File Size</label>
                    <div className="font-medium">{selectedFont.size}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Usage</label>
                    <div className="font-medium">{selectedFont.usageCount} presentations</div>
                  </div>
                  
                  <button className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg mt-4">
                    Delete Font
                  </button>
                </div>
              </div>
            )}

            {/* Google Fonts Integration */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border border-purple-200 p-6">
              <h3 className="font-semibold mb-2">💡 Pro Tip</h3>
              <p className="text-sm text-gray-700 mb-4">
                Browse and add fonts from Google Fonts library without uploading
              </p>
              <button className="w-full px-4 py-2 bg-white hover:bg-gray-50 border border-gray-300 font-medium rounded-lg">
                Browse Google Fonts
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

