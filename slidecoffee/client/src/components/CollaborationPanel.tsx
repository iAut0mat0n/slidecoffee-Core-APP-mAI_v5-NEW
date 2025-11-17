import { useCollaboration } from "@/hooks/useCollaboration";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Wifi, WifiOff } from "lucide-react";

interface CollaborationPanelProps {
  projectId: string;
}

export function CollaborationPanel({ projectId }: CollaborationPanelProps) {
  const { users, locks, isConnected } = useCollaboration(projectId);

  const usersList = Array.from(users.values());

  return (
    <Card className="w-64">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Collaborators ({usersList.length})
          </span>
          {isConnected ? (
            <Wifi className="h-4 w-4 text-green-600" />
          ) : (
            <WifiOff className="h-4 w-4 text-red-600" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {usersList.length === 0 ? (
          <p className="text-sm text-muted-foreground">No other users online</p>
        ) : (
          <div className="space-y-2">
            {usersList.map((user, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: user.color }}
                />
                <span className="text-sm">{user.userName}</span>
                {user.currentSlide && (
                  <Badge variant="outline" className="text-xs">
                    Slide {user.currentSlide}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        )}
        
        {locks.size > 0 && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-xs font-medium text-muted-foreground mb-2">Editing:</p>
            {Array.from(locks.entries()).map(([slideId, socketId]) => {
              const user = users.get(socketId);
              return (
                <div key={slideId} className="flex items-center gap-2 text-xs">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: user?.color || "#gray" }}
                  />
                  <span>
                    {user?.userName || "Unknown"} editing Slide {slideId}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

