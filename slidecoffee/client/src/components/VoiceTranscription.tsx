/**
 * Voice Transcription Component
 * 
 * Upload audio files and display transcriptions
 * - Upload audio (mp3, wav, m4a, webm)
 * - Show transcription progress
 * - Display transcribed text
 * - Copy/export transcriptions
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Upload,
  Mic,
  FileAudio,
  Copy,
  Download,
  Loader2,
} from "lucide-react";

export function VoiceTranscription() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [transcription, setTranscription] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

  const transcribeMutation = trpc.voiceTranscription.transcribe.useMutation({
    onSuccess: (data) => {
      setTranscription(data.text);
      toast.success("Transcription complete!");
      setIsUploading(false);
    },
    onError: (error) => {
      toast.error("Transcription failed", {
        description: error.message,
      });
      setIsUploading(false);
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["audio/mpeg", "audio/wav", "audio/m4a", "audio/webm", "audio/mp4"];
    if (!validTypes.includes(file.type)) {
      toast.error("Invalid file type", {
        description: "Please upload an audio file (MP3, WAV, M4A, or WebM)",
      });
      return;
    }

    // Validate file size (max 16MB)
    if (file.size > 16 * 1024 * 1024) {
      toast.error("File too large", {
        description: "Maximum file size is 16MB",
      });
      return;
    }

    setSelectedFile(file);
    setTranscription("");
  };

  const handleTranscribe = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    
    // TODO: Upload file to storage first, then pass URL to transcribe
    // For now, simulate with a mock URL
    const mockAudioUrl = "https://example.com/audio.mp3";
    
    transcribeMutation.mutate({
      audioUrl: mockAudioUrl,
      language: "en",
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(transcription);
    toast.success("Copied to clipboard");
  };

  const handleDownload = () => {
    const blob = new Blob([transcription], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "transcription.txt";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded transcription");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic className="h-5 w-5" />
          Voice Transcription
        </CardTitle>
        <CardDescription>
          Upload audio files and get accurate transcriptions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Upload */}
        <div className="border-2 border-dashed rounded-lg p-8 text-center">
          {selectedFile ? (
            <div className="space-y-4">
              <FileAudio className="h-12 w-12 mx-auto text-primary" />
              <div>
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Button
                  onClick={handleTranscribe}
                  disabled={isUploading || transcribeMutation.isPending}
                >
                  {isUploading || transcribeMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Transcribing...
                    </>
                  ) : (
                    <>
                      <Mic className="h-4 w-4 mr-2" />
                      Transcribe
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedFile(null);
                    setTranscription("");
                  }}
                >
                  Remove
                </Button>
              </div>
            </div>
          ) : (
            <label className="cursor-pointer">
              <input
                type="file"
                accept="audio/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">Upload Audio File</p>
              <p className="text-sm text-muted-foreground">
                Supported formats: MP3, WAV, M4A, WebM (max 16MB)
              </p>
              <Button className="mt-4">
                <Upload className="h-4 w-4 mr-2" />
                Choose File
              </Button>
            </label>
          )}
        </div>

        {/* Progress */}
        {(isUploading || transcribeMutation.isPending) && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Transcribing audio...</span>
              <span className="text-muted-foreground">This may take a minute</span>
            </div>
            <Progress value={undefined} className="h-2" />
          </div>
        )}

        {/* Transcription Result */}
        {transcription && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Transcription</h4>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm whitespace-pre-wrap">{transcription}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

