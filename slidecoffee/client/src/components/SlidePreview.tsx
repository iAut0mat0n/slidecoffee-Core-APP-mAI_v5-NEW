import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Minimize2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CheckCircle2
} from "lucide-react";

export interface Slide {
  id: string;
  number: number;
  title: string;
  content?: string;
  status: "pending" | "generating" | "complete" | "error";
  thumbnail?: string;
}

interface SlidePreviewProps {
  slides: Slide[];
  currentSlideIndex: number;
  onSlideChange: (index: number) => void;
}

export function SlidePreview({ slides, currentSlideIndex, onSlideChange }: SlidePreviewProps) {
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const currentSlide = slides[currentSlideIndex];

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50));
  const handlePrevSlide = () => onSlideChange(Math.max(0, currentSlideIndex - 1));
  const handleNextSlide = () => onSlideChange(Math.min(slides.length - 1, currentSlideIndex + 1));

  if (slides.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <PreviewToolbar
          zoom={zoom}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          isFullscreen={isFullscreen}
          onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
          currentSlide={0}
          totalSlides={0}
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4 max-w-md px-4">
            <div className="w-24 h-24 mx-auto rounded-full bg-muted flex items-center justify-center">
              <div className="text-4xl">☕</div>
            </div>
            <h3 className="text-xl font-semibold">No slides yet</h3>
            <p className="text-muted-foreground">
              Start chatting to create your presentation. Slides will appear here in real-time!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full flex flex-col ${isFullscreen ? "fixed inset-0 z-50 bg-background" : ""}`}>
      <PreviewToolbar
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        isFullscreen={isFullscreen}
        onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
        currentSlide={currentSlideIndex + 1}
        totalSlides={slides.length}
        onPrevSlide={handlePrevSlide}
        onNextSlide={handleNextSlide}
        canGoPrev={currentSlideIndex > 0}
        canGoNext={currentSlideIndex < slides.length - 1}
      />

      <div className="flex-1 overflow-hidden flex">
        {/* Main Preview */}
        <div className="flex-1 flex items-center justify-center p-6 bg-muted/30">
          <div 
            className="bg-white shadow-2xl transition-all duration-300"
            style={{
              width: `${zoom}%`,
              aspectRatio: "16/9",
              maxWidth: "100%",
              maxHeight: "100%"
            }}
          >
            {currentSlide.status === "pending" && (
              <div className="w-full h-full flex items-center justify-center bg-muted/50">
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-full bg-muted flex items-center justify-center">
                    <div className="text-2xl">⏳</div>
                  </div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </div>
              </div>
            )}

            {currentSlide.status === "generating" && (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
                <div className="text-center space-y-3">
                  <Loader2 className="w-12 h-12 mx-auto animate-spin text-primary" />
                  <p className="text-sm font-medium">Generating slide {currentSlide.number}...</p>
                  <p className="text-xs text-muted-foreground">{currentSlide.title}</p>
                </div>
              </div>
            )}

            {currentSlide.status === "complete" && (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-8">
                <div className="text-center space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                    <CheckCircle2 className="w-3 h-3" />
                    Complete
                  </div>
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">Slide {currentSlide.number}</div>
                    <h2 className="text-3xl font-bold">{currentSlide.title}</h2>
                  </div>
                  {currentSlide.content && (
                    <p className="text-sm text-muted-foreground max-w-md">{currentSlide.content}</p>
                  )}
                  <div className="pt-4 text-xs text-muted-foreground">
                    This is a preview. Full slide content will be available after generation.
                  </div>
                </div>
              </div>
            )}

            {currentSlide.status === "error" && (
              <div className="w-full h-full flex items-center justify-center bg-red-50">
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-full bg-red-100 flex items-center justify-center">
                    <div className="text-2xl">⚠️</div>
                  </div>
                  <p className="text-sm font-medium text-red-700">Error generating slide</p>
                  <p className="text-xs text-muted-foreground">Please try again</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Thumbnail Sidebar */}
        {!isFullscreen && (
          <div className="w-48 border-l bg-background/50 backdrop-blur overflow-y-auto p-3 space-y-2">
            <div className="text-xs font-medium text-muted-foreground px-2 py-1">
              Slides ({slides.length})
            </div>
            {slides.map((slide, index) => (
              <SlideThumbnail
                key={slide.id}
                slide={slide}
                isActive={index === currentSlideIndex}
                onClick={() => onSlideChange(index)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PreviewToolbar({
  zoom,
  onZoomIn,
  onZoomOut,
  isFullscreen,
  onToggleFullscreen,
  currentSlide,
  totalSlides,
  onPrevSlide,
  onNextSlide,
  canGoPrev,
  canGoNext
}: {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  currentSlide: number;
  totalSlides: number;
  onPrevSlide?: () => void;
  onNextSlide?: () => void;
  canGoPrev?: boolean;
  canGoNext?: boolean;
}) {
  return (
    <div className="border-b bg-background/95 backdrop-blur px-4 py-2 flex items-center justify-between">
      <div className="flex items-center gap-2">
        {totalSlides > 0 && (
          <>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onPrevSlide}
              disabled={!canGoPrev}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[80px] text-center">
              {currentSlide} / {totalSlides}
            </span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onNextSlide}
              disabled={!canGoNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onZoomOut} disabled={zoom <= 50}>
          <ZoomOut className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium min-w-[50px] text-center">{zoom}%</span>
        <Button variant="ghost" size="sm" onClick={onZoomIn} disabled={zoom >= 200}>
          <ZoomIn className="h-4 w-4" />
        </Button>
        <div className="w-px h-4 bg-border mx-1" />
        <Button variant="ghost" size="sm" onClick={onToggleFullscreen}>
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}

function SlideThumbnail({
  slide,
  isActive,
  onClick
}: {
  slide: Slide;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <Card 
      className={`p-2 cursor-pointer transition-all hover:shadow-md ${
        isActive ? "ring-2 ring-primary shadow-md" : ""
      }`}
      onClick={onClick}
    >
      <div 
        className="w-full bg-gradient-to-br from-blue-50 to-purple-50 rounded flex items-center justify-center text-xs font-medium text-muted-foreground mb-2"
        style={{ aspectRatio: "16/9" }}
      >
        {slide.status === "pending" && "⏳"}
        {slide.status === "generating" && <Loader2 className="w-3 h-3 animate-spin" />}
        {slide.status === "complete" && <CheckCircle2 className="w-3 h-3 text-green-600" />}
        {slide.status === "error" && "⚠️"}
      </div>
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium">Slide {slide.number}</span>
          <Badge 
            variant={
              slide.status === "complete" ? "default" : 
              slide.status === "generating" ? "secondary" : 
              slide.status === "error" ? "destructive" : 
              "outline"
            }
            className="text-[10px] px-1 py-0"
          >
            {slide.status}
          </Badge>
        </div>
        <p className="text-[10px] text-muted-foreground line-clamp-2">{slide.title}</p>
      </div>
    </Card>
  );
}

