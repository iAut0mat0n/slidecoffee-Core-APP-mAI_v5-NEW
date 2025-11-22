import { Router, Response, Request } from 'express';
import Stripe from 'stripe';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { STRIPE_CONFIG } from '../config/stripe-plans.js';

const router = Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

router.post('/create-checkout-session', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { priceId } = req.body;
    const userId = req.user?.id;
    const userEmail = req.user?.email;
    const workspaceId = req.user?.workspaceId;

    if (!priceId || !userId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:5000'}/settings?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5000'}/settings?canceled=true`,
      customer_email: userEmail,
      metadata: {
        userId,
        workspaceId: workspaceId || '',
      },
      subscription_data: {
        metadata: {
          userId,
          workspaceId: workspaceId || '',
        },
      },
    });

    res.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    res.status(500).json({ error: error.message || 'Failed to create checkout session' });
  }
});

router.post('/create-portal-session', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Fetch user's Stripe customer ID from database
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );

    const { data: userRecord, error } = await supabase
      .from('v2_users')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single();

    if (error || !userRecord?.stripe_customer_id) {
      return res.status(400).json({ error: 'No active subscription found' });
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: userRecord.stripe_customer_id,
      return_url: `${process.env.FRONTEND_URL || 'http://localhost:5000'}/settings`,
    });

    res.json({ url: portalSession.url });
  } catch (error: any) {
    console.error('Stripe portal error:', error);
    res.status(500).json({ error: error.message || 'Failed to create portal session' });
  }
});

// Get all available plans
router.get('/plans', (req: Request, res: Response) => {
  try {
    const plans = [
      {
        id: STRIPE_CONFIG.plans.starter.id,
        name: STRIPE_CONFIG.plans.starter.name,
        price: STRIPE_CONFIG.plans.starter.price,
        features: STRIPE_CONFIG.plans.starter.features,
        limits: STRIPE_CONFIG.plans.starter.limits,
        priceIds: null, // Free plan has no price IDs
      },
      {
        id: STRIPE_CONFIG.plans.americano.id,
        name: STRIPE_CONFIG.plans.americano.name,
        price: STRIPE_CONFIG.plans.americano.price,
        features: STRIPE_CONFIG.plans.americano.features,
        limits: STRIPE_CONFIG.plans.americano.limits,
        priceIds: STRIPE_CONFIG.plans.americano.priceIds,
      },
      {
        id: STRIPE_CONFIG.plans.cappuccino.id,
        name: STRIPE_CONFIG.plans.cappuccino.name,
        price: STRIPE_CONFIG.plans.cappuccino.price,
        features: STRIPE_CONFIG.plans.cappuccino.features,
        limits: STRIPE_CONFIG.plans.cappuccino.limits,
        priceIds: STRIPE_CONFIG.plans.cappuccino.priceIds,
        popular: true,
      },
      {
        id: STRIPE_CONFIG.plans.coldBrew.id,
        name: STRIPE_CONFIG.plans.coldBrew.name,
        price: STRIPE_CONFIG.plans.coldBrew.price,
        features: STRIPE_CONFIG.plans.coldBrew.features,
        limits: STRIPE_CONFIG.plans.coldBrew.limits,
        priceIds: STRIPE_CONFIG.plans.coldBrew.priceIds,
      },
    ];

    res.json({ plans });
  } catch (error: any) {
    console.error('Error fetching plans:', error);
    res.status(500).json({ error: 'Failed to fetch plans' });
  }
});

// Get credit top-up options
router.get('/topups', (req: Request, res: Response) => {
  try {
    const topups = Object.values(STRIPE_CONFIG.topups);
    res.json({ topups });
  } catch (error: any) {
    console.error('Error fetching topups:', error);
    res.status(500).json({ error: 'Failed to fetch topups' });
  }
});

// Check if user can create slides (enforce limits)
router.get('/check-slide-limit', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const userPlan = req.user?.plan || 'starter';

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Get user's current slide count this month
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );

    // Get presentations created this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: presentations, error } = await supabase
      .from('v2_presentations')
      .select('id, slides')
      .eq('user_id', userId)
      .gte('created_at', startOfMonth.toISOString());

    if (error) {
      console.error('Error fetching presentations:', error);
      return res.status(500).json({ error: 'Failed to check slide limit' });
    }

    // Count total slides created this month
    const totalSlides = presentations?.reduce((sum, p) => {
      const slides = p.slides ? (Array.isArray(p.slides) ? p.slides.length : 0) : 0;
      return sum + slides;
    }, 0) || 0;

    // Import helper function
    const { canCreateSlides } = await import('../config/stripe-plans.js');
    const limitCheck = canCreateSlides(userPlan, totalSlides);

    res.json({
      ...limitCheck,
      currentCount: totalSlides,
      plan: userPlan,
    });
  } catch (error: any) {
    console.error('Error checking slide limit:', error);
    res.status(500).json({ error: 'Failed to check slide limit' });
  }
});

export default router;
