import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc";
import {
  ArrowLeft,
  Send,
  Loader2,
  Sparkles,
  CheckCircle2,
  XCircle,
  FileText,
  Download,
  Maximize2,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useLocation, useParams } from "wouter";

export default function ProjectChatNew() {
  const { id } = useParams<{ id: string }>();
  const projectId = parseInt(id || "0");
  const [, setLocation] = useLocation();
  const [message, setMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: project } = trpc.projects.get.useQuery(
    { id: projectId },
    { enabled: !!projectId }
  );

  const { data: messages, refetch: refetchMessages } = trpc.chat.list.useQuery(
    { projectId },
    { enabled: !!projectId }
  );

  const { data: plan } = trpc.chat.getPlan.useQuery(
    { projectId },
    { enabled: !!projectId }
  );

  const sendMessage = trpc.chat.send.useMutation({
    onSuccess: () => {
      setMessage("");
      refetchMessages();
      setIsGenerating(false);
    },
    onError: (error) => {
      toast.error(error.message);
      setIsGenerating(false);
    },
  });

  const approvePlan = trpc.chat.approvePlan.useMutation({
    onSuccess: () => {
      toast.success("Plan approved! Generating slides...");
      refetchMessages();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const rejectPlan = trpc.chat.rejectPlan.useMutation({
    onSuccess: () => {
      toast.success("Plan rejected. Please provide feedback.");
      refetchMessages();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!message.trim() || isGenerating) return;

    setIsGenerating(true);
    sendMessage.mutate({
      projectId,
      content: message,
      role: "user",
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-card px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/projects")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">{project.title}</h1>
            <p className="text-sm text-muted-foreground">
              {project.description || "No description"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </header>

      {/* Main Content - Split View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Chat Interface */}
        <div className="w-1/2 border-r flex flex-col">
          {/* Messages Area */}
          <ScrollArea className="flex-1 p-6" ref={scrollRef}>
            <div className="space-y-6 max-w-3xl mx-auto">
              {/* Welcome Message */}
              {(!messages || messages.length === 0) && (
                <div className="text-center space-y-4 py-12">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                    <Sparkles className="w-8 h-8 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold">
                      Let's build your presentation
                    </h2>
                    <p className="text-muted-foreground">
                      Describe what you need, and I'll research, plan, and create
                      strategic slides for you.
                    </p>
                  </div>
                  <div className="grid gap-3 pt-4">
                    <Button
                      variant="outline"
                      className="justify-start h-auto p-4 text-left"
                      onClick={() =>
                        setMessage(
                          "Create a 10-slide investor pitch deck for a SaaS company"
                        )
                      }
                    >
                      <FileText className="w-5 h-5 mr-3 flex-shrink-0" />
                      <div>
                        <div className="font-medium">Investor Pitch Deck</div>
                        <div className="text-sm text-muted-foreground">
                          10 slides for SaaS company
                        </div>
                      </div>
                    </Button>
                    <Button
                      variant="outline"
                      className="justify-start h-auto p-4 text-left"
                      onClick={() =>
                        setMessage(
                          "Create a product launch presentation with market analysis"
                        )
                      }
                    >
                      <FileText className="w-5 h-5 mr-3 flex-shrink-0" />
                      <div>
                        <div className="font-medium">Product Launch</div>
                        <div className="text-sm text-muted-foreground">
                          With market analysis
                        </div>
                      </div>
                    </Button>
                  </div>
                </div>
              )}

              {/* Messages */}
              {messages?.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    <p className="text-xs opacity-70 mt-2">
                      {new Date(msg.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}

              {/* Plan Approval Card */}
              {plan && plan.status === "pending" && (
                <Card className="p-6 space-y-4 border-2 border-primary/20">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 space-y-3">
                      <div>
                        <h3 className="font-bold text-lg">
                          Presentation Plan Ready
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Review the outline below and approve to start generating
                          slides
                        </p>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-4">
                        <pre className="whitespace-pre-wrap text-sm font-mono">
                          {plan.planContent}
                        </pre>
                      </div>
                      <div className="flex gap-3">
                        <Button
                          className="flex-1"
                          onClick={() => approvePlan.mutate({ projectId })}
                          disabled={approvePlan.isPending}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Approve & Generate
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => rejectPlan.mutate({ projectId })}
                          disabled={rejectPlan.isPending}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Request Changes
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* Loading Indicator */}
              {isGenerating && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-2xl px-4 py-3 flex items-center gap-3">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">AI is thinking...</span>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t p-4 bg-card">
            <div className="max-w-3xl mx-auto">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  placeholder="Describe your presentation or ask for changes..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isGenerating}
                  className="flex-1 h-12"
                />
                <Button
                  size="icon"
                  className="h-12 w-12"
                  onClick={handleSendMessage}
                  disabled={!message.trim() || isGenerating}
                >
                  {isGenerating ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Press Enter to send • Shift+Enter for new line
              </p>
            </div>
          </div>
        </div>

        {/* Right: Slide Preview */}
        <div className="w-1/2 flex flex-col bg-muted/30">
          <div className="border-b bg-card px-6 py-3 flex items-center justify-between">
            <h2 className="font-semibold">Slide Preview</h2>
            <Button variant="ghost" size="icon">
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex-1 flex items-center justify-center p-8">
            {plan && plan.status === "approved" ? (
              <div className="w-full max-w-4xl aspect-video bg-white rounded-lg shadow-2xl border flex items-center justify-center">
                <div className="text-center space-y-4 p-8">
                  <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Generating Slides
                    </h3>
                    <p className="text-gray-600 mt-2">
                      Creating your presentation based on the approved plan...
                    </p>
                  </div>
                </div>
              </div>
            ) : plan && plan.status === "pending" ? (
              <div className="text-center space-y-4 max-w-md">
                <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                  <FileText className="w-10 h-10 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Plan Ready for Review</h3>
                  <p className="text-muted-foreground mt-2">
                    Approve the plan in the chat to start generating slides
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4 max-w-md">
                <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mx-auto">
                  <FileText className="w-10 h-10 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">No Slides Yet</h3>
                  <p className="text-muted-foreground mt-2">
                    Start chatting to create your presentation. Slides will appear
                    here in real-time.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

