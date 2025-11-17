
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { APP_LOGO, APP_TITLE } from "@/const";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { useIsMobile } from "@/hooks/useMobile";
import { LayoutDashboard, LogOut, PanelLeft, Palette, FileText, Clock, Star, Folder, Settings, CreditCard } from "lucide-react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from './DashboardLayoutSkeleton';
import { Button } from "./ui/button";
import { CreditDisplay, CreditDisplayCompact } from "./CreditDisplay";
import { UpgradeModal } from "./UpgradeModal";
import { useCreditWarnings } from "@/hooks/useCreditWarnings";
import { trpc } from "@/lib/trpc";
import { ProfilePictureUpload } from "./ProfilePictureUpload";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Palette, label: "Brands", path: "/brands" },
  { icon: FileText, label: "Projects", path: "/projects" },
];

const quickAccessItems: Array<{ icon: typeof Clock; label: string; path: string; badge?: string }> = [
  { icon: Clock, label: "Recent", path: "/projects?view=recent" },
  { icon: Star, label: "Favorites", path: "/projects?view=favorites" },
];

const SIDEBAR_WIDTH_KEY = "sidebar-width";
const DEFAULT_WIDTH = 280;
const MIN_WIDTH = 200;
const MAX_WIDTH = 480;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
  });
  const { loading, user } = useSupabaseAuth();

  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
  }, [sidebarWidth]);

  if (loading) {
    return <DashboardLayoutSkeleton />
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-8 p-8 max-w-md w-full">
          <div className="flex flex-col items-center gap-6">
            <div className="relative group">
              <div className="relative">
                <img
                  src={APP_LOGO}
                  alt={APP_TITLE}
                  className="h-20 w-20 rounded-xl object-cover shadow"
                />
              </div>
            </div>
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold tracking-tight">{APP_TITLE}</h1>
              <p className="text-sm text-muted-foreground">
                Please sign in to continue
              </p>
            </div>
          </div>
          <Button
            onClick={() => {
              window.location.href = "/";
            }}
            size="lg"
            className="w-full shadow-lg hover:shadow-xl transition-all"
          >
            Sign in
          </Button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": `${sidebarWidth}px`,
        } as CSSProperties
      }
    >
      <DashboardLayoutContent setSidebarWidth={setSidebarWidth}>
        {children}
      </DashboardLayoutContent>
    </SidebarProvider>
  );
}

type DashboardLayoutContentProps = {
  children: React.ReactNode;
  setSidebarWidth: (width: number) => void;
};

function DashboardLayoutContent({
  children,
  setSidebarWidth,
}: DashboardLayoutContentProps) {
  const { user, signOut } = useSupabaseAuth();
  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';
  const [location, setLocation] = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const activeMenuItem = menuItems.find(item => item.path === location);
  const isMobile = useIsMobile();
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  
  // Get workspace and projects for counts
  const { data: workspaces } = trpc.workspaces.list.useQuery();
  const defaultWorkspace = workspaces?.find((w) => w.isDefault) || workspaces?.[0];
  const { data: projects } = trpc.projects.list.useQuery(
    { workspaceId: defaultWorkspace?.id || 0 },
    { enabled: !!defaultWorkspace }
  );
  
  const { data: folders } = trpc.folders.list.useQuery(
    { workspaceId: defaultWorkspace?.id || 0 },
    { enabled: !!defaultWorkspace }
  );
  
  // Calculate counts
  const recentCount = projects?.filter(p => p.lastViewedAt).length || 0;
  const favoritesCount = projects?.filter(p => p.isFavorite).length || 0;
  
  // Enable credit warnings
  useCreditWarnings({
    onUpgradeClick: () => setUpgradeModalOpen(true),
    enabled: true,
  });

  useEffect(() => {
    if (isCollapsed) {
      setIsResizing(false);
    }
  }, [isCollapsed]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const sidebarLeft = sidebarRef.current?.getBoundingClientRect().left ?? 0;
      const newWidth = e.clientX - sidebarLeft;
      if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, setSidebarWidth]);

  return (
    <>
      <div className="relative" ref={sidebarRef}>
        <Sidebar
          collapsible="icon"
          className="border-r-0"
          disableTransition={isResizing}
        >
          <SidebarHeader className="h-16 justify-center">
            <div className="flex items-center gap-3 pl-2 group-data-[collapsible=icon]:px-0 transition-all w-full">
              {isCollapsed ? (
                <div className="relative h-8 w-8 shrink-0 group">
                  <img
                    src={APP_LOGO}
                    className="h-8 w-8 rounded-md object-cover ring-1 ring-border"
                    alt="Logo"
                  />
                  <button
                    onClick={toggleSidebar}
                    className="absolute inset-0 flex items-center justify-center bg-accent rounded-md ring-1 ring-border opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <PanelLeft className="h-4 w-4 text-foreground" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={APP_LOGO}
                      className="h-8 w-8 rounded-md object-cover ring-1 ring-border shrink-0"
                      alt="Logo"
                    />
                    <span className="font-semibold tracking-tight truncate">
                      {APP_TITLE}
                    </span>
                  </div>
                  <button
                    onClick={toggleSidebar}
                    className="ml-auto h-8 w-8 flex items-center justify-center hover:bg-accent rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0"
                  >
                    <PanelLeft className="h-4 w-4 text-muted-foreground" />
                  </button>
                </>
              )}
            </div>
          </SidebarHeader>

          <SidebarContent className="gap-0">
            {/* Workspace Switcher */}
            <div className="px-2 py-2 border-b">
              <WorkspaceSwitcher />
            </div>
            
            {/* Main Navigation */}
            <SidebarMenu className="px-2 py-1">
              {menuItems.map(item => {
                const isActive = location === item.path;
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => setLocation(item.path)}
                      tooltip={item.label}
                      className={`h-10 transition-all font-normal`}
                    >
                      <item.icon
                        className={`h-4 w-4 ${isActive ? "text-primary" : ""}`}
                      />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>

            {/* Quick Access Section */}
            {!isCollapsed && (
              <div className="px-2 py-4">
                <div className="px-2 mb-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Quick Access
                  </p>
                </div>
                <SidebarMenu>
                  {quickAccessItems.map(item => {
                    const isActive = location.includes(item.path.split('?')[0]) && 
                                    (item.path.includes('view=recent') ? location.includes('view=recent') :
                                     item.path.includes('view=favorites') ? location.includes('view=favorites') :
                                     item.path.includes('view=folders') ? location.includes('view=folders') : false);
                    
                    // Get count for this item
                    const count = item.label === 'Recent' ? recentCount :
                                 item.label === 'Favorites' ? favoritesCount : 0;
                    
                    return (
                      <SidebarMenuItem key={item.path}>
                        <SidebarMenuButton
                          isActive={isActive}
                          onClick={() => setLocation(item.path)}
                          tooltip={item.label}
                          className={`h-9 transition-all font-normal relative`}
                          disabled={item.badge === "Soon"}
                        >
                          <item.icon
                            className={`h-4 w-4 ${isActive ? "text-primary" : ""}`}
                          />
                          <span className="flex items-center gap-2 flex-1">
                            <span className="flex-1">{item.label}</span>
                            {item.badge && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                                {item.badge}
                              </span>
                            )}
                            {!item.badge && count > 0 && (
                              <span className="text-xs px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-medium ml-auto">
                                {count}
                              </span>
                            )}
                          </span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </div>
            )}
            
            {/* Folders Section */}
            {!isCollapsed && folders && folders.length > 0 && (
              <div className="px-2 py-4 border-t">
                <div className="px-2 mb-2 flex items-center justify-between">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Folders
                  </p>
                </div>
                <SidebarMenu>
                  {folders.map(folder => {
                    const folderPath = `/projects?view=folder&id=${folder.id}`;
                    const isActive = location.includes(folderPath);
                    const folderProjectCount = projects?.filter(p => p.folderId === folder.id).length || 0;
                    
                    return (
                      <SidebarMenuItem key={folder.id}>
                        <SidebarMenuButton
                          isActive={isActive}
                          onClick={() => setLocation(folderPath)}
                          tooltip={folder.name}
                          className={`h-9 transition-all font-normal relative`}
                        >
                          <Folder
                            className={`h-4 w-4 ${isActive ? "text-primary" : ""}`}
                            style={{ color: isActive ? undefined : folder.color || "#6366f1" }}
                          />
                          <span className="flex items-center gap-2 flex-1">
                            <span className="flex-1 truncate">{folder.name}</span>
                            {folderProjectCount > 0 && (
                              <span className="text-xs px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-medium ml-auto">
                                {folderProjectCount}
                              </span>
                            )}
                          </span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </div>
            )}
          </SidebarContent>

          <SidebarFooter className="p-4 border-t space-y-3">
            {/* Credit Display */}
            {!isCollapsed && (
              <CreditDisplay 
                onUpgradeClick={() => setUpgradeModalOpen(true)}
                className="w-full"
              />
            )}
            {isCollapsed && (
              <CreditDisplayCompact 
                onUpgradeClick={() => setUpgradeModalOpen(true)}
                className="w-full"
              />
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 rounded-lg px-1 py-1 hover:bg-accent/50 transition-colors w-full text-left group-data-[collapsible=icon]:justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <ProfilePictureUpload
                    currentAvatar={undefined}
                    userName={userName}
                    onUploadComplete={(url) => {
                      // TODO: Update user profile with new avatar URL via tRPC
                      console.log("New avatar URL:", url);
                    }}
                  />
                  {!isCollapsed && (
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{userName}</p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => window.location.href = '/settings'}>
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.location.href = '/subscription'}>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Subscription
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>
        <div
          className={`absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-primary/20 transition-colors ${isCollapsed ? "hidden" : ""}`}
          onMouseDown={() => {
            if (isCollapsed) return;
            setIsResizing(true);
          }}
          style={{ zIndex: 50 }}
        />
      </div>

      <SidebarInset>
        {isMobile && (
          <div className="flex border-b h-14 items-center justify-between bg-background/95 px-2 backdrop-blur supports-[backdrop-filter]:backdrop-blur sticky top-0 z-40">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="h-9 w-9 rounded-lg bg-background" />
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-1">
                  <span className="tracking-tight text-foreground">
                    {activeMenuItem?.label ?? APP_TITLE}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        <main className="flex-1 p-4">{children}</main>
      </SidebarInset>
      
      {/* Upgrade Modal */}
      <UpgradeModal 
        open={upgradeModalOpen}
        onOpenChange={setUpgradeModalOpen}
        currentTier={undefined}
      />
    </>
  );
}
