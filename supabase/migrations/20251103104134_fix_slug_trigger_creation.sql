/*
  # Fix Slug Trigger - Create Missing Trigger

  1. Changes
    - Drop existing trigger if exists
    - Create trigger that calls set_master_slug function on INSERT and UPDATE
    - This ensures unique slugs are generated automatically

  2. Security
    - Trigger runs BEFORE INSERT OR UPDATE
*/

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS set_master_slug_trigger ON masters;

-- Create trigger for slug generation
CREATE TRIGGER set_master_slug_trigger
  BEFORE INSERT OR UPDATE ON masters
  FOR EACH ROW
  EXECUTE FUNCTION set_master_slug();