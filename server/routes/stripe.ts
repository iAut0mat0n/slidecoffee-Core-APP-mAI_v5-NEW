import { Router, Response, Request } from 'express';
import Stripe from 'stripe';
import { requireAuth, AuthRequest } from '../middleware/auth.js';

const router = Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

const PLAN_PRICE_IDS = {
  pro_monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || '',
  pro_annual: process.env.STRIPE_PRO_ANNUAL_PRICE_ID || '',
  enterprise_monthly: process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID || '',
  enterprise_annual: process.env.STRIPE_ENTERPRISE_ANNUAL_PRICE_ID || '',
};

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

router.get('/plans', (req: Request, res: Response) => {
  try {
    res.json({
      plans: [
        {
          id: 'starter',
          name: 'Starter',
          price: { monthly: 0, annual: 0 },
          features: ['5 presentations/month', 'Basic templates', 'Export to PDF', 'Community support'],
          priceIds: null,
        },
        {
          id: 'pro',
          name: 'Pro',
          price: { monthly: 29, annual: 290 },
          features: ['Unlimited presentations', 'All templates', 'AI generation', 'Brand guidelines', 'Priority support', 'Export to PPT/PDF'],
          priceIds: {
            monthly: PLAN_PRICE_IDS.pro_monthly,
            annual: PLAN_PRICE_IDS.pro_annual,
          },
        },
        {
          id: 'enterprise',
          name: 'Enterprise',
          price: { monthly: 99, annual: 990 },
          features: ['Everything in Pro', 'Custom branding', 'API access', 'SSO', 'Dedicated support', 'SLA guarantee', 'Advanced analytics'],
          priceIds: {
            monthly: PLAN_PRICE_IDS.enterprise_monthly,
            annual: PLAN_PRICE_IDS.enterprise_annual,
          },
        },
      ],
    });
  } catch (error: any) {
    console.error('Error fetching plans:', error);
    res.status(500).json({ error: 'Failed to fetch plans' });
  }
});

export default router;
