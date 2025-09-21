/*
  # Fix storage RLS policies

  1. Security
    - Drop all existing policies safely
    - Create correct RLS policies for file uploads
    - Ensure bucket is public for reading
*/

-- Отключаем RLS временно для очистки
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Удаляем все существующие политики для storage.objects
DO $$ 
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'objects' AND schemaname = 'storage'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON storage.objects';
    END LOOP;
END $$;

-- Включаем RLS обратно
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Убеждаемся что bucket существует и публичный
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

-- Создаем новые политики
CREATE POLICY "Users can upload to their folder" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'profile-images' 
  AND auth.uid()::text = split_part(name, '/', 1)
);

CREATE POLICY "Users can view their files" ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'profile-images' 
  AND auth.uid()::text = split_part(name, '/', 1)
);

CREATE POLICY "Users can update their files" ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'profile-images' 
  AND auth.uid()::text = split_part(name, '/', 1)
);

CREATE POLICY "Users can delete their files" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'profile-images' 
  AND auth.uid()::text = split_part(name, '/', 1)
);

-- Публичный доступ для чтения (важно для отображения изображений)
CREATE POLICY "Public can view profile images" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'profile-images');