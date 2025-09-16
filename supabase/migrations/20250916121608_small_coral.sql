/*
  # Setup Storage RLS Policies for Image Upload

  1. Storage Policies
    - Allow authenticated users to upload their own images
    - Allow public read access to images
    - Allow users to update/delete their own images

  2. Security
    - Users can only upload to folders named after their user ID
    - Public can view all images
    - Only owners can modify/delete their images
*/

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy for uploading images (INSERT)
CREATE POLICY "Users can upload their own images" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'profile-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy for viewing images (SELECT) - public access
CREATE POLICY "Public can view images" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'profile-images');

-- Policy for updating images (UPDATE)
CREATE POLICY "Users can update their own images" ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'profile-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy for deleting images (DELETE)
CREATE POLICY "Users can delete their own images" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'profile-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Ensure the bucket exists and is public for reading
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-images', 'profile-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;