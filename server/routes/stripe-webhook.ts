import express, { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const router = Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

async function updateUserSubscription(userId: string, subscriptionData: any) {
  const { error } = await supabase
    .from('v2_users')
    .update({
      plan: subscriptionData.plan,
      stripe_customer_id: subscriptionData.customerId,
      stripe_subscription_id: subscriptionData.subscriptionId,
      subscription_status: subscriptionData.status,
      subscription_current_period_end: subscriptionData.currentPeriodEnd,
    })
    .eq('id', userId);

  if (error) {
    console.error('Failed to update user subscription:', error);
    throw error;
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.userId;
  if (!userId) {
    console.error('No userId in subscription metadata');
    return;
  }

  const plan = subscription.items.data[0]?.price.lookup_key || 'pro';
  const periodEnd = (subscription as any).current_period_end || 0;

  await updateUserSubscription(userId, {
    plan,
    customerId: subscription.customer as string,
    subscriptionId: subscription.id,
    status: subscription.status,
    currentPeriodEnd: new Date(periodEnd * 1000).toISOString(),
  });

  console.log(`Subscription created for user ${userId}, plan: ${plan}`);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.userId;
  if (!userId) {
    console.error('No userId in subscription metadata');
    return;
  }

  const plan = subscription.items.data[0]?.price.lookup_key || 'pro';
  const periodEnd = (subscription as any).current_period_end || 0;

  await updateUserSubscription(userId, {
    plan,
    customerId: subscription.customer as string,
    subscriptionId: subscription.id,
    status: subscription.status,
    currentPeriodEnd: new Date(periodEnd * 1000).toISOString(),
  });

  console.log(`Subscription updated for user ${userId}, status: ${subscription.status}`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.userId;
  if (!userId) {
    console.error('No userId in subscription metadata');
    return;
  }

  await updateUserSubscription(userId, {
    plan: 'starter',
    customerId: subscription.customer as string,
    subscriptionId: null,
    status: 'canceled',
    currentPeriodEnd: null,
  });

  console.log(`Subscription canceled for user ${userId}`);
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  if (!userId) {
    console.error('No userId in checkout session metadata');
    return;
  }

  if (session.mode === 'subscription') {
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
    await handleSubscriptionCreated(subscription);
  }

  console.log(`Checkout completed for user ${userId}`);
}

router.post('/stripe/webhook', express.raw({ type: 'application/json' }), async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'];

  if (!sig) {
    return res.status(400).send('Missing stripe-signature header');
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      webhookSecret
    );
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.paid':
        console.log('Invoice paid:', event.data.object.id);
        break;

      case 'invoice.payment_failed':
        console.log('Invoice payment failed:', event.data.object.id);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error: any) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

export default router;
