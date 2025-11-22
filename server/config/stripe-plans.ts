/**
 * Stripe Plan Configuration
 * Maps coffee-themed Stripe products to app plan tiers
 */

export const STRIPE_CONFIG = {
  // Subscription Plans
  plans: {
    // FREE TIER - Espresso (5 slides one-time, not in Stripe)
    espresso: {
      id: 'espresso',
      name: 'Espresso',
      stripeProductId: null, // No Stripe product for free tier
      limits: {
        slidesPerMonth: 5,
        presentationsPerMonth: 1, // 0.5 Brew = 5 slides one-time
        templatesAccess: 'basic',
        aiGeneration: false,
        brandGuidelines: false,
        exportFormats: ['pdf'],
        watermark: true,
      },
      price: {
        monthly: 0,
        annual: 0,
      },
      priceIds: null,
      features: [
        '5 slides (one-time)',
        'Basic templates',
        'Export to PDF',
        'Watermark on exports',
      ],
    },

    // STARTER TIER - Americano ($12/mo or $10/mo annual)
    americano: {
      id: 'americano',
      name: 'Americano',
      stripeProductId: 'prod_TTKyaYbvgAmwtn',
      limits: {
        slidesPerMonth: 75, // 7 Brews (70 slides) + 5 Shots (5 edits)
        presentationsPerMonth: 7,
        editsPerMonth: 5,
        templatesAccess: 'all',
        aiGeneration: true,
        brandGuidelines: false,
        exportFormats: ['pdf', 'pptx'],
        watermark: false,
      },
      price: {
        monthly: 12,
        annual: 120, // $10/month billed annually
      },
      priceIds: {
        monthly: 'price_1SWOIHQqJZwsptkv3oF47C38',
        annual: 'price_1SWOIHQqJZwsptkvgEmFNhiP',
      },
      features: [
        '7 presentations/month (70 slides)',
        '5 edits/month',
        'All templates',
        'AI generation',
        'No watermark',
        'PDF + PPTX export',
        'Email support',
        'Basic analytics',
      ],
    },

    // PRO TIER - Cappuccino ($29/mo or $24/mo annual)
    cappuccino: {
      id: 'cappuccino',
      name: 'Cappuccino',
      stripeProductId: 'prod_TTKyHIKHMtBAZT',
      limits: {
        slidesPerMonth: 450, // 30 Brews (300 slides) + Unlimited Shots (~150 edits)
        presentationsPerMonth: 30,
        editsPerMonth: -1, // unlimited
        templatesAccess: 'all',
        aiGeneration: true,
        premiumAI: true, // Claude Sonnet for 20% of slides
        brandGuidelines: true,
        exportFormats: ['pdf', 'pptx'],
        watermark: false,
      },
      price: {
        monthly: 29,
        annual: 288, // $24/month billed annually
      },
      priceIds: {
        monthly: 'price_1SWOIHQqJZwsptkvCtKZFZkL',
        annual: 'price_1SWOIIQqJZwsptkvNH0h35bE',
      },
      features: [
        '30 presentations/month (300 slides)',
        'Unlimited edits',
        'Premium AI models (Claude Sonnet)',
        'Custom branding & fonts',
        'Advanced analytics',
        'Priority support',
        'API access (coming soon)',
        'Remove footer branding',
      ],
    },

    // TEAM TIER - Cold Brew ($59/mo or $49/mo annual + $12/seat)
    coldBrew: {
      id: 'coldbrew',
      name: 'Cold Brew',
      stripeProductId: 'prod_TTKyq85JXkP37m',
      limits: {
        slidesPerMonth: 800, // 60 Brews (600 slides) + Unlimited Shots (~200 edits)
        presentationsPerMonth: 60,
        editsPerMonth: -1, // unlimited
        templatesAccess: 'all',
        aiGeneration: true,
        premiumAI: true,
        brandGuidelines: true,
        exportFormats: ['pdf', 'pptx'],
        watermark: false,
        teamSeats: 3, // Base includes 3 seats
        maxSeats: 20,
        collaboration: true,
      },
      price: {
        monthly: 59,
        annual: 588, // $49/month billed annually
        additionalSeat: 12, // $12/month per additional seat
      },
      priceIds: {
        monthly: 'price_1SWOIIQqJZwsptkvAkTmhZjI',
        annual: 'price_1SWOIIQqJZwsptkvY5grKV7v',
        additionalSeat: 'price_1SWOIJQqJZwsptkvSncvRXJ0',
      },
      features: [
        '60 presentations/month (shared)',
        'Unlimited edits',
        '3-20 team seats',
        'Team workspace',
        'Collaboration (comments, @mentions)',
        'Shared brand library',
        'Team analytics',
        'Version history',
        'Priority support',
      ],
    },

    // ENTERPRISE TIER - French Press ($199+/mo custom pricing)
    frenchPress: {
      id: 'frenchpress',
      name: 'French Press',
      stripeProductId: 'prod_TTKyO8ROj7J6gr',
      limits: {
        slidesPerMonth: -1, // Unlimited (fair use ~2,500/month)
        presentationsPerMonth: -1, // Unlimited
        editsPerMonth: -1, // Unlimited
        templatesAccess: 'all',
        aiGeneration: true,
        premiumAI: true,
        brandGuidelines: true,
        exportFormats: ['pdf', 'pptx'],
        watermark: false,
        teamSeats: -1, // Unlimited
        collaboration: true,
        enterprise: true,
      },
      price: {
        monthly: 199, // Starting price, custom pricing
      },
      priceIds: {
        monthly: 'price_1SWOIJQqJZwsptkvWfIpodet',
      },
      features: [
        'Unlimited presentations',
        'Unlimited edits',
        'Unlimited seats',
        'White-label options',
        'Custom domain',
        'Dedicated account manager',
        'SLA guarantees (99.9% uptime)',
        'Custom integrations',
        'On-premise deployment (optional)',
        'Training & onboarding',
      ],
      isEnterprise: true,
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
  return plan?.limits || STRIPE_CONFIG.plans.espresso.limits;
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
