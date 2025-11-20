import { useState } from 'react';

export default function ThemeEditor() {
  const [theme, setTheme] = useState({
    name: 'Custom Theme',
    primaryColor: '#8B5CF6',
    secondaryColor: '#3B82F6',
    accentColor: '#10B981',
    backgroundColor: '#FFFFFF',
    textColor: '#1F2937',
    fontFamily: 'Inter',
    fontSize: 16,
    borderRadius: 8,
  });

  const fontOptions = ['Inter', 'Roboto', 'Poppins', 'Montserrat', 'Lato', 'Open Sans'];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Theme Editor</h1>
            <p className="text-gray-600 mt-1">Customize your presentation theme</p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-white font-medium">
              Reset
            </button>
            <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg">
              Save Theme
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Settings Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Basic Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold mb-4">Basic Info</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Theme Name
                </label>
                <input
                  type="text"
                  value={theme.name}
                  onChange={(e) => setTheme({ ...theme, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Colors */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold mb-4">Colors</h3>
              <div className="space-y-4">
                {[
                  { key: 'primaryColor', label: 'Primary' },
                  { key: 'secondaryColor', label: 'Secondary' },
                  { key: 'accentColor', label: 'Accent' },
                  { key: 'backgroundColor', label: 'Background' },
                  { key: 'textColor', label: 'Text' },
                ].map((color) => (
                  <div key={color.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {color.label}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={theme[color.key as keyof typeof theme] as string}
                        onChange={(e) => setTheme({ ...theme, [color.key]: e.target.value })}
                        className="w-12 h-10 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={theme[color.key as keyof typeof theme]}
                        onChange={(e) => setTheme({ ...theme, [color.key]: e.target.value })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Typography */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold mb-4">Typography</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Font Family
                  </label>
                  <select
                    value={theme.fontFamily}
                    onChange={(e) => setTheme({ ...theme, fontFamily: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    {fontOptions.map((font) => (
                      <option key={font} value={font}>{font}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Base Font Size: {theme.fontSize}px
                  </label>
                  <input
                    type="range"
                    min="12"
                    max="24"
                    value={theme.fontSize}
                    onChange={(e) => setTheme({ ...theme, fontSize: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Styling */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold mb-4">Styling</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Border Radius: {theme.borderRadius}px
                </label>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={theme.borderRadius}
                  onChange={(e) => setTheme({ ...theme, borderRadius: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
              <h3 className="font-semibold mb-4">Live Preview</h3>
              
              {/* Preview Content */}
              <div
                className="p-8 rounded-lg"
                style={{
                  backgroundColor: theme.backgroundColor,
                  fontFamily: theme.fontFamily,
                  fontSize: `${theme.fontSize}px`,
                }}
              >
                {/* Title */}
                <h1
                  className="text-4xl font-bold mb-4"
                  style={{
                    color: theme.primaryColor,
                    borderRadius: `${theme.borderRadius}px`,
                  }}
                >
                  Presentation Title
                </h1>

                {/* Subtitle */}
                <p
                  className="text-xl mb-6"
                  style={{ color: theme.secondaryColor }}
                >
                  Your subtitle goes here
                </p>

                {/* Content Card */}
                <div
                  className="p-6 mb-6"
                  style={{
                    backgroundColor: theme.backgroundColor,
                    border: `2px solid ${theme.primaryColor}`,
                    borderRadius: `${theme.borderRadius}px`,
                  }}
                >
                  <h2
                    className="text-2xl font-semibold mb-3"
                    style={{ color: theme.textColor }}
                  >
                    Content Section
                  </h2>
                  <p style={{ color: theme.textColor }}>
                    This is how your content will look with the current theme settings.
                    The colors, fonts, and styling are all customizable.
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    className="px-6 py-3 font-semibold"
                    style={{
                      backgroundColor: theme.primaryColor,
                      color: '#FFFFFF',
                      borderRadius: `${theme.borderRadius}px`,
                    }}
                  >
                    Primary Button
                  </button>
                  <button
                    className="px-6 py-3 font-semibold"
                    style={{
                      backgroundColor: theme.secondaryColor,
                      color: '#FFFFFF',
                      borderRadius: `${theme.borderRadius}px`,
                    }}
                  >
                    Secondary Button
                  </button>
                  <button
                    className="px-6 py-3 font-semibold"
                    style={{
                      backgroundColor: theme.accentColor,
                      color: '#FFFFFF',
                      borderRadius: `${theme.borderRadius}px`,
                    }}
                  >
                    Accent Button
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

