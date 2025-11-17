import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  X,
  Edit3,
  MessageSquare,
  Trash2,
  Plus,
  Move,
  CheckCircle2,
  Share2,
  Download,
  Clock
} from "lucide-react";

export interface Activity {
  id: number;
  type: "edit" | "comment" | "delete" | "add" | "move" | "resolve" | "share" | "export";
  user: {
    name: string;
    initials: string;
    color: string;
  };
  description: string;
  timestamp: Date;
  slideNumber?: number;
}

interface ActivityFeedProps {
  isOpen: boolean;
  onClose: () => void;
  activities: Activity[];
}

const activityIcons = {
  edit: Edit3,
  comment: MessageSquare,
  delete: Trash2,
  add: Plus,
  move: Move,
  resolve: CheckCircle2,
  share: Share2,
  export: Download,
};

const activityColors = {
  edit: "text-blue-600",
  comment: "text-purple-600",
  delete: "text-red-600",
  add: "text-green-600",
  move: "text-orange-600",
  resolve: "text-green-600",
  share: "text-blue-600",
  export: "text-gray-600",
};

export function ActivityFeed({ isOpen, onClose, activities }: ActivityFeedProps) {
  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (seconds < 30) return "Just now";
    if (seconds < 60) return `${seconds}s ago`;
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return "Yesterday";
    return `${days}d ago`;
  };

  const groupedActivities = activities.reduce((groups, activity) => {
    const date = activity.timestamp.toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(activity);
    return groups;
  }, {} as Record<string, Activity[]>);

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-card border-l shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold">Activity Feed</h2>
              <p className="text-sm text-muted-foreground">
                Recent changes and updates
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Activities List */}
      <div className="flex-1 overflow-y-auto p-4">
        {Object.keys(groupedActivities).length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Clock className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <h3 className="font-semibold mb-2">No activity yet</h3>
            <p className="text-sm">
              ☕ Start editing to see collaboration activity
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedActivities).map(([date, dateActivities]) => (
              <div key={date} className="space-y-3">
                {/* Date Header */}
                <div className="sticky top-0 bg-card/95 backdrop-blur-sm py-2">
                  <h3 className="text-sm font-semibold text-muted-foreground">
                    {new Date(date).toDateString() === new Date().toDateString()
                      ? "Today"
                      : new Date(date).toDateString() === new Date(Date.now() - 86400000).toDateString()
                      ? "Yesterday"
                      : new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </h3>
                </div>

                {/* Activities */}
                <div className="space-y-3">
                  {dateActivities.map((activity) => {
                    const Icon = activityIcons[activity.type];
                    const colorClass = activityColors[activity.type];

                    return (
                      <div key={activity.id} className="flex gap-3 p-3 rounded-lg hover:bg-accent transition-colors">
                        {/* User Avatar */}
                        <Avatar className="h-10 w-10 flex-shrink-0">
                          <AvatarFallback
                            className="text-white text-xs font-semibold"
                            style={{ background: activity.user.color }}
                          >
                            {activity.user.initials}
                          </AvatarFallback>
                        </Avatar>

                        {/* Activity Content */}
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-start gap-2">
                            <Icon className={`h-4 w-4 mt-0.5 flex-shrink-0 ${colorClass}`} />
                            <div className="flex-1">
                              <p className="text-sm">
                                <span className="font-semibold">{activity.user.name}</span>{" "}
                                {activity.description}
                              </p>
                              {activity.slideNumber && (
                                <span className="inline-block mt-1 px-2 py-0.5 rounded text-xs bg-muted">
                                  Slide {activity.slideNumber}
                                </span>
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {formatTime(activity.timestamp)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t bg-muted/30">
        <p className="text-xs text-center text-muted-foreground">
          💡 All changes are automatically saved and synced
        </p>
      </div>
    </div>
  );
}

