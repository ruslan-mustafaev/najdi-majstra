/*
  # Fix Review Insert Policy

  1. Changes
    - Drop and recreate the insert policy for master_reviews
    - Fix the bug where master_id was compared to itself instead of the new master being reviewed
    - This was preventing clients from leaving reviews for multiple different masters

  2. Security
    - Clients can only leave reviews as themselves (client_id = auth.uid())
    - Clients cannot review themselves
    - Clients can only leave one review per master per 30 days
*/

-- Drop the existing broken policy
DROP POLICY IF EXISTS "Clients can insert reviews with restrictions" ON master_reviews;

-- Create the corrected policy
CREATE POLICY "Clients can insert reviews with restrictions"
  ON master_reviews FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = client_id
    AND auth.uid() != master_id
    AND NOT EXISTS (
      SELECT 1 FROM master_reviews mr
      WHERE mr.master_id = master_reviews.master_id
        AND mr.client_id = auth.uid()
        AND mr.created_at > now() - interval '30 days'
    )
  );
