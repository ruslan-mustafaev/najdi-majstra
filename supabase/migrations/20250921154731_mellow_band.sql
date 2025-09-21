-- COMPLETE RLS FIX FOR NAJDIMAJSTRA.SK
-- Execute this in Supabase SQL Editor

-- =====================================================
-- 1. FIX MASTERS TABLE RLS POLICIES
-- =====================================================

-- Drop existing policies for masters table
DROP POLICY IF EXISTS "Anonymous can view public profiles" ON masters;
DROP POLICY IF EXISTS "Authenticated users can insert their own profile" ON masters;
DROP POLICY IF EXISTS "Authenticated users can update their own profile" ON masters;
DROP POLICY IF EXISTS "Authenticated users can view their own profile" ON masters;
DROP POLICY IF EXISTS "Public can view active completed profiles" ON masters;

-- Create new, working policies for masters table
CREATE POLICY "Allow authenticated users to insert their profile" ON masters
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow authenticated users to update their profile" ON masters
FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow authenticated users to view their profile" ON masters
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Allow public to view active profiles" ON masters
FOR SELECT TO public
USING (is_active = true AND profile_completed = true);

CREATE POLICY "Allow anonymous to view active profiles" ON masters
FOR SELECT TO anon
USING (is_active = true AND profile_completed = true);

-- =====================================================
-- 2. FIX STORAGE RLS POLICIES
-- =====================================================

-- Enable RLS on storage.objects if not enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop all existing storage policies
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'objects' AND schemaname = 'storage'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON storage.objects';
    END LOOP;
END $$;

-- Create new storage policies
CREATE POLICY "Allow authenticated users to upload their files" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
    bucket_id = 'profile-images' 
    AND auth.uid()::text = split_part(name, '/', 1)
);

CREATE POLICY "Allow authenticated users to view their files" ON storage.objects
FOR SELECT TO authenticated
USING (
    bucket_id = 'profile-images' 
    AND auth.uid()::text = split_part(name, '/', 1)
);

CREATE POLICY "Allow authenticated users to update their files" ON storage.objects
FOR UPDATE TO authenticated
USING (
    bucket_id = 'profile-images' 
    AND auth.uid()::text = split_part(name, '/', 1)
)
WITH CHECK (
    bucket_id = 'profile-images' 
    AND auth.uid()::text = split_part(name, '/', 1)
);

CREATE POLICY "Allow authenticated users to delete their files" ON storage.objects
FOR DELETE TO authenticated
USING (
    bucket_id = 'profile-images' 
    AND auth.uid()::text = split_part(name, '/', 1)
);

CREATE POLICY "Allow public to view all files" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'profile-images');

CREATE POLICY "Allow anonymous to view all files" ON storage.objects
FOR SELECT TO anon
USING (bucket_id = 'profile-images');

-- =====================================================
-- 3. ENSURE BUCKET EXISTS AND IS CONFIGURED
-- =====================================================

-- Create bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'profile-images',
    'profile-images',
    true,
    104857600, -- 100MB
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'video/mp4', 'video/webm', 'video/ogg']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 104857600,
    allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'video/mp4', 'video/webm', 'video/ogg'];

-- =====================================================
-- 4. GRANT NECESSARY PERMISSIONS
-- =====================================================

-- Grant permissions to authenticated users
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;

-- Grant select permissions to public/anon
GRANT SELECT ON storage.objects TO public;
GRANT SELECT ON storage.objects TO anon;

-- =====================================================
-- 5. CREATE HELPER FUNCTION FOR DEBUGGING
-- =====================================================

CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT auth.uid();
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_current_user_id() TO authenticated;
GRANT EXECUTE ON FUNCTION get_current_user_id() TO anon;

-- =====================================================
-- 6. VERIFY SETUP
-- =====================================================

-- Check masters table policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'masters' 
ORDER BY policyname;

-- Check storage policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage'
ORDER BY policyname;

-- Check bucket configuration
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets 
WHERE id = 'profile-images';

-- Test auth function
SELECT get_current_user_id() as current_user_id;