import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Minimize2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Slide {
  id: string;
  title: string;
  content: string;
  layout: string;
  thumbnail?: string;
}

interface LivePreviewProps {
  slides: Slide[];
  currentSlideIndex: number;
  onSlideChange: (index: number) => void;
  isGenerating?: boolean;
  className?: string;
}

export function LivePreview({
  slides,
  currentSlideIndex,
  onSlideChange,
  isGenerating = false,
  className,
}: LivePreviewProps) {
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 10, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 10, 50));
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      previewRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handlePrevSlide = () => {
    if (currentSlideIndex > 0) {
      onSlideChange(currentSlideIndex - 1);
    }
  };

  const handleNextSlide = () => {
    if (currentSlideIndex < slides.length - 1) {
      onSlideChange(currentSlideIndex + 1);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrevSlide();
      if (e.key === "ArrowRight") handleNextSlide();
      if (e.key === "Escape" && isFullscreen) toggleFullscreen();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentSlideIndex, slides.length, isFullscreen]);

  const currentSlide = slides[currentSlideIndex];

  return (
    <div ref={previewRef} className={cn("flex flex-col h-full bg-muted/30", className)}>
      {/* Preview Header */}
      <div className="flex items-center justify-between p-4 border-b bg-background">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          <span className="font-semibold">Live Preview</span>
          {isGenerating && (
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating...
            </span>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomOut}
            disabled={zoom <= 50}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium min-w-[60px] text-center">
            {zoom}%
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomIn}
            disabled={zoom >= 200}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <div className="w-px h-6 bg-border mx-2" />
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Main Preview Area */}
      <div className="flex-1 overflow-hidden flex">
        {/* Slide Thumbnails */}
        <div className="w-48 border-r bg-background overflow-y-auto">
          <div className="p-2 space-y-2">
            {slides.map((slide, idx) => (
              <button
                key={slide.id}
                onClick={() => onSlideChange(idx)}
                className={cn(
                  "w-full aspect-video rounded-lg border-2 transition-all overflow-hidden group relative",
                  currentSlideIndex === idx
                    ? "border-primary shadow-md"
                    : "border-border hover:border-primary/50"
                )}
              >
                {/* Thumbnail placeholder */}
                <div className="w-full h-full bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 flex items-center justify-center">
                  <span className="text-xs font-semibold text-muted-foreground">
                    {idx + 1}
                  </span>
                </div>
                
                {/* Slide number badge */}
                <div className="absolute bottom-1 right-1 px-2 py-0.5 rounded bg-background/90 text-xs font-medium">
                  {idx + 1}
                </div>
              </button>
            ))}
            
            {/* Generating indicator */}
            {isGenerating && (
              <div className="w-full aspect-video rounded-lg border-2 border-dashed border-border flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
        </div>

        {/* Current Slide Display */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-auto">
          {slides.length === 0 ? (
            <div className="text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">No slides yet</h3>
                <p className="text-sm text-muted-foreground">
                  ☕ Brewing your presentation... Start creating and your slides will appear here in real-time
                </p>
              </div>
            </div>
          ) : currentSlide ? (
            <div 
              className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl transition-transform"
              style={{ 
                width: `${16 * zoom / 100}rem`,
                height: `${9 * zoom / 100}rem`,
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'center'
              }}
            >
              {/* Slide Content */}
              <div className="w-full h-full p-8 flex flex-col">
                <h2 className="text-2xl font-bold mb-4">{currentSlide.title}</h2>
                <div className="flex-1 text-sm whitespace-pre-wrap">
                  {currentSlide.content}
                </div>
              </div>
            </div>
          ) : null}

          {/* Navigation Arrows */}
          {slides.length > 0 && (
            <div className="flex items-center gap-4 mt-6">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePrevSlide}
                disabled={currentSlideIndex === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium">
                {currentSlideIndex + 1} / {slides.length}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={handleNextSlide}
                disabled={currentSlideIndex === slides.length - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

