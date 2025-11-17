import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Upload, Palette, Sparkles, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface BrandSelectionDialogProps {
  open: boolean;
  onClose: () => void;
  onBrandSelected: (brandId: number | null, templateId?: number) => void;
}

/**
 * BrandSelectionDialog Component
 * 
 * Prompts users to select a brand or template at the start of presentation creation
 * Shows existing brands, upload option, and sample templates
 */
export function BrandSelectionDialog({
  open,
  onClose,
  onBrandSelected,
}: BrandSelectionDialogProps) {
  // Get current workspace ID (assuming first workspace for now)
  const { data: workspaces } = trpc.workspaces.list.useQuery();
  const workspaceId = workspaces?.[0]?.id || 1;
  const [selectedBrandId, setSelectedBrandId] = useState<number | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const [view, setView] = useState<"brands" | "templates" | "upload">("brands");

  // Fetch user's brands
  const { data: brands, isLoading: brandsLoading } = trpc.brands.list.useQuery(
    { workspaceId },
    { enabled: !!workspaceId }
  );

  // Fetch sample templates
  const { data: templates, isLoading: templatesLoading } = trpc.templates.list.useQuery();

  const handleContinue = () => {
    onBrandSelected(selectedBrandId, selectedTemplateId || undefined);
    onClose();
  };

  const handleSkip = () => {
    onBrandSelected(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Let's set up your presentation style! ✨
          </DialogTitle>
          <DialogDescription>
            Choose a brand or template to ensure your slides look amazing and on-brand.
          </DialogDescription>
        </DialogHeader>

        {/* View Tabs */}
        <div className="flex gap-2 border-b">
          <Button
            variant={view === "brands" ? "default" : "ghost"}
            size="sm"
            onClick={() => setView("brands")}
            className="rounded-b-none"
          >
            <Palette className="h-4 w-4 mr-2" />
            My Brands ({brands?.length || 0})
          </Button>
          <Button
            variant={view === "templates" ? "default" : "ghost"}
            size="sm"
            onClick={() => setView("templates")}
            className="rounded-b-none"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Templates ({templates?.length || 0})
          </Button>
          <Button
            variant={view === "upload" ? "default" : "ghost"}
            size="sm"
            onClick={() => setView("upload")}
            className="rounded-b-none"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Brand
          </Button>
        </div>

        {/* Brands View */}
        {view === "brands" && (
          <div className="space-y-4 py-4">
            {brandsLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading your brands...
              </div>
            ) : brands && brands.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {brands.map((brand) => (
                  <button
                    key={brand.id}
                    onClick={() => setSelectedBrandId(brand.id)}
                    className={cn(
                      "relative p-4 border-2 rounded-lg text-left transition-all hover:shadow-md",
                      selectedBrandId === brand.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    {selectedBrandId === brand.id && (
                      <div className="absolute top-2 right-2">
                        <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                          <Check className="h-4 w-4 text-primary-foreground" />
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <h3 className="font-semibold">{brand.name}</h3>
                      
                      {/* Color Palette Preview */}
                      <div className="flex gap-1">
                        {brand.primaryColor && (
                          <div
                            className="h-6 w-6 rounded border"
                            style={{ backgroundColor: brand.primaryColor }}
                          />
                        )}
                        {brand.secondaryColor && (
                          <div
                            className="h-6 w-6 rounded border"
                            style={{ backgroundColor: brand.secondaryColor }}
                          />
                        )}
                        {brand.accentColor && (
                          <div
                            className="h-6 w-6 rounded border"
                            style={{ backgroundColor: brand.accentColor }}
                          />
                        )}
                      </div>

                      {/* Typography Preview */}
                      {brand.fontPrimary && (
                        <p className="text-sm text-muted-foreground">
                          Font: {brand.fontPrimary}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 space-y-4">
                <Palette className="h-12 w-12 mx-auto text-muted-foreground" />
                <div>
                  <p className="text-lg font-medium">No brands yet</p>
                  <p className="text-sm text-muted-foreground">
                    Upload your brand guidelines or choose a template to get started!
                  </p>
                </div>
                <div className="flex gap-2 justify-center">
                  <Button onClick={() => setView("upload")} variant="default">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Brand
                  </Button>
                  <Button onClick={() => setView("templates")} variant="outline">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Browse Templates
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Templates View */}
        {view === "templates" && (
          <div className="space-y-4 py-4">
            {templatesLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading templates...
              </div>
            ) : templates && templates.length > 0 ? (
              <div className="grid grid-cols-3 gap-4">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplateId(template.id)}
                    className={cn(
                      "relative aspect-[16/9] border-2 rounded-lg overflow-hidden transition-all hover:shadow-md",
                      selectedTemplateId === template.id
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    {selectedTemplateId === template.id && (
                      <div className="absolute top-2 right-2 z-10">
                        <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                          <Check className="h-4 w-4 text-primary-foreground" />
                        </div>
                      </div>
                    )}

                    {/* Template Preview */}
                    {template.thumbnailUrl ? (
                      <img
                        src={template.thumbnailUrl}
                        alt={template.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                        <Sparkles className="h-8 w-8 text-primary" />
                      </div>
                    )}

                    {/* Template Name Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                      <p className="text-white text-sm font-medium">{template.name}</p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No templates available yet
              </div>
            )}
          </div>
        )}

        {/* Upload View */}
        {view === "upload" && (
          <div className="py-8">
            <div className="border-2 border-dashed rounded-lg p-12 text-center space-y-4">
              <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Upload Your Brand Guidelines
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  We'll extract colors, fonts, and logos from your PowerPoint or PDF
                </p>
              </div>
              <Button size="lg">
                <Upload className="h-4 w-4 mr-2" />
                Choose File
              </Button>
              <p className="text-xs text-muted-foreground">
                Supports: .pptx, .pdf (max 10MB)
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t">
          <Button variant="ghost" onClick={handleSkip}>
            Skip for now
          </Button>
          <Button
            onClick={handleContinue}
            disabled={!selectedBrandId && !selectedTemplateId}
          >
            Continue with {selectedBrandId ? "Brand" : "Template"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

