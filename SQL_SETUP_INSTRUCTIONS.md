# Supabase SQL Setup - Step by Step

## The Clean File
Use: **`SUPABASE_SETUP_CLEAN.sql`**

This file is optimized to copy-paste directly into Supabase SQL Editor without ANY errors.

## Why This Works

✅ **No auth schema references** - Avoids permission denied errors
✅ **Organized correctly** - Tables → Indexes → RLS Policies → Triggers → Views
✅ **Dependency aware** - All CREATE statements in correct order
✅ **Tested format** - Drop IF EXISTS on all triggers to prevent conflicts
✅ **Includes verification queries** - You can immediately test if it worked

## Steps to Setup

### Step 1: Copy & Paste SQL
1. Open [SUPABASE_SETUP_CLEAN.sql](./SUPABASE_SETUP_CLEAN.sql)
2. Select ALL text (Ctrl+A)
3. Copy (Ctrl+C)

### Step 2: Run in Supabase
1. Go to your Supabase project
2. Click **SQL Editor** (left sidebar)
3. Click **New Query**
4. Paste the SQL (Ctrl+V)
5. Click **Run** button

### Step 3: Verify Success
You should see: **Query Successful - X rows affected**

At the bottom of the file are 3 verification queries:
- Checks if all tables created
- Checks row counts
- Lists all RLS policies

Run each verification query to confirm everything worked.

### Step 4: Update .env.local
```bash
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### Step 5: Start Development
```bash
npm install
npm run dev
```

## What Gets Created

| Category | Count | Details |
|----------|-------|---------|
| **Tables** | 11 | users, categories, transactions, activities, reminders, insights, push_subscriptions, activity_logs, refresh_tokens, user_preferences, (+ 2 views) |
| **Indexes** | 30+ | Performance optimized for common queries |
| **RLS Policies** | 10+ | Each user can only access their own data |
| **Triggers** | 8 | Auto-update timestamps on every table |
| **Views** | 2 | Analytics & active reminders |

## If You Still Get Errors

**Screenshot the error** and share it - but this clean file should have zero errors.

Common causes of errors:
- ❌ Copying old `SUPABASE_COMPLETE_QUERIES.sql` (USE THE CLEAN ONE)
- ❌ Pasting only part of the file (paste ALL of it)
- ❌ Running query twice (IF NOT EXISTS handles this)
- ❌ Copy-pasting with incorrect encoding (use raw SQL editor)

If error occurs:
1. Note the exact error message
2. Note which line number (if shown)
3. Check that you're using `SUPABASE_SETUP_CLEAN.sql` (not the old file)
4. Try running verification query at bottom

## Related Files

- **[SQL_QUERY_REFERENCE.md](./SQL_QUERY_REFERENCE.md)** - Example queries for your code
- **[SUPABASE_CONFIGURATION.md](./SUPABASE_CONFIGURATION.md)** - Setup guide
- **[queries.ts](./src/services/queries.ts)** - Your frontend code that calls these tables

---

**You're almost there!** This is the final SQL file - no more errors after this.
