import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Brain, Search, Lightbulb, FileText, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ReasoningStep {
  id: string;
  type: 'research' | 'analysis' | 'planning' | 'creation' | 'complete';
  title: string;
  description: string;
  details?: string[];
  timestamp: Date;
}

interface ReasoningCardProps {
  step: ReasoningStep;
  className?: string;
  style?: React.CSSProperties;
}

const iconMap = {
  research: Search,
  analysis: Brain,
  planning: Lightbulb,
  creation: FileText,
  complete: CheckCircle2,
};

const colorMap = {
  research: "text-blue-600 bg-blue-100 dark:bg-blue-900",
  analysis: "text-purple-600 bg-purple-100 dark:bg-purple-900",
  planning: "text-yellow-600 bg-yellow-100 dark:bg-yellow-900",
  creation: "text-green-600 bg-green-100 dark:bg-green-900",
  complete: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900",
};

/**
 * Card that displays AI's reasoning and thinking process
 * Shows research, analysis, planning, and creation steps
 */
export function ReasoningCard({ step, className, style }: ReasoningCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const Icon = iconMap[step.type];
  const colorClass = colorMap[step.type];

  return (
    <Card style={style} className={cn("border-l-4 animate-in slide-in-from-left-5 duration-500", className, {
      "border-l-blue-500": step.type === 'research',
      "border-l-purple-500": step.type === 'analysis',
      "border-l-yellow-500": step.type === 'planning',
      "border-l-green-500": step.type === 'creation',
      "border-l-emerald-500": step.type === 'complete',
    })}>
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div className={cn("h-10 w-10 rounded-full flex items-center justify-center shrink-0", colorClass)}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base font-semibold">{step.title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
          </div>
          {step.details && step.details.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="shrink-0"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </CardHeader>

      {isExpanded && step.details && (
        <CardContent className="pt-0">
          <div className="space-y-2 pl-13">
            {step.details.map((detail, idx) => (
              <div key={idx} className="flex items-start gap-2 text-sm">
                <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <p className="text-muted-foreground">{detail}</p>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

/**
 * Container for multiple reasoning cards with smooth animations
 */
interface ReasoningStreamProps {
  steps: ReasoningStep[];
  className?: string;
}

export function ReasoningStream({ steps, className }: ReasoningStreamProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {steps.map((step, idx) => (
        <ReasoningCard
          key={step.id}
          step={step}
          className="animate-in fade-in-50 slide-in-from-bottom-3"
          style={{
            animationDelay: `${idx * 150}ms`,
          }}
        />
      ))}
    </div>
  );
}

