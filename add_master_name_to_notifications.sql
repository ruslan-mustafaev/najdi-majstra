/*
  # Добавление имени мастера в уведомления

  1. Изменения
    - Добавить поле `master_name` в таблицу `offer_notifications`
    - Обновить триггер для автоматического добавления имени мастера при ответе
*/

-- Добавить поле master_name если его нет
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'offer_notifications' AND column_name = 'master_name'
  ) THEN
    ALTER TABLE offer_notifications ADD COLUMN master_name text;
  END IF;
END $$;

-- Обновить функцию для добавления имени мастера в уведомление
CREATE OR REPLACE FUNCTION create_offer_response_notification()
RETURNS TRIGGER AS $$
DECLARE
  master_name_value text;
BEGIN
  -- Если статус изменился с 'pending' на 'accepted' или 'rejected'
  IF OLD.status = 'pending' AND NEW.status IN ('accepted', 'rejected') THEN
    -- Установить время ответа
    NEW.master_response_at = now();

    -- Получить имя мастера
    SELECT name INTO master_name_value
    FROM masters
    WHERE id = NEW.master_id;

    -- Создать уведомление для клиента (если у него есть user_id)
    IF NEW.client_user_id IS NOT NULL THEN
      INSERT INTO offer_notifications (user_id, offer_id, type, master_name)
      VALUES (
        NEW.client_user_id,
        NEW.id,
        CASE
          WHEN NEW.status = 'accepted' THEN 'offer_accepted'
          WHEN NEW.status = 'rejected' THEN 'offer_rejected'
        END,
        master_name_value
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Убедиться что триггер существует
DROP TRIGGER IF EXISTS create_offer_response_notification_trigger ON client_offers;
CREATE TRIGGER create_offer_response_notification_trigger
  BEFORE UPDATE ON client_offers
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION create_offer_response_notification();
