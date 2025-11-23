import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Coffee } from 'lucide-react';

export default function PresentationViewer() {
  const { id } = useParams();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [slides] = useState([
    { id: 1, title: 'Market Analysis Q1 2024', content: 'Comprehensive Market Overview' },
    { id: 2, title: 'Key Findings', content: '• Revenue up 45%\n• Market share increased\n• Customer satisfaction at 92%' },
    { id: 3, title: 'Market Trends', content: 'Data visualization and insights' },
    { id: 4, title: 'Next Steps', content: 'Strategic recommendations for Q2' },
  ]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        setCurrentSlide((prev) => Math.min(slides.length - 1, prev + 1));
      } else if (e.key === 'ArrowLeft') {
        setCurrentSlide((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [slides.length, isFullscreen]);

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50' : 'min-h-screen'} bg-gray-900 flex flex-col`}>
      {/* Top Controls (hidden in fullscreen) */}
      {!isFullscreen && (
        <div className="bg-gray-800 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Coffee className="w-7 h-7" />
              <span className="font-semibold">SlideCoffee</span>
            </div>
            <div className="h-6 w-px bg-gray-600" />
            <h1 className="font-medium">Q4 Sales Deck</h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleFullscreen}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium"
            >
              Present
            </button>
            <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium">
              Get SlideCoffee
            </button>
          </div>
        </div>
      )}

      {/* Main Presentation Area */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="relative w-full max-w-7xl">
          {/* Slide */}
          <div
            className="bg-white rounded-lg shadow-2xl mx-auto"
            style={{
              width: '100%',
              maxWidth: '1280px',
              aspectRatio: '16/9',
            }}
          >
            <div className="h-full flex flex-col items-center justify-center p-16 text-center">
              <h1 className="text-6xl font-bold mb-6">{slides[currentSlide].title}</h1>
              <div className="text-2xl text-gray-600 whitespace-pre-line">
                {slides[currentSlide].content}
              </div>
            </div>
          </div>

          {/* Navigation Arrows */}
          {currentSlide > 0 && (
            <button
              onClick={() => setCurrentSlide(currentSlide - 1)}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-16 w-12 h-12 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center text-white text-2xl"
            >
              ‹
            </button>
          )}
          {currentSlide < slides.length - 1 && (
            <button
              onClick={() => setCurrentSlide(currentSlide + 1)}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-16 w-12 h-12 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center text-white text-2xl"
            >
              ›
            </button>
          )}
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="bg-gray-800 text-white px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
              disabled={currentSlide === 0}
              className="p-2 hover:bg-gray-700 rounded disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>
            <span className="text-sm">
              {currentSlide + 1} / {slides.length}
            </span>
            <button
              onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))}
              disabled={currentSlide === slides.length - 1}
              className="p-2 hover:bg-gray-700 rounded disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </div>

          {/* Slide Thumbnails */}
          <div className="flex gap-2">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                onClick={() => setCurrentSlide(index)}
                className={`w-16 h-9 rounded border-2 transition-all ${
                  currentSlide === index
                    ? 'border-purple-500 bg-purple-900'
                    : 'border-gray-600 bg-gray-700 hover:border-gray-500'
                }`}
                title={`Slide ${index + 1}: ${slide.title}`}
              >
                <div className="text-xs truncate px-1">{index + 1}</div>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {!isFullscreen && (
              <button
                onClick={toggleFullscreen}
                className="p-2 hover:bg-gray-700 rounded"
                title="Fullscreen (F)"
              >
                ⛶
              </button>
            )}
            <button className="p-2 hover:bg-gray-700 rounded" title="Settings">
              ⚙️
            </button>
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts Hint */}
      {!isFullscreen && (
        <div className="absolute bottom-20 right-6 bg-gray-800 text-white text-xs px-3 py-2 rounded-lg opacity-70">
          <div>← → Navigate</div>
          <div>Space Next slide</div>
          <div>Esc Exit fullscreen</div>
        </div>
      )}
    </div>
  );
}

