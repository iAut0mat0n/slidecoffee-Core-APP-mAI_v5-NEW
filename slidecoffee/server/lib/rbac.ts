import { TRPCError } from "@trpc/server";
import { middleware } from "../_core/trpc";

/**
 * Role-Based Access Control (RBAC) System
 * Defines permissions for different admin roles
 */

export type AdminRole = "super_admin" | "admin" | "support" | "viewer";

export type Permission =
  // User Management
  | "view_users"
  | "edit_users"
  | "delete_users"
  | "impersonate_users"
  
  // Subscription Management
  | "view_subscriptions"
  | "edit_subscriptions"
  | "manage_tiers"
  
  // Support Tickets
  | "view_support_tickets"
  | "manage_support_tickets"
  | "assign_tickets"
  
  // Admin Team
  | "view_admin_team"
  | "invite_admins"
  | "manage_admin_roles"
  | "remove_admins"
  
  // Activity & Audit
  | "view_activity_feed"
  | "view_audit_logs"
  | "export_audit_logs"
  
  // System
  | "view_system_stats"
  | "manage_system_settings"
  | "broadcast_announcements"
  | "export_data"
  
  // Content Moderation
  | "view_all_content"
  | "moderate_content"
  | "delete_content";

/**
 * Permission matrix for each role
 */
const rolePermissions: Record<AdminRole, Permission[]> = {
  super_admin: [
    // Full access to everything
    "view_users",
    "edit_users",
    "delete_users",
    "impersonate_users",
    "view_subscriptions",
    "edit_subscriptions",
    "manage_tiers",
    "view_support_tickets",
    "manage_support_tickets",
    "assign_tickets",
    "view_admin_team",
    "invite_admins",
    "manage_admin_roles",
    "remove_admins",
    "view_activity_feed",
    "view_audit_logs",
    "export_audit_logs",
    "view_system_stats",
    "manage_system_settings",
    "broadcast_announcements",
    "export_data",
    "view_all_content",
    "moderate_content",
    "delete_content",
  ],
  
  admin: [
    // Most permissions except system-critical ones
    "view_users",
    "edit_users",
    "view_subscriptions",
    "edit_subscriptions",
    "manage_tiers",
    "view_support_tickets",
    "manage_support_tickets",
    "assign_tickets",
    "view_admin_team",
    "invite_admins",
    "view_activity_feed",
    "view_audit_logs",
    "view_system_stats",
    "broadcast_announcements",
    "export_data",
    "view_all_content",
    "moderate_content",
  ],
  
  support: [
    // Support-focused permissions
    "view_users",
    "view_subscriptions",
    "view_support_tickets",
    "manage_support_tickets",
    "assign_tickets",
    "view_activity_feed",
    "view_system_stats",
    "view_all_content",
  ],
  
  viewer: [
    // Read-only access
    "view_users",
    "view_subscriptions",
    "view_support_tickets",
    "view_admin_team",
    "view_activity_feed",
    "view_audit_logs",
    "view_system_stats",
    "view_all_content",
  ],
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: AdminRole | null | undefined, permission: Permission): boolean {
  if (!role) return false;
  return rolePermissions[role]?.includes(permission) || false;
}

/**
 * Check if a role can manage another role (hierarchy enforcement)
 */
export function canManageRole(managerRole: AdminRole, targetRole: AdminRole): boolean {
  const hierarchy: Record<AdminRole, number> = {
    super_admin: 4,
    admin: 3,
    support: 2,
    viewer: 1,
  };

  return hierarchy[managerRole] > hierarchy[targetRole];
}

/**
 * tRPC middleware to enforce permission checks
 */
export const withPermission = (permission: Permission) =>
  middleware(({ ctx, next }) => {
    if (!ctx.user) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Authentication required" });
    }

    const userRole = ctx.user.adminRole;
    if (!userRole) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
    }

    if (!hasPermission(userRole, permission)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `Permission denied: ${permission}`,
      });
    }

    return next({ ctx });
  });

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: AdminRole): Permission[] {
  return rolePermissions[role] || [];
}

/**
 * Get human-readable role name
 */
export function getRoleName(role: AdminRole): string {
  const names: Record<AdminRole, string> = {
    super_admin: "Super Admin",
    admin: "Admin",
    support: "Support",
    viewer: "Viewer",
  };
  return names[role];
}

