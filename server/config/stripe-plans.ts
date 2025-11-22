/**
 * Stripe Plan Configuration
 * Maps coffee-themed Stripe products to app plan tiers
 */

export const STRIPE_CONFIG = {
  // Subscription Plans
  plans: {
    // FREE TIER - No Stripe product (built-in free tier)
    starter: {
      id: 'starter',
      name: 'Free',
      stripeProductId: null, // No Stripe product for free tier
      limits: {
        slidesPerMonth: 5,
        presentationsPerMonth: 5,
        templatesAccess: 'basic',
        aiGeneration: false,
        brandGuidelines: false,
        exportFormats: ['pdf'],
      },
      price: {
        monthly: 0,
        annual: 0,
      },
      priceIds: null,
      features: [
        '5 slides per month',
        'Basic templates',
        'Export to PDF',
        'Community support',
      ],
    },

    // BASIC PAID TIER - Americano (Entry-level Paid)
    americano: {
      id: 'americano',
      name: 'Americano',
      stripeProductId: 'prod_TTKyaYbvgAmwtn',
      limits: {
        slidesPerMonth: 20,
        presentationsPerMonth: 20,
        templatesAccess: 'standard',
        aiGeneration: true,
        brandGuidelines: false,
        exportFormats: ['pdf', 'pptx'],
      },
      price: {
        monthly: 15,
        annual: 150,
      },
      priceIds: {
        monthly: 'price_1SWOIHQqJZwsptkv3oF47C38',
        annual: 'price_1SWOIHQqJZwsptkvgEmFNhiP',
      },
      features: [
        '20 slides per month',
        'Standard templates',
        'AI generation',
        'Export to PPT/PDF',
        'Email support',
      ],
    },

    // PRO TIER - Cappuccino (Popular Choice)
    cappuccino: {
      id: 'cappuccino',
      name: 'Cappuccino',
      stripeProductId: 'prod_TTKyHIKHMtBAZT',
      limits: {
        slidesPerMonth: -1, // unlimited
        presentationsPerMonth: -1, // unlimited
        templatesAccess: 'all',
        aiGeneration: true,
        brandGuidelines: true,
        exportFormats: ['pdf', 'pptx'],
      },
      price: {
        monthly: 29,
        annual: 290,
      },
      priceIds: {
        monthly: 'price_1SWOIHQqJZwsptkvCtKZFZkL',
        annual: 'price_1SWOIIQqJZwsptkvNH0h35bE',
      },
      features: [
        'Unlimited slides',
        'Unlimited presentations',
        'All templates',
        'AI generation',
        'Brand guidelines',
        'Priority support',
        'Export to PPT/PDF',
      ],
    },

    // ENTERPRISE TIER - ColdBrew (Premium with Teams)
    coldBrew: {
      id: 'coldbrew',
      name: 'Cold Brew',
      stripeProductId: 'prod_TTKyq85JXkP37m',
      limits: {
        slidesPerMonth: -1, // unlimited
        presentationsPerMonth: -1, // unlimited
        templatesAccess: 'all',
        aiGeneration: true,
        brandGuidelines: true,
        exportFormats: ['pdf', 'pptx'],
        teamSeats: true,
        customBranding: true,
        apiAccess: true,
      },
      price: {
        monthly: 99,
        annual: 990,
      },
      priceIds: {
        monthly: 'price_1SWOIIQqJZwsptkvAkTmhZjI',
        annual: 'price_1SWOIIQqJZwsptkvY5grKV7v',
        additionalSeat: 'price_1SWOIJQqJZwsptkvSncvRXJ0',
      },
      features: [
        'Everything in Pro',
        'Custom branding',
        'Team collaboration',
        'Additional seats available',
        'API access',
        'SSO',
        'Dedicated support',
        'SLA guarantee',
        'Advanced analytics',
      ],
    },

    // SPECIAL TIER - FrenchPress (One-time or special offer)
    frenchPress: {
      id: 'frenchpress',
      name: 'French Press Special',
      stripeProductId: 'prod_TTKyO8ROj7J6gr', // frenchPress
      limits: {
        slidesPerMonth: 10, // One-time 10 slide offer
        presentationsPerMonth: 10,
        templatesAccess: 'basic',
        aiGeneration: false,
        brandGuidelines: false,
        exportFormats: ['pdf'],
      },
      price: {
        monthly: 9, // Special pricing
      },
      priceIds: {
        monthly: 'price_1SWOIJQqJZwsptkvWfIpodet',
      },
      features: [
        '10 slides one-time',
        'Basic templates',
        'Export to PDF',
        'Email support',
      ],
      isOneTime: true, // Special flag for one-time offers
    },
  },

  // Credit Top-ups
  topups: {
    credits_50: {
      id: 'credits_50',
      name: '50 Credits',
      credits: 50,
      stripeProductId: 'prod_TTKy8POIQ22nC5',
      priceId: 'price_1SWOIJQqJZwsptkvvb9j0g0E',
      price: 9.99,
    },
    credits_100: {
      id: 'credits_100',
      name: '100 Credits',
      credits: 100,
      stripeProductId: 'prod_TTKyRgg8OUZzrx',
      priceId: 'price_1SWOIKQqJZwsptkvVAevHdF7',
      price: 19.99,
      popular: true,
    },
    credits_300: {
      id: 'credits_300',
      name: '300 Credits',
      credits: 300,
      stripeProductId: 'prod_TTKya9bqKYKFer',
      priceId: 'price_1SWOIKQqJZwsptkv30if3q66',
      price: 49.99,
      bestValue: true,
    },
  },
};

// Helper function to get plan by ID
export function getPlanConfig(planId: string) {
  return STRIPE_CONFIG.plans[planId as keyof typeof STRIPE_CONFIG.plans];
}

// Helper function to get plan limits
export function getPlanLimits(planId: string) {
  const plan = getPlanConfig(planId);
  return plan?.limits || STRIPE_CONFIG.plans.starter.limits;
}

// Helper function to check if user can create more slides
export function canCreateSlides(planId: string, currentSlideCount: number): {
  allowed: boolean;
  limit: number;
  remaining: number;
  shouldPromptUpgrade: boolean;
} {
  const limits = getPlanLimits(planId);
  const limit = limits.slidesPerMonth;
  
  // -1 means unlimited
  if (limit === -1) {
    return {
      allowed: true,
      limit: -1,
      remaining: -1,
      shouldPromptUpgrade: false,
    };
  }

  const remaining = Math.max(0, limit - currentSlideCount);
  const allowed = currentSlideCount < limit;
  
  // Prompt upgrade when approaching limit (at 80% or at 10 slides for free tier)
  const shouldPromptUpgrade = 
    currentSlideCount >= 10 || // Show at 10 slides for free tier
    (limit > 0 && currentSlideCount >= limit * 0.8); // Show at 80% of limit

  return {
    allowed,
    limit,
    remaining,
    shouldPromptUpgrade,
  };
}

export default STRIPE_CONFIG;
