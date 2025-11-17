/**
 * Credit Display Widget
 * 
 * Shows user's remaining credits in the navigation bar
 * Displays warning when credits are low (< 20%)
 * Links to upgrade modal when clicked
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Coins, AlertTriangle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";

interface CreditDisplayProps {
  onUpgradeClick?: () => void;
  className?: string;
}

export function CreditDisplay({ onUpgradeClick, className }: CreditDisplayProps) {
  const { user, loading: authLoading } = useSupabaseAuth();
  
  const { data: credits, isLoading, error } = trpc.subscription.getCredits.useQuery(undefined, {
    enabled: !!user, // Only query when user is authenticated
    refetchInterval: 30000, // Refresh every 30 seconds
    retry: 3, // Retry up to 3 times
    retryDelay: 1000, // Wait 1s between retries
  });

  // Show friendly loading message if query failed (might be slow database)
  if (error) {
    return (
      <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50", className)}>
        <Coins className="h-4 w-4 text-muted-foreground animate-pulse" />
        <span className="text-sm text-muted-foreground">Loading credits...</span>
      </div>
    );
  }

  // Show loading state
  if (isLoading || !credits) {
    return (
      <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50", className)}>
        <Coins className="h-4 w-4 text-muted-foreground animate-pulse" />
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
    );
  }

  const { balance, tier } = credits;
  
  // Get credit limit for current tier
  const tierLimits: Record<string, number> = {
    starter: 75,
    pro: 2000,
    pro_plus: 5000,
    team: 6000,
    business: 10000,
    enterprise: -1, // unlimited
  };

  const limit = tierLimits[tier] || 75;
  const isUnlimited = limit === -1;
  // Use actual credit thresholds instead of percentages
  const lowThreshold = Math.floor(limit * 0.2); // 20% of limit
  const criticalThreshold = Math.floor(limit * 0.1); // 10% of limit
  const isLow = balance <= lowThreshold && balance > criticalThreshold && !isUnlimited;
  const isCritical = balance <= criticalThreshold && !isUnlimited;

  // Determine color based on balance
  const getColorClass = () => {
    if (isUnlimited) return "text-purple-600 dark:text-purple-400";
    if (isCritical) return "text-amber-600 dark:text-amber-400";
    if (isLow) return "text-blue-600 dark:text-blue-400";
    return "text-green-600 dark:text-green-400";
  };

  const getBgClass = () => {
    if (isUnlimited) return "bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800";
    if (isCritical) return "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800";
    if (isLow) return "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800";
    return "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800";
  };

  const handleClick = () => {
    if (onUpgradeClick) {
      onUpgradeClick();
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 h-auto border transition-all hover:scale-105",
        getBgClass(),
        className
      )}
    >
      {/* Icon */}
      {isUnlimited ? (
        <Sparkles className={cn("h-4 w-4", getColorClass())} />
      ) : isLow ? (
        <AlertTriangle className={cn("h-4 w-4", getColorClass())} />
      ) : (
        <Coins className={cn("h-4 w-4", getColorClass())} />
      )}

      {/* Balance */}
      <div className="flex flex-col items-start">
        <span className={cn("text-sm font-semibold", getColorClass())}>
          {isUnlimited ? "Unlimited" : `${balance.toLocaleString()} credits`}
        </span>
        {!isUnlimited && limit > 0 && (
          <span className="text-xs text-muted-foreground">
            {limit.toLocaleString()} per month
          </span>
        )}
      </div>

      {/* Warning indicator */}
      {isLow && !isUnlimited && (
        <div className="ml-1">
          <div className={cn(
            "h-2 w-2 rounded-full animate-pulse",
            isCritical ? "bg-red-500" : "bg-orange-500"
          )} />
        </div>
      )}
    </Button>
  );
}

/**
 * Compact version for mobile/small screens
 */
export function CreditDisplayCompact({ onUpgradeClick, className }: CreditDisplayProps) {
  const { user } = useSupabaseAuth();
  
  const { data: credits, isLoading } = trpc.subscription.getCredits.useQuery(undefined, {
    enabled: !!user, // Only query when user is authenticated
    refetchInterval: 30000,
    retry: false, // Don't retry on failure to avoid infinite loops
  });

  if (isLoading || !credits) {
    return (
      <Button variant="ghost" size="sm" className={cn("px-2", className)}>
        <Coins className="h-4 w-4 text-muted-foreground animate-pulse" />
      </Button>
    );
  }

  const { balance, tier } = credits;
  const tierLimits: Record<string, number> = {
    starter: 75,
    pro: 2000,
    pro_plus: 5000,
    team: 6000,
    business: 10000,
    enterprise: -1,
  };

  const limit = tierLimits[tier] || 75;
  const isUnlimited = limit === -1;
  const percentage = isUnlimited ? 100 : (balance / limit) * 100;
  const isLow = percentage < 20 && !isUnlimited;

  const getColorClass = () => {
    if (isUnlimited) return "text-purple-600";
    if (percentage < 10) return "text-red-600";
    if (isLow) return "text-orange-600";
    return "text-green-600";
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onUpgradeClick}
      className={cn("px-2 relative", className)}
    >
      {isUnlimited ? (
        <Sparkles className={cn("h-4 w-4", getColorClass())} />
      ) : (
        <Coins className={cn("h-4 w-4", getColorClass())} />
      )}
      {isLow && !isUnlimited && (
        <div className="absolute -top-1 -right-1">
          <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
        </div>
      )}
    </Button>
  );
}

