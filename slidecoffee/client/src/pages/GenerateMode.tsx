import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  Sparkles, 
  FileText, 
  Globe, 
  FileImage, 
  Share2,
  Plus,
  Minus,
  Shuffle,
  Lightbulb,
  Users,
  Utensils,
  GraduationCap,
  Mountain,
  Home,
  TrendingUp
} from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ChatSidebar } from "@/components/ChatSidebar";
import { LivePreview } from "@/components/LivePreview";
import { BrandSelectionDialog } from "@/components/BrandSelectionDialog";
import { GenerationProgressPanel } from "@/components/GenerationProgressPanel";
import { ClarifyingQuestionsDialog, type ClarifyingAnswers } from "@/components/ClarifyingQuestionsDialog";
import { celebrateCompletion } from "@/lib/confetti";

type ContentType = "presentation" | "webpage" | "document" | "social";
type StyleType = "default" | "professional" | "creative" | "minimal";
type LanguageType = "en-US" | "en-GB" | "es" | "fr" | "de" | "ja" | "zh";

interface SuggestedPrompt {
  icon: typeof Lightbulb;
  text: string;
  category: string;
}

const contentTypes: Array<{ value: ContentType; label: string; icon: typeof FileText }> = [
  { value: "presentation", label: "Presentation", icon: FileText },
  { value: "webpage", label: "Webpage", icon: Globe },
  { value: "document", label: "Document", icon: FileImage },
  { value: "social", label: "Social", icon: Share2 },
];

const suggestedPrompts: SuggestedPrompt[] = [
  { icon: Users, text: "Mentorship initiatives to boost employee growth", category: "Business" },
  { icon: Utensils, text: "How to make sushi: a beginner's guide", category: "Food" },
  { icon: GraduationCap, text: "Science fair project: renewable energy solutions", category: "Education" },
  { icon: Mountain, text: "Beautiful day hikes near San Francisco", category: "Travel" },
  { icon: Home, text: "Real estate investing for beginners", category: "Finance" },
  { icon: GraduationCap, text: "Industrial revolution lesson plan", category: "Education" },
];

export default function GenerateMode() {
  const [, setLocation] = useLocation();
  const { user } = useSupabaseAuth();
  const [contentType, setContentType] = useState<ContentType>("presentation");
  const [slideCount, setSlideCount] = useState(10);
  const [style, setStyle] = useState<StyleType>("default");
  const [language, setLanguage] = useState<LanguageType>("en-US");
  const [prompt, setPrompt] = useState("");
  const [visiblePrompts, setVisiblePrompts] = useState(suggestedPrompts);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{role: "user" | "assistant"; content: string; timestamp: Date}>>([]);
  const [isAITyping, setIsAITyping] = useState(false);
  const [slides, setSlides] = useState<Array<{id: string; title: string; content: string; layout: string}>>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [showBrandDialog, setShowBrandDialog] = useState(false);
  const [selectedBrandId, setSelectedBrandId] = useState<number | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | undefined>(undefined);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [showProgressPanel, setShowProgressPanel] = useState(false);
  const [showClarifyingQuestions, setShowClarifyingQuestions] = useState(false);
  const [clarifyingAnswers, setClarifyingAnswers] = useState<ClarifyingAnswers | null>(null);

  const { data: workspaces } = trpc.workspaces.list.useQuery();
  const defaultWorkspace = workspaces?.find(w => w.isDefault) || workspaces?.[0];

  // Check for prompt in URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlPrompt = params.get("prompt");
    if (urlPrompt) {
      setPrompt(urlPrompt);
    }
  }, []);

  const handleSlideCountChange = (delta: number) => {
    const newCount = Math.max(1, Math.min(50, slideCount + delta));
    setSlideCount(newCount);
  };

  const shufflePrompts = () => {
    const shuffled = [...suggestedPrompts].sort(() => Math.random() - 0.5);
    setVisiblePrompts(shuffled);
  };

  const handlePromptClick = (promptText: string) => {
    setPrompt(promptText);
  };

  const handleChatMessage = async (message: string) => {
    setChatMessages(prev => [...prev, { role: "user", content: message, timestamp: new Date() }]);
    setIsAITyping(true);

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "Great topic! I'll help you create a compelling presentation. What's your target audience?",
        "I can enhance that with data visualizations. Would you like me to add charts?",
        "That sounds interesting! Should we include case studies or examples?",
        "Perfect! I'll structure this with a strong opening and clear takeaways.",
      ];
      const response = responses[Math.floor(Math.random() * responses.length)];
      setChatMessages(prev => [...prev, { role: "assistant", content: response, timestamp: new Date() }]);
      setIsAITyping(false);
    }, 1500);
  };

  const handleGenerate = () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    // Show clarifying questions first
    setShowClarifyingQuestions(true);
  };

  const handleClarifyingComplete = (answers: ClarifyingAnswers) => {
    setClarifyingAnswers(answers);
    // Now show brand selection dialog
    setShowBrandDialog(true);
  };

  const handleBrandSelected = (brandId: number | null, templateId?: number) => {
    setSelectedBrandId(brandId);
    setSelectedTemplateId(templateId);
    
    // Now proceed with generation
    const brandMessage = brandId 
      ? "Using your selected brand guidelines! ✨" 
      : "Creating a fresh design for you! 🎨";
    
    toast.success(brandMessage);
    
    // Generate a mock project ID for demo (in production, this would come from backend)
    const mockProjectId = `project-${Date.now()}`;
    setCurrentProjectId(mockProjectId);
    setShowProgressPanel(true);
    setShowPreview(true);
    setIsChatOpen(true);
    
    // Simulate slide generation
    const mockSlides = [
      { id: "1", title: "Title Slide", content: prompt, layout: "title" },
      { id: "2", title: "Introduction", content: "Overview of the topic", layout: "content" },
      { id: "3", title: "Key Points", content: "Main ideas and concepts", layout: "content" },
    ];
    setSlides(mockSlides);
    
    // Add AI greeting with brand and clarifying context
    let aiMessage = brandId
      ? `I'm generating your presentation with your brand guidelines! ${templateId ? 'Using your selected template too. ' : ''}`
      : "I'm generating your presentation!";
    
    if (clarifyingAnswers) {
      const contextParts = [];
      if (clarifyingAnswers.audience) contextParts.push(`for ${clarifyingAnswers.audience}`);
      if (clarifyingAnswers.tone) contextParts.push(`with a ${clarifyingAnswers.tone} tone`);
      if (clarifyingAnswers.goal) contextParts.push(`to ${clarifyingAnswers.goal}`);
      
      if (contextParts.length > 0) {
        aiMessage += ` I'll create it ${contextParts.join(', ')}.`;
      }
    }
    
    aiMessage += " Feel free to ask me to make changes or add specific content.";
    
    setChatMessages([{
      role: "assistant",
      content: aiMessage,
      timestamp: new Date()
    }]);
    
    // TODO: Navigate to actual project creation with brand/template
    // const params = new URLSearchParams({
    //   mode: "generate",
    //   prompt: prompt,
    //   type: contentType,
    //   slides: slideCount.toString(),
    //   style: style,
    //   language: language,
    //   brandId: brandId?.toString() || '',
    //   templateId: templateId?.toString() || '',
    // });
    // setLocation(`/project/new?${params.toString()}`);
  };

  const handleGenerationComplete = () => {
    celebrateCompletion();
    toast.success("🎉 Presentation complete! All slides are ready.");
    setShowProgressPanel(false);
  };

  return (
    <DashboardLayout>
      <div className="min-h-[calc(100vh-4rem)] p-8">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Sparkles className="h-8 w-8 text-purple-600" />
              Generate
            </h1>
            <p className="text-lg text-muted-foreground">
              What would you like to create today?
            </p>
          </div>

          {/* Generation Progress Panel */}
          {showProgressPanel && currentProjectId && (
            <GenerationProgressPanel
              projectId={currentProjectId}
              enabled={showProgressPanel}
              onComplete={handleGenerationComplete}
            />
          )}

          {/* Type Selector */}
          <div className="flex items-center gap-3">
            {contentTypes.map((type) => (
              <Button
                key={type.value}
                variant={contentType === type.value ? "default" : "outline"}
                onClick={() => setContentType(type.value)}
                className="gap-2"
              >
                <type.icon className="h-4 w-4" />
                {type.label}
              </Button>
            ))}
          </div>

          {/* Configuration Bar */}
          <div className="flex items-center gap-4 p-4 rounded-lg border bg-card">
            {/* Slide Count */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleSlideCountChange(-1)}
                disabled={slideCount <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <div className="text-center min-w-[80px]">
                <div className="text-2xl font-bold">{slideCount}</div>
                <div className="text-xs text-muted-foreground">cards</div>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleSlideCountChange(1)}
                disabled={slideCount >= 50}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="h-8 w-px bg-border" />

            {/* Style Selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Style:</span>
              <Select value={style} onValueChange={(v) => setStyle(v as StyleType)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="creative">Creative</SelectItem>
                  <SelectItem value="minimal">Minimal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="h-8 w-px bg-border" />

            {/* Language Selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Language:</span>
              <Select value={language} onValueChange={(v) => setLanguage(v as LanguageType)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en-US">English (US)</SelectItem>
                  <SelectItem value="en-GB">English (UK)</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                  <SelectItem value="ja">日本語</SelectItem>
                  <SelectItem value="zh">中文</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Prompt Input */}
          <div className="space-y-3">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe what you'd like to make..."
              className="min-h-[120px] text-base resize-none"
            />
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Be specific about your topic, audience, and key points
              </p>
              <Button
                onClick={handleGenerate}
                size="lg"
                disabled={!prompt.trim()}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Generate
              </Button>
            </div>
          </div>

          {/* Suggested Prompts */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Suggested prompts</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={shufflePrompts}
                className="gap-2"
              >
                <Shuffle className="h-4 w-4" />
                Shuffle
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {visiblePrompts.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePromptClick(item.text)}
                  className="p-4 rounded-lg border bg-card hover:bg-accent transition-all text-left group hover:shadow-md"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0">
                      <item.icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-relaxed group-hover:text-primary transition-colors">
                        {item.text}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {item.category}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Help Text */}
          <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
            <Lightbulb className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                ☕ Pro tip: Great presentations are like good coffee - strong start, smooth finish
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Be specific about your audience, key points, and desired tone. Example: "10-slide investor pitch for a B2B SaaS startup, focusing on market opportunity and traction"
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Live Preview (shown after generation starts) */}
      {showPreview && (
        <div className="fixed inset-y-0 right-0 w-1/2 bg-background border-l z-30">
          <LivePreview
            slides={slides}
            currentSlideIndex={currentSlideIndex}
            onSlideChange={setCurrentSlideIndex}
            isGenerating={slides.length < slideCount}
          />
        </div>
      )}

      {/* AI Chat Sidebar */}
      <ChatSidebar
        isOpen={isChatOpen}
        onToggle={() => setIsChatOpen(!isChatOpen)}
        messages={chatMessages}
        onSendMessage={handleChatMessage}
        isTyping={isAITyping}
        placeholder="Ask AI to modify your presentation..."
        suggestedReplies={[
          "Add more slides",
          "Change the style",
          "Include data"
        ]}
      />

      {/* Clarifying Questions Dialog */}
      <ClarifyingQuestionsDialog
        open={showClarifyingQuestions}
        onClose={() => setShowClarifyingQuestions(false)}
        onComplete={handleClarifyingComplete}
        prompt={prompt}
      />

      {/* Brand Selection Dialog */}
      <BrandSelectionDialog
        open={showBrandDialog}
        onClose={() => setShowBrandDialog(false)}
        onBrandSelected={handleBrandSelected}
      />
    </DashboardLayout>
  );
}

