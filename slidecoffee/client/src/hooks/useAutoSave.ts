import { useEffect, useRef, useState } from "react";

/**
 * Auto-save hook with debouncing and status indicator
 */
export function useAutoSave<T>(
  data: T,
  saveFn: (data: T) => Promise<void>,
  options: {
    delay?: number; // Debounce delay in ms (default: 2000)
    enabled?: boolean; // Enable/disable auto-save (default: true)
  } = {}
) {
  const { delay = 2000, enabled = true } = options;
  
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [, forceUpdate] = useState({});
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const previousDataRef = useRef<T>(data);

  useEffect(() => {
    if (!enabled) return;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Check if data actually changed
    if (JSON.stringify(data) === JSON.stringify(previousDataRef.current)) {
      return;
    }

    // Set status to pending
    setStatus("idle");

    // Debounce save
    timeoutRef.current = setTimeout(async () => {
      try {
        setStatus("saving");
        await saveFn(data);
        setStatus("saved");
        setLastSaved(new Date());
        previousDataRef.current = data;

        // Reset to idle after 3 seconds
        setTimeout(() => {
          setStatus("idle");
        }, 3000);
      } catch (error) {
        console.error("Auto-save failed:", error);
        setStatus("error");
      }
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, saveFn, delay, enabled]);

  return {
    status,
    lastSaved,
    isSaving: status === "saving",
    isSaved: status === "saved",
    hasError: status === "error",
  };
}

/**
 * Format last saved time for display
 */
export function formatLastSaved(date: Date | null): string {
  if (!date) return "";

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);

  if (diffSec < 10) {
    return "Saved just now";
  } else if (diffSec < 60) {
    return `Saved ${diffSec} seconds ago`;
  } else if (diffMin < 60) {
    return `Saved ${diffMin} minute${diffMin > 1 ? "s" : ""} ago`;
  } else if (diffHour < 24) {
    return `Saved ${diffHour} hour${diffHour > 1 ? "s" : ""} ago`;
  } else {
    return `Saved on ${date.toLocaleDateString()}`;
  }
}

