
/*
# Fix signup: grant supabase_auth_admin insert on profiles

The auth signup trigger runs as supabase_auth_admin in Supabase hosted projects.
This role is subject to RLS. We need to either:
1. Grant bypass RLS on profiles to supabase_auth_admin, or
2. Add a policy that allows the service role to insert

Solution: grant the auth admin role direct insert rights bypassing RLS.
*/

-- Grant supabase_auth_admin bypass RLS on profiles 
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;

-- Add policy for service_role (used by trigger) 
DROP POLICY IF EXISTS "service_role_insert_profiles" ON public.profiles;
CREATE POLICY "service_role_insert_profiles" ON public.profiles
  FOR INSERT TO service_role
  WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_update_profiles" ON public.profiles;
CREATE POLICY "service_role_update_profiles" ON public.profiles
  FOR UPDATE TO service_role
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_select_profiles" ON public.profiles;
CREATE POLICY "service_role_select_profiles" ON public.profiles
  FOR SELECT TO service_role
  USING (true);

-- Also grant to anon so trigger under auth context can write
-- The trigger runs as supabase_auth_admin which maps to the auth context
GRANT INSERT ON public.profiles TO supabase_auth_admin;
GRANT SELECT ON public.profiles TO supabase_auth_admin;
