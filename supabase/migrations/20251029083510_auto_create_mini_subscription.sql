/*
  # Auto-create Mini subscription for all masters

  1. Changes
    - Creates a trigger that automatically creates a "Mini" (free) subscription when a master profile is created
    - Ensures every master has a default subscription plan visible in their dashboard
    
  2. Security
    - Function runs with SECURITY DEFINER to bypass RLS
    - Only creates subscription if none exists for the user
    - Creates lifetime Mini plan (free tier)
*/

-- Function to create default subscription
CREATE OR REPLACE FUNCTION create_default_subscription()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if user already has an active subscription
  IF NOT EXISTS (
    SELECT 1 FROM subscriptions 
    WHERE user_id = NEW.user_id 
    AND status = 'active'
  ) THEN
    -- Create a default Mini subscription
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
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS trigger_create_default_subscription ON masters;

-- Create trigger on masters table
CREATE TRIGGER trigger_create_default_subscription
  AFTER INSERT ON masters
  FOR EACH ROW
  EXECUTE FUNCTION create_default_subscription();