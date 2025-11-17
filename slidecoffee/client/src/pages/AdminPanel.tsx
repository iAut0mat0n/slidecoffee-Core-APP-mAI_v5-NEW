import { useState } from "react";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { TierManagement } from "@/components/TierManagement";
import { AdminActivityFeed } from "@/components/AdminActivityFeed";
import { SupportTickets } from "@/components/SupportTickets";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Users,
  CreditCard,
  Activity,
  Shield,
  FileText,
  Download,
  LifeBuoy,
  BarChart3,
  Settings,
} from "lucide-react";
import { Redirect } from "wouter";
import { SystemSettings } from "@/components/SystemSettings";

export default function AdminPanel() {
  const { user, loading } = useSupabaseAuth();
  const [selectedTab, setSelectedTab] = useState("dashboard");

  // Check if user is admin
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Check if user is admin (javian@forthlogic.com)
  const isAdmin = user?.email === "javian@forthlogic.com";
  
  if (!isAdmin) {
    return <Redirect to="/dashboard" />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Shield className="h-6 w-6" />
                Admin Panel
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Role: <Badge variant="outline">Admin</Badge>
              </p>
            </div>
            <Button variant="outline" onClick={() => (window.location.href = "/dashboard")}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-8 mb-8">
            <TabsTrigger value="dashboard" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="subscriptions" className="gap-2">
              <CreditCard className="h-4 w-4" />
              Subscriptions
            </TabsTrigger>
            <TabsTrigger value="support" className="gap-2">
              <LifeBuoy className="h-4 w-4" />
              Support
            </TabsTrigger>
            <TabsTrigger value="activity" className="gap-2">
              <Activity className="h-4 w-4" />
              Activity
            </TabsTrigger>
            <TabsTrigger value="team" className="gap-2">
              <Shield className="h-4 w-4" />
              Admin Team
            </TabsTrigger>
            <TabsTrigger value="audit" className="gap-2">
              <FileText className="h-4 w-4" />
              Audit Logs
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" />
              System
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <DashboardTab />
          </TabsContent>

          <TabsContent value="users">
            <UsersTab />
          </TabsContent>

          <TabsContent value="subscriptions">
            <TierManagement />
          </TabsContent>

          <TabsContent value="support">
            <SupportTickets />
          </TabsContent>

          <TabsContent value="activity">
            <AdminActivityFeed />
          </TabsContent>

          <TabsContent value="team">
            <AdminTeamTab />
          </TabsContent>

          <TabsContent value="audit">
            <AuditLogsTab />
          </TabsContent>

          <TabsContent value="settings">
            <SystemSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function DashboardTab() {
  const { data: stats, isLoading } = trpc.admin.getStats.useQuery();

  if (isLoading) {
    return <div className="text-center py-8">Loading stats...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeSubscriptions || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats?.monthlyRevenue || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">System Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Healthy</div>
          </CardContent>
        </Card>
      </div>

      {stats?.tierBreakdown && (
        <Card>
          <CardHeader>
            <CardTitle>Subscription Tier Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.tierBreakdown.map((tier: any) => (
                <div key={tier.tier} className="flex items-center justify-between">
                  <span className="font-medium">{tier.tier}</span>
                  <Badge variant="secondary">{tier.count} users</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function UsersTab() {
  const { data: users, isLoading } = trpc.admin.getUsers.useQuery({ limit: 50, offset: 0 });
  const utils = trpc.useUtils();

  const changeRoleMutation = trpc.admin.changeUserRole.useMutation({
    onSuccess: () => {
      utils.admin.getUsers.invalidate();
      toast.success("User role updated");
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const changeTierMutation = trpc.admin.changeUserTier.useMutation({
    onSuccess: () => {
      utils.admin.getUsers.invalidate();
      toast.success("User tier updated");
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const exportCSVMutation = trpc.admin.exportUsersCSV.useMutation({
    onSuccess: (data: { csv: string }) => {
      const blob = new Blob([data.csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `users-export-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      toast.success("CSV exported successfully");
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading users...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">User Management</h2>
        <Button onClick={() => exportCSVMutation.mutate()} disabled={exportCSVMutation.isPending}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr>
                  <th className="text-left p-4">User</th>
                  <th className="text-left p-4">Email</th>
                  <th className="text-left p-4">Tier</th>
                  <th className="text-left p-4">Credits</th>
                  <th className="text-left p-4">Role</th>
                  <th className="text-left p-4">Joined</th>
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users?.map((user: any) => (
                  <tr key={user.id} className="border-b hover:bg-accent">
                    <td className="p-4 font-medium">{user.name || "Unknown"}</td>
                    <td className="p-4 text-sm text-muted-foreground">{user.email}</td>
                    <td className="p-4">
                      <Badge variant="outline">{user.subscriptionTier}</Badge>
                    </td>
                    <td className="p-4">{user.credits}</td>
                    <td className="p-4">
                      <Select
                        value={user.adminRole || "user"}
                        onValueChange={(role) =>
                          changeRoleMutation.mutate({ userId: user.id, role: role as any })
                        }
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="viewer">Viewer</SelectItem>
                          <SelectItem value="support">Support</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="super_admin">Super Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <Select
                        value={user.subscriptionTier}
                        onValueChange={(tier) =>
                          changeTierMutation.mutate({ userId: user.id, tier: tier as "starter" | "pro" | "pro_plus" | "team" | "business" | "enterprise" })
                        }
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="starter">Starter</SelectItem>
                          <SelectItem value="pro">Pro</SelectItem>
                          <SelectItem value="pro_plus">Pro Plus</SelectItem>
                          <SelectItem value="team">Team</SelectItem>
                          <SelectItem value="business">Business</SelectItem>
                          <SelectItem value="enterprise">Enterprise</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AdminTeamTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin Team Management</CardTitle>
        <CardDescription>Manage admin roles and permissions</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Admin team management interface coming soon...</p>
      </CardContent>
    </Card>
  );
}

function AuditLogsTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Audit Logs</CardTitle>
        <CardDescription>Track all admin actions and system events</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Audit log viewer coming soon...</p>
      </CardContent>
    </Card>
  );
}

