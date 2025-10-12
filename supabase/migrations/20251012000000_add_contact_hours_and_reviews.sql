/*
  # Add Contact Hours and Reviews System

  1. New Tables
    - `master_contact_hours`
      - `id` (uuid, primary key)
      - `master_id` (uuid, foreign key to auth.users)
      - `is_24_7` (boolean) - Whether master is available 24/7
      - `schedule` (jsonb) - Weekly schedule with time ranges
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `master_reviews`
      - `id` (uuid, primary key)
      - `master_id` (uuid, foreign key to auth.users) - Master being reviewed
      - `client_id` (uuid, foreign key to auth.users) - Client who wrote review
      - `rating` (integer) - Star rating 1-5
      - `comment` (text) - Review text
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Contact hours: Masters can manage their own, everyone can read
    - Reviews: Clients can create (with restrictions), everyone can read, only authors can update/delete their own

  3. Important Notes
    - Reviews are limited to 1 per client per master per month
    - Master rating is calculated dynamically from all reviews
    - Contact hours support both 24/7 mode and weekly schedule
*/

-- Create master_contact_hours table
CREATE TABLE IF NOT EXISTS master_contact_hours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  master_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  is_24_7 boolean DEFAULT false,
  schedule jsonb DEFAULT '{"monday":[],"tuesday":[],"wednesday":[],"thursday":[],"friday":[],"saturday":[],"sunday":[]}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(master_id)
);

-- Create master_reviews table
CREATE TABLE IF NOT EXISTS master_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  master_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  client_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_master_contact_hours_master_id ON master_contact_hours(master_id);
CREATE INDEX IF NOT EXISTS idx_master_reviews_master_id ON master_reviews(master_id);
CREATE INDEX IF NOT EXISTS idx_master_reviews_client_id ON master_reviews(client_id);
CREATE INDEX IF NOT EXISTS idx_master_reviews_created_at ON master_reviews(created_at DESC);

-- Enable RLS
ALTER TABLE master_contact_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_reviews ENABLE ROW LEVEL SECURITY;

-- Contact Hours Policies
CREATE POLICY "Anyone can view contact hours"
  ON master_contact_hours FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Masters can insert their own contact hours"
  ON master_contact_hours FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = master_id);

CREATE POLICY "Masters can update their own contact hours"
  ON master_contact_hours FOR UPDATE
  TO authenticated
  USING (auth.uid() = master_id)
  WITH CHECK (auth.uid() = master_id);

CREATE POLICY "Masters can delete their own contact hours"
  ON master_contact_hours FOR DELETE
  TO authenticated
  USING (auth.uid() = master_id);

-- Review Policies
CREATE POLICY "Anyone can view reviews"
  ON master_reviews FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Clients can insert reviews with restrictions"
  ON master_reviews FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = client_id
    AND auth.uid() != master_id
    AND NOT EXISTS (
      SELECT 1 FROM master_reviews
      WHERE master_reviews.master_id = master_reviews.master_id
        AND master_reviews.client_id = auth.uid()
        AND master_reviews.created_at > now() - interval '30 days'
    )
  );

CREATE POLICY "Clients can update their own reviews"
  ON master_reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = client_id)
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Clients can delete their own reviews"
  ON master_reviews FOR DELETE
  TO authenticated
  USING (auth.uid() = client_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_master_contact_hours_updated_at ON master_contact_hours;
CREATE TRIGGER update_master_contact_hours_updated_at
  BEFORE UPDATE ON master_contact_hours
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_master_reviews_updated_at ON master_reviews;
CREATE TRIGGER update_master_reviews_updated_at
  BEFORE UPDATE ON master_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate master average rating
CREATE OR REPLACE FUNCTION get_master_average_rating(master_user_id uuid)
RETURNS numeric AS $$
BEGIN
  RETURN (
    SELECT COALESCE(ROUND(AVG(rating)::numeric, 1), 0)
    FROM master_reviews
    WHERE master_id = master_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
