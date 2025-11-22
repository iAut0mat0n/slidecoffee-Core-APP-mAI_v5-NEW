import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, X, Maximize, Minimize } from 'lucide-react'
import Button from './Button'

interface Slide {
  id: string
  title: string
  content: any
  layout?: string
}

interface PresentationSlideshowProps {
  slides: Slide[]
  initialSlide?: number
  onClose: () => void
  projectName?: string
}

export default function PresentationSlideshow({
  slides,
  initialSlide = 0,
  onClose,
  projectName = 'Presentation'
}: PresentationSlideshowProps) {
  const [currentSlide, setCurrentSlide] = useState(initialSlide)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const goToNext = useCallback(() => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1)
    }
  }, [currentSlide, slides.length])

  const goToPrevious = useCallback(() => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1)
    }
  }, [currentSlide])

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true)
      }).catch(err => {
        console.error('Error attempting to enable fullscreen:', err)
      })
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false)
      })
    }
  }, [])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault()
        goToNext()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        goToPrevious()
      } else if (e.key === 'Escape') {
        if (document.fullscreenElement) {
          document.exitFullscreen()
        } else {
          onClose()
        }
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault()
        toggleFullscreen()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [goToNext, goToPrevious, onClose, toggleFullscreen])

  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  if (slides.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-xl mb-4">No slides to present</p>
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    )
  }

  const slide = slides[currentSlide]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-black bg-opacity-50 text-white">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold">{projectName}</h2>
          <span className="text-sm text-gray-400">
            Slide {currentSlide + 1} of {slides.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleFullscreen}
            className="p-2 hover:bg-white hover:bg-opacity-10 rounded transition-colors"
            title={isFullscreen ? 'Exit fullscreen (F)' : 'Fullscreen (F)'}
          >
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-10 rounded transition-colors"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Slide Area */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-6xl aspect-video bg-white rounded-lg shadow-2xl p-12 flex flex-col">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">{slide.title}</h1>
          
          <div className="flex-1 overflow-y-auto">
            {typeof slide.content === 'string' ? (
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 text-xl leading-relaxed whitespace-pre-wrap">
                  {slide.content}
                </p>
              </div>
            ) : slide.content?.blocks ? (
              <div className="space-y-4">
                {slide.content.blocks.map((block: any, idx: number) => (
                  <div key={idx}>
                    {block.type === 'heading' && (
                      <h2 className="text-2xl font-semibold text-gray-800 mb-3">
                        {block.content}
                      </h2>
                    )}
                    {block.type === 'text' && (
                      <p className="text-lg text-gray-700 leading-relaxed">
                        {block.content}
                      </p>
                    )}
                    {block.type === 'list' && (
                      <ul className="space-y-2 ml-6">
                        {block.items?.map((item: string, i: number) => (
                          <li key={i} className="text-lg text-gray-700 list-disc">
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="prose prose-lg max-w-none">
                <pre className="text-sm bg-gray-50 p-4 rounded">
                  {JSON.stringify(slide.content, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-center px-6 py-6 bg-black bg-opacity-50">
        <div className="flex items-center gap-4">
          <Button
            variant="secondary"
            size="lg"
            onClick={goToPrevious}
            disabled={currentSlide === 0}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white border-0"
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Previous
          </Button>

          {/* Slide Indicators */}
          <div className="flex gap-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentSlide
                    ? 'bg-white w-8'
                    : 'bg-white bg-opacity-40 hover:bg-opacity-60'
                }`}
                title={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          <Button
            variant="primary"
            size="lg"
            onClick={goToNext}
            disabled={currentSlide === slides.length - 1}
            className="bg-primary-600 hover:bg-primary-700"
          >
            Next
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>

      {/* Keyboard Shortcuts Hint */}
      <div className="absolute bottom-20 right-6 text-white text-xs bg-black bg-opacity-50 px-3 py-2 rounded">
        <p>← → Navigate | F Fullscreen | Esc Close</p>
      </div>
    </div>
  )
}
