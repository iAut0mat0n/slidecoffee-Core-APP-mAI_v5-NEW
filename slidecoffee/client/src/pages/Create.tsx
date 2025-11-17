import { useState, useEffect, useRef } from "react";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  Send, 
  Loader2, 
  Coffee,
  CheckCircle2,
  Edit3,
  Play,
  X
} from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { SlidePreview, type Slide } from "@/components/SlidePreview";
import { PlanEditor, type PresentationPlan as PlanEditorPlan, type SlideOutline as PlanSlideOutline } from "@/components/PlanEditor";
import { coffeeMessages, getRandomMessage, getProgressMessage, getCelebrationLevel, triggerCelebration } from "@/lib/aiPersonality";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  type?: "text" | "plan" | "generating";
}

interface SlideOutline {
  number: number;
  title: string;
  description: string;
}

interface PresentationPlan {
  title: string;
  slideCount: number;
  slides: SlideOutline[];
  audience?: string;
  tone?: string;
  goal?: string;
}

export default function Create() {
  const { user } = useSupabaseAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<PresentationPlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { data: workspaces } = trpc.workspaces.list.useQuery();
  const defaultWorkspace = workspaces?.find(w => w.isDefault) || workspaces?.[0];

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: "welcome",
        role: "assistant",
        content: getRandomMessage(coffeeMessages.welcome),
        timestamp: new Date(),
        type: "text"
      }]);
    }
  }, []);

  const sendMessageMutation = trpc.dashboard.chat.useMutation();

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
      type: "text"
    };

    setMessages(prev => [...prev, userMessage]);
    const userInput = input;
    setInput("");
    setIsTyping(true);

    try {
      // Build conversation history
      const conversationHistory = messages.map(m => ({
        role: m.role as "user" | "assistant" | "system",
        content: m.content
      }));

      const response = await sendMessageMutation.mutateAsync({
        message: userInput,
        workspaceId: defaultWorkspace?.id || 0,
        conversationHistory: conversationHistory.filter(m => m.role !== 'system')
      });

      setIsTyping(false);

      if (response.type === "plan" && response.plan) {
        // AI generated a plan
        setCurrentPlan(response.plan as PresentationPlan);
        const planMessage: Message = {
          id: Date.now().toString(),
          role: "assistant",
          content: response.content,
          timestamp: new Date(),
          type: "plan"
        };
        setMessages(prev => [...prev, planMessage]);
      } else {
        // Regular text response
        const aiMessage: Message = {
          id: Date.now().toString(),
          role: "assistant",
          content: response.content,
          timestamp: new Date(),
          type: "text"
        };
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error) {
      setIsTyping(false);
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: getRandomMessage(coffeeMessages.error),
        timestamp: new Date(),
        type: "text"
      };
      setMessages(prev => [...prev, errorMessage]);
      console.error("Chat error:", error);
    }
  };



  const handleApprove = () => {
    if (!currentPlan) return;

    setIsGenerating(true);
    setGenerationProgress(0);

    // Initialize slides with pending status
    const initialSlides: Slide[] = currentPlan.slides.map(slide => ({
      id: `slide-${slide.number}`,
      number: slide.number,
      title: slide.title,
      content: slide.description,
      status: "pending" as const
    }));
    setSlides(initialSlides);

    const generatingMessage: Message = {
      id: Date.now().toString(),
      role: "assistant",
      content: getRandomMessage(coffeeMessages.generating),
      timestamp: new Date(),
      type: "generating"
    };
    setMessages(prev => [...prev, generatingMessage]);

    // Simulate generation progress with slide updates
    let currentSlideGenerating = 0;
    const interval = setInterval(() => {
      setGenerationProgress(prev => {
        const newProgress = prev + 5;
        
        // Update slide status based on progress
        const slideProgressStep = 100 / currentPlan.slides.length;
        const slideToGenerate = Math.floor(newProgress / slideProgressStep);
        
        if (slideToGenerate > currentSlideGenerating && slideToGenerate < currentPlan.slides.length) {
          // Mark previous slide as complete
          if (currentSlideGenerating > 0) {
            setSlides(prev => prev.map((s, i) => 
              i === currentSlideGenerating - 1 ? { ...s, status: "complete" as const } : s
            ));
          }
          
          // Mark current slide as generating
          setSlides(prev => prev.map((s, i) => 
            i === slideToGenerate ? { ...s, status: "generating" as const } : s
          ));
          setCurrentSlideIndex(slideToGenerate);
          currentSlideGenerating = slideToGenerate;
        }
        
        if (newProgress >= 100) {
          clearInterval(interval);
          // Mark all slides as complete
          setSlides(prev => prev.map(s => ({ ...s, status: "complete" as const })));
          handleGenerationComplete();
          return 100;
        }
        return newProgress;
      });
    }, 300);
  };

  const handleGenerationComplete = () => {
    setIsGenerating(false);
    
    // Celebration based on presentation size!
    const celebrationLevel = getCelebrationLevel(currentPlan?.slideCount || 0);
    triggerCelebration(celebrationLevel);

    toast.success("Presentation created! ☕", {
      description: "Your slides are ready to view and edit"
    });

    const completeMessage: Message = {
      id: Date.now().toString(),
      role: "assistant",
      content: getRandomMessage(coffeeMessages.complete),
      timestamp: new Date(),
      type: "text"
    };
    setMessages(prev => [...prev, completeMessage]);
  };

  const handleEditPlan = () => {
    // Plan editing is now inline in the PlanEditor component
  };

  const handlePlanUpdate = (updatedPlan: PresentationPlan) => {
    setCurrentPlan(updatedPlan);
    handleApprove();
  };

  const handleCancelEdit = () => {
    const cancelMessage: Message = {
      id: Date.now().toString(),
      role: "assistant",
      content: "No problem! Let me know if you'd like to make any changes.",
      timestamp: new Date(),
      type: "text"
    };
    setMessages(prev => [...prev, cancelMessage]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Coffee className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Create with AI</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={() => window.location.href = "/dashboard"}>
            Back to Dashboard
          </Button>
        </div>
      </div>

      {/* Main Content - Split Screen */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Panel - Left 40% */}
        <div className="w-2/5 border-r flex flex-col bg-background">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                {message.role === "assistant" && (
                  <div className="flex-shrink-0 mr-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Coffee className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                )}
                
                <div className={`max-w-[80%] ${message.role === "user" ? "ml-auto" : ""}`}>
                  {message.type === "plan" && currentPlan ? (
                    <PlanEditor plan={currentPlan} onApprove={handlePlanUpdate} onCancel={handleCancelEdit} />
                  ) : message.type === "generating" ? (
                    <GeneratingCard progress={generationProgress} />
                  ) : (
                    <div className={`rounded-2xl px-4 py-3 ${
                      message.role === "user" 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted"
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-1 px-2">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                {message.role === "user" && (
                  <div className="flex-shrink-0 ml-3">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-sm">
                      {user?.name?.[0] || "U"}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Coffee className="h-4 w-4 text-primary animate-pulse" />
                </div>
                <div className="bg-muted rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="min-h-[60px] max-h-[120px] resize-none"
                disabled={isTyping || isGenerating}
              />
              <Button 
                onClick={handleSend} 
                disabled={!input.trim() || isTyping || isGenerating}
                size="icon"
                className="h-[60px] w-[60px]"
              >
                {isTyping ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Preview Panel - Right 60% */}
        <div className="flex-1 bg-muted/30">
          <SlidePreview 
            slides={slides}
            currentSlideIndex={currentSlideIndex}
            onSlideChange={setCurrentSlideIndex}
          />
        </div>
      </div>
    </div>
  );
}



// Generating Card Component
function GeneratingCard({ progress }: { progress: number }) {
  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <div className="flex-1">
          <p className="font-medium text-sm">Generating your presentation...</p>
          <p className="text-xs text-muted-foreground">This usually takes 1-2 minutes</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {progress >= 25 && progress < 100 && (
        <p className="text-xs text-muted-foreground">{getProgressMessage(progress)}</p>
      )}
      {progress === 100 && (
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle2 className="h-4 w-4" />
          <p className="text-xs font-medium">Complete!</p>
        </div>
      )}
    </Card>
  );
}

