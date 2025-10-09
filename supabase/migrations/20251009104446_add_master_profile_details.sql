/*
  # Add Master Profile Details Fields

  1. New Columns
    - `experience_years` (integer) - Years of experience (Skúsenosti)
    - `team_type` (text) - Team or individual work preference (Tím / Individuálne)
    - `service_area` (text) - Area of operation (Oblasť pôsobenia: Lokálne / Lokálne + 50km / etc.)
    - `hourly_rate_min` (numeric) - Minimum hourly rate (Cenové rozpätie - min)
    - `hourly_rate_max` (numeric) - Maximum hourly rate (Cenové rozpätie - max)
    - `certificates` (text) - Professional certifications list (Odborná spôsobilosť)
  
  2. Changes
    - Add new fields to masters table for profile customization
    - Fields allow masters to configure what clients see in their profile
    - All fields are optional and can be set via Moj Profil settings
  
  3. Security
    - No RLS changes needed - existing policies cover these fields
    - Fields are editable by profile owner only
    - Publicly visible when profile is active and completed
*/

-- Add experience years field
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'masters' AND column_name = 'experience_years'
  ) THEN
    ALTER TABLE masters ADD COLUMN experience_years integer DEFAULT 0;
    COMMENT ON COLUMN masters.experience_years IS 'Years of professional experience';
  END IF;
END $$;

-- Add team type field
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'masters' AND column_name = 'team_type'
  ) THEN
    ALTER TABLE masters ADD COLUMN team_type text DEFAULT 'individuálne';
    COMMENT ON COLUMN masters.team_type IS 'Team or individual work: individuálne, tím';
  END IF;
END $$;

-- Add service area field
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'masters' AND column_name = 'service_area'
  ) THEN
    ALTER TABLE masters ADD COLUMN service_area text DEFAULT 'lokálne';
    COMMENT ON COLUMN masters.service_area IS 'Area of operation: lokálne, lokálne + 50km, celé slovensko, etc.';
  END IF;
END $$;

-- Add minimum hourly rate field
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'masters' AND column_name = 'hourly_rate_min'
  ) THEN
    ALTER TABLE masters ADD COLUMN hourly_rate_min numeric(10, 2) DEFAULT 0;
    COMMENT ON COLUMN masters.hourly_rate_min IS 'Minimum hourly rate in EUR';
  END IF;
END $$;

-- Add maximum hourly rate field
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'masters' AND column_name = 'hourly_rate_max'
  ) THEN
    ALTER TABLE masters ADD COLUMN hourly_rate_max numeric(10, 2) DEFAULT 0;
    COMMENT ON COLUMN masters.hourly_rate_max IS 'Maximum hourly rate in EUR';
  END IF;
END $$;

-- Add certificates field
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'masters' AND column_name = 'certificates'
  ) THEN
    ALTER TABLE masters ADD COLUMN certificates text DEFAULT '';
    COMMENT ON COLUMN masters.certificates IS 'Professional certifications and qualifications (text format: 1) cert1 2) cert2...)';
  END IF;
END $$;