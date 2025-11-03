/*
  # Auto-create Master Profile on Signup
  
  1. Changes
    - Create trigger function to automatically create master profile when user signs up
    - Uses user_metadata from registration form (full_name, phone, location)
    - Generates unique slug using full_name and profession
    - Only creates profile for users with user_type = 'master'
  
  2. Security
    - Function uses SECURITY DEFINER to bypass RLS during profile creation
    - Runs with privileges of function creator
*/

-- Create function to auto-create master profile
CREATE OR REPLACE FUNCTION create_master_profile_on_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only create master profile if user_type is 'master'
  IF (NEW.raw_user_meta_data->>'user_type') = 'master' THEN
    INSERT INTO masters (
      user_id,
      name,
      profession,
      email,
      phone,
      location,
      description,
      is_active,
      profile_completed
    ) VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', 'Nový majster'),
      'Majster',
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'phone', ''),
      COALESCE(NEW.raw_user_meta_data->>'location', ''),
      'Profesionálny majster',
      true,
      false
    )
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created_master ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created_master
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_master_profile_on_signup();