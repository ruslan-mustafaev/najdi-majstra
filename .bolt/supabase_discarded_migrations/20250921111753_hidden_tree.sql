-- Политики для Storage bucket 'profile-images'

-- 1. Политика для загрузки файлов (INSERT)
CREATE POLICY "Users can upload to their folder" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'profile-images' 
  AND (storage.foldername(name))[1] = (auth.uid())::text
);

-- 2. Политика для просмотра файлов (SELECT)
CREATE POLICY "Users can view their files" ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'profile-images' 
  AND (storage.foldername(name))[1] = (auth.uid())::text
);

-- 3. Политика для обновления файлов (UPDATE)
CREATE POLICY "Users can update their files" ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'profile-images' 
  AND (storage.foldername(name))[1] = (auth.uid())::text
)
WITH CHECK (
  bucket_id = 'profile-images' 
  AND (storage.foldername(name))[1] = (auth.uid())::text
);

-- 4. Публичный доступ для просмотра изображений профилей
CREATE POLICY "Public can view profile images" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'profile-images');