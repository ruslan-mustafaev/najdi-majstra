/*
  # Add CASCADE delete for user-related foreign keys
  
  This migration updates all foreign key constraints that reference auth.users
  to automatically delete related records when a user is deleted.
  
  ## Changes
  
  1. **masters table**
     - Update `user_id` FK to CASCADE delete
  
  2. **subscriptions table**
     - Update `user_id` FK to CASCADE delete
  
  3. **client_offers table**
     - Update `client_user_id` FK to SET NULL (offers should remain for history)
  
  4. **master_reviews table**
     - Update `master_id` and `client_id` FKs to CASCADE delete
  
  5. **offer_notifications table**
     - Update `user_id` FK to CASCADE delete
  
  6. **payment_history table**
     - Update `user_id` FK to SET NULL (payment history should remain)
  
  7. **stripe_customers table**
     - Update `user_id` FK to CASCADE delete
  
  ## Important Notes
  
  - This allows safe deletion of user accounts
  - Some tables use SET NULL to preserve historical data
  - Most tables use CASCADE to remove user-specific data
*/

-- Drop and recreate masters.user_id FK with CASCADE
ALTER TABLE masters 
  DROP CONSTRAINT IF EXISTS masters_user_id_fkey,
  ADD CONSTRAINT masters_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES auth.users(id) 
    ON DELETE CASCADE;

-- Drop and recreate subscriptions.user_id FK with CASCADE
ALTER TABLE subscriptions 
  DROP CONSTRAINT IF EXISTS subscriptions_user_id_fkey,
  ADD CONSTRAINT subscriptions_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES auth.users(id) 
    ON DELETE CASCADE;

-- Drop and recreate client_offers.client_user_id FK with SET NULL
ALTER TABLE client_offers 
  DROP CONSTRAINT IF EXISTS client_offers_client_user_id_fkey,
  ADD CONSTRAINT client_offers_client_user_id_fkey 
    FOREIGN KEY (client_user_id) 
    REFERENCES auth.users(id) 
    ON DELETE SET NULL;

-- Drop and recreate master_reviews FKs with CASCADE
ALTER TABLE master_reviews 
  DROP CONSTRAINT IF EXISTS master_reviews_master_id_fkey,
  ADD CONSTRAINT master_reviews_master_id_fkey 
    FOREIGN KEY (master_id) 
    REFERENCES auth.users(id) 
    ON DELETE CASCADE;

ALTER TABLE master_reviews 
  DROP CONSTRAINT IF EXISTS master_reviews_client_id_fkey,
  ADD CONSTRAINT master_reviews_client_id_fkey 
    FOREIGN KEY (client_id) 
    REFERENCES auth.users(id) 
    ON DELETE CASCADE;

-- Drop and recreate offer_notifications.user_id FK with CASCADE
ALTER TABLE offer_notifications 
  DROP CONSTRAINT IF EXISTS offer_notifications_user_id_fkey,
  ADD CONSTRAINT offer_notifications_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES auth.users(id) 
    ON DELETE CASCADE;

-- Drop and recreate payment_history.user_id FK with SET NULL
ALTER TABLE payment_history 
  DROP CONSTRAINT IF EXISTS payment_history_user_id_fkey,
  ADD CONSTRAINT payment_history_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES auth.users(id) 
    ON DELETE SET NULL;

-- Drop and recreate stripe_customers.user_id FK with CASCADE
ALTER TABLE stripe_customers 
  DROP CONSTRAINT IF EXISTS stripe_customers_user_id_fkey,
  ADD CONSTRAINT stripe_customers_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES auth.users(id) 
    ON DELETE CASCADE;
