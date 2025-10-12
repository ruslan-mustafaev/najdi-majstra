/*
  # Add client name to reviews

  1. Changes
    - Add `client_name` column to `master_reviews` table to store client's name
    - This allows displaying client names without needing to join with auth.users table
    - Name will be stored when review is created from user metadata

  2. Notes
    - Existing reviews will have NULL client_name (can show "Клиент" as fallback)
    - New reviews will populate this field from user's metadata
*/

-- Add client_name column to master_reviews
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'master_reviews' AND column_name = 'client_name'
  ) THEN
    ALTER TABLE master_reviews ADD COLUMN client_name text;
  END IF;
END $$;
