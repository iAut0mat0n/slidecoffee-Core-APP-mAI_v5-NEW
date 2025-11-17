import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles, Users, Target, MessageSquare } from "lucide-react";

export interface ClarifyingAnswers {
  audience?: string;
  tone?: string;
  keyPoints?: string;
  goal?: string;
}

interface ClarifyingQuestionsDialogProps {
  open: boolean;
  onClose: () => void;
  onComplete: (answers: ClarifyingAnswers) => void;
  prompt: string;
}

/**
 * Dialog that asks clarifying questions before generation
 * Helps AI create better, more targeted presentations
 */
export function ClarifyingQuestionsDialog({
  open,
  onClose,
  onComplete,
  prompt,
}: ClarifyingQuestionsDialogProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<ClarifyingAnswers>({});

  const questions = [
    {
      id: "audience",
      icon: Users,
      title: "Who's your audience?",
      description: "Help me tailor the content and tone",
      type: "input" as const,
      placeholder: "e.g., Investors, Team members, Clients, Students",
      examples: ["Investors", "Team members", "Clients", "Students", "General public"],
    },
    {
      id: "tone",
      icon: MessageSquare,
      title: "What tone should we use?",
      description: "The right tone makes all the difference",
      type: "select" as const,
      options: [
        { value: "professional", label: "Professional & Formal" },
        { value: "casual", label: "Casual & Friendly" },
        { value: "persuasive", label: "Persuasive & Compelling" },
        { value: "educational", label: "Educational & Informative" },
        { value: "inspiring", label: "Inspiring & Motivational" },
      ],
    },
    {
      id: "goal",
      icon: Target,
      title: "What's your main goal?",
      description: "What should your audience take away?",
      type: "input" as const,
      placeholder: "e.g., Secure funding, Educate team, Win client, Share knowledge",
      examples: ["Secure funding", "Educate team", "Win client", "Share knowledge"],
    },
    {
      id: "keyPoints",
      icon: Sparkles,
      title: "Any specific points to include?",
      description: "Optional: Key messages or topics you want covered",
      type: "textarea" as const,
      placeholder: "e.g., Market size, competitive advantage, team expertise...",
      optional: true,
    },
  ];

  const currentQuestion = questions[currentStep];

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(answers);
      onClose();
    }
  };

  const handleSkip = () => {
    onComplete(answers);
    onClose();
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateAnswer = (key: string, value: string) => {
    setAnswers({ ...answers, [key]: value });
  };

  const canProceed = currentQuestion.optional || answers[currentQuestion.id as keyof ClarifyingAnswers];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <DialogTitle>Let's make this perfect! ✨</DialogTitle>
          </div>
          <DialogDescription>
            Answer a few quick questions so I can create exactly what you need
          </DialogDescription>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="flex items-center gap-2 mb-4">
          {questions.map((_, idx) => (
            <div
              key={idx}
              className={`h-1 flex-1 rounded-full transition-colors ${
                idx <= currentStep ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Question Content */}
        <div className="space-y-6 py-4">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <currentQuestion.icon className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-1">
                {currentQuestion.title}
                {currentQuestion.optional && (
                  <span className="text-sm text-muted-foreground ml-2">(Optional)</span>
                )}
              </h3>
              <p className="text-sm text-muted-foreground">
                {currentQuestion.description}
              </p>
            </div>
          </div>

          {/* Input Field */}
          <div className="space-y-3">
            {currentQuestion.type === "input" && (
              <>
                <Input
                  placeholder={currentQuestion.placeholder}
                  value={answers[currentQuestion.id as keyof ClarifyingAnswers] || ""}
                  onChange={(e) => updateAnswer(currentQuestion.id, e.target.value)}
                  className="text-base"
                  autoFocus
                />
                {currentQuestion.examples && (
                  <div className="flex flex-wrap gap-2">
                    {currentQuestion.examples.map((example) => (
                      <Button
                        key={example}
                        variant="outline"
                        size="sm"
                        onClick={() => updateAnswer(currentQuestion.id, example)}
                        className="text-xs"
                      >
                        {example}
                      </Button>
                    ))}
                  </div>
                )}
              </>
            )}

            {currentQuestion.type === "select" && (
              <Select
                value={answers[currentQuestion.id as keyof ClarifyingAnswers] || ""}
                onValueChange={(value) => updateAnswer(currentQuestion.id, value)}
              >
                <SelectTrigger className="text-base">
                  <SelectValue placeholder="Choose a tone..." />
                </SelectTrigger>
                <SelectContent>
                  {currentQuestion.options?.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {currentQuestion.type === "textarea" && (
              <Textarea
                placeholder={currentQuestion.placeholder}
                value={answers[currentQuestion.id as keyof ClarifyingAnswers] || ""}
                onChange={(e) => updateAnswer(currentQuestion.id, e.target.value)}
                className="text-base min-h-[100px]"
                autoFocus
              />
            )}
          </div>

          {/* Context Reminder */}
          <div className="p-3 rounded-lg bg-muted/50 border">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">Your topic:</span> {prompt}
            </p>
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between">
          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button variant="ghost" onClick={handleBack}>
                Back
              </Button>
            )}
            <Button variant="ghost" onClick={handleSkip}>
              Skip Questions
            </Button>
          </div>
          <Button onClick={handleNext} disabled={!canProceed}>
            {currentStep < questions.length - 1 ? "Next" : "Let's Go! ✨"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

