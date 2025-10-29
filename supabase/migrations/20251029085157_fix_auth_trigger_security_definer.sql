/*
  # Fix auth user trigger to bypass RLS

  1. Changes
    - Updates create_free_subscription_for_new_user to use SECURITY DEFINER
    - Adds ON CONFLICT handling for unique constraint
    - Ensures new users get Mini subscription on registration
    
  2. Security
    - SECURITY DEFINER allows function to bypass RLS
    - Only creates subscription during user registration
*/

CREATE OR REPLACE FUNCTION create_free_subscription_for_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO subscriptions (
    user_id,
    plan_name,
    billing_period,
    status,
    amount_paid,
    currency,
    current_period_start
  ) VALUES (
    NEW.id,
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