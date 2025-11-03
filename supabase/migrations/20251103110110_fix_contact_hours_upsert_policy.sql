/*
  # Fix Contact Hours Upsert Policy

  1. Changes
    - Drop existing INSERT and UPDATE policies for master_contact_hours
    - Create new combined policies that support upsert operations
    - Ensure masters can both insert new records and update existing ones through upsert
  
  2. Security
    - Maintains ownership check (master must belong to authenticated user)
    - Works correctly with ON CONFLICT (upsert) operations
*/

-- Drop old policies
DROP POLICY IF EXISTS "Masters can insert their own contact hours" ON master_contact_hours;
DROP POLICY IF EXISTS "Masters can update their own contact hours" ON master_contact_hours;

-- Create new INSERT policy
CREATE POLICY "Masters can insert their own contact hours"
  ON master_contact_hours
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM masters
      WHERE masters.id = master_contact_hours.master_id
      AND masters.user_id = auth.uid()
    )
  );

-- Create new UPDATE policy
CREATE POLICY "Masters can update their own contact hours"
  ON master_contact_hours
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM masters
      WHERE masters.id = master_contact_hours.master_id
      AND masters.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM masters
      WHERE masters.id = master_contact_hours.master_id
      AND masters.user_id = auth.uid()
    )
  );
