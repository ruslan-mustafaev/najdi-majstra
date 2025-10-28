/*
  # Fix Functions Security - Final
  
  Drop and recreate all functions with SECURITY INVOKER
*/

-- Drop functions that have parameter name changes
DROP FUNCTION IF EXISTS get_master_average_rating(uuid) CASCADE;
DROP FUNCTION IF EXISTS generate_slug(text) CASCADE;

-- Recreate all functions with SECURITY INVOKER and SET search_path
CREATE FUNCTION get_master_average_rating(master_uuid uuid)
RETURNS numeric
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  avg_rating numeric;
BEGIN
  SELECT COALESCE(AVG(rating), 0) INTO avg_rating
  FROM master_reviews WHERE master_id = master_uuid;
  RETURN ROUND(avg_rating, 1);
END;
$$;

CREATE FUNCTION generate_slug(input_text text)
RETURNS text
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  RETURN lower(regexp_replace(
    regexp_replace(input_text, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'));
END;
$$;

CREATE OR REPLACE FUNCTION create_free_subscription_for_new_user()
RETURNS TRIGGER LANGUAGE plpgsql
SECURITY INVOKER SET search_path = public
AS $$
BEGIN
  INSERT INTO subscriptions (user_id, plan_name, billing_period, status, amount_paid, current_period_start)
  VALUES (NEW.id, 'Mini', 'lifetime', 'active', 0, now());
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql
SECURITY INVOKER SET search_path = public
AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE OR REPLACE FUNCTION check_portfolio_limit()
RETURNS TRIGGER LANGUAGE plpgsql
SECURITY INVOKER SET search_path = public
AS $$
DECLARE portfolio_count integer;
BEGIN
  SELECT COUNT(*) INTO portfolio_count FROM master_portfolio WHERE master_id = NEW.master_id;
  IF portfolio_count >= 20 THEN RAISE EXCEPTION 'Portfolio limit reached. Maximum 20 items allowed.'; END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION set_master_slug()
RETURNS TRIGGER LANGUAGE plpgsql
SECURITY INVOKER SET search_path = public
AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_slug(NEW.name || '-' || NEW.profession);
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION update_master_availability_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql
SECURITY INVOKER SET search_path = public
AS $$ BEGIN NEW.updated_at = CURRENT_TIMESTAMP; RETURN NEW; END; $$;

CREATE OR REPLACE FUNCTION update_master_projects_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql
SECURITY INVOKER SET search_path = public
AS $$ BEGIN NEW.updated_at = CURRENT_TIMESTAMP; RETURN NEW; END; $$;

CREATE OR REPLACE FUNCTION update_project_tasks_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql
SECURITY INVOKER SET search_path = public
AS $$ BEGIN NEW.updated_at = CURRENT_TIMESTAMP; RETURN NEW; END; $$;

CREATE OR REPLACE FUNCTION is_master_owner(master_uuid uuid)
RETURNS boolean LANGUAGE plpgsql
SECURITY INVOKER SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM masters WHERE id = master_uuid AND user_id = auth.uid());
END;
$$;

CREATE OR REPLACE FUNCTION is_project_owner(project_uuid uuid)
RETURNS boolean LANGUAGE plpgsql
SECURITY INVOKER SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM master_projects mp JOIN masters m ON m.id = mp.master_id
    WHERE mp.id = project_uuid AND m.user_id = auth.uid()
  );
END;
$$;

CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS uuid LANGUAGE plpgsql
SECURITY INVOKER SET search_path = public
AS $$ BEGIN RETURN auth.uid(); END; $$;