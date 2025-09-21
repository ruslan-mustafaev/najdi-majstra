-- Удаляем старые политики и создаем правильные
-- Выполните этот SQL в Supabase SQL Editor

-- Удаляем существующие политики
DROP POLICY IF EXISTS "Users can upload to their folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their files" ON storage.objects;

-- Создаем правильные политики с индексом [1] вместо [2]
-- Потому что user_id находится в первой папке пути

-- Политика для загрузки файлов (INSERT)
CREATE POLICY "Users can upload to their folder" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'profile-images' 
  AND (storage.foldername(name))[1] = (auth.uid())::text
);

-- Политика для просмотра своих файлов (SELECT)
CREATE POLICY "Users can view their files" ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'profile-images' 
  AND (storage.foldername(name))[1] = (auth.uid())::text
);

-- Политика для удаления своих файлов (DELETE)
CREATE POLICY "Users can delete their files" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'profile-images' 
  AND (storage.foldername(name))[1] = (auth.uid())::text
);

-- Политика для обновления своих файлов (UPDATE)
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