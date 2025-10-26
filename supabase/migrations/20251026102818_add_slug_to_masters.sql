/*
  # Add slug field to masters table

  1. Changes
    - Add `slug` column to `masters` table (text, unique, not null)
    - Create index on slug for faster lookups
    - Generate slugs from existing master names
    - Add trigger to auto-generate slug on insert/update

  2. Security
    - No RLS changes needed (inherits existing policies)
*/

-- Add slug column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'masters' AND column_name = 'slug'
  ) THEN
    ALTER TABLE masters ADD COLUMN slug text;
  END IF;
END $$;

-- Function to generate slug from name
CREATE OR REPLACE FUNCTION generate_slug(name text)
RETURNS text AS $$
DECLARE
  slug text;
BEGIN
  -- Convert to lowercase, replace spaces with hyphens, remove special chars
  slug := lower(regexp_replace(name, '[^a-zA-Z0-9\s-]', '', 'g'));
  slug := regexp_replace(slug, '\s+', '-', 'g');
  slug := regexp_replace(slug, '-+', '-', 'g');
  slug := trim(both '-' from slug);
  RETURN slug;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Update existing masters with slugs based on their names
UPDATE masters
SET slug = generate_slug(name) || '-' || substring(id::text from 1 for 8)
WHERE slug IS NULL;

-- Make slug unique and not null
ALTER TABLE masters ALTER COLUMN slug SET NOT NULL;

-- Create unique index on slug
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE tablename = 'masters' AND indexname = 'masters_slug_key'
  ) THEN
    CREATE UNIQUE INDEX masters_slug_key ON masters(slug);
  END IF;
END $$;

-- Function to auto-generate slug on insert/update
CREATE OR REPLACE FUNCTION set_master_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_slug(NEW.name) || '-' || substring(NEW.id::text from 1 for 8);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-generating slug
DROP TRIGGER IF EXISTS master_slug_trigger ON masters;
CREATE TRIGGER master_slug_trigger
  BEFORE INSERT OR UPDATE OF name ON masters
  FOR EACH ROW
  EXECUTE FUNCTION set_master_slug();