import { useState } from 'react';

export default function SlideEditor() {
  const [selectedSlide, setSelectedSlide] = useState(1);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);

  const slides = [
    { id: 1, title: 'Title Slide', thumbnail: '📊' },
    { id: 2, title: 'Introduction', thumbnail: '👋' },
    { id: 3, title: 'Key Points', thumbnail: '💡' },
    { id: 4, title: 'Data Analysis', thumbnail: '📈' },
    { id: 5, title: 'Conclusion', thumbnail: '✅' },
  ];

  const tools = [
    { id: 'select', icon: '↖️', label: 'Select' },
    { id: 'text', icon: 'T', label: 'Text' },
    { id: 'shape', icon: '▢', label: 'Shape' },
    { id: 'image', icon: '🖼️', label: 'Image' },
    { id: 'chart', icon: '📊', label: 'Chart' },
    { id: 'icon', icon: '⭐', label: 'Icon' },
  ];

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Top Toolbar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="text-2xl">☕</button>
            <div>
              <h1 className="font-semibold">Q4 Sales Presentation</h1>
              <p className="text-xs text-gray-500">Last edited 2 minutes ago</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Collaboration Avatars */}
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs border-2 border-white">
                JD
              </div>
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs border-2 border-white">
                AS
              </div>
            </div>

            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">
              Share
            </button>
            <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg">
              Present
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Slide Thumbnails */}
        <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Slides</h3>
              <button className="text-purple-600 hover:text-purple-700 text-xl">+</button>
            </div>
            <div className="space-y-2">
              {slides.map((slide) => (
                <div
                  key={slide.id}
                  onClick={() => setSelectedSlide(slide.id)}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${
                    selectedSlide === slide.id
                      ? 'bg-purple-100 border-2 border-purple-600'
                      : 'bg-gray-50 border-2 border-transparent hover:border-gray-300'
                  }`}
                >
                  <div className="aspect-video bg-white rounded flex items-center justify-center text-4xl mb-2">
                    {slide.thumbnail}
                  </div>
                  <div className="text-xs font-medium text-gray-700">{slide.id}. {slide.title}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Canvas */}
        <div className="flex-1 flex flex-col">
          {/* Editor Toolbar */}
          <div className="bg-white border-b border-gray-200 px-4 py-2">
            <div className="flex items-center gap-1">
              {tools.map((tool) => (
                <button
                  key={tool.id}
                  className="px-3 py-2 hover:bg-gray-100 rounded-lg flex flex-col items-center gap-1 group"
                  title={tool.label}
                >
                  <span className="text-lg">{tool.icon}</span>
                  <span className="text-xs text-gray-600 group-hover:text-gray-900">{tool.label}</span>
                </button>
              ))}
              <div className="w-px h-8 bg-gray-300 mx-2"></div>
              <button className="px-3 py-2 hover:bg-gray-100 rounded-lg" title="Undo">
                ↶
              </button>
              <button className="px-3 py-2 hover:bg-gray-100 rounded-lg" title="Redo">
                ↷
              </button>
            </div>
          </div>

          {/* Canvas Area */}
          <div className="flex-1 overflow-auto p-8 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-2xl" style={{ width: '960px', height: '540px' }}>
              {/* Slide Content */}
              <div className="w-full h-full p-12 flex flex-col items-center justify-center">
                <h1 className="text-5xl font-bold mb-6 text-center">
                  Q4 Sales Report
                </h1>
                <p className="text-2xl text-gray-600 text-center">
                  Quarterly Performance Overview
                </p>
                <div className="mt-12 text-6xl">📊</div>
              </div>
            </div>
          </div>

          {/* Bottom Toolbar */}
          <div className="bg-white border-t border-gray-200 px-4 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button className="px-3 py-1 hover:bg-gray-100 rounded">50%</button>
                <button className="px-3 py-1 hover:bg-gray-100 rounded">75%</button>
                <button className="px-3 py-1 bg-gray-100 rounded font-medium">100%</button>
                <button className="px-3 py-1 hover:bg-gray-100 rounded">150%</button>
              </div>
              <div className="text-sm text-gray-600">
                Slide {selectedSlide} of {slides.length}
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Properties */}
        <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
          <div className="p-4">
            <h3 className="font-semibold mb-4">Properties</h3>
            
            {/* Slide Properties */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Background
                </label>
                <div className="flex gap-2">
                  <button className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                    Color
                  </button>
                  <button className="flex-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    Image
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Layout
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option>Title Slide</option>
                  <option>Title + Content</option>
                  <option>Two Columns</option>
                  <option>Blank</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transition
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option>None</option>
                  <option>Fade</option>
                  <option>Slide</option>
                  <option>Zoom</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Speaker Notes
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none"
                  rows={4}
                  placeholder="Add notes for this slide..."
                ></textarea>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

