/**
 * Team Members Component
 * 
 * Manage workspace team members
 * - List all members with roles
 * - Invite new members by email
 * - Update member roles
 * - Remove members
 * - Only visible to workspace owners
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { UserPlus, Trash2, Crown, Shield, User } from "lucide-react";

interface TeamMembersProps {
  workspaceId: number;
  isOwner: boolean;
}

export function TeamMembers({ workspaceId, isOwner }: TeamMembersProps) {
  const utils = trpc.useUtils();
  const { data: members, isLoading } = trpc.workspaceMembers.list.useQuery({ workspaceId });

  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "member">("member");

  const inviteMutation = trpc.workspaceMembers.invite.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setInviteDialogOpen(false);
      setInviteEmail("");
      setInviteRole("member");
      utils.workspaceMembers.list.invalidate();
    },
    onError: (error) => {
      toast.error("Failed to invite member", {
        description: error.message,
      });
    },
  });

  const updateMutation = trpc.workspaceMembers.update.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      utils.workspaceMembers.list.invalidate();
    },
    onError: (error) => {
      toast.error("Failed to update member", {
        description: error.message,
      });
    },
  });

  const removeMutation = trpc.workspaceMembers.remove.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      utils.workspaceMembers.list.invalidate();
    },
    onError: (error) => {
      toast.error("Failed to remove member", {
        description: error.message,
      });
    },
  });

  const handleInvite = () => {
    if (!inviteEmail) {
      toast.error("Please enter an email address");
      return;
    }

    inviteMutation.mutate({
      workspaceId,
      email: inviteEmail,
      role: inviteRole,
      creditsAllocated: 0,
    });
  };

  const handleRemove = (memberId: number, memberName: string | null) => {
    if (confirm(`Remove ${memberName || "this member"} from the workspace?`)) {
      removeMutation.mutate({ memberId });
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return <Crown className="h-4 w-4 text-yellow-600" />;
      case "admin":
        return <Shield className="h-4 w-4 text-blue-600" />;
      default:
        return <User className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRoleBadge = (role: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      owner: "default",
      admin: "secondary",
      member: "outline",
    };

    return (
      <Badge variant={variants[role] || "outline"} className="flex items-center gap-1">
        {getRoleIcon(role)}
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>
              {members?.length || 0} member{members?.length !== 1 ? "s" : ""} in this workspace
            </CardDescription>
          </div>
          
          {isOwner && (
            <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Invite Team
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite Team Member</DialogTitle>
                  <DialogDescription>
                    Add a new member to your workspace. They must have a SlideCoffee account.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="invite-email">Email Address</Label>
                    <Input
                      id="invite-email"
                      type="email"
                      placeholder="teammate@example.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="invite-role">Role</Label>
                    <Select value={inviteRole} onValueChange={(v: "admin" | "member") => setInviteRole(v)}>
                      <SelectTrigger id="invite-role">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="member">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Member - Can create and edit presentations
                          </div>
                        </SelectItem>
                        <SelectItem value="admin">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Admin - Can manage team and settings
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setInviteDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleInvite}
                    disabled={inviteMutation.isPending}
                  >
                    {inviteMutation.isPending ? "Inviting..." : "Send Invite"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!members || members.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No team members yet</p>
            {isOwner && (
              <p className="text-sm mt-1">Click "Invite Team" to add members</p>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Credits</TableHead>
                <TableHead>Joined</TableHead>
                {isOwner && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.userAvatar || undefined} />
                        <AvatarFallback>
                          {member.userName?.charAt(0).toUpperCase() || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{member.userName || "Unknown"}</div>
                        <div className="text-sm text-muted-foreground">
                          {member.userEmail}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {isOwner && member.role !== "owner" ? (
                      <Select
                        value={member.role}
                        onValueChange={(newRole: "owner" | "admin" | "member") => {
                          updateMutation.mutate({
                            memberId: member.id,
                            role: newRole,
                          });
                        }}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="member">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              Member
                            </div>
                          </SelectItem>
                          <SelectItem value="admin">
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4" />
                              Admin
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      getRoleBadge(member.role)
                    )}
                  </TableCell>
                  <TableCell>
                    {isOwner && member.role !== "owner" ? (
                      <Input
                        type="number"
                        min="0"
                        className="w-24"
                        placeholder="0"
                        defaultValue={member.creditsAllocated || 0}
                        onBlur={(e) => {
                          const credits = parseInt(e.target.value) || 0;
                          if (credits !== (member.creditsAllocated || 0)) {
                            updateMutation.mutate({
                              memberId: member.id,
                              creditsAllocated: credits,
                            });
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.currentTarget.blur();
                          }
                        }}
                      />
                    ) : (
                      <span className="text-sm">{member.creditsAllocated || 0}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(member.createdAt).toLocaleDateString()}
                  </TableCell>
                  {isOwner && (
                    <TableCell className="text-right">
                      {member.role !== "owner" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemove(member.id, member.userName)}
                          disabled={removeMutation.isPending}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

