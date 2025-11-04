/*
  # Add master_id to offer_notifications

  1. Changes
    - Add `master_id` column to `offer_notifications` table
    - Populate existing records with master_id from client_offers
    - This allows direct linking to master profiles from notifications

  2. Purpose
    - Enable clients to click on master name in notifications to view their profile
    - Improve user experience by providing direct navigation to master profiles
*/

-- Add master_id column
ALTER TABLE offer_notifications 
ADD COLUMN IF NOT EXISTS master_id uuid REFERENCES masters(id) ON DELETE CASCADE;

-- Populate existing records with master_id from client_offers
UPDATE offer_notifications
SET master_id = (
  SELECT master_id 
  FROM client_offers 
  WHERE client_offers.id = offer_notifications.offer_id
)
WHERE master_id IS NULL;