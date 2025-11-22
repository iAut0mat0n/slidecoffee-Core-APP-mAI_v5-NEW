import { useState } from 'react';
import { toast } from 'sonner';

export type UpgradeTrigger = 'slide_limit' | 'brand_limit' | 'export_limit' | 'ai_limit';

export function useUpgradePrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [trigger, setTrigger] = useState<UpgradeTrigger>('slide_limit');

  const checkAndPromptUpgrade = async (triggerType: UpgradeTrigger): Promise<boolean> => {
    try {
      const response = await fetch('/api/usage/current', {
        credentials: 'include',
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      const { usage } = data;

      // Check if user should see upgrade prompt based on trigger
      const shouldPrompt = shouldShowUpgrade(triggerType, usage);

      if (shouldPrompt) {
        setTrigger(triggerType);
        setShowPrompt(true);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to check upgrade eligibility:', error);
      return false;
    }
  };

  const handleUpgrade = async (planId: string) => {
    try {
      // Get plan details to select price ID
      const plansResponse = await fetch('/api/stripe/plans');
      const plansData = await plansResponse.json();
      const plan = plansData.plans?.find((p: any) => p.id === planId);

      if (!plan || !plan.priceIds) {
        toast.error('Invalid plan selected');
        return;
      }

      // Create checkout session
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ priceId: plan.priceIds.monthly }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error('Failed to start upgrade');
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      toast.error('Failed to upgrade plan');
    }
  };

  const closePrompt = () => {
    setShowPrompt(false);
  };

  return {
    showPrompt,
    trigger,
    checkAndPromptUpgrade,
    handleUpgrade,
    closePrompt,
  };
}

function shouldShowUpgrade(trigger: UpgradeTrigger, usage: any): boolean {
  // Logic to determine if upgrade prompt should be shown
  switch (trigger) {
    case 'slide_limit':
      return usage.slides >= 4; // Show when approaching free tier limit
    case 'brand_limit':
      return usage.brands >= 1; // Free tier allows 1 brand
    default:
      return false;
  }
}
