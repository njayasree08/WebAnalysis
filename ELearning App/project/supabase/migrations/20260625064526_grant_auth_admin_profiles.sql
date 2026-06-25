
/*
# Definitive fix: grant supabase_auth_admin full access to profiles

In Supabase Cloud, the on_auth_user_created trigger executes under the
supabase_auth_admin role. We need to explicitly grant that role access
to the profiles table and add matching RLS policies.
*/

-- Grant table-level privileges to supabase_auth_admin
GRANT ALL ON public.profiles TO supabase_auth_admin;

-- Add RLS policy for supabase_auth_admin
DROP POLICY IF EXISTS "auth_admin_insert_profiles" ON public.profiles;
CREATE POLICY "auth_admin_insert_profiles" ON public.profiles
  FOR INSERT TO supabase_auth_admin
  WITH CHECK (true);

DROP POLICY IF EXISTS "auth_admin_select_profiles" ON public.profiles;
CREATE POLICY "auth_admin_select_profiles" ON public.profiles
  FOR SELECT TO supabase_auth_admin
  USING (true);
