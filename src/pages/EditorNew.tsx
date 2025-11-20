import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function EditorNew() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides] = useState([
    { id: 1, title: 'Title Slide', content: 'Market Analysis Q1 2024' },
    { id: 2, title: 'Overview', content: 'Key Findings' },
    { id: 3, title: 'Data', content: 'Market Trends' },
    { id: 4, title: 'Conclusion', content: 'Next Steps' },
  ]);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top Toolbar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            ← Back
          </button>
          <div>
            <h1 className="font-semibold">Q4 Sales Deck</h1>
            <p className="text-sm text-gray-500">Last edited 2 min ago</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">
            Preview
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">
            Export
          </button>
          <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg">
            Share
          </button>
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Slide Thumbnails */}
        <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4">
            <button className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg mb-4">
              + Add Slide
            </button>

            <div className="space-y-2">
              {slides.map((slide, index) => (
                <button
                  key={slide.id}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-full p-3 rounded-lg text-left transition-all ${
                    currentSlide === index
                      ? 'bg-purple-50 border-2 border-purple-500'
                      : 'bg-gray-50 border-2 border-transparent hover:border-gray-300'
                  }`}
                >
                  <div className="text-xs text-gray-500 mb-1">Slide {index + 1}</div>
                  <div className="font-medium text-sm">{slide.title}</div>
                  <div className="text-xs text-gray-600 mt-1 truncate">{slide.content}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Center - Canvas */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-auto">
          <div className="bg-white rounded-lg shadow-2xl" style={{ width: '960px', height: '540px', aspectRatio: '16/9' }}>
            <div className="h-full flex flex-col items-center justify-center p-12 text-center">
              <h1 className="text-5xl font-bold mb-4">{slides[currentSlide].content}</h1>
              <p className="text-xl text-gray-600">Slide {currentSlide + 1} of {slides.length}</p>
              <div className="mt-8 text-sm text-gray-400">
                Click to edit content
              </div>
            </div>
          </div>

          {/* Slide Navigation */}
          <div className="mt-6 flex items-center gap-4">
            <button
              onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
              disabled={currentSlide === 0}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>
            <span className="text-sm text-gray-600">
              {currentSlide + 1} / {slides.length}
            </span>
            <button
              onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))}
              disabled={currentSlide === slides.length - 1}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </div>
        </div>

        {/* Right Sidebar - Properties */}
        <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
          <div className="p-4 space-y-6">
            <div>
              <h3 className="font-semibold mb-3">Slide Properties</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Layout
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option>Title Slide</option>
                    <option>Title + Content</option>
                    <option>Two Columns</option>
                    <option>Image + Text</option>
                    <option>Full Image</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Background
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      defaultValue="#FFFFFF"
                      className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      defaultValue="#FFFFFF"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Theme
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option>Default</option>
                    <option>Modern</option>
                    <option>Minimal</option>
                    <option>Bold</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="font-semibold mb-3">Animations</h3>
              <button className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                + Add Animation
              </button>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="font-semibold mb-3">Notes</h3>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                rows={4}
                placeholder="Add speaker notes..."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

