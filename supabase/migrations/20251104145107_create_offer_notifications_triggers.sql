/*
  # Create triggers for automatic offer notifications

  1. New Triggers
    - Trigger on INSERT to client_offers: Creates notification for master when new offer is submitted
    - Trigger on UPDATE to client_offers: Creates notification for client when offer status changes
    - Automatically populates master_id in notifications from client_offers

  2. Purpose
    - Automate notification creation process
    - Ensure all offer events generate appropriate notifications
    - Include master information for client notifications
*/

-- Function to create notification when new offer is submitted (for master)
CREATE OR REPLACE FUNCTION notify_master_new_offer()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create notification for master about new offer
  INSERT INTO offer_notifications (
    user_id,
    offer_id,
    type,
    is_read,
    master_id
  )
  SELECT 
    m.user_id,
    NEW.id,
    'new_offer',
    false,
    NEW.master_id
  FROM masters m
  WHERE m.id = NEW.master_id;
  
  RETURN NEW;
END;
$$;

-- Function to create notification when offer status changes (for client)
CREATE OR REPLACE FUNCTION notify_client_offer_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only create notification if status changed from 'pending' to 'accepted' or 'rejected'
  IF OLD.status = 'pending' AND (NEW.status = 'accepted' OR NEW.status = 'rejected') THEN
    -- Create notification for client
    IF NEW.client_user_id IS NOT NULL THEN
      INSERT INTO offer_notifications (
        user_id,
        offer_id,
        type,
        is_read,
        master_name,
        master_id
      )
      SELECT 
        NEW.client_user_id,
        NEW.id,
        CASE 
          WHEN NEW.status = 'accepted' THEN 'offer_accepted'
          WHEN NEW.status = 'rejected' THEN 'offer_rejected'
        END,
        false,
        m.name,
        m.id
      FROM masters m
      WHERE m.id = NEW.master_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS trigger_notify_master_new_offer ON client_offers;
DROP TRIGGER IF EXISTS trigger_notify_client_offer_status_change ON client_offers;

-- Create trigger for new offers (notifies master)
CREATE TRIGGER trigger_notify_master_new_offer
  AFTER INSERT ON client_offers
  FOR EACH ROW
  EXECUTE FUNCTION notify_master_new_offer();

-- Create trigger for status changes (notifies client)
CREATE TRIGGER trigger_notify_client_offer_status_change
  AFTER UPDATE ON client_offers
  FOR EACH ROW
  EXECUTE FUNCTION notify_client_offer_status_change();