import { useEffect, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";

export interface GenerationProgress {
  projectId: string;
  status: 'started' | 'analyzing' | 'generating' | 'slide_created' | 'completed' | 'error';
  message: string;
  currentSlide?: number;
  totalSlides?: number;
  slideData?: any;
  error?: string;
  timestamp: string;
}

interface UseGenerationProgressOptions {
  projectId: string;
  enabled?: boolean;
  onProgress?: (progress: GenerationProgress) => void;
  onComplete?: () => void;
  onError?: (error: string) => void;
}

/**
 * Hook to subscribe to real-time slide generation progress via WebSocket
 * 
 * @example
 * ```tsx
 * const { progress, isGenerating, error } = useGenerationProgress({
 *   projectId: "123",
 *   enabled: true,
 *   onProgress: (progress) => {
 *     console.log(`Creating slide ${progress.currentSlide} of ${progress.totalSlides}`);
 *   },
 *   onComplete: () => {
 *     toast.success("Presentation complete!");
 *   }
 * });
 * ```
 */
export function useGenerationProgress({
  projectId,
  enabled = true,
  onProgress,
  onComplete,
  onError,
}: UseGenerationProgressOptions) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [progress, setProgress] = useState<GenerationProgress | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize socket connection
  useEffect(() => {
    if (!enabled) return;

    const socketUrl = window.location.origin;
    const newSocket = io(socketUrl, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    newSocket.on("connect", () => {
      console.log("[useGenerationProgress] Connected to WebSocket");
    });

    newSocket.on("disconnect", () => {
      console.log("[useGenerationProgress] Disconnected from WebSocket");
    });

    newSocket.on("connect_error", (err) => {
      console.error("[useGenerationProgress] Connection error:", err);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [enabled]);

  // Subscribe to generation progress
  useEffect(() => {
    if (!socket || !projectId || !enabled) return;

    // Subscribe to generation room
    socket.emit("subscribe-generation", { projectId });
    console.log(`[useGenerationProgress] Subscribed to project ${projectId}`);

    // Handle progress updates
    const handleProgress = (progressData: GenerationProgress) => {
      console.log("[useGenerationProgress] Progress update:", progressData);
      setProgress(progressData);

      // Update generating state
      if (progressData.status === 'started' || progressData.status === 'analyzing' || progressData.status === 'generating' || progressData.status === 'slide_created') {
        setIsGenerating(true);
      } else if (progressData.status === 'completed') {
        setIsGenerating(false);
        onComplete?.();
      } else if (progressData.status === 'error') {
        setIsGenerating(false);
        setError(progressData.error || 'Unknown error');
        onError?.(progressData.error || 'Unknown error');
      }

      // Call progress callback
      onProgress?.(progressData);
    };

    socket.on("generation-progress", handleProgress);

    return () => {
      socket.off("generation-progress", handleProgress);
      socket.emit("unsubscribe-generation", { projectId });
      console.log(`[useGenerationProgress] Unsubscribed from project ${projectId}`);
    };
  }, [socket, projectId, enabled, onProgress, onComplete, onError]);

  // Helper to get progress percentage
  const getProgressPercentage = useCallback(() => {
    if (!progress || !progress.currentSlide || !progress.totalSlides) {
      return 0;
    }
    return Math.round((progress.currentSlide / progress.totalSlides) * 100);
  }, [progress]);

  // Helper to get progress message with emoji
  const getProgressMessage = useCallback(() => {
    if (!progress) return "";

    switch (progress.status) {
      case 'started':
        return `☕ ${progress.message}`;
      case 'analyzing':
        return `🔍 ${progress.message}`;
      case 'generating':
        return `✨ ${progress.message}`;
      case 'slide_created':
        return `📄 ${progress.message}`;
      case 'completed':
        return `🎉 ${progress.message}`;
      case 'error':
        return `❌ ${progress.message}`;
      default:
        return progress.message;
    }
  }, [progress]);

  return {
    progress,
    isGenerating,
    error,
    getProgressPercentage,
    getProgressMessage,
    socket,
  };
}

