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

// Persistent idempotency check using Supabase
async function isEventProcessed(eventId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('v2_webhook_events')
    .select('event_id')
    .eq('event_id', eventId)
    .single();

  return !!data && !error;
}

async function claimEvent(eventId: string, eventType: string): Promise<{claimed: boolean, error?: any}> {
  // Use INSERT to claim the event - only one instance will succeed
  // If another instance already claimed it, we'll get a unique constraint violation
  const { data, error } = await supabase
    .from('v2_webhook_events')
    .insert({
      event_id: eventId,
      event_type: eventType,
      processed_at: new Date().toISOString(),
    })
    .select();

  if (error) {
    // Error code 23505 is unique constraint violation - event already processed
    if (error.code === '23505') {
      console.log(`Event ${eventId} already claimed by another instance`);
      return {claimed: false}; // Another instance claimed this event
    }
    
    // Other database errors should cause retry
    console.error('Database error claiming event:', error);
    return {claimed: false, error};
  }

  // Successfully inserted = we claimed this event
  return {claimed: true};
}

async function releaseEvent(eventId: string): Promise<void> {
  // If handler fails, release the claim so Stripe can retry
  const { error } = await supabase
    .from('v2_webhook_events')
    .delete()
    .eq('event_id', eventId);

  if (error) {
    console.error('Failed to release event claim:', error);
  }
}

// Clean up old webhook events (older than 7 days) every 6 hours
setInterval(async () => {
  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  await supabase
    .from('v2_webhook_events')
    .delete()
    .lt('processed_at', cutoff);
}, 6 * 60 * 60 * 1000);

async function updateUserSubscription(userId: string, subscriptionData: any) {
  const updates: any = {
    plan: subscriptionData.plan,
    stripe_customer_id: subscriptionData.customerId,
    stripe_subscription_id: subscriptionData.subscriptionId,
    subscription_status: subscriptionData.status,
    subscription_current_period_end: subscriptionData.currentPeriodEnd,
    subscription_workspace_id: subscriptionData.workspaceId, // Always set, even if null
  };

  const { error } = await supabase
    .from('v2_users')
    .update(updates)
    .eq('id', userId);

  if (error) {
    console.error('Failed to update user subscription:', error);
    throw error;
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.userId;
  const workspaceId = subscription.metadata.workspaceId;
  
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
    workspaceId: workspaceId || null,
  });

  console.log(`Subscription created for user ${userId}, plan: ${plan}, workspace: ${workspaceId || 'none'}`);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.userId;
  const workspaceId = subscription.metadata.workspaceId;
  
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
    workspaceId: workspaceId || null,
  });

  console.log(`Subscription updated for user ${userId}, status: ${subscription.status}, workspace: ${workspaceId || 'none'}`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.userId;
  if (!userId) {
    console.error('No userId in subscription metadata');
    return;
  }

  await updateUserSubscription(userId, {
    plan: 'espresso',
    customerId: subscription.customer as string,
    subscriptionId: null,
    status: 'canceled',
    currentPeriodEnd: null,
    workspaceId: null,
  });

  console.log(`Subscription canceled for user ${userId}, workspace access revoked`);
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  if (!userId) {
    console.error('No userId in checkout session metadata');
    return;
  }

  // Don't call handleSubscriptionCreated here - it will be called by customer.subscription.created event
  console.log(`Checkout completed for user ${userId}, waiting for subscription.created event`);
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

  // Idempotency protection: Try to claim the event first before processing
  // This prevents race conditions in autoscale deployments
  const {claimed, error: claimError} = await claimEvent(event.id, event.type);
  
  if (!claimed) {
    if (claimError) {
      // Database error - return 500 so Stripe retries
      console.error('Failed to claim event due to database error');
      return res.status(500).json({ error: 'Database unavailable' });
    }
    // Event already claimed by another instance - acknowledge
    console.log(`Event ${event.id} already claimed by another instance`);
    return res.json({ received: true, skipped: true });
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

    // Handler completed successfully, event remains claimed
    res.json({ received: true });
  } catch (error: any) {
    console.error('Webhook handler error:', error);
    
    // Release the claim so Stripe can retry
    await releaseEvent(event.id);
    
    // Return 500 so Stripe retries
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

export default router;
