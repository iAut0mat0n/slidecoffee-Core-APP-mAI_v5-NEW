import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Edit3,
  Plus,
  Trash2,
  GripVertical,
  Check,
  X,
  Sparkles
} from "lucide-react";

export interface SlideOutline {
  number: number;
  title: string;
  description: string;
}

export interface PresentationPlan {
  title: string;
  slideCount: number;
  slides: SlideOutline[];
  audience?: string;
  tone?: string;
  goal?: string;
}

interface PlanEditorProps {
  plan: PresentationPlan;
  onApprove: (plan: PresentationPlan) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

export function PlanEditor({ plan: initialPlan, onApprove, onCancel, isEditing = false }: PlanEditorProps) {
  const [plan, setPlan] = useState<PresentationPlan>(initialPlan);
  const [editMode, setEditMode] = useState(isEditing);
  const [editingSlideIndex, setEditingSlideIndex] = useState<number | null>(null);

  const handleUpdateTitle = (title: string) => {
    setPlan(prev => ({ ...prev, title }));
  };

  const handleUpdateSlide = (index: number, updates: Partial<SlideOutline>) => {
    setPlan(prev => ({
      ...prev,
      slides: prev.slides.map((slide, i) => 
        i === index ? { ...slide, ...updates } : slide
      )
    }));
  };

  const handleAddSlide = (afterIndex: number) => {
    const newSlide: SlideOutline = {
      number: afterIndex + 2,
      title: "New Slide",
      description: "Add your description here"
    };

    setPlan(prev => ({
      ...prev,
      slides: [
        ...prev.slides.slice(0, afterIndex + 1),
        newSlide,
        ...prev.slides.slice(afterIndex + 1)
      ].map((slide, i) => ({ ...slide, number: i + 1 })),
      slideCount: prev.slideCount + 1
    }));
  };

  const handleRemoveSlide = (index: number) => {
    if (plan.slides.length <= 1) return; // Don't allow removing the last slide

    setPlan(prev => ({
      ...prev,
      slides: prev.slides
        .filter((_, i) => i !== index)
        .map((slide, i) => ({ ...slide, number: i + 1 })),
      slideCount: prev.slideCount - 1
    }));
  };

  const handleMoveSlide = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= plan.slides.length) return;

    const newSlides = [...plan.slides];
    const [movedSlide] = newSlides.splice(fromIndex, 1);
    newSlides.splice(toIndex, 0, movedSlide);

    setPlan(prev => ({
      ...prev,
      slides: newSlides.map((slide, i) => ({ ...slide, number: i + 1 }))
    }));
  };

  const handleApprove = () => {
    onApprove(plan);
  };

  if (!editMode) {
    return (
      <Card className="p-4 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{plan.title}</h3>
            <p className="text-sm text-muted-foreground">{plan.slideCount} slides</p>
            {plan.audience && (
              <p className="text-xs text-muted-foreground mt-1">
                <span className="font-medium">Audience:</span> {plan.audience}
              </p>
            )}
            {plan.tone && (
              <p className="text-xs text-muted-foreground">
                <span className="font-medium">Tone:</span> {plan.tone}
              </p>
            )}
          </div>
          <Badge variant="secondary" className="gap-1">
            <Sparkles className="h-3 w-3" />
            Plan Ready
          </Badge>
        </div>

        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
          {plan.slides.map((slide) => (
            <div key={slide.number} className="flex gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                {slide.number}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{slide.title}</p>
                <p className="text-xs text-muted-foreground truncate">{slide.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 pt-2 border-t">
          <Button onClick={handleApprove} className="flex-1 gap-2">
            <Play className="h-4 w-4" />
            Generate Now
          </Button>
          <Button onClick={() => setEditMode(true)} variant="outline" className="gap-2">
            <Edit3 className="h-4 w-4" />
            Edit Plan
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 space-y-4">
      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground">Presentation Title</label>
          <Input
            value={plan.title}
            onChange={(e) => handleUpdateTitle(e.target.value)}
            className="mt-1"
            placeholder="Enter presentation title"
          />
        </div>

        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium">Slides ({plan.slideCount})</h4>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => handleAddSlide(plan.slides.length - 1)}
            className="gap-1 h-7 text-xs"
          >
            <Plus className="h-3 w-3" />
            Add Slide
          </Button>
        </div>
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
        {plan.slides.map((slide, index) => (
          <div key={slide.number} className="group relative">
            {editingSlideIndex === index ? (
              <Card className="p-3 space-y-2 bg-muted/50">
                <Input
                  value={slide.title}
                  onChange={(e) => handleUpdateSlide(index, { title: e.target.value })}
                  placeholder="Slide title"
                  className="font-medium"
                />
                <Textarea
                  value={slide.description}
                  onChange={(e) => handleUpdateSlide(index, { description: e.target.value })}
                  placeholder="Slide description"
                  className="min-h-[60px] text-sm"
                />
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => setEditingSlideIndex(null)}
                    className="gap-1"
                  >
                    <Check className="h-3 w-3" />
                    Done
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => setEditingSlideIndex(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="flex gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex flex-col items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 cursor-grab active:cursor-grabbing"
                    onClick={() => handleMoveSlide(index, index - 1)}
                    disabled={index === 0}
                  >
                    <GripVertical className="h-3 w-3" />
                  </Button>
                </div>

                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                  {slide.number}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{slide.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">{slide.description}</p>
                </div>

                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setEditingSlideIndex(index)}
                  >
                    <Edit3 className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleAddSlide(index)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                  {plan.slides.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-destructive hover:text-destructive"
                      onClick={() => handleRemoveSlide(index)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-2 pt-2 border-t">
        <Button onClick={handleApprove} className="flex-1 gap-2">
          <Check className="h-4 w-4" />
          Approve & Generate
        </Button>
        <Button onClick={onCancel} variant="outline" className="gap-2">
          <X className="h-4 w-4" />
          Cancel
        </Button>
      </div>
    </Card>
  );
}

