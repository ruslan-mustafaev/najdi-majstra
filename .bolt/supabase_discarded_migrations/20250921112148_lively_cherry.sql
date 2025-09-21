-- Удаляем старые политики с неправильным индексом
DROP POLICY IF EXISTS "Users can upload to their folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their files" ON storage.objects;

-- Создаем новые политики с правильным индексом [1]
CREATE POLICY "Users can upload to their folder" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'profile-images' 
  AND (storage.foldername(name))[1] = (auth.uid())::text
);

CREATE POLICY "Users can view their files" ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'profile-images' 
  AND (storage.foldername(name))[1] = (auth.uid())::text
);

CREATE POLICY "Users can delete their files" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'profile-images' 
  AND (storage.foldername(name))[1] = (auth.uid())::text
);

-- Политика для публичного просмотра остается без изменений
-- CREATE POLICY "Public can view profile images" ON storage.objects
-- FOR SELECT TO public
-- USING (bucket_id = 'profile-images');