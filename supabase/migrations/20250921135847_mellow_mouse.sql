/*
  # Storage policies for profile images

  1. Storage Setup
    - Create bucket 'profile-images' (must be done via Dashboard)
    - Enable RLS on storage.objects
    - Create policies for file operations

  2. Security
    - Users can only upload/delete their own files
    - Public can view all files in the bucket
*/

-- Enable RLS on storage.objects (if not already enabled)
-- This is usually enabled by default in Supabase

-- Policy 1: Allow public to view all files in profile-images bucket
CREATE POLICY "Public can view profile images" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'profile-images');

-- Policy 2: Allow authenticated users to upload files to their own folder
CREATE POLICY "Users can upload own files" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'profile-images' 
  AND auth.uid()::text = (string_to_array(name, '/'))[1]
);

-- Policy 3: Allow users to update their own files
CREATE POLICY "Users can update own files" ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'profile-images' 
  AND auth.uid()::text = (string_to_array(name, '/'))[1]
)
WITH CHECK (
  bucket_id = 'profile-images' 
  AND auth.uid()::text = (string_to_array(name, '/'))[1]
);

-- Policy 4: Allow users to delete their own files
CREATE POLICY "Users can delete own files" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'profile-images' 
  AND auth.uid()::text = (string_to_array(name, '/'))[1]
);