/*
* ==========================================
* 01_PROFILES_UP_SCRIPT
* ==========================================
*/

/*
* TABLES
*/

CREATE TABLE IF NOT EXISTS public.profiles (
   id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
   theme TEXT NOT NULL DEFAULT 'system',
   home TEXT NOT NULL DEFAULT 'home',
   post_save_action TEXT NOT NULL DEFAULT 'view',
   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
   -- Use 'CHECK' to limit what values are allowed in the column
   CHECK (theme IN ('light', 'dark', 'system')),
   CHECK (home IN ('home', 'groups', 'notes', 'lists', 'logs', 'links')),
   CHECK (post_save_action IN ('stay', 'view'))
);

/*
* GRANT / ACCESS
*/

-- Allow Supabase DATA API to see an interact with this table to authenticated users only
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.profiles TO authenticated;
-- Allow the backend 'service_role' (admin key) full access
GRANT ALL ON TABLE public.profiles TO service_role;

/*
* ROW LEVEL SECURITY (RLS)
*/

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can read their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Users can delete their own profile"
ON public.profiles FOR DELETE
USING (auth.uid() = id);

/*
* FUNCTIONS AND TRIGGERS
*/

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
   INSERT INTO public.profiles(id)
   VALUES (new.id);
   RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.delete_user_account_rpc()
RETURNS VOID
SET search_path = public
AS $$
DECLARE
   v_user_id UUID;
BEGIN
   -- 1. Capture the executing user's ID safely
   v_user_id := auth.uid();
    
   IF v_user_id IS NULL THEN
      RAISE EXCEPTION 'Not authenticated';
   END IF;

   -- 2. Manually clean up app data first to reduce cascade overhead
   DELETE FROM public.notes WHERE user_id = v_user_id;
   DELETE FROM public.lists WHERE user_id = v_user_id;
   DELETE FROM public.logs WHERE user_id = v_user_id;
   DELETE FROM public.links WHERE user_id = v_user_id;
   DELETE FROM public.groups WHERE user_id = v_user_id;

   -- 3. Now delete the auth record
   DELETE FROM auth.users WHERE id = v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Clean up old trigger if it exists to avoid duplicates
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
   AFTER INSERT ON auth.users
   FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Automatically set updated_at value if row updates
DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
   BEFORE UPDATE ON public.profiles
   FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();
