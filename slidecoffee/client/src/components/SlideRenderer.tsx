import { Card } from "@/components/ui/card";

/**
 * Slide data structure matching backend
 */
export type SlideLayout =
  | "title"
  | "title-content"
  | "two-column"
  | "image-text"
  | "full-image"
  | "quote"
  | "section-header"
  | "bullet-points"
  | "comparison";

export interface Slide {
  id: string;
  layout: SlideLayout;
  title?: string;
  subtitle?: string;
  content?: string;
  bulletPoints?: string[];
  leftColumn?: string;
  rightColumn?: string;
  imageUrl?: string;
  imageCaption?: string;
  quote?: string;
  quoteAuthor?: string;
  backgroundColor?: string;
  textColor?: string;
  notes?: string;
}

interface SlideRendererProps {
  slide: Slide;
  brandColors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
  };
}

/**
 * Professional slide renderer with 16:9 aspect ratio
 * Renders different layouts based on slide type
 */
export function SlideRenderer({ slide, brandColors }: SlideRendererProps) {
  const bgColor = slide.backgroundColor || brandColors?.primary || "#1a1a1a";
  const textColor = slide.textColor || "#ffffff";
  const accentColor = brandColors?.accent || "#0066cc";

  // 16:9 aspect ratio container
  const containerStyle = {
    aspectRatio: "16 / 9",
    backgroundColor: bgColor,
    color: textColor,
  };

  return (
    <Card 
      className="w-full overflow-hidden shadow-lg"
      style={containerStyle}
    >
      {slide.layout === "title" && (
        <TitleSlide slide={slide} accentColor={accentColor} />
      )}
      {slide.layout === "title-content" && (
        <TitleContentSlide slide={slide} accentColor={accentColor} />
      )}
      {slide.layout === "two-column" && (
        <TwoColumnSlide slide={slide} accentColor={accentColor} />
      )}
      {slide.layout === "bullet-points" && (
        <BulletPointsSlide slide={slide} accentColor={accentColor} />
      )}
      {slide.layout === "quote" && (
        <QuoteSlide slide={slide} accentColor={accentColor} />
      )}
      {slide.layout === "section-header" && (
        <SectionHeaderSlide slide={slide} accentColor={accentColor} />
      )}
      {slide.layout === "image-text" && (
        <ImageTextSlide slide={slide} accentColor={accentColor} />
      )}
      {slide.layout === "comparison" && (
        <ComparisonSlide slide={slide} accentColor={accentColor} />
      )}
      {slide.layout === "full-image" && (
        <FullImageSlide slide={slide} />
      )}
    </Card>
  );
}

// Title Slide - Opening slide with title and subtitle
function TitleSlide({ slide, accentColor }: { slide: Slide; accentColor: string }) {
  return (
    <div className="h-full flex flex-col items-center justify-center p-16 text-center">
      <h1 className="text-6xl font-bold mb-6 leading-tight">{slide.title}</h1>
      {slide.subtitle && (
        <p className="text-3xl opacity-80">{slide.subtitle}</p>
      )}
      <div 
        className="mt-8 w-32 h-1 rounded-full"
        style={{ backgroundColor: accentColor }}
      />
    </div>
  );
}

// Title + Content - Standard slide with title and body text
function TitleContentSlide({ slide, accentColor }: { slide: Slide; accentColor: string }) {
  return (
    <div className="h-full flex flex-col p-12">
      <div className="border-b pb-4 mb-6" style={{ borderColor: accentColor }}>
        <h2 className="text-4xl font-bold">{slide.title}</h2>
      </div>
      <div className="flex-1 flex items-center">
        <p className="text-2xl leading-relaxed">{slide.content}</p>
      </div>
    </div>
  );
}

// Two Column - Side-by-side content
function TwoColumnSlide({ slide, accentColor }: { slide: Slide; accentColor: string }) {
  return (
    <div className="h-full flex flex-col p-12">
      <div className="border-b pb-4 mb-6" style={{ borderColor: accentColor }}>
        <h2 className="text-4xl font-bold">{slide.title}</h2>
      </div>
      <div className="flex-1 grid grid-cols-2 gap-8">
        <div className="flex items-center">
          <p className="text-xl leading-relaxed">{slide.leftColumn}</p>
        </div>
        <div className="flex items-center">
          <p className="text-xl leading-relaxed">{slide.rightColumn}</p>
        </div>
      </div>
    </div>
  );
}

// Bullet Points - List of key points
function BulletPointsSlide({ slide, accentColor }: { slide: Slide; accentColor: string }) {
  return (
    <div className="h-full flex flex-col p-12">
      <div className="border-b pb-4 mb-6" style={{ borderColor: accentColor }}>
        <h2 className="text-4xl font-bold">{slide.title}</h2>
      </div>
      <div className="flex-1 flex items-center">
        <ul className="space-y-4 w-full">
          {slide.bulletPoints?.map((point, index) => (
            <li key={index} className="flex items-start gap-4">
              <div 
                className="w-3 h-3 rounded-full mt-2 flex-shrink-0"
                style={{ backgroundColor: accentColor }}
              />
              <span className="text-2xl leading-relaxed">{point}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// Quote - Large quote with attribution
function QuoteSlide({ slide, accentColor }: { slide: Slide; accentColor: string }) {
  return (
    <div className="h-full flex flex-col items-center justify-center p-16 text-center">
      <div className="text-8xl mb-8 opacity-30" style={{ color: accentColor }}>"</div>
      <blockquote className="text-3xl italic leading-relaxed mb-8 max-w-4xl">
        {slide.quote}
      </blockquote>
      {slide.quoteAuthor && (
        <p className="text-2xl opacity-70">— {slide.quoteAuthor}</p>
      )}
    </div>
  );
}

// Section Header - Divider slide between sections
function SectionHeaderSlide({ slide, accentColor }: { slide: Slide; accentColor: string }) {
  return (
    <div className="h-full flex flex-col items-center justify-center p-16 text-center">
      <div 
        className="w-24 h-1 rounded-full mb-8"
        style={{ backgroundColor: accentColor }}
      />
      <h2 className="text-5xl font-bold">{slide.title}</h2>
      {slide.subtitle && (
        <p className="text-2xl mt-6 opacity-80">{slide.subtitle}</p>
      )}
    </div>
  );
}

// Image + Text - Image on one side, text on the other
function ImageTextSlide({ slide, accentColor }: { slide: Slide; accentColor: string }) {
  return (
    <div className="h-full flex flex-col p-12">
      <div className="border-b pb-4 mb-6" style={{ borderColor: accentColor }}>
        <h2 className="text-4xl font-bold">{slide.title}</h2>
      </div>
      <div className="flex-1 grid grid-cols-2 gap-8">
        <div className="flex items-center justify-center bg-gray-800 rounded-lg overflow-hidden">
          {slide.imageUrl ? (
            <img 
              src={slide.imageUrl} 
              alt={slide.imageCaption || "Slide image"}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-gray-500 text-xl">Image placeholder</div>
          )}
        </div>
        <div className="flex flex-col justify-center">
          <p className="text-xl leading-relaxed">{slide.content}</p>
          {slide.imageCaption && (
            <p className="text-sm mt-4 opacity-60">{slide.imageCaption}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// Comparison - Side-by-side comparison
function ComparisonSlide({ slide, accentColor }: { slide: Slide; accentColor: string }) {
  return (
    <div className="h-full flex flex-col p-12">
      <div className="border-b pb-4 mb-6" style={{ borderColor: accentColor }}>
        <h2 className="text-4xl font-bold">{slide.title}</h2>
      </div>
      <div className="flex-1 grid grid-cols-2 gap-8">
        <div className="border rounded-lg p-6" style={{ borderColor: accentColor }}>
          <p className="text-xl leading-relaxed">{slide.leftColumn}</p>
        </div>
        <div className="border rounded-lg p-6" style={{ borderColor: accentColor }}>
          <p className="text-xl leading-relaxed">{slide.rightColumn}</p>
        </div>
      </div>
    </div>
  );
}

// Full Image - Image covering entire slide
function FullImageSlide({ slide }: { slide: Slide }) {
  return (
    <div className="h-full relative">
      {slide.imageUrl ? (
        <>
          <img 
            src={slide.imageUrl} 
            alt={slide.title || "Full slide image"}
            className="w-full h-full object-cover"
          />
          {slide.title && (
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
              <h2 className="text-5xl font-bold text-white text-center px-16">
                {slide.title}
              </h2>
            </div>
          )}
        </>
      ) : (
        <div className="h-full flex items-center justify-center bg-gray-800">
          <div className="text-center">
            <p className="text-gray-500 text-xl mb-4">Image placeholder</p>
            {slide.title && (
              <h2 className="text-4xl font-bold">{slide.title}</h2>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Slide thumbnail for navigation
 */
export function SlideThumbnail({ 
  slide, 
  index, 
  isActive, 
  onClick 
}: { 
  slide: Slide; 
  index: number; 
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        relative w-full aspect-video rounded-lg overflow-hidden border-2 transition-all
        ${isActive ? "border-blue-500 ring-2 ring-blue-500 ring-opacity-50" : "border-gray-700 hover:border-gray-500"}
      `}
    >
      <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
        <div className="text-center px-2">
          <p className="text-xs font-semibold truncate">{slide.title || `Slide ${index + 1}`}</p>
          <p className="text-[10px] text-gray-500 mt-1">{slide.layout}</p>
        </div>
      </div>
      <div className="absolute bottom-1 right-1 bg-black bg-opacity-60 px-1.5 py-0.5 rounded text-[10px]">
        {index + 1}
      </div>
    </button>
  );
}

