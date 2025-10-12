# Database Migration Instructions

The contact hours and reviews features require new database tables. Follow these steps to apply the migration:

## Steps to Apply Migration

1. **Open Supabase SQL Editor**
   - Go to: https://supabase.com/dashboard/project/budlyqnloyiyexsocpbb/sql/new
   - Or navigate to your Supabase project → SQL Editor → New Query

2. **Copy the Migration SQL**
   - Open the file: `supabase/migrations/20251012000000_add_contact_hours_and_reviews.sql`
   - Copy the entire contents

3. **Execute the Migration**
   - Paste the SQL into the SQL Editor
   - Click the "Run" button (or press Ctrl/Cmd + Enter)
   - Wait for execution to complete

4. **Verify Tables Were Created**
   - Go to Table Editor in Supabase Dashboard
   - You should see two new tables:
     - `master_contact_hours`
     - `master_reviews`

## What This Migration Creates

### Tables:
- **master_contact_hours**: Stores master availability schedules
- **master_reviews**: Stores client reviews and ratings

### Security:
- Row Level Security (RLS) policies for both tables
- Proper access controls for masters and clients

### Features:
- Review restrictions (1 per client per master per month)
- Dynamic rating calculation function
- Automatic timestamp updates

## Troubleshooting

If you get permission errors:
- Make sure you're logged into Supabase as the project owner
- The SQL Editor should have sufficient privileges by default

If tables already exist:
- The migration uses `IF NOT EXISTS` and `IF EXISTS` clauses
- It's safe to run multiple times without errors

## After Migration

Once the migration is complete:
1. Refresh your application
2. The errors in the console should disappear
3. Contact hours and reviews features will work correctly
