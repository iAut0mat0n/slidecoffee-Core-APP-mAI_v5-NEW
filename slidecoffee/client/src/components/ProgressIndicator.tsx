import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface ProgressIndicatorProps {
  stage: "analyzing" | "planning" | "generating" | "complete";
  message?: string;
}

const STAGE_INFO = {
  analyzing: {
    title: "Analyzing Your Request",
    emoji: "🤔",
    messages: [
      "Understanding your presentation goals...",
      "Identifying key themes and messages...",
      "Thinking about the best narrative structure...",
    ],
    progress: 25,
  },
  planning: {
    title: "Creating Strategic Plan",
    emoji: "📋",
    messages: [
      "Outlining the presentation flow...",
      "Selecting optimal slide layouts...",
      "Structuring your story for maximum impact...",
    ],
    progress: 50,
  },
  generating: {
    title: "Generating Slides",
    emoji: "🎬",
    messages: [
      "Bringing your presentation to life...",
      "Crafting each slide with care...",
      "Applying your brand guidelines...",
      "Almost there, adding final touches...",
    ],
    progress: 75,
  },
  complete: {
    title: "Complete!",
    emoji: "🎉",
    messages: ["Your presentation is ready!"],
    progress: 100,
  },
};

export function ProgressIndicator({ stage, message }: ProgressIndicatorProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState(30);

  const stageInfo = STAGE_INFO[stage];
  const displayMessage = message || stageInfo.messages[currentMessageIndex];

  // Rotate through messages
  useEffect(() => {
    if (stage === "complete") return;

    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % stageInfo.messages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [stage, stageInfo.messages.length]);

  // Countdown timer
  useEffect(() => {
    if (stage === "complete") return;

    const interval = setInterval(() => {
      setEstimatedTime((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [stage]);

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-6">
      {/* Emoji & Title */}
      <div className="text-center space-y-2">
        <div className="text-6xl animate-bounce">{stageInfo.emoji}</div>
        <h3 className="text-2xl font-bold">{stageInfo.title}</h3>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-md">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-out"
            style={{ width: `${stageInfo.progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-sm text-gray-600">
          <span>{stageInfo.progress}% complete</span>
          {stage !== "complete" && estimatedTime > 0 && (
            <span>~{estimatedTime}s remaining</span>
          )}
        </div>
      </div>

      {/* Message */}
      <div className="flex items-center space-x-3 text-gray-700">
        {stage !== "complete" && (
          <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
        )}
        <p className="text-lg animate-fade-in">{displayMessage}</p>
      </div>

      {/* Encouragement */}
      {stage === "generating" && (
        <p className="text-sm text-gray-500 italic animate-fade-in">
          ☕ Grab a coffee while I work my magic...
        </p>
      )}
    </div>
  );
}

/**
 * Mini progress indicator for inline use
 */
export function MiniProgressIndicator({ message }: { message: string }) {
  return (
    <div className="flex items-center space-x-2 text-sm text-gray-600">
      <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
      <span>{message}</span>
    </div>
  );
}

/**
 * Auto-save indicator
 */
interface AutoSaveIndicatorProps {
  status: "idle" | "saving" | "saved" | "error";
  lastSaved?: Date | null;
}

export function AutoSaveIndicator({ status, lastSaved }: AutoSaveIndicatorProps) {
  const [timeAgo, setTimeAgo] = useState("");

  useEffect(() => {
    if (!lastSaved) return;

    const updateTimeAgo = () => {
      const now = new Date();
      const diffMs = now.getTime() - lastSaved.getTime();
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);

      if (diffSec < 10) {
        setTimeAgo("just now");
      } else if (diffSec < 60) {
        setTimeAgo(`${diffSec}s ago`);
      } else if (diffMin < 60) {
        setTimeAgo(`${diffMin}m ago`);
      } else {
        setTimeAgo(lastSaved.toLocaleTimeString());
      }
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 1000);

    return () => clearInterval(interval);
  }, [lastSaved]);

  if (status === "idle") return null;

  return (
    <div className="flex items-center space-x-2 text-xs text-gray-500">
      {status === "saving" && (
        <>
          <Loader2 className="w-3 h-3 animate-spin" />
          <span>Saving...</span>
        </>
      )}
      {status === "saved" && (
        <>
          <span className="text-green-600">✓</span>
          <span>Saved {timeAgo}</span>
        </>
      )}
      {status === "error" && (
        <>
          <span className="text-red-600">✗</span>
          <span>Save failed</span>
        </>
      )}
    </div>
  );
}

