/*
  # Fix Slug Generation - Update Function with Unique Check

  1. Changes
    - Replace set_master_slug function with version that checks for uniqueness
    - Adds counter suffix if slug already exists
    - Works with both INSERT and UPDATE operations

  2. Security
    - Function uses SECURITY INVOKER for proper permissions
*/

-- Drop and recreate the function with unique slug generation
CREATE OR REPLACE FUNCTION set_master_slug()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY INVOKER 
SET search_path = public
AS $$
DECLARE
  base_slug text;
  final_slug text;
  slug_exists boolean;
  counter int := 0;
  random_suffix text;
BEGIN
  -- Only generate slug on INSERT or if slug is NULL
  IF (TG_OP = 'INSERT' AND (NEW.slug IS NULL OR NEW.slug = '')) OR 
     (TG_OP = 'UPDATE' AND (NEW.slug IS NULL OR NEW.slug = '')) THEN
    
    -- Generate base slug from name and profession
    base_slug := generate_slug(NEW.name || '-' || NEW.profession);
    final_slug := base_slug;
    
    -- Check if slug exists and add random suffix if needed
    SELECT EXISTS(SELECT 1 FROM masters WHERE slug = final_slug AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid))
    INTO slug_exists;
    
    IF slug_exists THEN
      -- Generate random 8-character suffix
      random_suffix := substring(md5(random()::text || clock_timestamp()::text) from 1 for 8);
      final_slug := base_slug || '-' || random_suffix;
    END IF;
    
    NEW.slug := final_slug;
  END IF;
  
  RETURN NEW;
END;
$$;