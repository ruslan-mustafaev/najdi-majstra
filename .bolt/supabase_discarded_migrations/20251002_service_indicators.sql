/*
  # Service Indicators and Availability Status

  1. Changes
    - Add 'is_available' column to masters table to track real-time availability status
    - Add 'service_regular' column for regular service indicator (blue)
    - Add 'service_urgent' column for urgent repair indicator (red)
    - Add 'service_realization' column for realization/execution indicator (green)

  2. Security
    - RLS policies already exist for masters table
    - Masters can update their own indicators
*/

DO $$
BEGIN
  -- Add is_available column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'masters' AND column_name = 'is_available'
  ) THEN
    ALTER TABLE masters ADD COLUMN is_available boolean DEFAULT false;
  END IF;

  -- Add service_regular column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'masters' AND column_name = 'service_regular'
  ) THEN
    ALTER TABLE masters ADD COLUMN service_regular boolean DEFAULT false;
  END IF;

  -- Add service_urgent column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'masters' AND column_name = 'service_urgent'
  ) THEN
    ALTER TABLE masters ADD COLUMN service_urgent boolean DEFAULT false;
  END IF;

  -- Add service_realization column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'masters' AND column_name = 'service_realization'
  ) THEN
    ALTER TABLE masters ADD COLUMN service_realization boolean DEFAULT false;
  END IF;
END $$;
