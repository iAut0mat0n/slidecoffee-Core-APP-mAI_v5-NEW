/**
 * Credit Notifications Hook
 * 
 * Monitors credit balance and shows friendly reminders when running low
 * - Shows gentle heads up at 20% remaining (once per session)
 * - Shows friendly reminder at 10% remaining (once per session)
 * - Shows refill message at 0 credits (every time)
 * 
 * All messages use positive, encouraging language to maintain great UX
 * Triggers upgrade modal when user clicks "View Plans"
 */

import { useEffect, useRef, createElement } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { AlertTriangle, Coins } from "lucide-react";

interface UseCreditWarningsOptions {
  onUpgradeClick?: () => void;
  enabled?: boolean;
}

export function useCreditWarnings({ onUpgradeClick, enabled = true }: UseCreditWarningsOptions = {}) {
  const { data: credits } = trpc.subscription.getCredits.useQuery(undefined, {
    enabled,
    refetchInterval: 30000, // Check every 30 seconds
  });

  // Track which warnings we've shown this session
  const warningsShown = useRef({
    low20: false,
    low10: false,
    zero: false,
  });

  useEffect(() => {
    if (!credits || !enabled) return;

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

    // Don't show warnings for unlimited tier
    if (isUnlimited) return;

    const lowThreshold = Math.floor(limit * 0.2);
    const criticalThreshold = Math.floor(limit * 0.1);

    // Zero credits - show every time
    if (balance === 0) {
      warningsShown.current.zero = true;
      toast.info("Time to refill your coffee! ☕", {
        description: "You've used all your credits. Upgrade to keep creating amazing presentations.",
        className: "[&_.sonner-toast-description]:text-foreground/90",
        icon: createElement(Coins, { className: "h-4 w-4" }),
        action: onUpgradeClick
          ? {
              label: "View Plans",
              onClick: onUpgradeClick,
            }
          : undefined,
        duration: 10000,
      });
      return;
    }

    // Critical threshold - friendly reminder
    if (balance <= criticalThreshold && balance > 0 && !warningsShown.current.low10) {
      warningsShown.current.low10 = true;
      toast.info("Coffee's getting low! ☕", {
        description: `You have ${balance} credits left. Upgrade anytime to keep the creativity flowing.`,
        className: "[&_.sonner-toast-description]:text-foreground/90",
        icon: createElement(Coins, { className: "h-4 w-4" }),
        action: onUpgradeClick
          ? {
              label: "View Plans",
              onClick: onUpgradeClick,
            }
          : undefined,
        duration: 8000,
      });
      return;
    }

    // Low threshold - gentle heads up
    if (balance <= lowThreshold && balance > criticalThreshold && !warningsShown.current.low20) {
      warningsShown.current.low20 = true;
      toast.info("Heads up! ✨", {
        description: `You have ${balance} of ${limit} credits left this month. You're doing great!`,
        className: "[&_.sonner-toast-description]:text-foreground/90",
        icon: createElement(Coins, { className: "h-4 w-4" }),
        action: onUpgradeClick
          ? {
              label: "View Plans",
              onClick: onUpgradeClick,
            }
          : undefined,
        duration: 6000,
      });
    }
  }, [credits, enabled, onUpgradeClick]);

  return {
    credits,
    isLow: credits ? ((credits.balance / 75) * 100 < 20) : false,
    isCritical: credits ? ((credits.balance / 75) * 100 < 10) : false,
    isZero: credits ? (credits.balance === 0) : false,
  };
}

