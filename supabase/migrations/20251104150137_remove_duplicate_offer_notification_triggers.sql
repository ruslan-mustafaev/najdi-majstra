/*
  # Remove duplicate offer notification triggers

  1. Problem
    - Two sets of triggers creating notifications on client_offers table
    - Old triggers: create_offer_notification_trigger, create_offer_response_notification_trigger
    - New triggers: trigger_notify_master_new_offer, trigger_notify_client_offer_status_change
    - This causes duplicate notifications

  2. Solution
    - Drop old duplicate triggers
    - Keep new triggers with better naming and functionality
*/

-- Drop old duplicate triggers
DROP TRIGGER IF EXISTS create_offer_notification_trigger ON client_offers;
DROP TRIGGER IF EXISTS create_offer_response_notification_trigger ON client_offers;

-- Drop old functions if they exist
DROP FUNCTION IF EXISTS create_offer_notification_for_master();
DROP FUNCTION IF EXISTS create_offer_response_notification();