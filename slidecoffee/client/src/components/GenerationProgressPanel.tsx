import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle, Coffee, Sparkles, FileText, Pause, Play, StopCircle } from "lucide-react";
import { useGenerationProgress } from "@/hooks/useGenerationProgress";
import { cn } from "@/lib/utils";

interface GenerationProgressPanelProps {
  projectId: string;
  enabled?: boolean;
  onComplete?: () => void;
  onStop?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  className?: string;
}

/**
 * Real-time slide generation progress panel
 * Shows live updates as slides are being created
 */
export function GenerationProgressPanel({
  projectId,
  enabled = true,
  onComplete,
  onStop,
  onPause,
  onResume,
  className,
}: GenerationProgressPanelProps) {
  const [isPaused, setIsPaused] = useState(false);

  const handlePause = () => {
    setIsPaused(true);
    onPause?.();
  };

  const handleResume = () => {
    setIsPaused(false);
    onResume?.();
  };

  const handleStop = () => {
    onStop?.();
  };
  const {
    progress,
    isGenerating,
    error,
    getProgressPercentage,
    getProgressMessage,
  } = useGenerationProgress({
    projectId,
    enabled,
    onComplete,
  });

  if (!progress && !isGenerating) {
    return null;
  }

  const percentage = getProgressPercentage();
  const message = getProgressMessage();

  return (
    <Card className={cn("border-2", className, {
      "border-blue-500": isGenerating,
      "border-green-500": progress?.status === 'completed',
      "border-red-500": progress?.status === 'error',
    })}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          {/* Status Icon */}
          {isGenerating && (
            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
            </div>
          )}
          {progress?.status === 'completed' && (
            <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
          )}
          {progress?.status === 'error' && (
            <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
          )}

          <div className="flex-1">
            <CardTitle className="text-lg">
              {isGenerating ? (isPaused ? "Paused" : "Brewing your presentation...") : progress?.status === 'completed' ? "Presentation ready!" : "Generation stopped"}
            </CardTitle>
            <CardDescription className="mt-1">
              {message}
            </CardDescription>
          </div>

          {/* Control Buttons */}
          {isGenerating && (
            <div className="flex items-center gap-2">
              {isPaused ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResume}
                  className="gap-2"
                >
                  <Play className="h-4 w-4" />
                  Resume
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePause}
                  className="gap-2"
                >
                  <Pause className="h-4 w-4" />
                  Pause
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleStop}
                className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <StopCircle className="h-4 w-4" />
                Stop
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Bar */}
        {isGenerating && progress?.totalSlides && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Slide {progress.currentSlide || 0} of {progress.totalSlides}
              </span>
              <span className="font-medium">{percentage}%</span>
            </div>
            <Progress value={percentage} className="h-2" />
          </div>
        )}

        {/* Status Messages */}
        <div className="space-y-2">
          {progress?.status === 'started' && (
            <StatusMessage
              icon={Coffee}
              text="Starting generation process..."
              active
            />
          )}
          {progress?.status === 'analyzing' && (
            <StatusMessage
              icon={Sparkles}
              text="Analyzing your prompt and brand guidelines..."
              active
            />
          )}
          {(progress?.status === 'generating' || progress?.status === 'slide_created') && (
            <StatusMessage
              icon={FileText}
              text={`Creating slide ${progress.currentSlide} of ${progress.totalSlides}...`}
              active
            />
          )}
          {progress?.status === 'completed' && (
            <StatusMessage
              icon={CheckCircle2}
              text="All slides created successfully!"
              success
            />
          )}
          {progress?.status === 'error' && (
            <StatusMessage
              icon={XCircle}
              text={error || "An error occurred during generation"}
              error
            />
          )}
        </div>

        {/* Slide Preview (if available) */}
        {progress?.slideData && (
          <div className="mt-4 p-3 rounded-lg bg-muted/50 border">
            <p className="text-sm font-medium mb-1">Latest slide:</p>
            <p className="text-sm text-muted-foreground">
              {progress.slideData.title || "Untitled Slide"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface StatusMessageProps {
  icon: typeof Coffee;
  text: string;
  active?: boolean;
  success?: boolean;
  error?: boolean;
}

function StatusMessage({ icon: Icon, text, active, success, error }: StatusMessageProps) {
  return (
    <div className={cn(
      "flex items-center gap-2 text-sm p-2 rounded-md transition-colors",
      {
        "bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300": active,
        "bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-300": success,
        "bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300": error,
        "text-muted-foreground": !active && !success && !error,
      }
    )}>
      <Icon className={cn("h-4 w-4 shrink-0", {
        "animate-pulse": active,
      })} />
      <span>{text}</span>
    </div>
  );
}

