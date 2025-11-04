/*
  # Add profession fields to masters table

  1. New Columns
    - `primary_profession` (text) - Main profession of the master
    - `additional_professions` (text[]) - Array of additional professions (optional)

  2. Changes
    - Add primary_profession column with all professions from filter
    - Add additional_professions column as text array
    - Both fields are optional (nullable)
    - No default values to allow masters to choose freely

  3. Available Professions
    From PROJEKTOVÉ PROFESIE:
    - Architekt, Interiérový dizajnér, Krajinný architekt, Statik, Projektant,
      Energetický audítor, Geodet, Požiarny technik, BOZP koordinátor,
      Rozpočtár, Technický dozor, Autorský dozor

    From STAVEBNÉ PROFESIE:
    - Stavbyvedúci, Murár, Betónár, Tesár, Pokrývač, Izolatér,
      Železobetónár, Stavebný robotník, Demolačník, Výkopové práce

    From INTERIÉROVÉ PRÁCE:
    - Maliar, Podlahár, Obkladač, Sadrokartónár, Tapetár, Parkettár,
      Kuchynský dizajnér, Nábytok na mieru, Dekoratér, Čalúnnik

    From TECHNICKÉ PROFESIE:
    - Elektrikár, Vodoinštalatér, Plynár, Kúrenár, Klimatizácie,
      Solárne systémy, Tepelné čerpadlá, Bezpečnostné systémy,
      Smart home, Výťahy, Bazény, Studne

    From EXTERIÉROVÉ PRÁCE:
    - Fasáda, Záhradník, Oplotenie, Terasy, Dlažby, Strešné okná,
      Žľaby, Komíny, Pergoly, Zimné záhrady, Altánky, Osvetlenie exteriéru

    From ŠPECIALIZOVANÉ SLUŽBY:
    - Čistenie a upratovanie, Sťahovanie, Automechanik, Fotografovanie

  4. Usage
    - Master selects one primary_profession (required for profile visibility)
    - Master can optionally add multiple additional_professions
    - Additional professions help with better search visibility
*/

-- Add primary_profession column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'masters' AND column_name = 'primary_profession'
  ) THEN
    ALTER TABLE masters ADD COLUMN primary_profession text;
    COMMENT ON COLUMN masters.primary_profession IS 'Main profession of the master (required for profile visibility)';
  END IF;
END $$;

-- Add additional_professions column as text array
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'masters' AND column_name = 'additional_professions'
  ) THEN
    ALTER TABLE masters ADD COLUMN additional_professions text[] DEFAULT '{}';
    COMMENT ON COLUMN masters.additional_professions IS 'Additional professions for better search visibility (optional)';
  END IF;
END $$;

-- Update existing masters: copy 'profession' to 'primary_profession' if not set
UPDATE masters
SET primary_profession = profession
WHERE primary_profession IS NULL AND profession IS NOT NULL AND profession != '';

-- Add index for faster profession searches
CREATE INDEX IF NOT EXISTS idx_masters_primary_profession ON masters(primary_profession);
CREATE INDEX IF NOT EXISTS idx_masters_additional_professions ON masters USING GIN(additional_professions);
