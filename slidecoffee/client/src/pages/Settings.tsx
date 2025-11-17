import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { User, CreditCard, Users, Shield, Bell } from "lucide-react";
import { TeamMembers } from "@/components/TeamMembers";
import { MFASettings } from "@/components/MFASettings";
import { AutoTopupSettings } from "@/components/AutoTopupSettings";
import { ProfilePictureUpload } from "@/components/ProfilePictureUpload";
import { Link } from "wouter";
import { Switch } from "@/components/ui/switch";

export default function Settings() {
  const { user } = useSupabaseAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [profileName, setProfileName] = useState("");
  // Workspace management moved to sidebar switcher
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [creditWarnings, setCreditWarnings] = useState(true);
  const [teamActivity, setTeamActivity] = useState(true);
  
  // Get database user record (has integer ID)
  const { data: dbUser } = trpc.auth.me.useQuery();
  
  // Get current workspace for Team tab
  const { data: workspaces } = trpc.workspaces.list.useQuery();
  const defaultWorkspace = workspaces?.find(w => w.isDefault) || workspaces?.[0];
  
  const { data: credits } = trpc.subscription.getCredits.useQuery();
  
  // Initialize profile name from user data
  useState(() => {
    if (user?.user_metadata?.name) {
      setProfileName(user.user_metadata.name);
    }
  });
  
  // Profile update mutation
  const updateProfileMutation = trpc.profile.updateName.useMutation({
    onSuccess: () => {
      toast.success("Profile updated successfully!");
    },
    onError: (error) => {
      toast.error(`Failed to update profile: ${error.message}`);
    },
  });
  
  const handleSaveProfile = async () => {
    if (!profileName.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    await updateProfileMutation.mutateAsync({ name: profileName });
  };
  
  // Workspace mutations removed - now handled in sidebar WorkspaceSwitcher component
  
  // Password change handler
  const handleChangePassword = async () => {
    if (!user?.email) {
      toast.error("User email not found");
      return;
    }
    
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY
      );
      
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      toast.success("Password reset email sent! Check your inbox.");
    } catch (error: any) {
      toast.error(`Failed to send reset email: ${error.message}`);
    }
  };

  return (
    <DashboardLayout>
      <div className="container max-w-6xl py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your account, subscription, and workspace settings
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="subscription" className="gap-2">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Subscription</span>
            </TabsTrigger>

            <TabsTrigger value="team" className="gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Team</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal information and profile picture
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <ProfilePictureUpload
                    currentAvatar={undefined}
                    userName={user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'}
                    onUploadComplete={(url) => {
                      toast.success("Profile picture updated!");
                    }}
                  />
                  <div>
                    <h3 className="font-medium">Profile Picture</h3>
                    <p className="text-sm text-muted-foreground">
                      Click to upload a new profile picture
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      placeholder="Enter your name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">
                      Email cannot be changed. Contact support if you need to update it.
                    </p>
                  </div>

                  <Button 
                    onClick={handleSaveProfile}
                    disabled={updateProfileMutation.isPending}
                  >
                    {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subscription Tab */}
          <TabsContent value="subscription" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Current Plan</CardTitle>
                <CardDescription>
                  Manage your subscription and credits
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold text-lg capitalize">{credits?.tier || 'Starter'} Plan</h3>
                    <p className="text-sm text-muted-foreground">
                      {credits?.balance || 0} credits remaining
                    </p>
                  </div>
                  <Link href="/subscription">
                    <Button>View Plans & Upgrade</Button>
                  </Link>
                </div>

                <AutoTopupSettings />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Workspace Tab removed - now managed in sidebar WorkspaceSwitcher */}

          {/* Team Tab */}
          <TabsContent value="team" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>
                  Invite and manage team members in your workspace
                </CardDescription>
              </CardHeader>
              <CardContent>
                {defaultWorkspace && dbUser && (
                  <TeamMembers 
                    workspaceId={defaultWorkspace.id} 
                    isOwner={defaultWorkspace.ownerId === dbUser.id}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Manage your account security and authentication
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <MFASettings />

                <div className="pt-6 border-t">
                  <h3 className="font-medium mb-2">Password</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    We'll send you an email with a link to reset your password
                  </p>
                  <Button variant="outline" onClick={handleChangePassword}>
                    Send Reset Email
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Choose what notifications you want to receive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h3 className="font-medium">Email Notifications</h3>
                    <p className="text-sm text-muted-foreground">
                      Receive updates about your projects via email
                    </p>
                  </div>
                  <Switch
                    checked={emailNotifications}
                    onCheckedChange={(checked) => {
                      setEmailNotifications(checked);
                      toast.success(checked ? "Email notifications enabled" : "Email notifications disabled");
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h3 className="font-medium">Credit Warnings</h3>
                    <p className="text-sm text-muted-foreground">
                      Get notified when your credits are running low
                    </p>
                  </div>
                  <Switch
                    checked={creditWarnings}
                    onCheckedChange={(checked) => {
                      setCreditWarnings(checked);
                      toast.success(checked ? "Credit warnings enabled" : "Credit warnings disabled");
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h3 className="font-medium">Team Activity</h3>
                    <p className="text-sm text-muted-foreground">
                      Notifications about team member actions
                    </p>
                  </div>
                  <Switch
                    checked={teamActivity}
                    onCheckedChange={(checked) => {
                      setTeamActivity(checked);
                      toast.success(checked ? "Team activity notifications enabled" : "Team activity notifications disabled");
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

