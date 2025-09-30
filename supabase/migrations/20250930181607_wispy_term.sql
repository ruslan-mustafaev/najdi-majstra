/*
  # Create master portfolio table

  1. New Tables
    - `master_portfolio`
      - `id` (uuid, primary key)
      - `master_id` (uuid, foreign key to masters table)
      - `project_title` (text, название проекта)
      - `location` (text, локация проекта)
      - `completion_date` (date, дата завершения)
      - `duration_months` (integer, длительность в месяцах)
      - `difficulty_rating` (integer, рейтинг сложности 1-5)
      - `description` (text, описание проекта)
      - `project_images` (text[], массив URL фотографий)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `master_portfolio` table
    - Add policies for masters to manage their own portfolio
    - Add policy for public to view active portfolios

  3. Indexes
    - Index on master_id for fast queries
    - Index on completion_date for sorting
*/

-- Create master_portfolio table
CREATE TABLE IF NOT EXISTS master_portfolio (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  master_id uuid NOT NULL REFERENCES masters(id) ON DELETE CASCADE,
  project_title text NOT NULL,
  location text NOT NULL,
  completion_date date,
  duration_months integer DEFAULT 1 CHECK (duration_months > 0 AND duration_months <= 60),
  difficulty_rating integer DEFAULT 3 CHECK (difficulty_rating >= 1 AND difficulty_rating <= 5),
  description text,
  project_images text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_master_portfolio_master_id ON master_portfolio(master_id);
CREATE INDEX IF NOT EXISTS idx_master_portfolio_completion_date ON master_portfolio(completion_date DESC);
CREATE INDEX IF NOT EXISTS idx_master_portfolio_created_at ON master_portfolio(created_at DESC);

-- Enable RLS
ALTER TABLE master_portfolio ENABLE ROW LEVEL SECURITY;

-- Policy: Masters can manage their own portfolio
CREATE POLICY "Masters can manage own portfolio"
  ON master_portfolio
  FOR ALL
  TO authenticated
  USING (
    master_id IN (
      SELECT id FROM masters WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    master_id IN (
      SELECT id FROM masters WHERE user_id = auth.uid()
    )
  );

-- Policy: Public can view active portfolios
CREATE POLICY "Public can view portfolios"
  ON master_portfolio
  FOR SELECT
  TO public
  USING (
    master_id IN (
      SELECT id FROM masters 
      WHERE is_active = true 
      AND profile_completed = true
      AND (is_deleted = false OR is_deleted IS NULL)
    )
  );

-- Function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_master_portfolio_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function
CREATE TRIGGER update_master_portfolio_updated_at
  BEFORE UPDATE ON master_portfolio
  FOR EACH ROW
  EXECUTE FUNCTION update_master_portfolio_updated_at();