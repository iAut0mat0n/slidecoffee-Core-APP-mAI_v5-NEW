import { getDb } from "../db";
import { aiBudgetSettings, aiUsageMetrics, notificationQueue, users } from "../../drizzle/schema";
import { and, eq, gte, sql } from "drizzle-orm";

/**
 * Budget Alert Service
 * Monitors AI spending and sends alerts when budgets are exceeded
 */

interface BudgetStatus {
  budgetId: number;
  workspaceId: number;
  budgetType: "daily" | "monthly";
  budgetAmount: number;
  currentSpend: number;
  percentUsed: number;
  alertThreshold: number;
  shouldAlert: boolean;
}

/**
 * Check all active budgets and send alerts if thresholds exceeded
 */
export async function checkBudgetsAndAlert(): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[BudgetAlert] Database not available");
    return;
  }

  try {
    // Get all enabled budget settings
    const budgets = await db
      .select()
      .from(aiBudgetSettings)
      .where(eq(aiBudgetSettings.enabled, true));

    for (const budget of budgets) {
      const status = await checkBudgetStatus(budget.workspaceId, budget.budgetType as 'monthly' | 'daily');
      
      if (status && status.shouldAlert) {
        await sendBudgetAlert(budget, status);
      }
    }
  } catch (error) {
    console.error("[BudgetAlert] Error checking budgets:", error);
  }
}

/**
 * Check budget status for a workspace
 */
export async function checkBudgetStatus(
  workspaceId: number,
  budgetType: "daily" | "monthly"
): Promise<BudgetStatus | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    // Get budget settings
    const budgetSettings = await db
      .select()
      .from(aiBudgetSettings)
      .where(
        and(
          eq(aiBudgetSettings.workspaceId, workspaceId),
          eq(aiBudgetSettings.budgetType, budgetType),
          eq(aiBudgetSettings.enabled, true)
        )
      )
      .limit(1);

    if (!budgetSettings.length) return null;

    const budget = budgetSettings[0];

    // Calculate time range based on budget type
    const now = new Date();
    let startDate: Date;

    if (budgetType === "daily") {
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
    } else {
      // Monthly
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // Get current spending
    const spendingResult = await db
      .select({
        totalCost: sql<number>`COALESCE(SUM(${aiUsageMetrics.costUsd}), 0)`.as("totalCost"),
      })
      .from(aiUsageMetrics)
      .where(
        and(
          eq(aiUsageMetrics.workspaceId, workspaceId),
          gte(aiUsageMetrics.createdAt, startDate)
        )
      );

    const currentSpend = spendingResult[0]?.totalCost || 0;
    const percentUsed = (currentSpend / budget.budgetAmount) * 100;

    // Check if we should alert (exceeded threshold and haven't alerted recently)
    const shouldAlert = percentUsed >= budget.alertThreshold * 100 && !hasRecentAlert(budget);

    return {
      budgetId: budget.id,
      workspaceId,
      budgetType,
      budgetAmount: budget.budgetAmount,
      currentSpend,
      percentUsed,
      alertThreshold: budget.alertThreshold,
      shouldAlert,
    };
  } catch (error) {
    console.error("[BudgetAlert] Error checking budget status:", error);
    return null;
  }
}

/**
 * Check if we've sent an alert recently (within 24 hours)
 */
function hasRecentAlert(budget: typeof aiBudgetSettings.$inferSelect): boolean {
  if (!budget.lastAlertSentAt) return false;

  const lastAlert = new Date(budget.lastAlertSentAt);
  const twentyFourHoursAgo = new Date();
  twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

  return lastAlert > twentyFourHoursAgo;
}

/**
 * Send budget alert notification
 */
async function sendBudgetAlert(
  budget: typeof aiBudgetSettings.$inferSelect,
  status: BudgetStatus
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    // Get workspace owner to notify
    const workspaceOwners = await db
      .select({
        userId: users.id,
        email: users.email,
        name: users.name,
      })
      .from(users)
      .where(eq(users.id, budget.workspaceId)); // Simplified - in real app would join through workspaces table

    if (!workspaceOwners.length) {
      console.warn(`[BudgetAlert] No owner found for workspace ${budget.workspaceId}`);
      return;
    }

    const owner = workspaceOwners[0];

    // Create notification
    const title = `☕ AI Budget Alert: ${status.percentUsed.toFixed(0)}% Used`;
    const message = `Your ${status.budgetType} AI budget of $${status.budgetAmount.toFixed(2)} is ${status.percentUsed.toFixed(0)}% consumed. Current spend: $${status.currentSpend.toFixed(2)}. Time to brew some more coffee! ☕`;

    await db.insert(notificationQueue).values({
      userId: owner.userId,
      type: "credit_low", // Reusing existing type
      title,
      message,
      actionUrl: "/admin?tab=system-settings",
      isRead: 0,
      metadata: JSON.stringify({
        budgetId: budget.id,
        budgetType: status.budgetType,
        budgetAmount: status.budgetAmount,
        currentSpend: status.currentSpend,
        percentUsed: status.percentUsed,
      }),
    });

    // Update last alert timestamp
    await db
      .update(aiBudgetSettings)
      .set({ lastAlertSentAt: new Date() })
      .where(eq(aiBudgetSettings.id, budget.id));

    console.log(`[BudgetAlert] Sent alert for workspace ${budget.workspaceId}: ${status.percentUsed.toFixed(0)}% used`);
  } catch (error) {
    console.error("[BudgetAlert] Error sending alert:", error);
  }
}

/**
 * Get budget status for display in UI
 */
export async function getBudgetStatusForWorkspace(
  workspaceId: number
): Promise<{
  daily: BudgetStatus | null;
  monthly: BudgetStatus | null;
}> {
  const daily = await checkBudgetStatus(workspaceId, "daily");
  const monthly = await checkBudgetStatus(workspaceId, "monthly");

  return { daily, monthly };
}

