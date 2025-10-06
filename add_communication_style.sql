/*
  # Add communication_style field to masters table

  1. New Column
    - `communication_style` (text, nullable)
      - Stores the preferred communication style of the master
      - Examples: "Profesionálne a vecne", "Priateľsky a uvoľnene", "Rýchlo a jasno"

  2. Changes
    - Add new column to masters table
    - No RLS changes needed (covered by existing policies)
*/

-- Add communication_style column to masters table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'masters' AND column_name = 'communication_style'
  ) THEN
    ALTER TABLE masters ADD COLUMN communication_style text;
    COMMENT ON COLUMN masters.communication_style IS 'Preferred communication style of the master';
  END IF;
END $$;
