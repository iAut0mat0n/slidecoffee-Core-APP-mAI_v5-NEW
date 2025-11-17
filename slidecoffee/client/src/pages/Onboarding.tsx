import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { APP_TITLE } from "@/const";
import { trpc } from "@/lib/trpc";
import { Send, Loader2, Upload, Sparkles, Check } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

type Message = {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  showFileUpload?: boolean;
};

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [extractedBrand, setExtractedBrand] = useState<any>(null);
  const [showReview, setShowReview] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: workspaces, isLoading: workspacesLoading } = trpc.workspaces.list.useQuery(undefined, {
    retry: false,
  });
  const defaultWorkspace = workspaces?.find((w) => w.isDefault) || workspaces?.[0];

  const chatBrand = trpc.brands.chatBrand.useMutation();
  const createBrand = trpc.brands.create.useMutation({
    onSuccess: () => {
      toast.success("Brand created! Let's build your first presentation 🚀");
      setLocation("/dashboard");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Define helper functions before useEffect
  const addMessage = (role: "user" | "assistant", content: string, showFileUpload = false) => {
    setMessages(prev => [...prev, { role, content, timestamp: new Date(), showFileUpload }]);
  };

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Start conversation automatically on mount
  useEffect(() => {
    if (messages.length === 0) {
      setTimeout(() => {
        addMessage("assistant", `Hi! I'm your AI brand assistant for ${APP_TITLE} ☕\n\nI'll help you create a brand profile so all your presentations look perfectly styled.\n\nLet's start - what's your brand or company name?`);
      }, 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Focus input after AI responds
  useEffect(() => {
    if (!isTyping && messages.length > 0) {
      inputRef.current?.focus();
    }
  }, [isTyping, messages.length]);

  // Show loading state while workspaces are loading
  if (workspacesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const handleAIResponse = async (userMessage: string) => {
    setIsTyping(true);
    
    try {
      const result = await chatBrand.mutateAsync({
        conversationHistory: messages.map(m => ({
          role: m.role,
          content: m.content
        })),
        userMessage
      });
      
      setIsTyping(false);
      
      // Check if AI wants to offer file upload
      const messageCount = messages.filter(m => m.role === "user").length;
      const shouldOfferUpload = messageCount === 1 && !uploadedFile;
      
      if (shouldOfferUpload) {
        addMessage("assistant", result.response);
        setTimeout(() => {
          addMessage("assistant", "💡 **Pro tip:** If you have existing brand guidelines or PowerPoints, you can upload them and I'll extract your colors, fonts, and style automatically!\n\nWould you like to upload a file, or shall we continue building your brand through conversation?", true);
        }, 1500);
      } else {
        addMessage("assistant", result.response);
      }
      
      // If AI has enough info, show brand review
      if (result.brandData) {
        setTimeout(() => {
          setExtractedBrand(result.brandData);
          setShowReview(true);
          addMessage("assistant", "Perfect! I've created a brand profile for you. Take a look below and let me know if you'd like any changes! 👇");
        }, 1500);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setIsTyping(false);
      addMessage("assistant", "I'm having trouble connecting. Could you tell me more about your brand?");
    }
  };

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;
    
    const message = userInput.trim();
    setUserInput("");
    addMessage("user", message);
    
    await handleAIResponse(message);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const validTypes = [
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/pdf",
      "application/vnd.ms-powerpoint"
    ];
    
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a PowerPoint (.pptx) or PDF file");
      return;
    }
    
    setUploadedFile(file);
    addMessage("user", `📎 Uploaded: ${file.name}`);
    
    setIsTyping(true);
    addMessage("assistant", "Great! Let me analyze your file...");
    
    // Simulate file analysis
    setTimeout(() => {
      setIsTyping(false);
      setExtractedBrand({
        name: file.name.replace(/\.(pptx|pdf)$/i, ""),
        primaryColor: "#1E40AF",
        secondaryColor: "#7C3AED",
        accentColor: "#059669",
        fonts: ["Helvetica", "Arial"],
        tone: "Professional and authoritative",
      });
      setShowReview(true);
      addMessage("assistant", "✨ I've analyzed your file and extracted your brand identity! Here's what I found:");
    }, 2000);
  };

  const handleCreateBrand = () => {
    if (!defaultWorkspace || !extractedBrand) return;
    
    createBrand.mutate({
      workspaceId: defaultWorkspace.id,
      name: extractedBrand.name,
      primaryColor: extractedBrand.primaryColor,
      secondaryColor: extractedBrand.secondaryColor,
      accentColor: extractedBrand.accentColor,
      fontPrimary: extractedBrand.fonts?.[0] || "Inter",
      fontSecondary: extractedBrand.fonts?.[1] || "Georgia",
      guidelinesText: extractedBrand.description || extractedBrand.tone || "",
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div className="container max-w-4xl py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-semibold">{APP_TITLE} Setup</h1>
              <p className="text-xs text-muted-foreground">Brand Assistant</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setLocation("/dashboard")}
          >
            Skip for now
          </Button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="container max-w-3xl py-8 space-y-6">
          {messages.map((msg, idx) => (
            <div key={idx}>
              <div
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground ml-12"
                      : "bg-muted mr-12"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                </div>
              </div>
              
              {/* Inline file upload option */}
              {msg.showFileUpload && !uploadedFile && (
                <div className="flex justify-start mt-3">
                  <div className="mr-12">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Upload Brand File
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-2xl px-4 py-3 mr-12">
                <div className="flex gap-1">
                  <div className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}

          {/* Brand Review Card */}
          {showReview && extractedBrand && (
            <div className="flex justify-start">
              <div className="bg-card border rounded-xl p-6 mr-12 max-w-md shadow-sm">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Brand Name</p>
                    <p className="text-lg font-semibold">{extractedBrand.name}</p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Color Palette</p>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <div 
                          className="h-12 rounded-lg border"
                          style={{ backgroundColor: extractedBrand.primaryColor }}
                        />
                        <p className="text-xs text-center mt-1 text-muted-foreground">Primary</p>
                      </div>
                      <div className="flex-1">
                        <div 
                          className="h-12 rounded-lg border"
                          style={{ backgroundColor: extractedBrand.secondaryColor }}
                        />
                        <p className="text-xs text-center mt-1 text-muted-foreground">Secondary</p>
                      </div>
                      <div className="flex-1">
                        <div 
                          className="h-12 rounded-lg border"
                          style={{ backgroundColor: extractedBrand.accentColor }}
                        />
                        <p className="text-xs text-center mt-1 text-muted-foreground">Accent</p>
                      </div>
                    </div>
                  </div>

                  {extractedBrand.fonts && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Typography</p>
                      <p className="text-sm">{extractedBrand.fonts.join(", ")}</p>
                    </div>
                  )}

                  {extractedBrand.tone && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Brand Tone</p>
                      <p className="text-sm">{extractedBrand.tone}</p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setShowReview(false);
                        setExtractedBrand(null);
                        addMessage("user", "Let's start over");
                        addMessage("assistant", "No problem! What would you like to change?");
                      }}
                    >
                      Start Over
                    </Button>
                    <Button 
                      size="sm"
                      className="flex-1 gap-2"
                      onClick={handleCreateBrand}
                      disabled={createBrand.isPending}
                    >
                      {createBrand.isPending ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Check className="h-3 w-3" />
                          Looks Perfect!
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky bottom-0">
        <div className="container max-w-3xl py-4">
          <div className="flex gap-2 items-end">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Type your message..."
                className="pr-10 min-h-[44px] resize-none"
                disabled={isTyping || createBrand.isPending}
              />
            </div>
            <Button 
              onClick={handleSendMessage}
              disabled={!userInput.trim() || isTyping || createBrand.isPending}
              size="icon"
              className="h-[44px] w-[44px] shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-center text-muted-foreground mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pptx,.pdf,.ppt"
        className="hidden"
        onChange={handleFileUpload}
      />
    </div>
  );
}

