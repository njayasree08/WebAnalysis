
/*
# Fix profiles trigger and RLS to allow signup

The signup was failing because handle_new_user trigger couldn't INSERT into profiles
due to RLS blocking non-authenticated sessions. Fix by:
1. Recreating the function with proper SECURITY DEFINER owned by postgres
2. The SECURITY DEFINER function runs as its owner (postgres) which bypasses RLS
*/

-- Drop and recreate trigger function as postgres-owned SECURITY DEFINER
-- This allows the trigger to insert profiles bypassing RLS during signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Ensure trigger is still attached
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
