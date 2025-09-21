/*
  # Fix Storage RLS Policies

  1. Security
    - Drop all existing storage policies
    - Create correct RLS policies for file uploads
    - Allow users to manage their own files
    - Allow public read access to profile images
*/

-- Удаляем ВСЕ существующие политики для storage.objects
DROP POLICY IF EXISTS "Users can upload to their folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their files" ON storage.objects;
DROP POLICY IF EXISTS "Public can view profile images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload files" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to view their own files" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own files" ON storage.objects;

-- Включаем RLS для storage.objects (если не включен)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Создаем новые правильные политики
CREATE POLICY "Allow authenticated uploads to profile-images" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'profile-images' AND
  auth.uid()::text = split_part(name, '/', 1)
);

CREATE POLICY "Allow users to view their own files" ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'profile-images' AND
  auth.uid()::text = split_part(name, '/', 1)
);

CREATE POLICY "Allow users to update their own files" ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'profile-images' AND
  auth.uid()::text = split_part(name, '/', 1)
);

CREATE POLICY "Allow users to delete their own files" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'profile-images' AND
  auth.uid()::text = split_part(name, '/', 1)
);

-- Публичный доступ для чтения всех файлов в bucket profile-images
CREATE POLICY "Allow public to view profile images" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'profile-images');

-- Также убедимся что bucket существует и настроен правильно
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-images',
  'profile-images', 
  true,
  104857600, -- 100MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 104857600,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov'];