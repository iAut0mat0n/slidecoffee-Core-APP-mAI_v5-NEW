import { useState } from "react";
import { Check, ChevronsUpDown, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface WorkspaceSwitcherProps {
  className?: string;
}

export function WorkspaceSwitcher({ className }: WorkspaceSwitcherProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [newWorkspaceDescription, setNewWorkspaceDescription] = useState("");

  const utils = trpc.useUtils();
  
  const { data: workspaces, isLoading } = trpc.workspaces.list.useQuery();
  const { data: currentWorkspace } = trpc.workspaces.getCurrent.useQuery();
  
  const switchWorkspace = trpc.workspaces.setDefault.useMutation({
    onSuccess: () => {
      utils.workspaces.getCurrent.invalidate();
      utils.workspaces.list.invalidate();
      toast.success("Workspace switched successfully");
    },
    onError: (error) => {
      toast.error("Failed to switch workspace", {
        description: error.message,
      });
    },
  });

  const createWorkspace = trpc.workspaces.create.useMutation({
    onSuccess: () => {
      utils.workspaces.list.invalidate();
      utils.workspaces.getCurrent.invalidate();
      setCreateDialogOpen(false);
      setNewWorkspaceName("");
      setNewWorkspaceDescription("");
      toast.success("Workspace created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create workspace", {
        description: error.message,
      });
    },
  });

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) {
      toast.error("Please enter a workspace name");
      return;
    }
    createWorkspace.mutate({
      name: newWorkspaceName,
      description: newWorkspaceDescription || undefined,
    });
  };

  const handleSwitchWorkspace = (workspaceId: number) => {
    if (workspaceId === currentWorkspace?.id) return;
    switchWorkspace.mutate({ id: workspaceId });
  };

  if (isLoading) {
    return (
      <div className={`p-2 ${className}`}>
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-muted/50 animate-pulse">
          <div className="w-8 h-8 rounded bg-muted" />
          <div className="flex-1 space-y-1">
            <div className="h-3 bg-muted rounded w-24" />
            <div className="h-2 bg-muted rounded w-16" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={className}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between px-2 py-6 h-auto hover:bg-accent"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-lg">
                  {currentWorkspace?.name?.[0]?.toUpperCase() || "W"}
                </div>
                <div className="flex flex-col items-start min-w-0 flex-1">
                  <span className="font-semibold text-sm truncate w-full text-left">
                    {currentWorkspace?.name || "My Workspace"}
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {currentWorkspace?.memberCount || 1} member{(currentWorkspace?.memberCount || 1) !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
              <ChevronsUpDown className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[280px]">
            <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {workspaces?.map((workspace) => (
              <DropdownMenuItem
                key={workspace.id}
                onClick={() => handleSwitchWorkspace(workspace.id)}
                className="flex items-center gap-2 cursor-pointer"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                  {workspace.name[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{workspace.name}</div>
                  {workspace.description && (
                    <div className="text-xs text-muted-foreground truncate">
                      {workspace.description}
                    </div>
                  )}
                </div>
                {workspace.id === currentWorkspace?.id && (
                  <Check className="w-4 h-4 text-primary" />
                )}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setCreateDialogOpen(true)}
              className="flex items-center gap-2 cursor-pointer text-primary"
            >
              <Plus className="w-4 h-4" />
              <span>Create Workspace</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Create Workspace Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <form onSubmit={handleCreateWorkspace}>
            <DialogHeader>
              <DialogTitle>Create New Workspace</DialogTitle>
              <DialogDescription>
                Create a new workspace to organize your brands and projects.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="workspace-name">Workspace Name</Label>
                <Input
                  id="workspace-name"
                  placeholder="e.g., Marketing Team"
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="workspace-description">
                  Description (Optional)
                </Label>
                <Textarea
                  id="workspace-description"
                  placeholder="What is this workspace for?"
                  value={newWorkspaceDescription}
                  onChange={(e) => setNewWorkspaceDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createWorkspace.isPending}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {createWorkspace.isPending ? "Creating..." : "Create Workspace"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

