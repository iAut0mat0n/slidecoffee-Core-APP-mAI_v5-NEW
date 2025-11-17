import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tour, type TourStep } from "@/components/Tour";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { FileText, Plus, X, Check, Sparkles, ArrowRight, HelpCircle, Star, Search } from "lucide-react";
import { ProjectCard } from "@/components/ProjectCard";
import { ProjectCardList } from "@/components/ProjectCardList";
import { ViewToggle, type ViewMode } from "@/components/ViewToggle";
import type { ProjectStatus } from "@/components/ui/status-badge";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";

const tourSteps: TourStep[] = [
  {
    target: "[data-tour='create-project-button']",
    title: "Step 1: Create a Project",
    description: "Click here to start a new presentation project. You'll choose a brand and describe your topic.",
    position: "bottom",
  },
  {
    target: "[data-tour='empty-state']",
    title: "Step 2: Chat with AI",
    description: "Once you create a project, you'll chat with our AI. Describe your presentation topic, and the AI will research and plan the structure.",
    position: "top",
  },
  {
    target: "[data-tour='empty-state']",
    title: "Step 3: Review & Generate",
    description: "After the AI creates a plan, you'll review it. Once approved, the AI generates professional slides tailored to your brand!",
    position: "top",
  },
];

export default function Projects() {
  const [location, setLocation] = useLocation();
  const [isCreating, setIsCreating] = useState(false);
  const [showTour, setShowTour] = useState(false);
  
  // Check URL parameters for view mode
  const urlParams = new URLSearchParams(window.location.search);
  const viewParam = urlParams.get('view');
  const folderIdParam = urlParams.get('id');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(viewParam === 'favorites');
  const [showRecentOnly, setShowRecentOnly] = useState(viewParam === 'recent');
  const [showFolderView, setShowFolderView] = useState(viewParam === 'folder');
  const [currentFolderId, setCurrentFolderId] = useState<number | null>(
    folderIdParam ? parseInt(folderIdParam) : null
  );
  
  // Update state when URL changes
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const view = params.get('view');
    const folderId = params.get('id');
    setShowFavoritesOnly(view === 'favorites');
    setShowRecentOnly(view === 'recent');
    setShowFolderView(view === 'folder');
    setCurrentFolderId(folderId ? parseInt(folderId) : null);
  }, [location]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem("projects-view-mode");
    return (saved as ViewMode) || "grid";
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<number | null>(null);

  useEffect(() => {
    localStorage.setItem("projects-view-mode", viewMode);
  }, [viewMode]);
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    brandId: "",
  });

  const { data: workspaces } = trpc.workspaces.list.useQuery();
  const defaultWorkspace = workspaces?.find((w) => w.isDefault) || workspaces?.[0];

  const { data: brands } = trpc.brands.list.useQuery(
    { workspaceId: defaultWorkspace?.id || 0 },
    { enabled: !!defaultWorkspace }
  );
  
  const { data: folders } = trpc.folders.list.useQuery(
    { workspaceId: defaultWorkspace?.id || 0 },
    { enabled: !!defaultWorkspace }
  );

  const { data: projects, refetch, isLoading } = trpc.projects.list.useQuery(
    { workspaceId: defaultWorkspace?.id || 0 },
    { enabled: !!defaultWorkspace }
  );

  const createProject = trpc.projects.create.useMutation({
    onSuccess: (data) => {
      toast.success("Project created! Let's build your presentation 🚀");
      setIsCreating(false);
      setNewProject({ title: "", description: "", brandId: "" });
      refetch();
      // Navigate to project chat page
      setLocation(`/project/${data.id}`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const toggleFavorite = trpc.projects.toggleFavorite.useMutation({
    onSuccess: (data, variables) => {
      toast.success(data.isFavorite ? "Added to favorites ⭐" : "Removed from favorites");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const duplicateProject = trpc.projects.duplicate.useMutation({
    onSuccess: (data) => {
      toast.success("Project duplicated successfully! 📋");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteProject = trpc.projects.delete.useMutation({
    onSuccess: () => {
      toast.success("Project deleted successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleDeleteProject = (id: number) => {
    setProjectToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (projectToDelete) {
      deleteProject.mutate({ id: projectToDelete });
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
    }
  };

  const handleCreateProject = () => {
    if (!defaultWorkspace) {
      toast.error("No workspace found");
      return;
    }
    if (!newProject.title.trim()) {
      toast.error("Project title is required");
      return;
    }

    createProject.mutate({
      workspaceId: defaultWorkspace.id,
      title: newProject.title,
      description: newProject.description,
      brandId: newProject.brandId ? parseInt(newProject.brandId) : undefined,
    });
  };



  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">Your Projects</h1>
              <p className="text-lg text-muted-foreground mt-2">
                Create and manage your presentation projects. Each project is a conversation with AI.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={showFavoritesOnly ? "default" : "outline"}
                size="sm"
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className="gap-2"
              >
                <Star className={`w-4 h-4 ${showFavoritesOnly ? "fill-current" : ""}`} />
                {showFavoritesOnly ? "All Projects" : "Favorites"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTour(true)}
                className="gap-2"
              >
                <HelpCircle className="w-4 h-4" />
                Quick Tour
              </Button>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search projects by name or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <ViewToggle view={viewMode} onViewChange={setViewMode} />
          </div>
        </div>

        {/* Create New Project Section */}
        {!isCreating && (
          <Button
            size="lg"
            onClick={() => setIsCreating(true)}
            className="w-full md:w-auto transition-all duration-200 hover:scale-105 hover:shadow-lg"
            data-tour="create-project-button"
          >
            <Plus className="w-5 h-5 mr-2" />
            Start New Project
          </Button>
        )}

        {isCreating && (
          <Card className="border-2 border-primary/20 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-2xl">Create New Project</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCreating(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="title" className="text-base">
                      Project Title *
                    </Label>
                    <Input
                      id="title"
                      placeholder="e.g., Q4 Investor Pitch, Product Launch Deck"
                      value={newProject.title}
                      onChange={(e) =>
                        setNewProject({ ...newProject, title: e.target.value })
                      }
                      className="h-12 text-lg"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="brand" className="text-base">
                      Brand (Optional)
                    </Label>
                    <Select
                      value={newProject.brandId}
                      onValueChange={(value) =>
                        setNewProject({ ...newProject, brandId: value })
                      }
                    >
                      <SelectTrigger id="brand" className="h-12">
                        <SelectValue placeholder="Select a brand" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No brand</SelectItem>
                        {brands?.map((brand) => (
                          <SelectItem key={brand.id} value={brand.id.toString()}>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-4 h-4 rounded border"
                                style={{ backgroundColor: brand.primaryColor || "#ccc" }}
                              />
                              {brand.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="description" className="text-base">
                    Project Description (Optional)
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Brief description of your presentation. What's the goal? Who's the audience?"
                    value={newProject.description}
                    onChange={(e) =>
                      setNewProject({ ...newProject, description: e.target.value })
                    }
                    rows={8}
                    className="resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setIsCreating(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  size="lg"
                  onClick={handleCreateProject}
                  disabled={createProject.isPending}
                  className="flex-1"
                >
                  <Check className="w-5 h-5 mr-2" />
                  {createProject.isPending ? "Creating..." : "Create & Start Chatting"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Projects Grid */}
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-56" />
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-12 h-12 rounded-xl" />
                      </div>
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </div>
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Skeleton className="w-4 h-4 rounded" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-4 w-40" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : projects && projects.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">
              {showFolderView && currentFolderId ? 
                folders?.find(f => f.id === currentFolderId)?.name || "Folder" :
                showRecentOnly ? "Recent Projects" : 
                showFavoritesOnly ? "Favorite Projects" : 
                "Your Projects"} 
              ({showFolderView && currentFolderId ? 
                projects.filter(p => p.folderId === currentFolderId).length :
                showRecentOnly ? projects.filter(p => p.lastViewedAt).length : 
                showFavoritesOnly ? projects.filter(p => p.isFavorite).length : 
                projects.length})
            </h2>
            <div className={viewMode === "grid" ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3" : "space-y-3"}>
              {projects
                .filter(project => {
                  // Filter by folder
                  if (showFolderView && currentFolderId && project.folderId !== currentFolderId) return false;
                  
                  // Filter by favorites
                  if (showFavoritesOnly && !project.isFavorite) return false;
                  
                  // Filter by recent (only show projects with lastViewedAt)
                  if (showRecentOnly && !project.lastViewedAt) return false;
                  
                  // Filter by search query
                  if (searchQuery.trim()) {
                    const query = searchQuery.toLowerCase();
                    const titleMatch = project.title.toLowerCase().includes(query);
                    const descMatch = project.description?.toLowerCase().includes(query);
                    return titleMatch || descMatch;
                  }
                  
                  return true;
                })
                .sort((a, b) => {
                  // Sort by lastViewedAt for Recent view
                  if (showRecentOnly && a.lastViewedAt && b.lastViewedAt) {
                    return new Date(b.lastViewedAt).getTime() - new Date(a.lastViewedAt).getTime();
                  }
                  return 0;
                })
                .map((project) => {
                const brand = brands?.find((b) => b.id === project.brandId);
                
                if (viewMode === "list") {
                  return (
                    <ProjectCardList
                      key={project.id}
                      id={project.id}
                      title={project.title}
                      description={project.description || undefined}
                      status={project.status as ProjectStatus}
                      brandName={brand?.name || "No brand"}
                      brandColor={brand?.primaryColor || "#6366f1"}
                      isFavorite={project.isFavorite || false}
                      lastViewedAt={project.lastViewedAt ? new Date(project.lastViewedAt) : undefined}
                      createdAt={new Date(project.createdAt)}
                      updatedAt={new Date(project.updatedAt)}
                      onToggleFavorite={() => toggleFavorite.mutate({ id: project.id })}
                      onDuplicate={() => duplicateProject.mutate({ id: project.id })}
                      onExport={() => toast.info("Move to folder feature coming soon!")}
                      onDelete={() => handleDeleteProject(project.id)}
                    />
                  );
                }
                
                return (
                  <ProjectCard
                    key={project.id}
                    id={project.id}
                    title={project.title}
                    description={project.description || undefined}
                    status={project.status as ProjectStatus}
                    brandName={brand?.name || "No brand"}
                    brandColor={brand?.primaryColor || "#6366f1"}
                    isFavorite={project.isFavorite || false}
                    lastViewedAt={project.lastViewedAt ? new Date(project.lastViewedAt) : undefined}
                    createdAt={new Date(project.createdAt)}
                    onToggleFavorite={() => toggleFavorite.mutate({ id: project.id })}
                    onDuplicate={() => duplicateProject.mutate({ id: project.id })}
                    onExport={() => toast.info("Move to folder feature coming soon!")}
                    onDelete={() => handleDeleteProject(project.id)}
                  />
                );
              })}
            </div>
          </div>
        )}

        {projects && projects.length === 0 && !isCreating && (
          <Card className="border-dashed border-2 bg-gradient-to-br from-primary/5 to-transparent" data-tour="empty-state">
            <CardContent className="flex flex-col items-center justify-center py-20 text-center space-y-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                  <Sparkles className="w-12 h-12 text-primary" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
                  <Plus className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="space-y-3 max-w-2xl">
                <h3 className="text-3xl font-bold tracking-tight">Start Your First Project</h3>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Create board-ready presentations through AI-powered conversations. Simply describe your topic, and our AI will research, plan, and generate professional slides tailored to your brand.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 text-sm">
                  <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-background/50">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                      <span className="text-blue-500 font-bold">1</span>
                    </div>
                    <span className="font-medium">Chat with AI</span>
                    <span className="text-muted-foreground text-xs">Describe your topic</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-background/50">
                    <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                      <span className="text-purple-500 font-bold">2</span>
                    </div>
                    <span className="font-medium">Review Plan</span>
                    <span className="text-muted-foreground text-xs">Approve structure</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-background/50">
                    <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                      <span className="text-green-500 font-bold">3</span>
                    </div>
                    <span className="font-medium">Get Slides</span>
                    <span className="text-muted-foreground text-xs">AI generates deck</span>
                  </div>
                </div>
              </div>
              <Button size="lg" onClick={() => setIsCreating(true)} className="mt-2 transition-all duration-200 hover:scale-105 hover:shadow-lg">
                <Sparkles className="w-5 h-5 mr-2" />
                Start Your First Project
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Tour */}
      <Tour
        steps={tourSteps}
        isActive={showTour}
        onComplete={() => {
          setShowTour(false);
          toast.success("Tour completed! Ready to create your first project?");
        }}
        onSkip={() => {
          setShowTour(false);
          toast.info("Tour skipped. You can restart it anytime from the Quick Tour button.");
        }}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Delete Project?"
        description="This action cannot be undone. This will permanently delete the project and all related data including chat history and slides."
      />
    </DashboardLayout>
  );
}

