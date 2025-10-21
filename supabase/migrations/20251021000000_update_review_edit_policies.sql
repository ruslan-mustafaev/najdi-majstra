/*
  # Update Review Edit and Delete Policies

  1. Changes
    - Update the UPDATE policy for master_reviews to restrict editing to 24 hours
    - Update the DELETE policy for master_reviews to restrict deletion to 24 hours

  2. Security
    - Clients can only edit/delete their own reviews
    - Edits and deletions are only allowed within 24 hours of creation
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Clients can update their own reviews" ON master_reviews;
DROP POLICY IF EXISTS "Clients can delete their own reviews" ON master_reviews;

-- Recreate UPDATE policy with 24-hour restriction
CREATE POLICY "Clients can update their own reviews within 24 hours"
  ON master_reviews FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = client_id
    AND created_at > now() - interval '24 hours'
  )
  WITH CHECK (
    auth.uid() = client_id
    AND created_at > now() - interval '24 hours'
  );

-- Recreate DELETE policy with 24-hour restriction
CREATE POLICY "Clients can delete their own reviews within 24 hours"
  ON master_reviews FOR DELETE
  TO authenticated
  USING (
    auth.uid() = client_id
    AND created_at > now() - interval '24 hours'
  );
