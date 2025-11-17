import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  Upload, 
  FileText,
  File,
  Image as ImageIcon,
  Sparkles,
  CheckCircle2,
  Loader2
} from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useState, useRef } from "react";
import { toast } from "sonner";

export default function ImportMode() {
  const [, setLocation] = useLocation();
  const { user } = useSupabaseAuth();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: workspaces } = trpc.workspaces.list.useQuery();
  const defaultWorkspace = workspaces?.find(w => w.isDefault) || workspaces?.[0];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = async (file: File) => {
    // Validate file type
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
    ];

    if (!validTypes.includes(file.type)) {
      toast.error("Unsupported file type. Please upload PDF, PowerPoint, or Word documents.");
      return;
    }

    setUploadedFile(file);
    setIsAnalyzing(true);

    // Simulate AI analysis (in real implementation, this would call the backend)
    setTimeout(() => {
      setAnalysisResult({
        fileName: file.name,
        fileType: file.type,
        pages: Math.floor(Math.random() * 20) + 5,
        textBlocks: Math.floor(Math.random() * 50) + 10,
        images: Math.floor(Math.random() * 15) + 3,
        colors: ['#2563eb', '#7c3aed', '#ec4899'],
        suggestions: [
          "Enhance visual hierarchy with consistent headings",
          "Add data visualizations for key metrics",
          "Improve color consistency across slides",
          "Optimize text density for better readability"
        ]
      });
      setIsAnalyzing(false);
      toast.success("File analyzed successfully!");
    }, 2000);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleCreateFromFile = () => {
    if (!uploadedFile) return;

    const params = new URLSearchParams({
      mode: "import",
      fileName: uploadedFile.name,
    });
    
    toast.success("Creating enhanced presentation...");
    setLocation(`/project/new?${params.toString()}`);
  };

  return (
    <DashboardLayout>
      <div className="min-h-[calc(100vh-4rem)] p-8">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Upload className="h-8 w-8 text-blue-600" />
              Import file
            </h1>
            <p className="text-lg text-muted-foreground">
              Upload a document and let AI enhance it
            </p>
          </div>

          {/* Upload Zone */}
          {!uploadedFile ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`
                relative border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer
                transition-all duration-200
                ${isDragging 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' 
                  : 'border-border hover:border-blue-400 hover:bg-accent'
                }
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.pptx,.ppt,.docx,.doc"
                onChange={handleFileInputChange}
                className="hidden"
              />
              
              <div className="space-y-6">
                <div className="flex justify-center">
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <Upload className="h-10 w-10 text-white" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">
                    {isDragging ? "Drop your file here" : "Drag and drop your file"}
                  </h3>
                  <p className="text-muted-foreground">
                    or click to browse
                  </p>
                </div>

                <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span>PDF</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <File className="h-4 w-4" />
                    <span>PowerPoint</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <File className="h-4 w-4" />
                    <span>Word</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* File Info Card */}
              <div className="p-6 rounded-lg border bg-card">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{uploadedFile.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  {isAnalyzing ? (
                    <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                  ) : (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  )}
                </div>
              </div>

              {/* Analysis Results */}
              {isAnalyzing ? (
                <div className="p-8 rounded-lg border bg-card text-center space-y-4">
                  <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Analyzing your file...</h3>
                    <p className="text-sm text-muted-foreground">
                      Extracting content, images, and design elements
                    </p>
                  </div>
                </div>
              ) : analysisResult && (
                <div className="space-y-6">
                  {/* Extraction Results */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg border bg-card text-center">
                      <div className="text-3xl font-bold text-blue-600">{analysisResult.pages}</div>
                      <div className="text-sm text-muted-foreground mt-1">Pages</div>
                    </div>
                    <div className="p-4 rounded-lg border bg-card text-center">
                      <div className="text-3xl font-bold text-purple-600">{analysisResult.textBlocks}</div>
                      <div className="text-sm text-muted-foreground mt-1">Text Blocks</div>
                    </div>
                    <div className="p-4 rounded-lg border bg-card text-center">
                      <div className="text-3xl font-bold text-pink-600">{analysisResult.images}</div>
                      <div className="text-sm text-muted-foreground mt-1">Images</div>
                    </div>
                  </div>

                  {/* Color Palette */}
                  <div className="p-6 rounded-lg border bg-card space-y-4">
                    <h3 className="font-semibold">Detected Color Palette</h3>
                    <div className="flex gap-3">
                      {analysisResult.colors.map((color: string, idx: number) => (
                        <div key={idx} className="flex flex-col items-center gap-2">
                          <div 
                            className="h-16 w-16 rounded-lg border-2 border-border"
                            style={{ backgroundColor: color }}
                          />
                          <span className="text-xs font-mono">{color}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI Suggestions */}
                  <div className="p-6 rounded-lg border bg-card space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-purple-600" />
                      AI Enhancement Suggestions
                    </h3>
                    <ul className="space-y-3">
                      {analysisResult.suggestions.map((suggestion: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-3 text-sm">
                          <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setUploadedFile(null);
                        setAnalysisResult(null);
                      }}
                    >
                      Upload Different File
                    </Button>
                    <Button
                      size="lg"
                      onClick={handleCreateFromFile}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Create Enhanced Version
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Help Text */}
          <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
            <Sparkles className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                ☕ AI will analyze and enhance your document
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                We'll extract content, improve design, add visualizations, and ensure consistency throughout your presentation. Like a perfect espresso shot - refined and powerful!
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

