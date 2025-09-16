/*
  # Fix Storage RLS Policies

  1. Storage Policies
    - Enable RLS on storage.objects
    - Allow authenticated users to upload files to their own folders
    - Allow public read access to profile images
    - Allow users to update/delete their own files

  2. Bucket Setup
    - Ensure profile-images bucket exists
    - Set proper bucket configuration
*/

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can upload their own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile images" ON storage.objects;

-- Create bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-images', 'profile-images', true)
ON CONFLICT (id) DO NOTHING;

-- Policy for uploading files (INSERT)
CREATE POLICY "Users can upload their own profile images" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'profile-images' AND 
  auth.uid()::text = (string_to_array(name, '/'))[1]
);

-- Policy for viewing files (SELECT) - public access
CREATE POLICY "Public can view profile images" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'profile-images');

-- Policy for updating files (UPDATE)
CREATE POLICY "Users can update their own profile images" ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'profile-images' AND 
  auth.uid()::text = (string_to_array(name, '/'))[1]
);

-- Policy for deleting files (DELETE)
CREATE POLICY "Users can delete their own profile images" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'profile-images' AND 
  auth.uid()::text = (string_to_array(name, '/'))[1]
);