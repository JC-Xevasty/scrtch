/*
* ==========================================
* 03_CONTENT_FUNCTIONS_TRIGGERS_DOWN_SCRIPT
* ==========================================
*/

/*
 * ------------------------------------------------------
 * DROP TRIGGER AND FUNCTIONS
 * ------------------------------------------------------
 */


DROP TRIGGER IF EXISTS structural_links_to_folder ON public.links;
DROP TRIGGER IF EXISTS structural_logs_to_group ON public.logs;
DROP TRIGGER IF EXISTS structural_lists_to_group ON public.lists;
DROP TRIGGER IF EXISTS structural_notes_to_group ON public.notes;
DROP TRIGGER IF EXISTS cascade_log_items_to_parent ON public.log_items;
DROP TRIGGER IF EXISTS cascade_list_items_to_parent ON public.list_items;


DROP FUNCTION IF EXISTS public.handle_delete_user_content_rpc();
DROP FUNCTION IF EXISTS public.handle_delete_group_rpc();
DROP FUNCTION IF EXISTS public.get_dashboard_cleanup_stats();
DROP FUNCTION IF EXISTS public.get_dashboard_stats();
DROP FUNCTION IF EXISTS public.get_link_folder_data();
DROP FUNCTION IF EXISTS public.handle_update_log_rpc();
DROP FUNCTION IF EXISTS public.handle_create_log_rpc();
DROP FUNCTION IF EXISTS public.handle_update_list_rpc();
DROP FUNCTION IF EXISTS public.handle_create_list_rpc();
DROP FUNCTION IF EXISTS public.handle_folder_structural_change();
DROP FUNCTION IF EXISTS public.handle_group_content_structural_change();
DROP FUNCTION IF EXISTS public.handle_child_item_timestamp_cascade();

DROP TRIGGER IF EXISTS set_links_updated_at ON public.links;
DROP TRIGGER IF EXISTS set_log_items_updated_at ON public.log_items;
DROP TRIGGER IF EXISTS set_logs_updated_at ON public.logs;
DROP TRIGGER IF EXISTS set_list_items_updated_at ON public.list_items;
DROP TRIGGER IF EXISTS set_lists_updated_at ON public.lists;
DROP TRIGGER IF EXISTS set_notes_updated_at ON public.notes;
DROP TRIGGER IF EXISTS set_groups_updated_at ON public.groups;