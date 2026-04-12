<!-- ============================================================================
-- SUPABASE AUTH COMPLETE - Full Setup from Scratch (No Rate Limit Issues)
-- ============================================================================
-- Use this if you want to completely reset and start fresh
-- This DELETES all test users and recreates everything

-- ============================================================================
-- PART 0: CLEANUP (OPTIONAL - Only if you want fresh start)
-- ============================================================================

-- Delete all test users (CAREFUL - deletes your test accounts)
-- DELETE FROM public.users WHERE email LIKE 'test%';
-- DELETE FROM auth.users WHERE email LIKE 'test%';

-- ============================================================================
-- PART 1: VERIFY RLS POLICIES ARE SET UP CORRECTLY
-- ============================================================================

-- Check current policies
SELECT schemaname, tablename, policyname, cmd, using_expression
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'users'
ORDER BY tablename, policyname;

-- ============================================================================
-- PART 2: ENSURE CORRECT POLICIES EXIST
-- ============================================================================

-- Drop all old policies first
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can insert own profile on signup" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can delete own data" ON users;

-- Create fresh policies
CREATE POLICY "Users can read own data" ON users 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete own data" ON users
  FOR DELETE
  USING (auth.uid() = id);

-- ============================================================================
-- PART 3: AUTO-CREATE USER PREFERENCES ON SIGNUP
-- ============================================================================

DROP FUNCTION IF EXISTS public.create_user_preferences() CASCADE;
DROP TRIGGER IF EXISTS create_preferences_on_user_create ON public.users;

CREATE OR REPLACE FUNCTION public.create_user_preferences()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.user_preferences (
    user_id,
    theme,
    language,
    currency,
    timezone,
    notifications_enabled,
    push_notifications_enabled,
    email_digest_enabled,
    digest_frequency,
    created_at,
    updated_at
  )
  VALUES (
    new.id,
    'light',
    'en',
    'USD',
    'UTC',
    true,
    true,
    true,
    'weekly',
    now(),
    now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    updated_at = NOW();

  RETURN new;
END;
$$;

CREATE TRIGGER create_preferences_on_user_create
  AFTER INSERT ON public.users
  FOR EACH ROW
  EXECUTE PROCEDURE public.create_user_preferences();

-- ============================================================================
-- PART 4: VERIFY SETUP
-- ============================================================================

SELECT 'Policies' as check_type, COUNT(*) as count 
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'users'

UNION ALL

SELECT 'Triggers', COUNT(*) 
FROM information_schema.triggers 
WHERE trigger_schema = 'public' AND event_object_table = 'users'

UNION ALL

SELECT 'Functions', COUNT(*) 
FROM information_schema.routines 
WHERE routine_schema = 'public' AND routine_type = 'FUNCTION';

-- ============================================================================
-- PART 5: TESTING
-- ============================================================================

-- After running this:
-- 1. Do hard refresh: Ctrl+Shift+R
-- 2. Try to signup with a NEW email (different from before)
-- 3. Verify email if prompted
-- 4. Check if redirects to dashboard
-- 5. Check browser console F12 for logs

-- If you get "email rate limit exceeded", wait ~1 hour or use proxy

-- ============================================================================
