/*
  # Create subscriptions view for easy monitoring

  1. New View
    - `user_subscriptions_view` - Shows all active subscriptions with user details
      - User email and ID
      - Plan name and billing period
      - Subscription status and dates
      - Payment amount and currency
      - Stripe customer and subscription IDs
  
  2. Purpose
    - Easy monitoring of who purchased which plan
    - Quick access to subscription details
    - Human-readable subscription information
*/

-- Create a view to easily see user subscriptions
CREATE OR REPLACE VIEW user_subscriptions_view AS
SELECT 
  s.id,
  s.user_id,
  m.email as user_email,
  m.name as user_name,
  s.plan_name,
  s.billing_period,
  s.status,
  s.amount_paid,
  s.currency,
  s.stripe_customer_id,
  s.stripe_subscription_id,
  s.current_period_start,
  s.current_period_end,
  s.created_at,
  s.updated_at
FROM subscriptions s
LEFT JOIN masters m ON m.user_id = s.user_id
ORDER BY s.created_at DESC;

-- Grant access to authenticated users to view their own subscriptions
GRANT SELECT ON user_subscriptions_view TO authenticated;

-- Create RLS policy for the view
ALTER VIEW user_subscriptions_view SET (security_invoker = on);