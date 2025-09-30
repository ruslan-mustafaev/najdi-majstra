/*
  # Обновление структуры портфолио

  1. Изменения
    - Убираем project_images массив URLs
    - Добавляем photos_count для быстрого доступа
    - Добавляем main_photo_path для превью
    - Добавляем project_folder_path для организации

  2. Индексы
    - Индекс по master_id для быстрых запросов
    - Индекс по completion_date для сортировки
*/

-- Добавляем новые колонки
ALTER TABLE master_portfolio 
ADD COLUMN IF NOT EXISTS photos_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS main_photo_path TEXT,
ADD COLUMN IF NOT EXISTS project_folder_path TEXT;

-- Обновляем существующие записи
UPDATE master_portfolio 
SET 
  photos_count = COALESCE(array_length(project_images, 1), 0),
  main_photo_path = CASE 
    WHEN project_images IS NOT NULL AND array_length(project_images, 1) > 0 
    THEN project_images[1] 
    ELSE NULL 
  END,
  project_folder_path = CONCAT(
    (SELECT user_id FROM masters WHERE masters.id = master_portfolio.master_id),
    '/projects/',
    master_portfolio.id
  );

-- Создаем индексы для оптимизации
CREATE INDEX IF NOT EXISTS idx_portfolio_master_date 
ON master_portfolio(master_id, completion_date DESC);

CREATE INDEX IF NOT EXISTS idx_portfolio_photos_count 
ON master_portfolio(photos_count) 
WHERE photos_count > 0;

-- Комментарии для документации
COMMENT ON COLUMN master_portfolio.photos_count IS 'Количество фотографий в проекте (для быстрого доступа)';
COMMENT ON COLUMN master_portfolio.main_photo_path IS 'Путь к главной фотографии проекта в Storage';
COMMENT ON COLUMN master_portfolio.project_folder_path IS 'Путь к папке проекта в Storage';