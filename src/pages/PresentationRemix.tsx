import { useState } from 'react';

export default function PresentationRemix() {
  const [selectedSlides, setSelectedSlides] = useState<number[]>([]);
  
  const sourcePresentation = {
    id: 1,
    title: 'Q4 Sales Deck',
    slides: [
      { id: 1, title: 'Title Slide', thumbnail: '📊' },
      { id: 2, title: 'Executive Summary', thumbnail: '📈' },
      { id: 3, title: 'Revenue Breakdown', thumbnail: '💰' },
      { id: 4, title: 'Market Analysis', thumbnail: '🎯' },
      { id: 5, title: 'Customer Insights', thumbnail: '👥' },
      { id: 6, title: 'Product Roadmap', thumbnail: '🚀' },
      { id: 7, title: 'Team Structure', thumbnail: '🏢' },
      { id: 8, title: 'Financial Projections', thumbnail: '📉' },
      { id: 9, title: 'Next Steps', thumbnail: '✅' },
      { id: 10, title: 'Thank You', thumbnail: '🙏' },
    ],
  };

  const toggleSlide = (slideId: number) => {
    setSelectedSlides((prev) =>
      prev.includes(slideId)
        ? prev.filter((id) => id !== slideId)
        : [...prev, slideId]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Remix Presentation</h1>
          <p className="text-gray-600 mt-1">
            Select slides to create a new presentation from {sourcePresentation.title}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Slide Selection */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">
                  Select Slides ({selectedSlides.length}/{sourcePresentation.slides.length})
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedSlides(sourcePresentation.slides.map((s) => s.id))}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Select All
                  </button>
                  <button
                    onClick={() => setSelectedSlides([])}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {sourcePresentation.slides.map((slide) => (
                  <div
                    key={slide.id}
                    onClick={() => toggleSlide(slide.id)}
                    className={`relative p-6 border-2 rounded-xl cursor-pointer transition-all ${
                      selectedSlides.includes(slide.id)
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    {selectedSlides.includes(slide.id) && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm">
                        ✓
                      </div>
                    )}
                    <div className="text-4xl mb-3 text-center">{slide.thumbnail}</div>
                    <div className="text-sm font-medium text-center">{slide.title}</div>
                    <div className="text-xs text-gray-500 text-center mt-1">Slide {slide.id}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Options Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Remix Options */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold mb-4">Remix Options</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Presentation Name
                  </label>
                  <input
                    type="text"
                    placeholder="My Remixed Deck"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Apply Theme
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option>Keep Original</option>
                    <option>Modern Business</option>
                    <option>Creative Bold</option>
                    <option>Minimal Clean</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" defaultChecked />
                    <span className="text-sm">Preserve animations</span>
                  </label>
                </div>

                <div>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" defaultChecked />
                    <span className="text-sm">Keep comments</span>
                  </label>
                </div>

                <div>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">Reorder slides automatically</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold mb-4">Preview Order</h3>
              {selectedSlides.length > 0 ? (
                <div className="space-y-2">
                  {selectedSlides.map((slideId, index) => {
                    const slide = sourcePresentation.slides.find((s) => s.id === slideId);
                    return (
                      <div key={slideId} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                        <span className="text-sm font-medium text-gray-500">{index + 1}.</span>
                        <span className="text-2xl">{slide?.thumbnail}</span>
                        <span className="text-sm flex-1">{slide?.title}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 text-sm">
                  No slides selected
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                disabled={selectedSlides.length === 0}
                className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Remix ({selectedSlides.length} slides)
              </button>
              <button className="w-full px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

