import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { trpc } from "@/lib/trpc";
import { Activity, User, FileText, Settings, CreditCard, LogIn, LogOut } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const actionIcons: Record<string, any> = {
  "user.login": LogIn,
  "user.logout": LogOut,
  "user.signup": User,
  "user.profile_update": Settings,
  "presentation.create": FileText,
  "presentation.edit": FileText,
  "presentation.delete": FileText,
  "subscription.upgrade": CreditCard,
  "subscription.downgrade": CreditCard,
  "subscription.cancel": CreditCard,
  "admin.user_update": User,
  "admin.tier_create": Settings,
  "admin.tier_update": Settings,
};

const actionColors: Record<string, string> = {
  "user.login": "text-green-600",
  "user.logout": "text-gray-600",
  "user.signup": "text-blue-600",
  "presentation.create": "text-purple-600",
  "presentation.delete": "text-red-600",
  "subscription.upgrade": "text-green-600",
  "subscription.downgrade": "text-orange-600",
  "subscription.cancel": "text-red-600",
};

export function AdminActivityFeed() {
  const { data: activities, isLoading } = trpc.activity.getRecent.useQuery({
    limit: 50,
    offset: 0,
  });

  const { data: stats } = trpc.activity.getStats.useQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Activity (24h)</CardDescription>
              <CardTitle className="text-3xl">{stats.total24h}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Top Action</CardDescription>
              <CardTitle className="text-lg">
                {stats.topActions[0]?.action || "N/A"}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {stats.topActions[0]?.count || 0} times
              </p>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Unique Actions</CardDescription>
              <CardTitle className="text-3xl">
                {Object.keys(stats.actionCounts).length}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>
      )}

      {/* Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Real-time user actions across the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            {!activities || activities.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>No activity yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activities.map((activity) => {
                  const Icon = actionIcons[activity.action] || Activity;
                  const color = actionColors[activity.action] || "text-gray-600";
                  const details = activity.details ? JSON.parse(activity.details) : {};

                  return (
                    <div
                      key={activity.id}
                      className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className={`mt-1 ${color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">
                            {activity.action.replace(/\./g, " › ")}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            User #{activity.userId}
                          </Badge>
                        </div>
                        {Object.keys(details).length > 0 && (
                          <div className="text-sm text-muted-foreground">
                            {Object.entries(details).map(([key, value]) => (
                              <div key={key}>
                                <span className="font-medium">{key}:</span> {String(value)}
                              </div>
                            ))}
                          </div>
                        )}
                        {activity.ipAddress && (
                          <p className="text-xs text-muted-foreground">
                            IP: {activity.ipAddress}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(activity.createdAt), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

