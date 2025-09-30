/*
  # Master Availability Calendar

  1. New Tables
    - `master_availability`
      - `id` (uuid, primary key)
      - `master_id` (uuid, foreign key to masters table)
      - `date` (date, the specific date)
      - `status` (text, one of: 'available', 'busy', 'partially-busy', 'unavailable')
      - `work_hours_start` (time, start of work hours)
      - `work_hours_end` (time, end of work hours)
      - `notes` (text, optional notes about the day)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `master_availability` table
    - Add policy for authenticated users to read availability data
    - Add policy for master to manage their own availability

  3. Indexes
    - Index on `master_id` for fast lookups
    - Index on `date` for date-based queries
    - Composite index on `master_id` and `date` for optimal performance
*/

-- Create master_availability table
CREATE TABLE IF NOT EXISTS master_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  master_id uuid NOT NULL REFERENCES masters(id) ON DELETE CASCADE,
  date date NOT NULL,
  status text NOT NULL CHECK (status IN ('available', 'busy', 'partially-busy', 'unavailable')),
  work_hours_start time DEFAULT '08:00:00',
  work_hours_end time DEFAULT '17:00:00',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(master_id, date)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_master_availability_master_id ON master_availability(master_id);
CREATE INDEX IF NOT EXISTS idx_master_availability_date ON master_availability(date);
CREATE INDEX IF NOT EXISTS idx_master_availability_master_date ON master_availability(master_id, date);

-- Enable RLS
ALTER TABLE master_availability ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view availability (for clients to see when master is available)
CREATE POLICY "Anyone can view master availability"
  ON master_availability
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Masters can insert their own availability
CREATE POLICY "Masters can insert own availability"
  ON master_availability
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM masters
      WHERE masters.id = master_availability.master_id
      AND masters.user_id = auth.uid()
    )
  );

-- Policy: Masters can update their own availability
CREATE POLICY "Masters can update own availability"
  ON master_availability
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM masters
      WHERE masters.id = master_availability.master_id
      AND masters.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM masters
      WHERE masters.id = master_availability.master_id
      AND masters.user_id = auth.uid()
    )
  );

-- Policy: Masters can delete their own availability
CREATE POLICY "Masters can delete own availability"
  ON master_availability
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM masters
      WHERE masters.id = master_availability.master_id
      AND masters.user_id = auth.uid()
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_master_availability_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS master_availability_updated_at ON master_availability;
CREATE TRIGGER master_availability_updated_at
  BEFORE UPDATE ON master_availability
  FOR EACH ROW
  EXECUTE FUNCTION update_master_availability_updated_at();
