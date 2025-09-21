/*
  # Fix Storage RLS Policies

  1. Security
    - Drop all existing policies
    - Create proper RLS policies for storage.objects
    - Ensure bucket is public
    - Fix policy conditions

  2. Changes
    - Use proper auth.uid() checks
    - Fix folder path validation
    - Enable public read access
*/

-- Disable RLS temporarily to clean up
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies on storage.objects
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON storage.objects';
    END LOOP;
END $$;

-- Re-enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Ensure bucket exists and is public
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-images', 
  'profile-images', 
  true, 
  52428800, -- 50MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'video/mp4', 'video/webm', 'video/ogg']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'video/mp4', 'video/webm', 'video/ogg'];

-- Create new policies with proper conditions
CREATE POLICY "Authenticated users can upload to their folder"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'profile-images' 
  AND auth.uid()::text = split_part(name, '/', 1)
);

CREATE POLICY "Authenticated users can view their files"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'profile-images' 
  AND auth.uid()::text = split_part(name, '/', 1)
);

CREATE POLICY "Authenticated users can update their files"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'profile-images' 
  AND auth.uid()::text = split_part(name, '/', 1)
);

CREATE POLICY "Authenticated users can delete their files"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'profile-images' 
  AND auth.uid()::text = split_part(name, '/', 1)
);

-- Public read access for all profile images
CREATE POLICY "Public can view profile images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'profile-images');

-- Grant necessary permissions
GRANT ALL ON storage.objects TO authenticated;
GRANT SELECT ON storage.objects TO public;