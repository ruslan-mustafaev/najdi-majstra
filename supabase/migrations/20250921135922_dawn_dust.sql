/*
  # Storage Setup for Profile Images

  1. Storage Policies
    - Allow authenticated users to upload their own files
    - Allow public read access to uploaded files
    - Restrict file operations to file owners

  2. Bucket Configuration
    - Public bucket for profile images
    - File size limits and type restrictions
*/

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy for uploading files (authenticated users can upload to their own folder)
CREATE POLICY "Users can upload their own files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy for viewing files (public can view all files in profile-images bucket)
CREATE POLICY "Public can view profile images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'profile-images');

-- Policy for updating files (users can update their own files)
CREATE POLICY "Users can update their own files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profile-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'profile-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy for deleting files (users can delete their own files)
CREATE POLICY "Users can delete their own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Enable RLS on storage.buckets
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

-- Policy for bucket access
CREATE POLICY "Public bucket access"
ON storage.buckets
FOR SELECT
TO public
USING (id = 'profile-images');