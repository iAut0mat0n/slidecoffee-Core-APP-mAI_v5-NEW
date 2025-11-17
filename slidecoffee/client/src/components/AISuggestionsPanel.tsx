/**
 * AI Suggestions Panel Component
 * 
 * Display AI-generated suggestions for presentations
 * - Show suggestions with context
 * - Accept/reject actions
 * - Apply suggestions to slides
 * - Track suggestion history
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Sparkles,
  Check,
  X,
  Eye,
  Lightbulb,
  TrendingUp,
  Palette,
  Type,
  Layout,
  Image as ImageIcon,
} from "lucide-react";

interface AISuggestionsPanelProps {
  projectId: number;
  onApplySuggestion?: (suggestionId: number) => void;
}

const suggestionTypeIcons = {
  content: Lightbulb,
  design: Palette,
  layout: Layout,
  typography: Type,
  imagery: ImageIcon,
  structure: TrendingUp,
};

const suggestionTypeColors = {
  content: "text-blue-600 bg-blue-50 border-blue-200",
  design: "text-purple-600 bg-purple-50 border-purple-200",
  layout: "text-green-600 bg-green-50 border-green-200",
  typography: "text-amber-600 bg-amber-50 border-amber-200",
  imagery: "text-pink-600 bg-pink-50 border-pink-200",
  structure: "text-indigo-600 bg-indigo-50 border-indigo-200",
};

export function AISuggestionsPanel({ projectId, onApplySuggestion }: AISuggestionsPanelProps) {
  const utils = trpc.useUtils();
  const { data: suggestions, isLoading } = trpc.aiSuggestions.list.useQuery({ projectId });

  const [expandedId, setExpandedId] = useState<number | null>(null);

  const acceptMutation = trpc.aiSuggestions.accept.useMutation({
    onSuccess: (data, variables) => {
      toast.success("Suggestion applied", {
        description: "The AI suggestion has been applied to your presentation",
      });
      utils.aiSuggestions.list.invalidate();
      onApplySuggestion?.(variables.suggestionId);
    },
    onError: (error) => {
      toast.error("Failed to apply suggestion", {
        description: error.message,
      });
    },
  });

  const rejectMutation = trpc.aiSuggestions.reject.useMutation({
    onSuccess: () => {
      toast.success("Suggestion dismissed");
      utils.aiSuggestions.list.invalidate();
    },
    onError: (error) => {
      toast.error("Failed to dismiss suggestion", {
        description: error.message,
      });
    },
  });

  const handleAccept = (suggestionId: number) => {
    acceptMutation.mutate({ suggestionId });
  };

  const handleReject = (suggestionId: number) => {
    rejectMutation.mutate({ suggestionId });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Suggestions
          </CardTitle>
          <CardDescription>Loading suggestions...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!suggestions || suggestions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Suggestions
          </CardTitle>
          <CardDescription>No suggestions available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Lightbulb className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>AI will analyze your presentation and provide suggestions</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const pendingSuggestions = suggestions.filter(s => s.status === "pending");
  const appliedCount = suggestions.filter(s => s.status === "accepted").length;
  const dismissedCount = suggestions.filter(s => s.status === "rejected").length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Suggestions
            </CardTitle>
            <CardDescription>
              {pendingSuggestions.length} pending
              {appliedCount > 0 && ` • ${appliedCount} applied`}
              {dismissedCount > 0 && ` • ${dismissedCount} dismissed`}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-3">
            {pendingSuggestions.map((suggestion) => {
              const Icon = suggestionTypeIcons[suggestion.type as keyof typeof suggestionTypeIcons] || Lightbulb;
              const colorClass = suggestionTypeColors[suggestion.type as keyof typeof suggestionTypeColors] || "text-gray-600 bg-gray-50 border-gray-200";
              const isExpanded = expandedId === suggestion.id;

              return (
                <div
                  key={suggestion.id}
                  className={`border rounded-lg p-4 transition-all ${colorClass}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      <div className="h-8 w-8 rounded-full bg-white/80 flex items-center justify-center">
                        <Icon className="h-4 w-4" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="text-xs capitalize">
                          {suggestion.type}
                        </Badge>
                        {suggestion.priority === "high" && (
                          <Badge variant="destructive" className="text-xs">
                            High Priority
                          </Badge>
                        )}
                        {suggestion.confidence && suggestion.confidence > 0.8 && (
                          <Badge variant="default" className="text-xs">
                            {Math.round(suggestion.confidence * 100)}% confident
                          </Badge>
                        )}
                      </div>

                      <p className="font-medium mb-2">{suggestion.title}</p>

                      <p className="text-sm mb-3 opacity-90">
                        {isExpanded
                          ? suggestion.description
                          : `${suggestion.description.substring(0, 120)}${suggestion.description.length > 120 ? "..." : ""}`}
                      </p>

                      {suggestion.description.length > 120 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 text-xs mb-3"
                          onClick={() => setExpandedId(isExpanded ? null : suggestion.id)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          {isExpanded ? "Show less" : "Show more"}
                        </Button>
                      )}

                      {suggestion.targetSlide && (
                        <p className="text-xs opacity-75 mb-3">
                          Applies to: Slide {suggestion.targetSlide}
                        </p>
                      )}

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleAccept(suggestion.id)}
                          disabled={acceptMutation.isPending}
                          className="bg-white/90 hover:bg-white"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Apply
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReject(suggestion.id)}
                          disabled={rejectMutation.isPending}
                          className="bg-white/90 hover:bg-white"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Dismiss
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {appliedCount > 0 && (
            <div className="mt-6 pt-6 border-t">
              <h4 className="text-sm font-medium mb-3 text-muted-foreground">
                Applied Suggestions ({appliedCount})
              </h4>
              <div className="space-y-2">
                {suggestions
                  .filter(s => s.status === "accepted")
                  .map((suggestion) => (
                    <div
                      key={suggestion.id}
                      className="flex items-center gap-2 p-2 rounded bg-muted/50 text-sm"
                    >
                      <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span className="flex-1 truncate">{suggestion.title}</span>
                      <Badge variant="secondary" className="text-xs capitalize">
                        {suggestion.type}
                      </Badge>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

