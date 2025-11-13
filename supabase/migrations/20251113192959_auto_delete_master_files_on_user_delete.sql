/*
  # Auto-delete master files from Storage on user deletion
  
  This migration creates a trigger that automatically deletes all files
  uploaded by a master from Supabase Storage when their user account is deleted.
  
  ## What gets deleted
  
  When a master (user) is deleted, the following files are automatically removed from Storage:
  
  1. Profile avatar image (master-avatars bucket)
  2. Work example photos (master-work-images bucket)
  3. Work videos (master-videos bucket)
  4. Portfolio project photos (portfolio-images bucket)
  
  ## How it works
  
  - Trigger runs BEFORE the master record is deleted from the database
  - Extracts all file paths from the master profile
  - Calls Supabase Storage API to delete each file
  - Then allows the database record to be deleted normally
  
  ## Important Notes
  
  - This is automatic - no manual action needed
  - Files are permanently deleted and cannot be recovered
  - The trigger uses SECURITY DEFINER to have permissions to delete files
*/

-- Function to delete all files associated with a master
CREATE OR REPLACE FUNCTION delete_master_storage_files()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  image_url text;
  video_url text;
  project_record record;
BEGIN
  -- Delete profile avatar from master-avatars bucket
  IF OLD.profile_image_url IS NOT NULL AND OLD.profile_image_url != '' THEN
    -- Extract path after the bucket name
    -- Format: https://...storage.../master-avatars/user-id/filename.jpg
    PERFORM storage.fdelete(
      'master-avatars'::text,
      ARRAY[regexp_replace(OLD.profile_image_url, '^.*/master-avatars/', '')]
    );
  END IF;

  -- Delete work images from master-work-images bucket
  IF OLD.work_images_urls IS NOT NULL THEN
    FOREACH image_url IN ARRAY OLD.work_images_urls
    LOOP
      IF image_url IS NOT NULL AND image_url != '' THEN
        PERFORM storage.fdelete(
          'master-work-images'::text,
          ARRAY[regexp_replace(image_url, '^.*/master-work-images/', '')]
        );
      END IF;
    END LOOP;
  END IF;

  -- Delete work videos from master-videos bucket
  IF OLD.work_video_url IS NOT NULL THEN
    FOREACH video_url IN ARRAY OLD.work_video_url
    LOOP
      IF video_url IS NOT NULL AND video_url != '' THEN
        PERFORM storage.fdelete(
          'master-videos'::text,
          ARRAY[regexp_replace(video_url, '^.*/master-videos/', '')]
        );
      END IF;
    END LOOP;
  END IF;

  -- Delete portfolio project images from portfolio-images bucket
  FOR project_record IN 
    SELECT project_images 
    FROM master_portfolio 
    WHERE master_id = OLD.id
  LOOP
    IF project_record.project_images IS NOT NULL THEN
      FOREACH image_url IN ARRAY project_record.project_images
      LOOP
        IF image_url IS NOT NULL AND image_url != '' THEN
          PERFORM storage.fdelete(
            'portfolio-images'::text,
            ARRAY[regexp_replace(image_url, '^.*/portfolio-images/', '')]
          );
        END IF;
      END LOOP;
    END IF;
  END LOOP;

  -- Allow the deletion to proceed
  RETURN OLD;
END;
$$;

-- Create trigger that fires BEFORE master is deleted
DROP TRIGGER IF EXISTS trigger_delete_master_storage_files ON masters;

CREATE TRIGGER trigger_delete_master_storage_files
  BEFORE DELETE ON masters
  FOR EACH ROW
  EXECUTE FUNCTION delete_master_storage_files();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION delete_master_storage_files() TO authenticated;
GRANT EXECUTE ON FUNCTION delete_master_storage_files() TO service_role;
