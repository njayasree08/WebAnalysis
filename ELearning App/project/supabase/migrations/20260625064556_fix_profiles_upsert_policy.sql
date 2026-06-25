
/*
# Allow upsert on profiles for authenticated users (their own row)

The client-side profile creation after signup needs to do an upsert.
The existing INSERT policy only allows INSERT for authenticated.
We also need to make sure the upsert (INSERT + ON CONFLICT UPDATE) works.
*/

-- Allow authenticated users to upsert their own profile
DROP POLICY IF EXISTS "profiles_upsert_own" ON public.profiles;
CREATE POLICY "profiles_upsert_own" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- The update policy already exists, just ensure it covers upsert scenarios
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
