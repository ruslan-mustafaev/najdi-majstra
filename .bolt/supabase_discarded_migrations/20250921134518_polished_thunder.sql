-- Удаляем старые политики
DROP POLICY IF EXISTS "Users can upload to their folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their files" ON storage.objects;
DROP POLICY IF EXISTS "Public can view profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;

-- Создаем новые политики с правильной логикой
-- Публичный просмотр всех файлов
CREATE POLICY "Public can view profile images" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'profile-images');

-- Загрузка файлов только в свою папку
CREATE POLICY "Users can upload own files" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'profile-images' 
  AND auth.uid()::text = (string_to_array(name, '/'))[1]
);

-- Обновление только своих файлов
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

-- Удаление только своих файлов
CREATE POLICY "Users can delete own files" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'profile-images' 
  AND auth.uid()::text = (string_to_array(name, '/'))[1]
);

-- Убеждаемся что bucket существует и настроен правильно
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-images',
  'profile-images', 
  true,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'video/mp4', 'video/webm', 'video/ogg']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'video/mp4', 'video/webm', 'video/ogg'];