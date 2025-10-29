/*
  # Fix Slug Generation - Make it Unique

  1. Changes
    - Update set_master_slug function to generate unique slugs by adding random suffix
    - Only generate new slug on INSERT, not UPDATE
    - This prevents duplicate key violations

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
BEGIN
  -- Only generate slug on INSERT or if slug is NULL
  IF (TG_OP = 'INSERT' AND (NEW.slug IS NULL OR NEW.slug = '')) OR 
     (TG_OP = 'UPDATE' AND (NEW.slug IS NULL OR NEW.slug = '')) THEN
    
    -- Generate base slug from name and profession
    base_slug := generate_slug(NEW.name || '-' || NEW.profession);
    final_slug := base_slug;
    
    -- Check if slug exists and add counter if needed
    LOOP
      SELECT EXISTS(SELECT 1 FROM masters WHERE slug = final_slug AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid))
      INTO slug_exists;
      
      EXIT WHEN NOT slug_exists;
      
      counter := counter + 1;
      final_slug := base_slug || '-' || counter;
    END LOOP;
    
    NEW.slug := final_slug;
  END IF;
  
  RETURN NEW;
END;
$$;
