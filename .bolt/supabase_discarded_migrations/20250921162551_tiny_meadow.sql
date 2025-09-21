/*
  # Add support for multiple work videos

  1. Changes
    - Change work_video_url from text to text[] array
    - Update existing data to array format
    - Allow up to 5 videos per master

  2. Security
    - Maintain existing RLS policies
*/

-- Change work_video_url to array type
ALTER TABLE masters 
ALTER COLUMN work_video_url TYPE text[] 
USING CASE 
  WHEN work_video_url IS NULL THEN '{}'::text[]
  WHEN work_video_url = '' THEN '{}'::text[]
  ELSE ARRAY[work_video_url]
END;

-- Set default to empty array
ALTER TABLE masters 
ALTER COLUMN work_video_url SET DEFAULT '{}'::text[];

-- Add comment for clarity
COMMENT ON COLUMN masters.work_video_url IS 'Array of work video URLs (max 5 videos, 100MB each)';