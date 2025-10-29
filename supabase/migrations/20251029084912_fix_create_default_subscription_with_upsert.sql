/*
  # Fix create_default_subscription to handle unique constraint

  1. Changes
    - Updates create_default_subscription function to use INSERT ... ON CONFLICT
    - Handles case where subscription already exists
    - Prevents 500 errors during user registration
    
  2. Security
    - Maintains SECURITY DEFINER to bypass RLS
    - Only creates Mini plan for new users
*/

CREATE OR REPLACE FUNCTION create_default_subscription()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Create a default Mini subscription using INSERT ... ON CONFLICT
  -- This handles the unique constraint on user_id
  INSERT INTO subscriptions (
    user_id,
    plan_name,
    billing_period,
    status,
    amount_paid,
    currency,
    current_period_start
  ) VALUES (
    NEW.user_id,
    'mini',
    'lifetime',
    'active',
    0,
    'EUR',
    NOW()
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;