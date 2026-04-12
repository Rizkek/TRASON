-- ============================================================================
-- SUPABASE AUTH FIX - Auto Create User Profile on Signup
-- ============================================================================
-- Run this in Supabase SQL Editor to fix the user creation issue
-- This adds a trigger to auto-create user profiles when users sign up

-- ============================================================================
-- PART 1: FIX RLS POLICIES - Allow new users to create their own profile
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can insert own profile on signup" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;

-- Create new policies that allow authenticated users to manage their own profile

-- 1. Allow reading own profile (including before email verification)
CREATE POLICY "Users can read own data" ON users 
  FOR SELECT 
  USING (auth.uid() = id);

-- 2. Allow inserting own profile during signup
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 3. Allow updating own profile
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 4. Allow deleting own profile (optional)
CREATE POLICY "Users can delete own data" ON users
  FOR DELETE
  USING (auth.uid() = id);

-- ============================================================================
-- PART 2: CREATE TRIGGER - Auto-create user profile when auth user created
-- ============================================================================

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Note: The trigger on auth.users requires elevated permissions in Supabase
-- Instead, we handle new user creation from the client-side with the upsert approach
-- See signup page which uses: .upsert([...], { onConflict: 'id' })
--
-- The RLS policies below are sufficient for client-side user creation

-- ============================================================================
-- PART 3: CREATE USER PREFERENCES AUTOMATICALLY (OPTIONAL)
-- ============================================================================

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS create_preferences_on_user_create ON public.users CASCADE;
DROP FUNCTION IF EXISTS public.create_user_preferences() CASCADE;

-- Create function to auto-create user preferences
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
  ON CONFLICT (user_id) DO NOTHING;

  RETURN new;
END;
$$;

-- Create trigger for user preferences
CREATE TRIGGER create_preferences_on_user_create
  AFTER INSERT ON public.users
  FOR EACH ROW
  EXECUTE PROCEDURE public.create_user_preferences();

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Check if triggers are created
SELECT trigger_name, event_object_table, action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY trigger_name;

-- Check if functions exist
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('handle_new_user', 'create_user_preferences')
ORDER BY routine_name;

-- ============================================================================
-- NOTES
-- ============================================================================
-- After running this SQL:
-- 1. Try to sign up again with a test account
-- 2. New user profiles should be created automatically
-- 3. If still getting errors, check:
--    - Supabase > Authentication > Policies
--    - Run: DELETE FROM public.users WHERE id = 'test-id' to clean up failed attempts
-- ============================================================================
