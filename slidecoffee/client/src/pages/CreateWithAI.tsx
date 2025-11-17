import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/DashboardLayout";
import { FileText, Sparkles, Upload, Layers, ArrowRight, Shuffle } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useState } from "react";

type CreationMode = "paste" | "generate" | "import" | "remix";

interface ModeCard {
  id: CreationMode;
  icon: typeof FileText;
  title: string;
  description: string;
  badge?: string;
  path: string;
}

const modes: ModeCard[] = [
  {
    id: "paste",
    icon: FileText,
    title: "Paste in text",
    description: "Create from notes, outline, or long-form content",
    path: "/create/paste",
  },
  {
    id: "generate",
    icon: Sparkles,
    title: "Generate",
    description: "Describe what you'd like to make in one line",
    path: "/create/generate",
  },
  {
    id: "import",
    icon: Upload,
    title: "Import file or URL",
    description: "Enhance existing docs, PDFs, or web pages",
    path: "/create/import",
  },
  {
    id: "remix",
    icon: Layers,
    title: "Remix a template",
    description: "Fill in a template with your content",
    badge: "BETA",
    path: "/create/remix",
  },
];

export default function CreateWithAI() {
  const [, setLocation] = useLocation();
  const { user } = useSupabaseAuth();
  const [recentPrompts, setRecentPrompts] = useState<string[]>([
    "10-slide investor pitch for a SaaS startup",
    "Product roadmap presentation for Q1 2025",
    "Sales training deck for new hires",
  ]);

  const { data: workspaces } = trpc.workspaces.list.useQuery();
  const defaultWorkspace = workspaces?.find(w => w.isDefault) || workspaces?.[0];

  const handleModeClick = (path: string) => {
    setLocation(path);
  };

  const handleRecentPromptClick = (prompt: string) => {
    setLocation(`/create/generate?prompt=${encodeURIComponent(prompt)}`);
  };

  const shufflePrompts = () => {
    const allPrompts = [
      "10-slide investor pitch for a SaaS startup",
      "Product roadmap presentation for Q1 2025",
      "Sales training deck for new hires",
      "Company culture and values presentation",
      "Marketing strategy for product launch",
      "Quarterly business review for executives",
      "Customer success case study showcase",
      "Technical architecture overview",
      "Team onboarding and welcome deck",
    ];
    
    // Shuffle and take 3
    const shuffled = allPrompts.sort(() => Math.random() - 0.5).slice(0, 3);
    setRecentPrompts(shuffled);
  };

  return (
    <DashboardLayout>
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-8">
        {/* Gradient Background Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20 -z-10" />
        
        <div className="w-full max-w-5xl space-y-12">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">Create with AI</h1>
            <p className="text-lg text-muted-foreground">
              Choose how you'd like to start your presentation
            </p>
          </div>

          {/* Mode Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {modes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => handleModeClick(mode.path)}
                className="group relative p-8 rounded-2xl border-2 bg-card hover:bg-accent transition-all hover:shadow-lg hover:scale-[1.02] text-left"
              >
                {/* Badge */}
                {mode.badge && (
                  <span className="absolute top-4 right-4 px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded-full">
                    {mode.badge}
                  </span>
                )}

                {/* Icon */}
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <mode.icon className="h-6 w-6 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                  {mode.title}
                  <ArrowRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {mode.description}
                </p>
              </button>
            ))}
          </div>

          {/* Recent Prompts Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Your recent prompts</h2>
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
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleRecentPromptClick(prompt)}
                  className="p-4 rounded-lg border bg-card hover:bg-accent transition-colors text-left group"
                >
                  <div className="flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
                    <p className="text-sm leading-relaxed group-hover:text-primary transition-colors">
                      {prompt}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Tip */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              ☕ Tip: All modes support AI chat for real-time guidance and live preview. Let's brew something amazing!
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

