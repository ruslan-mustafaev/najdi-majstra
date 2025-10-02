-- Add service indicators and availability columns to masters table

-- Add is_available column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'masters' AND column_name = 'is_available'
  ) THEN
    ALTER TABLE masters ADD COLUMN is_available boolean DEFAULT false;
    RAISE NOTICE 'Added is_available column';
  ELSE
    RAISE NOTICE 'is_available column already exists';
  END IF;
END $$;

-- Add service_regular column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'masters' AND column_name = 'service_regular'
  ) THEN
    ALTER TABLE masters ADD COLUMN service_regular boolean DEFAULT false;
    RAISE NOTICE 'Added service_regular column';
  ELSE
    RAISE NOTICE 'service_regular column already exists';
  END IF;
END $$;

-- Add service_urgent column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'masters' AND column_name = 'service_urgent'
  ) THEN
    ALTER TABLE masters ADD COLUMN service_urgent boolean DEFAULT false;
    RAISE NOTICE 'Added service_urgent column';
  ELSE
    RAISE NOTICE 'service_urgent column already exists';
  END IF;
END $$;

-- Add service_realization column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'masters' AND column_name = 'service_realization'
  ) THEN
    ALTER TABLE masters ADD COLUMN service_realization boolean DEFAULT false;
    RAISE NOTICE 'Added service_realization column';
  ELSE
    RAISE NOTICE 'service_realization column already exists';
  END IF;
END $$;

-- Verify the columns were added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'masters'
  AND column_name IN ('is_available', 'service_regular', 'service_urgent', 'service_realization')
ORDER BY column_name;
