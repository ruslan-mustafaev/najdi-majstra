/*
  # Add Social Media Fields to Masters Table

  1. New Columns
    - `social_facebook` (text) - Facebook profile URL
    - `social_instagram` (text) - Instagram profile URL
    - `social_youtube` (text) - YouTube channel URL
    - `social_tiktok` (text) - TikTok profile URL
    - `social_telegram` (text) - Telegram profile URL
    - `social_whatsapp` (text) - WhatsApp contact URL
  
  2. Changes
    - Add social media URL fields to masters table
    - Masters can add their social media links
    - Clients will see social media icons linking to master's profiles
    - If field is empty, icon won't be displayed to clients
  
  3. Security
    - No RLS changes needed - existing policies cover these fields
    - Fields are optional and editable by profile owner only
    - Publicly visible when profile is active and completed
*/

-- Add Facebook field
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'masters' AND column_name = 'social_facebook'
  ) THEN
    ALTER TABLE masters ADD COLUMN social_facebook text DEFAULT '';
    COMMENT ON COLUMN masters.social_facebook IS 'Facebook profile URL';
  END IF;
END $$;

-- Add Instagram field
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'masters' AND column_name = 'social_instagram'
  ) THEN
    ALTER TABLE masters ADD COLUMN social_instagram text DEFAULT '';
    COMMENT ON COLUMN masters.social_instagram IS 'Instagram profile URL';
  END IF;
END $$;

-- Add YouTube field
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'masters' AND column_name = 'social_youtube'
  ) THEN
    ALTER TABLE masters ADD COLUMN social_youtube text DEFAULT '';
    COMMENT ON COLUMN masters.social_youtube IS 'YouTube channel URL';
  END IF;
END $$;

-- Add TikTok field
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'masters' AND column_name = 'social_tiktok'
  ) THEN
    ALTER TABLE masters ADD COLUMN social_tiktok text DEFAULT '';
    COMMENT ON COLUMN masters.social_tiktok IS 'TikTok profile URL';
  END IF;
END $$;

-- Add Telegram field
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'masters' AND column_name = 'social_telegram'
  ) THEN
    ALTER TABLE masters ADD COLUMN social_telegram text DEFAULT '';
    COMMENT ON COLUMN masters.social_telegram IS 'Telegram profile URL';
  END IF;
END $$;

-- Add WhatsApp field
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'masters' AND column_name = 'social_whatsapp'
  ) THEN
    ALTER TABLE masters ADD COLUMN social_whatsapp text DEFAULT '';
    COMMENT ON COLUMN masters.social_whatsapp IS 'WhatsApp contact URL';
  END IF;
END $$;