import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Users,
  Activity,
  Wifi,
  WifiOff,
  Clock
} from "lucide-react";

export interface Collaborator {
  id: number;
  name: string;
  initials: string;
  color: string;
  isActive: boolean;
  currentSlide?: number;
  lastActivity?: Date;
}

interface CollaborationBarProps {
  collaborators: Collaborator[];
  currentUser: Collaborator;
  isConnected: boolean;
  onShowActivity?: () => void;
}

export function CollaborationBar({ 
  collaborators, 
  currentUser, 
  isConnected,
  onShowActivity 
}: CollaborationBarProps) {
  const [showAll, setShowAll] = useState(false);

  const activeCollaborators = collaborators.filter(c => c.isActive);
  const displayedCollaborators = showAll ? activeCollaborators : activeCollaborators.slice(0, 5);
  const remainingCount = activeCollaborators.length - displayedCollaborators.length;

  const formatLastActivity = (date?: Date) => {
    if (!date) return "Just now";
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(diff / 60000);

    if (seconds < 30) return "Just now";
    if (minutes < 1) return `${seconds}s ago`;
    if (minutes < 60) return `${minutes}m ago`;
    return "Inactive";
  };

  return (
    <div className="fixed top-4 right-4 z-40 flex items-center gap-3 bg-card/95 backdrop-blur-sm border rounded-lg px-4 py-2 shadow-lg">
      {/* Connection Status */}
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <>
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <Wifi className="h-4 w-4 text-green-600" />
              </>
            ) : (
              <>
                <div className="h-2 w-2 rounded-full bg-red-500" />
                <WifiOff className="h-4 w-4 text-red-600" />
              </>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          {isConnected ? "Connected - Real-time sync active" : "Disconnected - Changes saved locally"}
        </TooltipContent>
      </Tooltip>

      {/* Divider */}
      <div className="h-6 w-px bg-border" />

      {/* Active Collaborators */}
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">{activeCollaborators.length}</span>
      </div>

      {/* Collaborator Avatars */}
      <div className="flex items-center -space-x-2">
        {displayedCollaborators.map((collaborator) => (
          <Tooltip key={collaborator.id}>
            <TooltipTrigger asChild>
              <div className="relative">
                <Avatar className="h-8 w-8 border-2 border-background cursor-pointer hover:scale-110 transition-transform">
                  <AvatarFallback 
                    className="text-white text-xs font-semibold"
                    style={{ background: collaborator.color }}
                  >
                    {collaborator.initials}
                  </AvatarFallback>
                </Avatar>
                {collaborator.isActive && (
                  <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="space-y-1">
                <div className="font-semibold">{collaborator.name}</div>
                {collaborator.currentSlide && (
                  <div className="text-xs text-muted-foreground">
                    Viewing slide {collaborator.currentSlide}
                  </div>
                )}
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatLastActivity(collaborator.lastActivity)}
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        ))}

        {remainingCount > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setShowAll(!showAll)}
                className="h-8 w-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-semibold hover:scale-110 transition-transform cursor-pointer"
              >
                +{remainingCount}
              </button>
            </TooltipTrigger>
            <TooltipContent>
              {showAll ? "Show less" : `${remainingCount} more collaborator${remainingCount > 1 ? "s" : ""}`}
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      {/* Activity Feed Button */}
      {onShowActivity && (
        <>
          <div className="h-6 w-px bg-border" />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={onShowActivity} className="h-8 w-8 p-0">
                <Activity className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              View activity feed
            </TooltipContent>
          </Tooltip>
        </>
      )}
    </div>
  );
}

