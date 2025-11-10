/*
  # Add age and website fields to masters table

  1. Changes
    - Add `age` column (integer, nullable) - for internal use only in master's dashboard
    - Add `website` column (text, nullable) - will be displayed on public profile
  
  2. Notes
    - Age field will only be visible in master's own dashboard settings
    - Website field will be visible on public master profile in contacts section
    - Both fields are optional
*/

-- Add age column (private - only for master's dashboard)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'masters' AND column_name = 'age'
  ) THEN
    ALTER TABLE masters ADD COLUMN age INTEGER;
  END IF;
END $$;

-- Add website column (public - displayed on profile)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'masters' AND column_name = 'website'
  ) THEN
    ALTER TABLE masters ADD COLUMN website TEXT;
  END IF;
END $$;

-- Add comment to clarify usage
COMMENT ON COLUMN masters.age IS 'Master age - displayed only in their own dashboard, not on public profile';
COMMENT ON COLUMN masters.website IS 'Master website URL - displayed publicly on their profile in contacts section';
