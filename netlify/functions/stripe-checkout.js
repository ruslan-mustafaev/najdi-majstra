const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

exports.handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'STRIPE_SECRET_KEY is not configured' }),
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { price_id, success_url, cancel_url, customer_email, user_id, mode } = body;

    if (!price_id) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'price_id is required' }),
      };
    }

    let customerId = null;

    if (user_id && mode !== 'payment') {
      const { data: existingCustomer } = await supabase
        .from('stripe_customers')
        .select('customer_id')
        .eq('user_id', user_id)
        .maybeSingle();

      if (existingCustomer?.customer_id) {
        customerId = existingCustomer.customer_id;

        const subscriptions = await stripe.subscriptions.list({
          customer: customerId,
          status: 'active',
          limit: 100,
        });

        for (const subscription of subscriptions.data) {
          console.log(`Canceling existing subscription: ${subscription.id}`);
          await stripe.subscriptions.cancel(subscription.id);
        }
      }
    }

    const sessionParams = {
      payment_method_types: ['card'],
      line_items: [
        {
          price: price_id,
          quantity: 1,
        },
      ],
      mode: mode || 'subscription',
      success_url: success_url || `${process.env.URL || event.headers.origin}/subscription?success=true`,
      cancel_url: cancel_url || `${process.env.URL || event.headers.origin}/subscription?canceled=true`,
      metadata: {
        user_id: user_id || '',
      },
    };

    if (customerId) {
      sessionParams.customer = customerId;
    } else if (customer_email) {
      sessionParams.customer_email = customer_email;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: session.url,
        session_id: session.id,
      }),
    };

  } catch (error) {
    console.error('Stripe checkout error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: 'Failed to create checkout session',
        message: error.message || 'Unknown error',
      }),
    };
  }
};
