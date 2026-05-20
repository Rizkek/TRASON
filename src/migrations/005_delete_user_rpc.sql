-- Migration: 005_delete_user_rpc
-- Create a function to allow users to completely delete their own account and all cascaded data.
-- This function runs with elevated privileges (security definer) to bypass normal RLS restrictions on auth.users.

CREATE OR REPLACE FUNCTION delete_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Ensure a user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Delete the user from auth.users. 
  -- Note: Depending on foreign key definitions (ON DELETE CASCADE),
  -- this will automatically delete records in public tables (like user_preferences, activities, etc.)
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;
