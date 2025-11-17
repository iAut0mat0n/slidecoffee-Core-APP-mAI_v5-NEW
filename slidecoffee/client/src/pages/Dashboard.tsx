import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Send, Loader2, Sparkles, Plus, Clock, Star, Upload, Grid3x3, List, Search } from "lucide-react";
import { ProjectCard } from "@/components/ProjectCard";
import { ProjectGridSkeleton } from "@/components/ProjectCardSkeleton";
import type { ProjectStatus } from "@/components/ui/status-badge";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { useState, useRef, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Message = {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  action?: {
    type: "create_project" | "list_projects" | "open_project" | "manage_brands" | "search_templates";
    data?: any;
  };
};

type FilterType = "all" | "recent" | "created_by_you" | "favorites";
type ViewMode = "grid" | "list";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { user } = useSupabaseAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: workspaces } = trpc.workspaces.list.useQuery();
  const defaultWorkspace = workspaces?.find(w => w.isDefault) || workspaces?.[0];
  
  const { data: brands, isLoading: brandsLoading } = trpc.brands.list.useQuery(
    { workspaceId: defaultWorkspace?.id || 0 },
    { enabled: !!defaultWorkspace }
  );
  
  const { data: allProjects, isLoading: projectsLoading } = trpc.projects.list.useQuery(
    { workspaceId: defaultWorkspace?.id || 0 },
    { enabled: !!defaultWorkspace }
  );

  const dashboardChat = trpc.dashboard.chat.useMutation();

  // Filter projects based on active filter and search
  const filteredProjects = allProjects?.filter(project => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        project.title.toLowerCase().includes(query) ||
        project.description?.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    // Type filter
    switch (activeFilter) {
      case "recent":
        return project.lastViewedAt !== null;
      case "favorites":
        return project.isFavorite === true;
      case "created_by_you":
        return true; // All projects in workspace are created by user
      case "all":
      default:
        return true;
    }
  });

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Welcome message on first load
  useEffect(() => {
    if (messages.length === 0 && user) {
      const greeting = getTimeBasedGreeting();
      setTimeout(() => {
        addMessage("assistant", `${greeting}, ${user.user_metadata?.name?.split(" ")[0] || user.email?.split('@')[0] || "there"}! 👋\n\nI'm your AI assistant. I can help you:\n• Create new presentations\n• Find and open your projects\n• Manage your brands\n• Search templates\n\nWhat would you like to do today?`);
      }, 500);
    }
  }, [user]);

  // Focus input after AI responds
  useEffect(() => {
    if (!isTyping && messages.length > 0) {
      inputRef.current?.focus();
    }
  }, [isTyping, messages.length]);

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const addMessage = (role: "user" | "assistant", content: string, action?: Message["action"]) => {
    setMessages(prev => [...prev, { role, content, timestamp: new Date(), action }]);
  };

  const handleAIResponse = async (userMessage: string) => {
    setIsTyping(true);
    
    try {
      const result = await dashboardChat.mutateAsync({
        message: userMessage,
        workspaceId: defaultWorkspace?.id || 0,
        conversationHistory: messages.map(m => ({
          role: m.role,
          content: m.content
        }))
      });
      
      setIsTyping(false);
      addMessage("assistant", result.response, result.action);

      // Execute actions
      if (result.action && result.action.type) {
        if (result.action.type === "create_project") {
          toast.success("Creating your project...");
          // Navigate to project creation
          setTimeout(() => {
            setLocation(`/project/new?prompt=${encodeURIComponent(userMessage)}`);
          }, 1000);
        } else if (result.action.type === "open_project" && result.action.data?.projectId) {
          setTimeout(() => {
            setLocation(`/project/${result.action?.data.projectId}`);
          }, 500);
        } else if (result.action.type === "manage_brands") {
          setTimeout(() => {
            setLocation("/brands");
          }, 500);
        }
      }
    } catch (error) {
      console.error("Dashboard chat error:", error);
      setIsTyping(false);
      addMessage("assistant", "I'm having trouble connecting. Could you try rephrasing that?");
    }
  };

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;
    
    const message = userInput.trim();
    setUserInput("");
    addMessage("user", message);
    
    await handleAIResponse(message);
  };

  const handleQuickAction = (prompt: string) => {
    setUserInput(prompt);
    inputRef.current?.focus();
  };

  const isLoading = brandsLoading || projectsLoading;

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-4rem)] flex flex-col">
        {/* Header with Create Button and Filters */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          {/* Left: Create New Button with AI Badge */}
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setLocation("/create")}
              size="lg"
              className="relative bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create new
              <span className="ml-2 px-2 py-0.5 text-xs bg-white/20 rounded-full">AI</span>
            </Button>
            
            {/* Import Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="lg">
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => setLocation("/import/file")}>
                  <Upload className="h-4 w-4 mr-2" />
                  Import file
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocation("/templates")}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Import template
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Right: Search and View Toggle */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-[250px]"
              />
            </div>
            <div className="flex items-center gap-1 border rounded-lg p-1">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="h-8 w-8 p-0"
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="h-8 w-8 p-0"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Recent Presentations Section */}
        {!searchQuery && activeFilter === "all" && filteredProjects && filteredProjects.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">Recent Presentations</h2>
                <p className="text-sm text-muted-foreground">Quick access to your last viewed projects</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveFilter("recent")}
              >
                View all
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {filteredProjects
                .filter(p => p.lastViewedAt)
                .sort((a, b) => new Date(b.lastViewedAt!).getTime() - new Date(a.lastViewedAt!).getTime())
                .slice(0, 5)
                .map((project) => {
                  const brand = brands?.find(b => b.id === project.brandId);
                  return (
                    <button
                      key={project.id}
                      onClick={() => setLocation(`/project/${project.id}`)}
                      className="group text-left p-4 rounded-lg border bg-card hover:shadow-md hover:border-primary/50 transition-all"
                    >
                      <div className="space-y-3">
                        {/* Thumbnail placeholder */}
                        <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/5 rounded-md flex items-center justify-center">
                          <Sparkles className="h-8 w-8 text-primary/40" />
                        </div>
                        
                        {/* Project info */}
                        <div className="space-y-1">
                          <h3 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                            {project.title}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {new Date(project.lastViewedAt!).toLocaleDateString()}
                          </p>
                        </div>
                        
                        {/* Brand badge */}
                        {brand && brand.primaryColor && (
                          <div 
                            className="text-xs px-2 py-1 rounded inline-block"
                            style={{ 
                              backgroundColor: brand.primaryColor + '20', 
                              color: brand.primaryColor 
                            }}
                          >
                            {brand.name}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>
        )}

        {/* Filters Bar */}
        <div className="flex items-center gap-2 mb-6 pb-4 border-b">
          <Button
            variant={activeFilter === "all" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveFilter("all")}
          >
            All
          </Button>
          <Button
            variant={activeFilter === "recent" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveFilter("recent")}
          >
            <Clock className="h-4 w-4 mr-2" />
            Recently viewed
          </Button>
          <Button
            variant={activeFilter === "created_by_you" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveFilter("created_by_you")}
          >
            Created by you
          </Button>
          <Button
            variant={activeFilter === "favorites" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveFilter("favorites")}
          >
            <Star className="h-4 w-4 mr-2" />
            Favorites
          </Button>
        </div>

        {/* Main Content Area - Projects Grid/List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            viewMode === "grid" ? (
              <ProjectGridSkeleton count={6} />
            ) : (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="animate-pulse p-4 rounded-lg border bg-card">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-muted rounded" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-3/4" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : filteredProjects && filteredProjects.length > 0 ? (
            viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map((project) => {
                  const brand = brands?.find(b => b.id === project.brandId);
                  return (
                    <div
                      key={project.id}
                      onClick={() => setLocation(`/project/${project.id}`)}
                      className="group cursor-pointer p-6 rounded-lg border bg-card hover:shadow-lg transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                            {project.title}
                          </h3>
                          {project.description && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {project.description}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Toggle favorite logic here
                          }}
                        >
                          <Star className={`h-4 w-4 ${project.isFavorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
                        {brand && brand.primaryColor && (
                          <span className="px-2 py-1 rounded" style={{ backgroundColor: brand.primaryColor + '20', color: brand.primaryColor }}>
                            {brand.name}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredProjects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => setLocation(`/project/${project.id}`)}
                    className="w-full text-left p-4 rounded-lg border bg-card hover:bg-accent transition-colors flex items-center justify-between"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{project.title}</p>
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {project.description || "No description"}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 ml-4">
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(project.updatedAt).toLocaleDateString()}
                      </span>
                      {project.isFavorite && (
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery ? "No projects found" : activeFilter === "all" ? "No projects yet" : `No ${activeFilter.replace(/_/g, " ")} projects`}
              </h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-md">
                {searchQuery 
                  ? "☕ No matches found. Try adjusting your search or create a new project"
                  : "☕ Time for a fresh brew! Get started by creating your first presentation with AI"}
              </p>
              <Button
                onClick={() => setLocation("/create")}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create your first project
              </Button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

