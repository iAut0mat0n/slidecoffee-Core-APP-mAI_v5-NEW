import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  FileText, 
  Globe, 
  FileImage, 
  Share2,
  Sparkles,
  Info
} from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

type ContentType = "presentation" | "webpage" | "document" | "social";
type OrientationType = "portrait" | "landscape";
type ActionType = "generate" | "summarize" | "preserve";

const contentTypes: Array<{ value: ContentType; label: string; icon: typeof FileText }> = [
  { value: "presentation", label: "Presentation", icon: FileText },
  { value: "webpage", label: "Webpage", icon: Globe },
  { value: "document", label: "Document", icon: FileImage },
  { value: "social", label: "Social", icon: Share2 },
];

const exampleContent = `Introduction
---
Welcome to our product
Key features overview

Problem Statement
---
Current market challenges
Customer pain points

Solution
---
Our innovative approach
How we solve the problem`;

export default function PasteMode() {
  const [, setLocation] = useLocation();
  const { user } = useSupabaseAuth();
  const [contentType, setContentType] = useState<ContentType>("presentation");
  const [orientation, setOrientation] = useState<OrientationType>("landscape");
  const [content, setContent] = useState("");
  const [action, setAction] = useState<ActionType>("generate");

  const { data: workspaces } = trpc.workspaces.list.useQuery();
  const defaultWorkspace = workspaces?.find(w => w.isDefault) || workspaces?.[0];

  const handleCreate = () => {
    if (!content.trim()) {
      toast.error("Please enter some content");
      return;
    }

    // Navigate to project creation with parameters
    const params = new URLSearchParams({
      mode: "paste",
      content: content,
      type: contentType,
      orientation: orientation,
      action: action,
    });
    
    toast.success("Creating your presentation...");
    setLocation(`/project/new?${params.toString()}`);
  };

  return (
    <DashboardLayout>
      <div className="min-h-[calc(100vh-4rem)] p-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Main Content Area */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header */}
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                  <FileText className="h-8 w-8 text-blue-600" />
                  Paste in text
                </h1>
                <p className="text-lg text-muted-foreground">
                  Transform your notes, outline, or content into a presentation
                </p>
              </div>

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

              {/* Orientation Selector */}
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">Orientation:</span>
                <Select value={orientation} onValueChange={(v) => setOrientation(v as OrientationType)}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="landscape">Landscape</SelectItem>
                    <SelectItem value="portrait">Portrait</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Content Textarea */}
              <div className="space-y-3">
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Type or paste in content here..."
                  className="min-h-[400px] text-base resize-none font-mono"
                />
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {content.length} characters • {content.split('\n').filter(l => l.trim()).length} lines
                  </p>
                  <Button
                    onClick={handleCreate}
                    size="lg"
                    disabled={!content.trim()}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Create
                  </Button>
                </div>
              </div>

              {/* Action Selection */}
              <div className="space-y-4 p-6 rounded-lg border bg-card">
                <h3 className="text-lg font-semibold">What do you want to do with this content?</h3>
                <RadioGroup value={action} onValueChange={(v) => setAction(v as ActionType)}>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-accent transition-colors cursor-pointer">
                      <RadioGroupItem value="generate" id="generate" className="mt-1" />
                      <Label htmlFor="generate" className="flex-1 cursor-pointer">
                        <div className="font-medium mb-1">Generate from notes or outline</div>
                        <div className="text-sm text-muted-foreground">
                          AI will expand your notes into a full presentation with design and structure
                        </div>
                      </Label>
                    </div>

                    <div className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-accent transition-colors cursor-pointer">
                      <RadioGroupItem value="summarize" id="summarize" className="mt-1" />
                      <Label htmlFor="summarize" className="flex-1 cursor-pointer">
                        <div className="font-medium mb-1">Summarize long text or document</div>
                        <div className="text-sm text-muted-foreground">
                          AI will extract key points and create a concise presentation
                        </div>
                      </Label>
                    </div>

                    <div className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-accent transition-colors cursor-pointer">
                      <RadioGroupItem value="preserve" id="preserve" className="mt-1" />
                      <Label htmlFor="preserve" className="flex-1 cursor-pointer">
                        <div className="font-medium mb-1">Preserve this exact text</div>
                        <div className="text-sm text-muted-foreground">
                          AI will design slides around your exact content without changing it
                        </div>
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>
            </div>

            {/* Right: Sidebar with Instructions */}
            <div className="lg:col-span-1 space-y-6">
              <div className="sticky top-8 space-y-6">
                {/* Card-by-card control */}
                <div className="p-6 rounded-lg border bg-card space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Info className="h-5 w-5 text-blue-600" />
                    Optional: card-by-card control
                  </h3>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <p>
                      Use <code className="px-2 py-1 rounded bg-muted font-mono text-xs">---</code> to separate slides
                    </p>
                    <p>
                      Each section between <code className="px-2 py-1 rounded bg-muted font-mono text-xs">---</code> will become one slide
                    </p>
                  </div>
                </div>

                {/* Example Content */}
                <div className="p-6 rounded-lg border bg-card space-y-4">
                  <h3 className="font-semibold">Example format</h3>
                  <pre className="text-xs font-mono bg-muted p-4 rounded-lg overflow-x-auto whitespace-pre-wrap">
                    {exampleContent}
                  </pre>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setContent(exampleContent)}
                    className="w-full"
                  >
                    Use this example
                  </Button>
                </div>

                {/* Tips */}
                <div className="p-6 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 space-y-3">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                    ☕ Pro tips
                  </h3>
                  <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
                    <li>• Use headings to structure your content</li>
                    <li>• Bullet points work great for key ideas</li>
                    <li>• Include data and numbers when relevant</li>
                    <li>• AI will enhance formatting and design - like adding cream to coffee!</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

