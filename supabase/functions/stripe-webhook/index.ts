import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY')!;
const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;
const stripe = new Stripe(stripeSecret, {
  appInfo: {
    name: 'Bolt Integration',
    version: '1.0.0',
  },
});

const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

// Map price IDs to plan names - hardcoded because env vars are not available in edge functions
function getPlanNameFromPriceId(priceId: string): { name: string; period: string } {
  const priceMap: Record<string, { name: string; period: string }> = {
    'price_1SNKxAFUTMN3g7t4IS59w1Gc': { name: 'odbornik', period: 'monthly' },
    'price_1SNKy0FUTMN3g7t4galvKNXt': { name: 'odbornik', period: 'yearly' },
    'price_1SNKzGFUTMN3g7t4ObLLtlRB': { name: 'expert', period: 'monthly' },
    'price_1SNKziFUTMN3g7t4iGisNalD': { name: 'expert', period: 'yearly' },
    'price_1SNL0GFUTMN3g7t4rjg6nsBA': { name: 'profik', period: 'monthly' },
    'price_1SNL0kFUTMN3g7t4s0OM3Zzq': { name: 'profik', period: 'yearly' },
    'price_1SNL1QFUTMN3g7t4uk4b9Gry': { name: 'premier', period: 'yearly' },
  };

  const result = priceMap[priceId] || { name: 'unknown', period: 'monthly' };
  console.info(`Price ID ${priceId} mapped to: ${result.name} (${result.period})`);
  return result;
}

Deno.serve(async (req) => {
  try {
    // Handle OPTIONS request for CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204 });
    }

    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    // get the signature from the header
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      return new Response('No signature found', { status: 400 });
    }

    // get the raw body
    const body = await req.text();

    // verify the webhook signature
    let event: Stripe.Event;

    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, stripeWebhookSecret);
    } catch (error: any) {
      console.error(`Webhook signature verification failed: ${error.message}`);
      return new Response(`Webhook signature verification failed: ${error.message}`, { status: 400 });
    }

    EdgeRuntime.waitUntil(handleEvent(event));

    return Response.json({ received: true });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function handleEvent(event: Stripe.Event) {
  const stripeData = event?.data?.object ?? {};

  if (!stripeData) {
    return;
  }

  if (!('customer' in stripeData)) {
    return;
  }

  // for one time payments, we only listen for the checkout.session.completed event
  if (event.type === 'payment_intent.succeeded' && event.data.object.invoice === null) {
    return;
  }

  const { customer: customerId } = stripeData;

  if (!customerId || typeof customerId !== 'string') {
    console.error(`No customer received on event: ${JSON.stringify(event)}`);
  } else {
    let isSubscription = true;

    if (event.type === 'checkout.session.completed') {
      const { mode } = stripeData as Stripe.Checkout.Session;

      isSubscription = mode === 'subscription';

      console.info(`Processing ${isSubscription ? 'subscription' : 'one-time payment'} checkout session`);
    }

    const { mode, payment_status } = stripeData as Stripe.Checkout.Session;

    if (isSubscription) {
      console.info(`Starting subscription sync for customer: ${customerId}`);

      // If this is a checkout.session.completed event, extract subscription info immediately
      if (event.type === 'checkout.session.completed') {
        const session = stripeData as Stripe.Checkout.Session;
        if (session.subscription) {
          console.info(`Checkout completed with subscription: ${session.subscription}`);
          // Wait a bit for Stripe to finalize the subscription
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      await syncCustomerFromStripe(customerId);
    } else if (mode === 'payment' && payment_status === 'paid') {
      try {
        // Extract the necessary information from the session
        const session = stripeData as Stripe.Checkout.Session;
        const {
          id: checkout_session_id,
          payment_intent,
          amount_subtotal,
          amount_total,
          currency,
        } = session;

        // Insert the order into the stripe_orders table
        const { error: orderError } = await supabase.from('stripe_orders').insert({
          checkout_session_id,
          payment_intent_id: payment_intent,
          customer_id: customerId,
          amount_subtotal,
          amount_total,
          currency,
          payment_status,
          status: 'completed',
        });

        if (orderError) {
          console.error('Error inserting order:', orderError);
          return;
        }
        console.info(`Successfully processed one-time payment for session: ${checkout_session_id}`);

        // For Premier plan (one-time payment), create a lifetime subscription
        // Get the price ID from line items
        const lineItems = await stripe.checkout.sessions.listLineItems(checkout_session_id);
        if (lineItems.data.length > 0) {
          const priceId = lineItems.data[0].price?.id;
          if (priceId) {
            const planInfo = getPlanNameFromPriceId(priceId);
            console.info(`One-time payment for plan: ${planInfo.name}`);

            // Get user_id from stripe_customers table
            const { data: customerData, error: customerError } = await supabase
              .from('stripe_customers')
              .select('user_id')
              .eq('customer_id', customerId)
              .maybeSingle();

            if (customerError || !customerData) {
              console.error('Error fetching user_id for customer', customerId, customerError);
              return;
            }

            // Create/update subscription record for lifetime access
            const { data: existingSub } = await supabase
              .from('subscriptions')
              .select('id')
              .eq('user_id', customerData.user_id)
              .maybeSingle();

            const subscriptionData = {
              plan_name: planInfo.name,
              billing_period: 'lifetime',
              status: 'active',
              stripe_customer_id: customerId,
              amount_paid: amount_total ? amount_total / 100 : 0,
              currency: currency?.toUpperCase() || 'EUR',
              current_period_start: new Date().toISOString(),
            };

            if (existingSub) {
              // Update existing subscription
              const { error } = await supabase
                .from('subscriptions')
                .update({
                  ...subscriptionData,
                  updated_at: new Date().toISOString(),
                })
                .eq('user_id', customerData.user_id);

              if (error) {
                console.error('Error updating lifetime subscription:', error);
              } else {
                console.info(`Updated lifetime subscription for user ${customerData.user_id}: plan=${planInfo.name}`);
              }
            } else {
              // Insert new subscription
              const { error } = await supabase
                .from('subscriptions')
                .insert({
                  user_id: customerData.user_id,
                  ...subscriptionData,
                });

              if (error) {
                console.error('Error creating lifetime subscription:', error);
              } else {
                console.info(`Created lifetime subscription for user ${customerData.user_id}: plan=${planInfo.name}`);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error processing one-time payment:', error);
      }
    }
  }
}

// based on the excellent https://github.com/t3dotgg/stripe-recommendations
async function syncCustomerFromStripe(customerId: string) {
  try {
    // fetch latest subscription data from Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      limit: 1,
      status: 'all',
      expand: ['data.default_payment_method'],
    });

    // TODO verify if needed
    if (subscriptions.data.length === 0) {
      console.info(`No active subscriptions found for customer: ${customerId}`);
      const { error: noSubError } = await supabase.from('stripe_subscriptions').upsert(
        {
          customer_id: customerId,
          subscription_status: 'not_started',
        },
        {
          onConflict: 'customer_id',
        },
      );

      if (noSubError) {
        console.error('Error updating subscription status:', noSubError);
        throw new Error('Failed to update subscription status in database');
      }
      return;
    }

    // assumes that a customer can only have a single subscription
    const subscription = subscriptions.data[0];
    const priceId = subscription.items.data[0].price.id;
    const planInfo = getPlanNameFromPriceId(priceId);

    console.info(`Processing subscription for customer ${customerId}, plan: ${planInfo.name}, status: ${subscription.status}`);

    // store subscription state in stripe_subscriptions table
    const { error: subError } = await supabase.from('stripe_subscriptions').upsert(
      {
        customer_id: customerId,
        subscription_id: subscription.id,
        price_id: priceId,
        current_period_start: subscription.current_period_start,
        current_period_end: subscription.current_period_end,
        cancel_at_period_end: subscription.cancel_at_period_end,
        ...(subscription.default_payment_method && typeof subscription.default_payment_method !== 'string'
          ? {
              payment_method_brand: subscription.default_payment_method.card?.brand ?? null,
              payment_method_last4: subscription.default_payment_method.card?.last4 ?? null,
            }
          : {}),
        status: subscription.status,
      },
      {
        onConflict: 'customer_id',
      },
    );

    if (subError) {
      console.error('Error syncing subscription to stripe_subscriptions:', subError);
      throw new Error('Failed to sync subscription in database');
    }

    // Get user_id from stripe_customers table
    const { data: customerData, error: customerError } = await supabase
      .from('stripe_customers')
      .select('user_id')
      .eq('customer_id', customerId)
      .maybeSingle();

    if (customerError || !customerData) {
      console.error('Error fetching user_id for customer', customerId, customerError);
      return;
    }

    // Calculate amount paid
    const amountPaid = subscription.items.data[0].price.unit_amount ? subscription.items.data[0].price.unit_amount / 100 : 0;
    const currency = subscription.items.data[0].price.currency || 'eur';

    // Store in subscriptions table for easy access
    // First, check if subscription exists
    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', customerData.user_id)
      .maybeSingle();

    let userSubError;

    if (existingSub) {
      // Update existing subscription
      const { error } = await supabase
        .from('subscriptions')
        .update({
          plan_name: planInfo.name,
          billing_period: planInfo.period,
          status: subscription.status,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscription.id,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          amount_paid: amountPaid,
          currency: currency.toUpperCase(),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', customerData.user_id);
      userSubError = error;
    } else {
      // Insert new subscription
      const { error } = await supabase
        .from('subscriptions')
        .insert({
          user_id: customerData.user_id,
          plan_name: planInfo.name,
          billing_period: planInfo.period,
          status: subscription.status,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscription.id,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          amount_paid: amountPaid,
          currency: currency.toUpperCase(),
        });
      userSubError = error;
    }

    if (userSubError) {
      console.error('Error updating user subscription in subscriptions table:', userSubError);
    } else {
      console.info(`Successfully updated subscription for user ${customerData.user_id}: plan=${planInfo.name}, status=${subscription.status}`);
    }

    console.info(`Successfully synced subscription for customer: ${customerId}`);
  } catch (error) {
    console.error(`Failed to sync subscription for customer ${customerId}:`, error);
    throw error;
  }
}
