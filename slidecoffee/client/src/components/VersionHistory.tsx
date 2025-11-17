/**
 * Version History Component
 * 
 * Display and manage presentation version history
 * - List all versions with timestamps
 * - Restore previous versions
 * - View version details
 * - Compare versions (diff view)
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { History, RotateCcw, Eye, Clock, User, FileText, AlertTriangle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface VersionHistoryProps {
  projectId: number;
  onRestore?: () => void;
}

export function VersionHistory({ projectId, onRestore }: VersionHistoryProps) {
  const utils = trpc.useUtils();
  const { data: versions, isLoading } = trpc.versionHistory.getHistory.useQuery({ presentationId: projectId });

  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingVersion, setViewingVersion] = useState<any>(null);

  const restoreMutation = trpc.versionHistory.rollback.useMutation({
    onSuccess: () => {
      toast.success("Version restored successfully");
      setRestoreDialogOpen(false);
      setSelectedVersion(null);
      utils.versionHistory.getHistory.invalidate();
      utils.projects.get.invalidate();
      onRestore?.();
    },
    onError: (error) => {
      toast.error("Failed to restore version", {
        description: error.message,
      });
    },
  });

  const handleView = async (versionId: number) => {
    try {
      setSelectedVersion(versionId);
      const data = await utils.versionHistory.getVersion.fetch({ versionId });
      setViewingVersion(data);
      setViewDialogOpen(true);
    } catch (error: any) {
      toast.error("Failed to load version", {
        description: error.message,
      });
    }
  };

  const handleRestore = () => {
    if (!selectedVersion) return;
    restoreMutation.mutate({ versionId: selectedVersion });
  };



  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Version History
          </CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!versions || versions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Version History
          </CardTitle>
          <CardDescription>No versions saved yet</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Versions will appear here as you make changes</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Version History
          </CardTitle>
          <CardDescription>
            {versions.length} {versions.length === 1 ? "version" : "versions"} saved
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {versions.map((version, index) => (
                <div
                  key={version.id}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">Version {versions.length - index}</span>
                      {index === 0 && (
                        <Badge variant="default" className="text-xs">
                          Current
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Clock className="h-3 w-3" />
                      <span>
                        {formatDistanceToNow(new Date(version.createdAt), { addSuffix: true })}
                      </span>
                      {version.authorId && (
                        <>
                          <span>•</span>
                          <User className="h-3 w-3" />
                          <span>User {version.authorId}</span>
                        </>
                      )}
                    </div>

                    {version.changeDescription && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {version.changeDescription}
                      </p>
                    )}

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Version {version.versionNumber}</span>
                      {version.isAutoSave === 1 && (
                        <>
                          <span>•</span>
                          <span>Auto-saved</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleView(version.id)}

                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {index !== 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedVersion(version.id);
                          setRestoreDialogOpen(true);
                        }}
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Restore Confirmation Dialog */}
      <Dialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restore Version</DialogTitle>
            <DialogDescription>
              Are you sure you want to restore this version? This will create a new version with the restored content.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/50">
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium mb-1">Your current work will be preserved</p>
                <p className="text-muted-foreground">
                  The current version will be saved before restoring. You can always restore back to it later.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRestoreDialogOpen(false);
                setSelectedVersion(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRestore}
              disabled={restoreMutation.isPending}
            >
              {restoreMutation.isPending ? "Restoring..." : "Restore Version"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Version Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Version Details</DialogTitle>
            <DialogDescription>
              {viewingVersion && formatDistanceToNow(new Date(viewingVersion.createdAt), { addSuffix: true })}
            </DialogDescription>
          </DialogHeader>

          {viewingVersion && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Created by:</span>
                  <p className="font-medium">User {viewingVersion.authorId || "Unknown"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Version:</span>
                  <p className="font-medium">#{viewingVersion.versionNumber}</p>
                </div>
              </div>

              {viewingVersion.changeDescription && (
                <div>
                  <span className="text-sm text-muted-foreground">Description:</span>
                  <p className="mt-1">{viewingVersion.changeDescription}</p>
                </div>
              )}

              {viewingVersion.content && (
                <div>
                  <span className="text-sm text-muted-foreground">Content preview:</span>
                  <ScrollArea className="h-[200px] mt-2 p-3 rounded-lg border bg-muted/50">
                    <pre className="text-xs whitespace-pre-wrap">
                      {JSON.stringify(viewingVersion.content, null, 2).substring(0, 1000)}
                      {JSON.stringify(viewingVersion.content).length > 1000 && "..."}
                    </pre>
                  </ScrollArea>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setViewDialogOpen(false);
                setViewingVersion(null);
              }}
            >
              Close
            </Button>
            {viewingVersion && (
              <Button
                onClick={() => {
                  setViewDialogOpen(false);
                  setSelectedVersion(viewingVersion.id);
                  setRestoreDialogOpen(true);
                }}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Restore This Version
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

