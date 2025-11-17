/**
 * Credit Management System
 * 
 * Handles credit allocation, usage tracking, and transactions.
 * Ensures users stay within their plan limits.
 * 
 * Credit Costs (Estimated):
 * - Simple outline: ~10 credits
 * - Complex outline with research: ~50 credits
 * - Single slide generation: ~30-50 credits
 * - Full 10-slide presentation: ~400-600 credits
 * 
 * Plan Limits:
 * - Starter: 200 credits/month
 * - Pro: 2,000 credits/month
 * - Pro Plus: 5,000 credits/month
 * - Team: 6,000 credits/seat/month
 * - Business: 10,000 credits/seat/month
 * - Enterprise: Unlimited
 */

import { getDb } from '../db';
import { eq } from 'drizzle-orm';
import { users, creditTransactions } from '../../drizzle/schema';

export type SubscriptionTier = 'starter' | 'pro' | 'pro_plus' | 'team' | 'business' | 'enterprise';
export type TransactionType = 'usage' | 'top_up' | 'refund' | 'subscription_renewal' | 'admin_adjustment';

// Credit limits per tier
export const CREDIT_LIMITS: Record<SubscriptionTier, number> = {
  starter: 75,
  pro: 2000,
  pro_plus: 5000,
  team: 6000,
  business: 10000,
  enterprise: -1, // unlimited
};

/**
 * Get user's current credit balance
 */
export async function getUserCredits(userId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return result[0]?.creditsRemaining || 0;
}

/**
 * Check if user has enough credits
 */
export async function hasEnoughCredits(userId: number, amount: number): Promise<boolean> {
  const balance = await getUserCredits(userId);
  return balance >= amount;
}

/**
 * Deduct credits from user's balance
 * Returns new balance or throws error if insufficient credits
 */
export async function deductCredits(
  userId: number,
  amount: number,
  presentationId: number | null,
  description: string
): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  // Get current balance
  const userResult = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  const user = userResult[0];
  
  if (!user) {
    throw new Error('User not found');
  }

  const balanceBefore = user.creditsRemaining;

  // Check if enough credits
  if (balanceBefore < amount) {
    throw new Error(`Insufficient credits. Need ${amount}, have ${balanceBefore}`);
  }

  const balanceAfter = balanceBefore - amount;

  // Update user balance
  await db.update(users)
    .set({ 
      creditsRemaining: balanceAfter,
      creditsUsedThisMonth: (user.creditsUsedThisMonth || 0) + amount,
    })
    .where(eq(users.id, userId));

  // Record transaction
  await db.insert(creditTransactions).values({
    userId,
    presentationId,
    amount: -amount, // negative for usage
    type: 'usage',
    description,
    balanceBefore,
    balanceAfter,
  });

  console.log(`[Credits] User ${userId} used ${amount} credits. Balance: ${balanceBefore} → ${balanceAfter}`);

  return balanceAfter;
}

/**
 * Add credits to user's balance
 */
export async function addCredits(
  userId: number,
  amount: number,
  type: TransactionType,
  description: string
): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  // Get current balance
  const userResult = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  const user = userResult[0];
  
  if (!user) {
    throw new Error('User not found');
  }

  const balanceBefore = user.creditsRemaining;
  const balanceAfter = balanceBefore + amount;

  // Update user balance
  await db.update(users)
    .set({ creditsRemaining: balanceAfter })
    .where(eq(users.id, userId));

  // Record transaction
  await db.insert(creditTransactions).values({
    userId,
    presentationId: null,
    amount, // positive for addition
    type,
    description,
    balanceBefore,
    balanceAfter,
  });

  console.log(`[Credits] User ${userId} received ${amount} credits (${type}). Balance: ${balanceBefore} → ${balanceAfter}`);

  return balanceAfter;
}

/**
 * Reset monthly credits based on subscription tier
 * Called at the start of each billing cycle
 */
export async function resetMonthlyCredits(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const userResult = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  const user = userResult[0];
  
  if (!user) {
    throw new Error('User not found');
  }

  const tier = user.subscriptionTier;
  const creditLimit = CREDIT_LIMITS[tier];

  if (creditLimit === -1) {
    // Enterprise: unlimited, no reset needed
    return;
  }

  const balanceBefore = user.creditsRemaining;

  // Reset to plan limit
  await db.update(users)
    .set({ 
      creditsRemaining: creditLimit,
      creditsUsedThisMonth: 0,
      billingCycleStart: new Date(),
    })
    .where(eq(users.id, userId));

  // Record transaction
  await db.insert(creditTransactions).values({
    userId,
    presentationId: null,
    amount: creditLimit - balanceBefore,
    type: 'subscription_renewal',
    description: `Monthly credit renewal for ${tier} plan`,
    balanceBefore,
    balanceAfter: creditLimit,
  });

  console.log(`[Credits] User ${userId} monthly credits reset. ${tier} plan: ${creditLimit} credits`);
}

/**
 * Get credit transaction history for a user
 */
export async function getCreditHistory(userId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];

  return db.select()
    .from(creditTransactions)
    .where(eq(creditTransactions.userId, userId))
    .orderBy(creditTransactions.createdAt)
    .limit(limit);
}

/**
 * Estimate credits needed for an operation
 */
export function estimateCredits(operation: 'outline' | 'slide' | 'presentation', complexity: 'simple' | 'complex' = 'simple'): number {
  const estimates = {
    outline: {
      simple: 10,
      complex: 50,
    },
    slide: {
      simple: 30,
      complex: 50,
    },
    presentation: {
      simple: 400,
      complex: 600,
    },
  };

  return estimates[operation][complexity];
}

/**
 * Check if user needs credit warning
 * Returns true if credits are running low
 */
export async function needsCreditWarning(userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const userResult = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  const user = userResult[0];
  
  if (!user) return false;

  const tier = user.subscriptionTier;
  const limit = CREDIT_LIMITS[tier];

  if (limit === -1) return false; // Enterprise: unlimited

  const remaining = user.creditsRemaining;
  const threshold = limit * 0.2; // Warn at 20% remaining

  return remaining <= threshold;
}

