import { useState } from 'react';

interface TemplatePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: {
    id: string;
    name: string;
    description: string;
    category: string;
    slides: number;
    preview: string;
  };
}

export default function TemplatePreviewModal({ isOpen, onClose, template }: TemplatePreviewModalProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  if (!isOpen) return null;

  const slidePreview = [
    { id: 1, title: 'Title Slide', icon: '📊' },
    { id: 2, title: 'Agenda', icon: '📋' },
    { id: 3, title: 'Content Slide', icon: '💡' },
    { id: 4, title: 'Data Visualization', icon: '📈' },
    { id: 5, title: 'Conclusion', icon: '✅' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{template.name}</h2>
            <p className="text-gray-600 mt-1">{template.description}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Slide Preview */}
          <div className="flex-1 bg-gray-100 p-8 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl aspect-video flex items-center justify-center">
              <div className="text-center p-12">
                <div className="text-6xl mb-4">{slidePreview[currentSlide].icon}</div>
                <h3 className="text-3xl font-bold">{slidePreview[currentSlide].title}</h3>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-80 border-l border-gray-200 p-6 overflow-y-auto">
            <h3 className="font-semibold mb-4">Template Info</h3>
            <div className="space-y-4 text-sm">
              <div>
                <span className="text-gray-600">Category:</span>
                <span className="ml-2 font-medium">{template.category}</span>
              </div>
              <div>
                <span className="text-gray-600">Slides:</span>
                <span className="ml-2 font-medium">{template.slides}</span>
              </div>
            </div>

            <h3 className="font-semibold mt-6 mb-4">Slide Thumbnails</h3>
            <div className="space-y-2">
              {slidePreview.map((slide, index) => (
                <button
                  key={slide.id}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-full p-3 rounded-lg text-left transition-all ${
                    currentSlide === index
                      ? 'bg-purple-100 border-2 border-purple-600'
                      : 'bg-gray-50 border-2 border-transparent hover:border-gray-300'
                  }`}
                >
                  <div className="aspect-video bg-white rounded flex items-center justify-center text-2xl mb-2">
                    {slide.icon}
                  </div>
                  <div className="text-xs font-medium">{slide.id}. {slide.title}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
              disabled={currentSlide === 0}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>
            <button
              onClick={() => setCurrentSlide(Math.min(slidePreview.length - 1, currentSlide + 1))}
              disabled={currentSlide === slidePreview.length - 1}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
            >
              Close
            </button>
            <button className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg">
              Use This Template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

