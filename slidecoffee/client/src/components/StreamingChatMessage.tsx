import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type MessageChunk = {
  type: "token" | "reasoning" | "research" | "knowledge" | "complete" | "error";
  content: string;
  metadata?: Record<string, any>;
};

interface StreamingChatMessageProps {
  isStreaming: boolean;
  chunks: MessageChunk[];
  onComplete?: () => void;
}

/**
 * StreamingChatMessage Component
 * Displays AI responses with word-by-word streaming animation
 * Shows reasoning, research, and knowledge commits transparently
 */
export function StreamingChatMessage({
  isStreaming,
  chunks,
  onComplete,
}: StreamingChatMessageProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);

  useEffect(() => {
    if (chunks.length === 0) return;

    // Build the full text from all token chunks
    const tokenChunks = chunks.filter((c) => c.type === "token");
    const fullText = tokenChunks.map((c) => c.content).join("");

    setDisplayedText(fullText);

    // Check if streaming is complete
    const hasCompleteChunk = chunks.some((c) => c.type === "complete");
    if (hasCompleteChunk && onComplete) {
      onComplete();
    }
  }, [chunks, onComplete]);

  // Get special chunks (reasoning, research, knowledge)
  const reasoningChunks = chunks.filter((c) => c.type === "reasoning");
  const researchChunks = chunks.filter((c) => c.type === "research");
  const knowledgeChunks = chunks.filter((c) => c.type === "knowledge");
  const errorChunks = chunks.filter((c) => c.type === "error");

  return (
    <div className="space-y-3">
      {/* Reasoning Cards */}
      {reasoningChunks.map((chunk, idx) => (
        <div
          key={`reasoning-${idx}`}
          className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg"
        >
          <Loader2 className="h-4 w-4 animate-spin text-blue-600 dark:text-blue-400 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-blue-900 dark:text-blue-100 font-medium">
              {chunk.content}
            </p>
          </div>
        </div>
      ))}

      {/* Research Indicators */}
      {researchChunks.map((chunk, idx) => (
        <div
          key={`research-${idx}`}
          className="flex items-start gap-2 p-3 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg"
        >
          <span className="text-purple-600 dark:text-purple-400">🔍</span>
          <div className="flex-1">
            <p className="text-sm text-purple-900 dark:text-purple-100">
              {chunk.content}
            </p>
          </div>
        </div>
      ))}

      {/* Knowledge Commits */}
      {knowledgeChunks.map((chunk, idx) => (
        <div
          key={`knowledge-${idx}`}
          className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg"
        >
          <span className="text-green-600 dark:text-green-400">✓</span>
          <div className="flex-1">
            <p className="text-sm text-green-900 dark:text-green-100 font-medium">
              {chunk.content}
            </p>
          </div>
        </div>
      ))}

      {/* Main Message Content */}
      {displayedText && (
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {displayedText}
            {isStreaming && (
              <span className="inline-block w-1 h-4 ml-1 bg-current animate-pulse" />
            )}
          </p>
        </div>
      )}

      {/* Error Messages */}
      {errorChunks.map((chunk, idx) => (
        <div
          key={`error-${idx}`}
          className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg"
        >
          <span className="text-red-600 dark:text-red-400">⚠️</span>
          <div className="flex-1">
            <p className="text-sm text-red-900 dark:text-red-100">
              {chunk.content}
            </p>
          </div>
        </div>
      ))}

      {/* Typing Indicator */}
      {isStreaming && displayedText === "" && reasoningChunks.length === 0 && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Brewing your response...</span>
        </div>
      )}
    </div>
  );
}

