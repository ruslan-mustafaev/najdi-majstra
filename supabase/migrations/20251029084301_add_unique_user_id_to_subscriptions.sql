/*
  # Add unique constraint on user_id in subscriptions table

  1. Changes
    - Adds unique constraint on user_id column
    - Ensures each user can have only one active subscription record
    - Required for upsert operations in stripe webhook
    
  2. Notes
    - This allows the webhook to use onConflict: 'user_id' to update existing subscriptions
*/

-- Add unique constraint on user_id
ALTER TABLE subscriptions 
ADD CONSTRAINT subscriptions_user_id_unique UNIQUE (user_id);