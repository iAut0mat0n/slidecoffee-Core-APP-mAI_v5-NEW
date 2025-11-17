/**
 * Image Generation Component
 * 
 * Generate images from text prompts using AI
 * - Enter text prompt
 * - Generate image
 * - Display generated image
 * - Download/copy image URL
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Sparkles,
  Image as ImageIcon,
  Download,
  Copy,
  Loader2,
  RefreshCw,
} from "lucide-react";

export function ImageGeneration() {
  const [prompt, setPrompt] = useState("");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateMutation = trpc.imageGeneration.generate.useMutation({
    onSuccess: (data: { url: string | undefined }) => {
      setGeneratedImage(data.url || null);
      toast.success("Image generated successfully!");
      setIsGenerating(false);
    },
    onError: (error: any) => {
      toast.error("Image generation failed", {
        description: error.message,
      });
      setIsGenerating(false);
    },
  });

  const handleGenerate = () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    setIsGenerating(true);
    generateMutation.mutate({ prompt });
  };

  const handleCopyUrl = () => {
    if (!generatedImage) return;
    navigator.clipboard.writeText(generatedImage);
    toast.success("Image URL copied to clipboard");
  };

  const handleDownload = async () => {
    if (!generatedImage) return;
    
    try {
      const response = await fetch(generatedImage);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `generated-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Image downloaded");
    } catch (error) {
      toast.error("Failed to download image");
    }
  };

  const handleRegenerate = () => {
    setGeneratedImage(null);
    handleGenerate();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          AI Image Generation
        </CardTitle>
        <CardDescription>
          Generate images from text descriptions using AI
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Prompt Input */}
        <div className="space-y-2">
          <Label htmlFor="prompt">Image Description</Label>
          <Textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the image you want to generate... (e.g., 'A serene landscape with mountains and a lake at sunset')"
            rows={4}
            disabled={isGenerating}
          />
          <p className="text-xs text-muted-foreground">
            Be specific and descriptive for best results
          </p>
        </div>

        {/* Generate Button */}
        <Button
          onClick={handleGenerate}
          disabled={!prompt.trim() || isGenerating}
          className="w-full"
          size="lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Generating Image...
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5 mr-2" />
              Generate Image
            </>
          )}
        </Button>

        {/* Loading State */}
        {isGenerating && (
          <div className="border-2 border-dashed rounded-lg p-12 text-center">
            <Loader2 className="h-16 w-16 mx-auto mb-4 text-primary animate-spin" />
            <p className="text-lg font-medium mb-2">Creating your image...</p>
            <p className="text-sm text-muted-foreground">
              This usually takes 5-20 seconds
            </p>
          </div>
        )}

        {/* Generated Image */}
        {generatedImage && !isGenerating && (
          <div className="space-y-4">
            <div className="border rounded-lg overflow-hidden">
              <img
                src={generatedImage}
                alt="Generated image"
                className="w-full h-auto"
              />
            </div>

            {/* Image Actions */}
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleDownload} className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" onClick={handleCopyUrl} className="flex-1">
                <Copy className="h-4 w-4 mr-2" />
                Copy URL
              </Button>
              <Button variant="outline" onClick={handleRegenerate} className="flex-1">
                <RefreshCw className="h-4 w-4 mr-2" />
                Regenerate
              </Button>
            </div>

            {/* Prompt Display */}
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Prompt:</p>
              <p className="text-sm">{prompt}</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!generatedImage && !isGenerating && (
          <div className="border-2 border-dashed rounded-lg p-12 text-center">
            <ImageIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-lg font-medium mb-2">No image generated yet</p>
            <p className="text-sm text-muted-foreground">
              Enter a description above and click "Generate Image"
            </p>
          </div>
        )}

        {/* Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-sm mb-2 text-blue-900">💡 Tips for better results:</h4>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Be specific about style, colors, and mood</li>
            <li>• Include details about lighting and composition</li>
            <li>• Mention art style if desired (e.g., "watercolor", "photorealistic")</li>
            <li>• Keep prompts focused and clear</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

