/*
* ==========================================
* 01_PROFILES_DOWN_SCRIPT
* ==========================================
*/

/*
* DROP FUNCTIONS AND TRIGGERS
*/

-- Drop the external trigger pointing to auth schema first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop table specific triggers
DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;

-- Drop execution functions
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.delete_user_account_rpc();

/*
* DROP TABLES
*/

-- Drop the profiles table (this automatically drops associated RLS policies, checks, and grants)
DROP TABLE IF EXISTS public.profiles;