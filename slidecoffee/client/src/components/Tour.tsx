import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, ArrowRight, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";

export interface TourStep {
  target: string; // CSS selector for the element to highlight
  title: string;
  description: string;
  position?: "top" | "bottom" | "left" | "right";
}

interface TourProps {
  steps: TourStep[];
  onComplete: () => void;
  onSkip: () => void;
  isActive: boolean;
}

export function Tour({ steps, onComplete, onSkip, isActive }: TourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!isActive || currentStep >= steps.length) return;

    const updatePosition = () => {
      const target = document.querySelector(steps[currentStep].target);
      if (target) {
        const rect = target.getBoundingClientRect();
        setTargetRect(rect);
        // Scroll element into view
        target.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition);
    };
  }, [currentStep, steps, isActive]);

  if (!isActive || currentStep >= steps.length || !targetRect) {
    return null;
  }

  const step = steps[currentStep];
  const position = step.position || "bottom";

  // Calculate tooltip position
  const getTooltipStyle = (): React.CSSProperties => {
    const padding = 16;
    let top = 0;
    let left = 0;

    switch (position) {
      case "bottom":
        top = targetRect.bottom + padding;
        left = targetRect.left + targetRect.width / 2;
        break;
      case "top":
        top = targetRect.top - padding;
        left = targetRect.left + targetRect.width / 2;
        break;
      case "left":
        top = targetRect.top + targetRect.height / 2;
        left = targetRect.left - padding;
        break;
      case "right":
        top = targetRect.top + targetRect.height / 2;
        left = targetRect.right + padding;
        break;
    }

    return {
      position: "fixed",
      top: `${top}px`,
      left: `${left}px`,
      transform:
        position === "bottom" || position === "top"
          ? "translateX(-50%)"
          : position === "left"
          ? "translate(-100%, -50%)"
          : "translateY(-50%)",
      zIndex: 10001,
      maxWidth: "400px",
    };
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        style={{ zIndex: 9999 }}
        onClick={onSkip}
      />

      {/* Highlight */}
      <div
        className="fixed border-4 border-primary rounded-lg pointer-events-none animate-pulse"
        style={{
          top: `${targetRect.top - 4}px`,
          left: `${targetRect.left - 4}px`,
          width: `${targetRect.width + 8}px`,
          height: `${targetRect.height + 8}px`,
          zIndex: 10000,
        }}
      />

      {/* Tooltip */}
      <Card style={getTooltipStyle()} className="shadow-2xl border-primary">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                  {currentStep + 1}
                </div>
                <h3 className="font-semibold text-lg">{step.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onSkip}
              className="h-8 w-8 shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-muted-foreground">
              Step {currentStep + 1} of {steps.length}
            </div>
            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button variant="outline" size="sm" onClick={handlePrevious}>
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
              )}
              <Button size="sm" onClick={handleNext}>
                {currentStep < steps.length - 1 ? (
                  <>
                    Next
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </>
                ) : (
                  "Finish"
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

