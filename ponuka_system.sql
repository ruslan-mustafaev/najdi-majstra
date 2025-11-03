/*
  # Sistema ponúk (predložení) od klientov k majstrom

  1. Nové tabuľky
    - `client_offers` - Ponuky od klientov
      - `id` (uuid, primary key)
      - `master_id` (uuid, odkaz na masters tabuľku)
      - `client_user_id` (uuid, odkaz na auth.users)
      - `client_name` (text) - Meno a priezvisko klienta
      - `client_email` (text) - Email klienta
      - `client_phone` (text) - Telefón klienta
      - `location` (text) - Lokácia práce
      - `preferred_date` (date) - Preferovaný dátum
      - `description` (text) - Popis toho, čo klient chce
      - `status` (text) - 'pending', 'accepted', 'rejected'
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `master_response_at` (timestamptz) - Kedy majster odpovedal

    - `offer_notifications` - Upozornenia na ponuky
      - `id` (uuid, primary key)
      - `user_id` (uuid, odkaz na auth.users)
      - `offer_id` (uuid, odkaz na client_offers)
      - `type` (text) - 'new_offer', 'offer_accepted', 'offer_rejected'
      - `is_read` (boolean)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS na oboch tabuľkách
    - Politiky pre čítanie a zapisovanie
*/

-- Vytvorenie tabuľky ponúk
CREATE TABLE IF NOT EXISTS client_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  master_id uuid NOT NULL REFERENCES masters(id) ON DELETE CASCADE,
  client_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  client_name text NOT NULL,
  client_email text NOT NULL,
  client_phone text NOT NULL,
  location text NOT NULL,
  preferred_date date,
  description text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  master_response_at timestamptz,
  CONSTRAINT valid_email CHECK (client_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Index pre rýchle vyhľadávanie
CREATE INDEX IF NOT EXISTS idx_client_offers_master_id ON client_offers(master_id);
CREATE INDEX IF NOT EXISTS idx_client_offers_client_user_id ON client_offers(client_user_id);
CREATE INDEX IF NOT EXISTS idx_client_offers_status ON client_offers(status);
CREATE INDEX IF NOT EXISTS idx_client_offers_created_at ON client_offers(created_at DESC);

-- Vytvorenie tabuľky upozornení
CREATE TABLE IF NOT EXISTS offer_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  offer_id uuid NOT NULL REFERENCES client_offers(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('new_offer', 'offer_accepted', 'offer_rejected')),
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Index pre rýchle vyhľadávanie
CREATE INDEX IF NOT EXISTS idx_offer_notifications_user_id ON offer_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_offer_notifications_is_read ON offer_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_offer_notifications_created_at ON offer_notifications(created_at DESC);

-- Enable RLS
ALTER TABLE client_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE offer_notifications ENABLE ROW LEVEL SECURITY;

-- Politiky pre client_offers

-- Klienti môžu vytvárať ponuky
CREATE POLICY "Authenticated users can create offers"
  ON client_offers FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Klienti môžu čítať svoje vlastné ponuky
CREATE POLICY "Clients can view their own offers"
  ON client_offers FOR SELECT
  TO authenticated
  USING (client_user_id = auth.uid());

-- Majstri môžu čítať ponuky, ktoré sú pre nich
CREATE POLICY "Masters can view offers sent to them"
  ON client_offers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM masters
      WHERE masters.id = client_offers.master_id
      AND masters.user_id = auth.uid()
    )
  );

-- Majstri môžu aktualizovať status ponúk (prijať/odmietnuť)
CREATE POLICY "Masters can update status of their offers"
  ON client_offers FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM masters
      WHERE masters.id = client_offers.master_id
      AND masters.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM masters
      WHERE masters.id = client_offers.master_id
      AND masters.user_id = auth.uid()
    )
  );

-- Politiky pre offer_notifications

-- Používatelia môžu čítať svoje vlastné upozornenia
CREATE POLICY "Users can view their own notifications"
  ON offer_notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Používatelia môžu označiť svoje upozornenia ako prečítané
CREATE POLICY "Users can update their own notifications"
  ON offer_notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Systém môže vytvárať upozornenia (cez trigger alebo backend)
CREATE POLICY "System can create notifications"
  ON offer_notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Funkcia na automatické aktualizovanie updated_at
CREATE OR REPLACE FUNCTION update_client_offers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger na aktualizáciu updated_at
DROP TRIGGER IF EXISTS update_client_offers_updated_at_trigger ON client_offers;
CREATE TRIGGER update_client_offers_updated_at_trigger
  BEFORE UPDATE ON client_offers
  FOR EACH ROW
  EXECUTE FUNCTION update_client_offers_updated_at();

-- Funkcia na vytvorenie upozornenia pre majstra pri novej ponuke
CREATE OR REPLACE FUNCTION create_offer_notification_for_master()
RETURNS TRIGGER AS $$
DECLARE
  master_user_id uuid;
BEGIN
  -- Získať user_id majstra
  SELECT user_id INTO master_user_id
  FROM masters
  WHERE id = NEW.master_id;

  -- Vytvoriť upozornenie pre majstra
  IF master_user_id IS NOT NULL THEN
    INSERT INTO offer_notifications (user_id, offer_id, type)
    VALUES (master_user_id, NEW.id, 'new_offer');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger na vytvorenie upozornenia pri novej ponuke
DROP TRIGGER IF EXISTS create_offer_notification_trigger ON client_offers;
CREATE TRIGGER create_offer_notification_trigger
  AFTER INSERT ON client_offers
  FOR EACH ROW
  EXECUTE FUNCTION create_offer_notification_for_master();

-- Funkcia na vytvorenie upozornenia pre klienta pri odpovedi majstra
CREATE OR REPLACE FUNCTION create_offer_response_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Ak sa status zmenil z 'pending' na 'accepted' alebo 'rejected'
  IF OLD.status = 'pending' AND NEW.status IN ('accepted', 'rejected') THEN
    -- Nastaviť čas odpovede
    NEW.master_response_at = now();

    -- Vytvoriť upozornenie pre klienta (ak má user_id)
    IF NEW.client_user_id IS NOT NULL THEN
      INSERT INTO offer_notifications (user_id, offer_id, type)
      VALUES (
        NEW.client_user_id,
        NEW.id,
        CASE
          WHEN NEW.status = 'accepted' THEN 'offer_accepted'
          WHEN NEW.status = 'rejected' THEN 'offer_rejected'
        END
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger na vytvorenie upozornenia pri odpovedi majstra
DROP TRIGGER IF EXISTS create_offer_response_notification_trigger ON client_offers;
CREATE TRIGGER create_offer_response_notification_trigger
  BEFORE UPDATE ON client_offers
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION create_offer_response_notification();
