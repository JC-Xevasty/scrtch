/*
* ==========================================
* 02_CONTENT_TABLES_UP_SCRIPT
* ==========================================
*/

/*
 * CONTENT TABLES 
 */

/* GROUPS */
CREATE TABLE IF NOT EXISTS public.groups (
   id UUID DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
   title TEXT NOT NULL,
   description TEXT NOT NULL DEFAULT '',
   is_pinned_collection BOOLEAN NOT NULL DEFAULT false,
   is_pinned_dashboard BOOLEAN NOT NULL DEFAULT false,
   user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL DEFAULT auth.uid(),
   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

/* NOTES */
CREATE TABLE IF NOT EXISTS public.notes (
   id UUID DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
   title TEXT NOT NULL,
   content TEXT NOT NULL DEFAULT '',
   is_pinned_collection BOOLEAN NOT NULL DEFAULT false,
   is_pinned_group BOOLEAN NOT NULL DEFAULT false,
   is_pinned_dashboard BOOLEAN NOT NULL DEFAULT false,
   group_id UUID REFERENCES public.groups ON DELETE SET NULL DEFAULT NULL,
   user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL DEFAULT auth.uid(),
   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

/* LISTS */
CREATE TABLE IF NOT EXISTS public.lists (
   id UUID DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
   title TEXT NOT NULL,
   list_type TEXT NOT NULL, 
   is_pinned_collection BOOLEAN NOT NULL DEFAULT false,
   is_pinned_group BOOLEAN NOT NULL DEFAULT false,
   is_pinned_dashboard BOOLEAN NOT NULL DEFAULT false,
   group_id UUID REFERENCES public.groups ON DELETE SET NULL DEFAULT NULL,
   user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL DEFAULT auth.uid(),
   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
   -- Use 'CHECK' to limit what values are allowed in the column
   CHECK (list_type IN ('unordered', 'ordered', 'checklist'))
);

CREATE TABLE IF NOT EXISTS public.list_items (
   id UUID DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
   list_id UUID REFERENCES public.lists ON DELETE CASCADE NOT NULL,
   title TEXT NOT NULL,
   content TEXT NOT NULL DEFAULT '',
   checked BOOLEAN NOT NULL DEFAULT false,
   item_order INT NOT NULL,
   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

/* LOGS */
CREATE TABLE IF NOT EXISTS public.logs (
   id UUID DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
   title TEXT NOT NULL,
   is_pinned_collection BOOLEAN NOT NULL DEFAULT false,
   is_pinned_group BOOLEAN NOT NULL DEFAULT false,
   is_pinned_dashboard BOOLEAN NOT NULL DEFAULT false,
   group_id UUID REFERENCES public.groups ON DELETE SET NULL DEFAULT NULL,
   user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL DEFAULT auth.uid(),
   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.log_items (
   id UUID DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
   log_id UUID REFERENCES public.logs ON DELETE CASCADE NOT NULL,
   title TEXT NOT NULL,
   content TEXT NOT NULL DEFAULT '',
   entry_date TIMESTAMP WITH TIME ZONE NOT NULL,
   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

/* LINKS */
CREATE TABLE IF NOT EXISTS public.links (
   id UUID DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
   title TEXT NOT NULL,
   href TEXT DEFAULT NULL,
   item_type TEXT NOT NULL,
   folder_id UUID REFERENCES public.links ON DELETE CASCADE DEFAULT NULL,
   user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL DEFAULT auth.uid(),
   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
   -- Use 'CHECK' to limit what values are allowed in the column
   CHECK (item_type IN ('folder', 'link')),
   -- Enforce: folders shouldn't have links, links must have a destination address string
   CONSTRAINT check_link_fields CHECK (
      (item_type = 'folder' AND href IS NULL) OR
      (item_type = 'link' AND href <> '')
   )
);

/*
* HIGH PERFORMANCE LOOKUP INDEXES
*/
CREATE INDEX IF NOT EXISTS idx_groups_user ON public.groups(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_user ON public.notes(user_id);
CREATE INDEX IF NOT EXISTS idx_lists_user ON public.lists(user_id);
CREATE INDEX IF NOT EXISTS idx_list_items_lookup ON public.list_items(list_id, item_order);
CREATE INDEX IF NOT EXISTS idx_logs_user ON public.logs(user_id);
CREATE INDEX IF NOT EXISTS idx_log_items_lookup ON public.log_items(log_id, entry_date, created_at);
CREATE INDEX IF NOT EXISTS idx_links_user ON public.links(user_id);

CREATE INDEX IF NOT EXISTS idx_notes_user_group ON public.notes(user_id, group_id);
CREATE INDEX IF NOT EXISTS idx_lists_user_group ON public.lists(user_id, group_id);
CREATE INDEX IF NOT EXISTS idx_logs_user_group ON public.logs(user_id, group_id);
CREATE INDEX IF NOT EXISTS idx_links_user_folder ON public.links(user_id, folder_id);

/*
* GRANT / ACCESS
*/

-- Allow Supabase DATA API to see an interact with this table to authenticated users only
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.groups TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.notes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.lists TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.list_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.logs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.log_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.links TO authenticated;
-- Allow the backend 'service_role' (admin key) full access
GRANT ALL ON TABLE public.groups TO service_role;
GRANT ALL ON TABLE public.notes TO service_role;
GRANT ALL ON TABLE public.lists TO service_role;
GRANT ALL ON TABLE public.list_items TO service_role;
GRANT ALL ON TABLE public.logs TO service_role;
GRANT ALL ON TABLE public.log_items TO service_role;
GRANT ALL ON TABLE public.links TO service_role;

/*
* ROW LEVEL SECURITY (RLS)
*/
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.log_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;

-- Policies
-- Parent Table Policies (checking user_id)
CREATE POLICY "Users can manage their own groups" ON public.groups
   FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own notes" ON public.notes
   FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own lists" ON public.lists
   FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own logs" ON public.logs
   FOR ALL USING (auth.uid() = user_id);

/* 
 * Since there is an auth.uid() = user_id validation on every row operation,
 * don't need to check the ancestry parent folder ownership directly because
 * RLS will automatically isolate unaitorized parent folder records from being 
 * read anyway.
 */
CREATE POLICY "Users can manage their own links" ON public.links
   FOR ALL USING (auth.uid() = user_id);

-- Child Table Policies: LIST ITEMS
CREATE POLICY "Users can manage items of their own lists" ON public.list_items
   FOR ALL USING (
      list_id IN (SELECT id FROM public.lists WHERE user_id = auth.uid())
   );

-- Child Table Policies: LOG ITEMS
CREATE POLICY "Users can manage items of their own logs" ON public.log_items
   FOR ALL USING (
      log_id IN (SELECT id FROM public.logs WHERE user_id = auth.uid())
   );


/* 
 * VIEWS
 */

CREATE OR REPLACE VIEW public.contents 
WITH (security_barrier = true) AS
SELECT (
   c.id, 
   c.type, 
   c.title, 
   c.group_id, 
   c.is_pinned_collection, 
   c.is_pinned_group, 
   c.is_pinned_dashboard, 
   c.updated_at,
   c.user_id,
   g.title as group_title
)
FROM (
   SELECT id, 'notes' as type, title, group_id, is_pinned_collection, is_pinned_group, is_pinned_dashboard, updated_at, user_id FROM public.notes
   UNION ALL
   SELECT id, 'lists' as type, title, group_id, is_pinned_collection, is_pinned_group, is_pinned_dashboard, updated_at, user_id FROM public.lists
   UNION ALL
   SELECT id, 'logs' as type, title, group_id, is_pinned_collection, is_pinned_group, is_pinned_dashboard, updated_at, user_id FROM public.logs;
) c
LEFT JOIN public.groups g ON c.group_id = g.id;

ALTER VIEW public.contents SET (security_invoker = true); 