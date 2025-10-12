# RLS Policy Fix Summary

## Problem
The RLS (Row Level Security) policy was blocking inserts to `master_contact_hours` and `master_reviews` tables with error:
```
new row violates row-level security policy for table "master_contact_hours"
```

## Root Cause
The issue was a mismatch between the ID being used in the application and the ID expected by the database:

- **Database Tables**: `master_contact_hours` and `master_reviews` use `master_id` which references `auth.users(id)` (the authentication user ID)
- **Application Code**: Was using `masterId` from the `masters` table, which is the master's database record ID, not their auth user ID
- **RLS Policies**: Check `auth.uid() = master_id`, expecting the auth user ID

## Solution
Updated all components to use the correct auth user ID:

### 1. Added `userId` to Master Type
- Added `userId?: string` field to the `Master` interface
- This field stores the auth user ID (`user_id` from masters table)

### 2. Updated MasterDashboard Component
- Changed contact hours loading to use `user.id` (auth ID) instead of `masterId` (database ID)
- Updated ContactHoursSelector to receive `user.id`

### 3. Updated MastersApi
- Now includes `userId: master.user_id` when mapping master records
- This ensures the auth user ID is available throughout the app

### 4. Updated MasterProfile Component
- Changed to use `master.userId` for contact hours and reviews queries
- Added null checks to prevent queries with undefined IDs

### 5. Updated ReviewForm Component
- Receives `masterId` parameter which is now the auth user ID
- RLS policies now correctly validate the user

## Database Schema
```
masters table:
  - id (uuid) - Database record ID
  - user_id (uuid) - References auth.users(id)

master_contact_hours table:
  - id (uuid)
  - master_id (uuid) - References auth.users(id) ← Uses auth ID

master_reviews table:
  - id (uuid)
  - master_id (uuid) - References auth.users(id) ← Uses auth ID
  - client_id (uuid) - References auth.users(id) ← Uses auth ID
```

## Testing
After this fix:
- Masters can now save their contact hours
- Clients can submit reviews
- RLS policies correctly validate user permissions
- No more 403 Forbidden errors

## Related Files Changed
- `/src/types/index.ts` - Added userId field to Master interface
- `/src/lib/mastersApi.ts` - Added userId mapping
- `/src/components/MasterDashboard.tsx` - Use user.id for contact hours
- `/src/components/MasterProfile.tsx` - Use master.userId for queries
- `/src/components/ContactHoursSelector.tsx` - No changes (already correct)
- `/src/components/ReviewForm.tsx` - No changes (already correct)
