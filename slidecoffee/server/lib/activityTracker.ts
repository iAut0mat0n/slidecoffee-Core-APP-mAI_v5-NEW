import { getDb } from "../db";
import { activityFeed } from "../../drizzle/schema";

interface TrackActivityParams {
  userId: number;
  action: string;
  entityType?: string;
  entityId?: number;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Track user activity in the activity feed
 */
export async function trackActivity(params: TrackActivityParams): Promise<void> {
  try {
    const db = await getDb();
    if (!db) {
      console.warn("[ActivityTracker] Database not available");
      return;
    }

    await db.insert(activityFeed).values({
      userId: params.userId,
      action: params.action,
      entityType: params.entityType || undefined,
      entityId: params.entityId || undefined,
      details: params.details ? JSON.stringify(params.details) : undefined,
      ipAddress: params.ipAddress || undefined,
      userAgent: params.userAgent || undefined,
    });
  } catch (error) {
    console.error("[ActivityTracker] Failed to track activity:", error);
    // Don't throw - activity tracking should never break the main flow
  }
}

/**
 * Common activity actions
 */
export const ActivityActions = {
  // User actions
  USER_LOGIN: "user.login",
  USER_LOGOUT: "user.logout",
  USER_SIGNUP: "user.signup",
  USER_PROFILE_UPDATE: "user.profile_update",
  
  // Presentation actions
  PRESENTATION_CREATE: "presentation.create",
  PRESENTATION_EDIT: "presentation.edit",
  PRESENTATION_DELETE: "presentation.delete",
  PRESENTATION_SHARE: "presentation.share",
  PRESENTATION_EXPORT: "presentation.export",
  
  // Collaboration actions
  COLLAB_INVITE: "collaboration.invite",
  COLLAB_JOIN: "collaboration.join",
  COLLAB_LEAVE: "collaboration.leave",
  COLLAB_COMMENT: "collaboration.comment",
  
  // Subscription actions
  SUBSCRIPTION_UPGRADE: "subscription.upgrade",
  SUBSCRIPTION_DOWNGRADE: "subscription.downgrade",
  SUBSCRIPTION_CANCEL: "subscription.cancel",
  
  // Admin actions
  ADMIN_USER_UPDATE: "admin.user_update",
  ADMIN_TIER_CREATE: "admin.tier_create",
  ADMIN_TIER_UPDATE: "admin.tier_update",
} as const;

