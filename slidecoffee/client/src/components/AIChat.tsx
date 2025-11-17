import React, { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Send, 
  Sparkles, 
  Loader2, 
  Coffee, 
  Lightbulb, 
  ChevronDown,
  ChevronUp,
  Check,
  FileEdit,
  Search,
  Brain,
  Database
} from "lucide-react";
import { toast } from "sonner";

interface ReasoningStep {
  type: "thinking" | "research" | "knowledge" | "action" | "file_operation";
  title: string;
  content: string;
  status: "pending" | "in_progress" | "completed" | "accepted";
  details?: string;
  timestamp: Date;
}

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  suggestions?: string[];
  reasoning?: ReasoningStep[];
}

interface AIChatProps {
  presentationId?: number;
  onActionClick?: (action: string, data?: any) => void;
}

export function AIChat({ presentationId, onActionClick }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hey there! ☕️ I'm SlideCoffee AI, your presentation copilot. I'll show you my thinking process as we work together. What would you like to create today?",
      suggestions: [
        "Generate slides from a topic",
        "Research a subject deeply",
        "Improve existing slides",
      ],
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [currentReasoning, setCurrentReasoning] = useState<ReasoningStep[]>([]);
  const [expandedReasoning, setExpandedReasoning] = useState<Set<number>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);

  const chatMutation = trpc.aiAgent.chat.useMutation({
    onMutate: () => {
      // Start showing reasoning process
      const initialReasoning: ReasoningStep[] = [
        {
          type: "thinking",
          title: "Understanding your request",
          content: "Analyzing the context and intent of your message...",
          status: "in_progress",
          timestamp: new Date(),
        },
      ];
      setCurrentReasoning(initialReasoning);
    },
    onSuccess: (data) => {
      // Simulate reasoning steps completion
      const completedReasoning: ReasoningStep[] = [
        {
          type: "thinking",
          title: "Understanding your request",
          content: "Analyzed context and identified key objectives",
          status: "completed",
          details: "Parsed user intent, extracted key topics, and determined appropriate response strategy",
          timestamp: new Date(),
        },
        {
          type: "research",
          title: "Gathering relevant information",
          content: "Retrieved knowledge from training data and context",
          status: "completed",
          details: "Accessed presentation best practices, design principles, and domain-specific knowledge",
          timestamp: new Date(),
        },
        {
          type: "knowledge",
          title: "Key insights committed",
          content: data.message.slice(0, 100) + "...",
          status: "accepted",
          details: data.message,
          timestamp: new Date(),
        },
      ];

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.message,
          suggestions: data.suggestions,
          reasoning: completedReasoning,
        },
      ]);
      setCurrentReasoning([]);
      setIsTyping(false);
    },
    onError: (error) => {
      toast.error("Failed to get response: " + error.message);
      setCurrentReasoning([]);
      setIsTyping(false);
    },
  });

  const { data: smartSuggestions } = trpc.aiAgent.getSmartSuggestions.useQuery({
    presentationId,
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, currentReasoning]);

  const handleSend = () => {
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    setInput("");
    setIsTyping(true);

    // Add user message
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);

    // Send to AI
    chatMutation.mutate({
      message: userMessage,
      conversationHistory: messages.slice(-10),
      presentationId,
      researchMode: userMessage.toLowerCase().includes("research"),
    });
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  const handleSmartActionClick = (action: string) => {
    if (onActionClick) {
      onActionClick(action);
    }

    const actionMessages: Record<string, string> = {
      research_topic: "Research this topic in depth",
      add_statistics: "Find relevant statistics and data",
      improve_storytelling: "Help me improve the narrative flow",
      generate_slides: "Generate slides from our conversation",
      apply_brand: "Apply my brand styling",
      export_ppt: "Export as PowerPoint",
    };

    const message = actionMessages[action] || action;
    setInput(message);
  };

  const toggleReasoningExpansion = (index: number) => {
    setExpandedReasoning((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const getReasoningIcon = (type: ReasoningStep["type"]) => {
    switch (type) {
      case "thinking":
        return <Brain className="h-4 w-4" />;
      case "research":
        return <Search className="h-4 w-4" />;
      case "knowledge":
        return <Database className="h-4 w-4" />;
      case "action":
        return <Sparkles className="h-4 w-4" />;
      case "file_operation":
        return <FileEdit className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: ReasoningStep["status"]) => {
    switch (status) {
      case "pending":
        return "text-gray-400";
      case "in_progress":
        return "text-blue-500";
      case "completed":
        return "text-green-500";
      case "accepted":
        return "text-green-600";
    }
  };

  const ReasoningCard = ({ step, index }: { step: ReasoningStep; index: number }) => {
    const isExpanded = expandedReasoning.has(index);
    const hasDetails = !!step.details;

    return (
      <Card className="p-3 bg-muted/50 border-l-4 border-l-blue-500">
        <div className="flex items-start gap-2">
          <div className={`mt-0.5 ${getStatusColor(step.status)}`}>
            {step.status === "in_progress" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : step.status === "accepted" ? (
              <Check className="h-4 w-4" />
            ) : (
              getReasoningIcon(step.type)
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">{step.title}</h4>
              {hasDetails && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => toggleReasoningExpansion(index)}
                >
                  {isExpanded ? (
                    <ChevronUp className="h-3 w-3" />
                  ) : (
                    <ChevronDown className="h-3 w-3" />
                  )}
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{step.content}</p>
            {isExpanded && step.details && (
              <div className="mt-2 p-2 bg-background rounded text-xs">
                {step.details}
              </div>
            )}
            {step.status === "accepted" && (
              <Badge variant="secondary" className="mt-2 text-xs">
                <Check className="h-3 w-3 mr-1" />
                Accepted
              </Badge>
            )}
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="p-4 border-b bg-gradient-to-r from-amber-50 to-orange-50">
        <div className="flex items-center gap-2">
          <Coffee className="h-5 w-5 text-amber-600" />
          <h3 className="font-semibold">SlideCoffee AI Copilot</h3>
          <Badge variant="secondary" className="ml-auto">
            <Sparkles className="h-3 w-3 mr-1" />
            Reasoning Enabled
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          I'll show you my thinking process as we work together
        </p>
      </div>

      {/* Smart Actions */}
      {smartSuggestions && smartSuggestions.length > 0 && (
        <div className="p-3 border-b bg-muted/30">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="h-4 w-4 text-amber-600" />
            <span className="text-sm font-medium">Quick Actions</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {smartSuggestions.map((suggestion) => (
              <Button
                key={suggestion.id}
                variant="outline"
                size="sm"
                onClick={() => handleSmartActionClick(suggestion.action)}
                className="text-xs"
              >
                <span className="mr-1">{suggestion.icon}</span>
                {suggestion.text}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div key={index} className="space-y-2">
              <div
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>

              {/* Reasoning Steps */}
              {message.reasoning && message.reasoning.length > 0 && (
                <div className="ml-2 space-y-2">
                  {message.reasoning.map((step, stepIndex) => (
                    <ReasoningCard key={stepIndex} step={step} index={stepIndex} />
                  ))}
                </div>
              )}

              {/* Suggestions */}
              {message.suggestions && message.suggestions.length > 0 && (
                <div className="flex flex-wrap gap-2 ml-2">
                  {message.suggestions.map((suggestion, idx) => (
                    <Button
                      key={idx}
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="text-xs border border-dashed"
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Current Reasoning (while processing) */}
          {currentReasoning.length > 0 && (
            <div className="space-y-2">
              {currentReasoning.map((step, index) => (
                <ReasoningCard key={index} step={step} index={index + 1000} />
              ))}
            </div>
          )}

          {/* Typing indicator */}
          {isTyping && currentReasoning.length === 0 && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Brewing response...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask me anything about your presentation..."
            className="min-h-[60px] resize-none"
            disabled={isTyping}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            size="icon"
            className="h-[60px] w-[60px]"
          >
            {isTyping ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Press Enter to send, Shift+Enter for new line • Reasoning mode active
        </p>
      </div>
    </div>
  );
}

