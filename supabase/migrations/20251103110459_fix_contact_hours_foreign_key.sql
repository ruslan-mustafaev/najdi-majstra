/*
  # Fix Contact Hours Foreign Key

  1. Changes
    - Delete orphaned records (master_id not in masters table)
    - Drop incorrect foreign key constraint (master_id -> auth.users)
    - Add correct foreign key constraint (master_id -> masters.id)
  
  2. Security
    - Maintains RLS policies
    - Ensures referential integrity with masters table
*/

-- Delete orphaned records first
DELETE FROM master_contact_hours
WHERE master_id NOT IN (SELECT id FROM masters);

-- Drop incorrect foreign key
ALTER TABLE master_contact_hours 
  DROP CONSTRAINT IF EXISTS master_contact_hours_master_id_fkey;

-- Add correct foreign key to masters table
ALTER TABLE master_contact_hours
  ADD CONSTRAINT master_contact_hours_master_id_fkey 
  FOREIGN KEY (master_id) 
  REFERENCES masters(id) 
  ON DELETE CASCADE;
