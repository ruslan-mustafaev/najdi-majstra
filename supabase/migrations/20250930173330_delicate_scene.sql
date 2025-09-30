/*
  # Создание таблицы портфолио мастеров

  1. Новые таблицы
    - `master_portfolio`
      - `id` (uuid, primary key)
      - `master_id` (uuid, foreign key to masters)
      - `project_title` (text, название проекта)
      - `location` (text, локация проекта)
      - `completion_date` (date, дата завершения)
      - `duration_months` (integer, длительность в месяцах)
      - `difficulty_rating` (integer, рейтинг сложности 1-5)
      - `description` (text, описание проекта)
      - `project_images` (text[], массив URL фотографий)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Безопасность
    - Включен RLS для таблицы `master_portfolio`
    - Политика для управления своими проектами мастерами
    - Политика для публичного просмотра портфолио
    - Ограничение максимум 5 проектов на мастера

  3. Индексы
    - Индекс по `master_id` для быстрого поиска проектов мастера
*/

-- Таблица для портфолио проектов мастера
CREATE TABLE IF NOT EXISTS master_portfolio (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  master_id uuid NOT NULL REFERENCES masters(id) ON DELETE CASCADE,
  project_title text NOT NULL, -- Zákazka - Čo som robil
  location text NOT NULL, -- Lokalita - Kde som to robil
  completion_date date NOT NULL, -- Kedy - Rok a mesiac
  duration_months integer NOT NULL, -- Čas trvania zákazky v mesiacoch
  difficulty_rating integer NOT NULL CHECK (difficulty_rating >= 1 AND difficulty_rating <= 5), -- Vlastné hodnotenie 1-5
  description text, -- Voľný opis zákazky
  project_images text[] DEFAULT '{}', -- Fotografie z projektu (max 5)
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Индекс для быстрого поиска по мастеру
CREATE INDEX IF NOT EXISTS idx_master_portfolio_master_id ON master_portfolio(master_id);

-- RLS политики
ALTER TABLE master_portfolio ENABLE ROW LEVEL SECURITY;

-- Мастер может управлять своими проектами
CREATE POLICY "Masters can manage own portfolio" ON master_portfolio
  FOR ALL TO authenticated
  USING (master_id IN (SELECT id FROM masters WHERE user_id = auth.uid()));

-- Публичный просмотр портфолио
CREATE POLICY "Public can view portfolio" ON master_portfolio
  FOR SELECT TO public
  USING (true);

-- Ограничение: максимум 5 проектов на мастера
CREATE OR REPLACE FUNCTION check_portfolio_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM master_portfolio WHERE master_id = NEW.master_id) >= 5 THEN
    RAISE EXCEPTION 'Maximálne 5 projektov na majstra';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER portfolio_limit_trigger
  BEFORE INSERT ON master_portfolio
  FOR EACH ROW EXECUTE FUNCTION check_portfolio_limit();