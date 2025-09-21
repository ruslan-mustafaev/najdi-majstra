# Настройка Storage в Supabase Dashboard

## Проблема
RLS политики для storage блокируют загрузку файлов. Нужно настроить их через Dashboard.

## Решение

### 1. Перейди в Supabase Dashboard
- Открой https://supabase.com/dashboard
- Выбери свой проект

### 2. Настрой Storage Bucket
- Перейди в **Storage** → **Buckets**
- Найди bucket `profile-images` или создай новый
- Нажми на настройки bucket (три точки)
- Установи:
  - **Public bucket**: ✅ Включено
  - **File size limit**: 100MB
  - **Allowed MIME types**: `image/*,video/*`

### 3. Настрой RLS Policies
- Перейди в **Storage** → **Policies**
- Удали все существующие политики для `profile-images`
- Создай новые политики:

#### Policy 1: "Allow authenticated users to upload"
```sql
CREATE POLICY "Allow authenticated users to upload" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'profile-images' 
  AND auth.uid()::text = split_part(name, '/', 1)
);
```

#### Policy 2: "Allow users to view their files"
```sql
CREATE POLICY "Allow users to view their files" ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'profile-images' 
  AND auth.uid()::text = split_part(name, '/', 1)
);
```

#### Policy 3: "Allow users to delete their files"
```sql
CREATE POLICY "Allow users to delete their files" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'profile-images' 
  AND auth.uid()::text = split_part(name, '/', 1)
);
```

#### Policy 4: "Allow public to view files"
```sql
CREATE POLICY "Allow public to view files" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'profile-images');
```

### 4. Альтернативный способ (если не работает)
Если RLS всё ещё блокирует, временно отключи RLS для storage:

```sql
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
```

⚠️ **Внимание**: Это отключит безопасность для всех файлов!

### 5. Проверка
После настройки попробуй загрузить файл в приложении.