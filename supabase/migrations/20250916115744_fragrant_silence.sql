/*
  # Add image fields to masters table

  1. New Columns
    - `profile_image_url` (text) - URL профильного изображения
    - `work_images_urls` (text[]) - Массив URL изображений работ
    - `work_video_url` (text) - URL видео работ

  2. Changes
    - Добавляем поля для хранения изображений и видео
    - Устанавливаем значения по умолчанию
*/

-- Добавляем поля для изображений
ALTER TABLE masters 
ADD COLUMN IF NOT EXISTS profile_image_url text,
ADD COLUMN IF NOT EXISTS work_images_urls text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS work_video_url text;

-- Обновляем существующие записи значениями по умолчанию
UPDATE masters 
SET profile_image_url = 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=400'
WHERE profile_image_url IS NULL;

UPDATE masters 
SET work_images_urls = ARRAY[
  'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/159358/multimeter-digital-hand-tool-159358.jpeg?auto=compress&cs=tinysrgb&w=400'
]
WHERE work_images_urls = '{}' OR work_images_urls IS NULL;