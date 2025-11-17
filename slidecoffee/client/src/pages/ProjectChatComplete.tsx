import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { SlideRenderer, SlideThumbnail, type Slide } from "@/components/SlideRenderer";
import { trpc } from "@/lib/trpc";
import {
  ArrowLeft,
  Send,
  Loader2,
  Sparkles,
  CheckCircle2,
  XCircle,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useLocation, useParams } from "wouter";
import { celebrateCompletion, celebratePlanApproved } from "@/lib/confetti";
import { CollaborationBar } from "@/components/CollaborationBar";
import { useCollaboration } from "@/hooks/useCollaboration";

export default function ProjectChatComplete() {
  const { id } = useParams<{ id: string }>();
  const projectId = parseInt(id || "0");
  const [, setLocation] = useLocation();
  const [message, setMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Collaboration
  const collaboration = useCollaboration(projectId.toString());

  const { data: project } = trpc.projects.get.useQuery(
    { id: projectId },
    { enabled: !!projectId }
  );

  const { data: messages, refetch: refetchMessages } = trpc.chat.list.useQuery(
    { projectId },
    { enabled: !!projectId, refetchInterval: 3000 } // Poll for updates
  );

  const { data: slidesData, refetch: refetchSlides } = trpc.chat.getSlides.useQuery(
    { projectId },
    { enabled: !!projectId, refetchInterval: 3000 } // Poll for slide updates
  );

  const { data: plan } = trpc.chat.getPlan.useQuery(
    { projectId },
    { enabled: !!projectId, refetchInterval: 3000 }
  );

  const sendMessage = trpc.chat.send.useMutation({
    onSuccess: (data) => {
      setMessage("");
      refetchMessages();
      refetchSlides();
      setIsGenerating(false);
      
      // Celebrate when slides are complete
      if (data.slidesGenerated) {
        setTimeout(() => {
          celebrateCompletion();
          toast.success("🎉 Your presentation is ready! Looking fantastic!");
        }, 1000);
      }
    },
    onError: (error) => {
      toast.error(error.message);
      setIsGenerating(false);
    },
  });

  const approvePlan = trpc.chat.approvePlan.useMutation({
    onSuccess: () => {
      celebratePlanApproved();
      toast.success("🎉 Plan approved! Let me work my magic...");
      setIsGenerating(true);
      // Send a message to trigger slide generation
      sendMessage.mutate({
        projectId,
        content: "Generate slides",
        role: "user",
      });
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

  const slides = slidesData?.slides || [];

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
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
      handleSend();
    }
  };

  const nextSlide = () => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
  };

  const exportMutation = trpc.export.toPowerPoint.useMutation({
    onSuccess: (data) => {
      // Convert base64 to blob and download
      const byteCharacters = atob(data.data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], {
        type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      });
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = data.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('PowerPoint exported successfully!');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleExport = () => {
    exportMutation.mutate({ projectId });
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/projects")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold">{project?.title || "Loading..."}</h1>
            <p className="text-sm text-muted-foreground">
              {slides.length > 0 ? `${slides.length} slides` : "No slides yet"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <CollaborationBar
            collaborators={Array.from(collaboration.users.values()).map((user, idx) => ({
              id: user.userId,
              name: user.userName,
              initials: user.userName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2),
              color: user.color,
              isActive: true,
              currentSlide: user.currentSlide,
            }))}
            currentUser={{
              id: 0,
              name: "You",
              initials: "Y",
              color: "#3b82f6",
              isActive: true,
              currentSlide: currentSlideIndex,
            }}
            isConnected={collaboration.isConnected}
            onShowActivity={() => {}}
          />
          {slides.length > 0 && (
            <Button onClick={handleExport} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          )}
        </div>
      </div>

      {/* Main Content - Split View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Chat */}
        <div className="w-1/2 border-r flex flex-col">
          {/* Messages */}
          <ScrollArea className="flex-1 p-6" ref={scrollRef}>
            <div className="space-y-6 max-w-2xl">
              {messages && messages.length === 0 && (
                <Card className="p-8 text-center">
                  <Sparkles className="h-12 w-12 mx-auto mb-4 text-blue-500" />
                  <h3 className="text-lg font-semibold mb-2">
                    Let's create something amazing!
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Describe the presentation you want to create, and I'll help you build it.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setMessage("Create a 10-slide investor pitch deck")}
                    >
                      Investor Pitch
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setMessage("Create a quarterly business review presentation")}
                    >
                      Business Review
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setMessage("Create a product launch presentation")}
                    >
                      Product Launch
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setMessage("Create a sales proposal deck")}
                    >
                      Sales Proposal
                    </Button>
                  </div>
                </Card>
              )}

              {messages?.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <Card
                    className={`max-w-[80%] p-4 ${
                      msg.role === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-muted"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </Card>
                </div>
              ))}

              {/* Plan Approval Buttons */}
              {plan && plan.status === "pending" && (
                <Card className="p-6 border-blue-500">
                  <div className="flex items-start gap-4">
                    <Sparkles className="h-6 w-6 text-blue-500 mt-1" />
                    <div className="flex-1">
                      <h4 className="font-semibold mb-2">Plan Ready for Review</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        I've created a strategic plan for your presentation. Review it above and let me know if you'd like any changes.
                      </p>
                      <div className="flex gap-3">
                        <Button
                          onClick={() => approvePlan.mutate({ projectId })}
                          disabled={approvePlan.isPending}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Approve & Generate Slides
                        </Button>
                        <Button
                          onClick={() => rejectPlan.mutate({ projectId })}
                          disabled={rejectPlan.isPending}
                          variant="outline"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Request Changes
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {isGenerating && (
                <Card className="p-6">
                  <div className="flex items-center gap-4">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                    <div>
                      <p className="font-semibold">Working on it...</p>
                      <p className="text-sm text-muted-foreground">
                        Creating your professional slides
                      </p>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Describe your presentation or request changes..."
                disabled={isGenerating}
                className="flex-1"
              />
              <Button
                onClick={handleSend}
                disabled={!message.trim() || isGenerating}
                size="icon"
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Right: Slide Preview */}
        <div className="w-1/2 flex flex-col bg-gray-950">
          {slides.length > 0 ? (
            <>
              {/* Slide Navigation */}
              <div className="border-b border-gray-800 px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={prevSlide}
                    disabled={currentSlideIndex === 0}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <span className="text-sm font-medium">
                    Slide {currentSlideIndex + 1} of {slides.length}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={nextSlide}
                    disabled={currentSlideIndex === slides.length - 1}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Main Slide View */}
              <div className="flex-1 p-8 flex items-center justify-center overflow-auto">
                <div className="w-full max-w-5xl">
                  <SlideRenderer 
                    slide={slides[currentSlideIndex]} 
                  />
                </div>
              </div>

              {/* Slide Thumbnails */}
              <div className="border-t border-gray-800 p-4">
                <ScrollArea className="w-full">
                  <div className="flex gap-2 pb-2">
                    {slides.map((slide, index) => (
                      <div key={slide.id} className="w-32 flex-shrink-0">
                        <SlideThumbnail
                          slide={slide}
                          index={index}
                          isActive={index === currentSlideIndex}
                          onClick={() => setCurrentSlideIndex(index)}
                        />
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center p-8">
              <div>
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-900 flex items-center justify-center">
                  <Sparkles className="h-12 w-12 text-gray-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-300">
                  No Slides Yet
                </h3>
                <p className="text-gray-500 max-w-md">
                  Start chatting to create your presentation. I'll generate professional slides in real-time as we work together.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

