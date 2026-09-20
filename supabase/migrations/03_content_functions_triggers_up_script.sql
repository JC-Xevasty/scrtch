/*
* ==========================================
* 03_CONTENT_FUNCTIONS_TRIGGERS_UP_SCRIPT
* ==========================================
*/


/* 
 * ====================
 * FUNCTIONS / TRIGGERS
 * ====================
 */


 /*
  * ------------------------------------------------------
  * Automatically set updated_at value when record changes
  * ------------------------------------------------------
  */

-- Note: public.set_current_timestamp_updated_at() is created in 00_automated.updated_at_setter_up_script
DROP TRIGGER IF EXISTS set_groups_updated_at ON public.groups;
CREATE TRIGGER set_groups_updated_at
  BEFORE UPDATE ON public.groups
  FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

DROP TRIGGER IF EXISTS set_notes_updated_at ON public.notes;
CREATE TRIGGER set_notes_updated_at
  BEFORE UPDATE ON public.notes
  FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();
      
DROP TRIGGER IF EXISTS set_lists_updated_at ON public.lists;
CREATE TRIGGER set_lists_updated_at
  BEFORE UPDATE ON public.lists
  FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

DROP TRIGGER IF EXISTS set_list_items_updated_at ON public.list_items;
CREATE TRIGGER set_list_items_updated_at
  BEFORE UPDATE ON public.list_items
  FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

DROP TRIGGER IF EXISTS set_logs_updated_at ON public.logs;
CREATE TRIGGER set_logs_updated_at
  BEFORE UPDATE ON public.logs
  FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

DROP TRIGGER IF EXISTS set_log_items_updated_at ON public.log_items;
CREATE TRIGGER set_log_items_updated_at
  BEFORE UPDATE ON public.log_items
  FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

DROP TRIGGER IF EXISTS set_links_updated_at ON public.links;
CREATE TRIGGER set_links_updated_at
  BEFORE UPDATE ON public.links
  FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();





 /*
  * ------------------------------------------------------
  * Automatically set updated_at of lists and logs records
  * if items is added, updated, or removed
  * ------------------------------------------------------
  */

CREATE OR REPLACE FUNCTION public.handle_child_item_timestamp_cascade()
RETURNS TRIGGER AS $$
BEGIN
  -- If table is list_items, bump parent list
  IF TG_TABLE_NAME = 'list_items' THEN
    UPDATE public.lists 
    SET updated_at = NOW() 
    WHERE id = COALESCE(NEW.list_id, OLD.list_id);
  -- If table is log_items, bump parent log
  ELSIF TG_TABLE_NAME = 'log_items' THEN
    UPDATE public.logs 
    SET updated_at = NOW() 
    WHERE id = COALESCE(NEW.log_id, OLD.log_id);
  END IF;
  RETURN NULL; -- Row-level after triggers can safely return NULL
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply handle_child_item_timestamp_cascade() function as trigger for list_items and log_items
DROP TRIGGER IF EXISTS cascade_list_items_to_parent ON public.list_items;
CREATE TRIGGER cascade_list_items_to_parent
  AFTER INSERT OR UPDATE OR DELETE ON public.list_items
  FOR EACH ROW EXECUTE FUNCTION public.handle_child_item_timestamp_cascade();

DROP TRIGGER IF EXISTS cascade_log_items_to_parent ON public.log_items;
CREATE TRIGGER cascade_log_items_to_parent
  AFTER INSERT OR UPDATE OR DELETE ON public.log_items
  FOR EACH ROW EXECUTE FUNCTION public.handle_child_item_timestamp_cascade();





/*
 * ------------------------------------------------------
 * Automatically set updated_at of group records if notes, 
 * lists, or logs are added, updated, reassigned, or removed
 * ------------------------------------------------------
 */

/* Update Parent Groups when Content is Added, Removed, or Reassigned */
CREATE OR REPLACE FUNCTION public.handle_group_content_structural_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Handle Insert/Update (Bumping the new group)
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') AND NEW.group_id IS NOT NULL THEN
    UPDATE public.groups SET updated_at = NOW() WHERE id = NEW.group_id;
  END IF;

  -- Handle Delete/Update (Bumping the old group if an item was removed or reassigned)
  IF (TG_OP = 'DELETE' OR TG_OP = 'UPDATE') AND OLD.group_id IS NOT NULL THEN
    -- Only bump old group if it actually changed or was dropped completely
    IF TG_OP = 'DELETE' OR OLD.group_id IS DISTINCT FROM NEW.group_id THEN
        UPDATE public.groups SET updated_at = NOW() WHERE id = OLD.group_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS structural_notes_to_group ON public.notes;
CREATE TRIGGER structural_notes_to_group
  AFTER INSERT OR UPDATE OR DELETE ON public.notes
  FOR EACH ROW EXECUTE FUNCTION public.handle_group_content_structural_change();

DROP TRIGGER IF EXISTS structural_lists_to_group ON public.lists;
CREATE TRIGGER structural_lists_to_group
  AFTER INSERT OR UPDATE OR DELETE ON public.lists
  FOR EACH ROW EXECUTE FUNCTION public.handle_group_content_structural_change();

DROP TRIGGER IF EXISTS structural_logs_to_group ON public.logs;
CREATE TRIGGER structural_logs_to_group
  AFTER INSERT OR UPDATE OR DELETE ON public.logs
  FOR EACH ROW EXECUTE FUNCTION public.handle_group_content_structural_change();





/*
 * ------------------------------------------------------
 * Automatically set updated_at of folder link records when
 * items are added, updated, or removed.
 * ------------------------------------------------------
 */

CREATE OR REPLACE FUNCTION public.handle_folder_structural_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Handle Insert/Update (Bumping the new folder)
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') AND NEW.folder_id IS NOT NULL THEN
    UPDATE public.links SET updated_at = NOW() WHERE id = NEW.folder_id AND item_type = 'folder';
  END IF;

  -- Handle Delete/Update (Bumping the old folder if an item was removed or reassigned)
  IF (TG_OP = 'DELETE' OR TG_OP = 'UPDATE') AND OLD.folder_id IS NOT NULL THEN
    IF TG_OP = 'DELETE' OR OLD.folder_id IS DISTINCT FROM NEW.folder_id THEN
        UPDATE public.links SET updated_at = NOW() WHERE id = OLD.folder_id AND item_type = 'folder';
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS structural_links_to_folder ON public.links;
CREATE TRIGGER structural_links_to_folder
  AFTER INSERT OR UPDATE OR DELETE ON public.links
  FOR EACH ROW EXECUTE FUNCTION public.handle_folder_structural_change();





/*
 * ------------------------------------------------------
 * CREATING A LIST
 * Create the parent list record and the child list_items records
 * ------------------------------------------------------
 */

CREATE OR REPLACE FUNCTION public.handle_create_list_rpc(
  p_title TEXT,
  p_list_type TEXT,
  p_group_id UUID,
  p_list_items JSONB
)
RETURNS JSONB
SET search_path = public
AS $$
DECLARE
  new_list_id UUID;
  result JSONB;
BEGIN
  -- Create the parent list and get the record id
  INSERT INTO public.lists (title, list_type, group_id, user_id)
  VALUES (p_title, p_list_type, p_group_id, auth.uid())
  RETURNING id INTO new_list_id;

  -- Check if there are list items
  IF p_list_items IS NOT NULL AND jsonb_array_length(p_list_items) > 0 THEN
    INSERT INTO public.list_items (list_id, title, content, item_order, checked)
    SELECT
      new_list_id,
        (item->>'title')::TEXT,
        (item->>'content')::TEXT,
        (item->>'item_order')::INTEGER,
        COALESCE((item->>'checked')::BOOLEAN, false)
    FROM jsonb_array_elements(p_list_items) AS item;
  END IF;

  -- Return resulting record
  SELECT 
    to_jsonb(l) ||
    jsonb_build_object(
        -- Fetch and join the group title object (handles null automatically)
        'groups', (
          SELECT jsonb_build_object('title', g.title)
          FROM public.groups g
          WHERE g.id = l.group_id
        ),
        -- Fetch, sort, and aggregate child items into a JSON array (handles empty arrays safely)
        'list_items', COALESCE((
          SELECT jsonb_agg(items_ordered)
          FROM (
              SELECT li.*
              FROM public.list_items li
              WHERE li.list_id = l.id
              ORDER BY li.item_order ASC
          ) items_ordered
        ), '[]'::jsonb)

    )
  INTO result
  FROM public.lists l
  WHERE l.id = new_list_id;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;





/*
 * ------------------------------------------------------
 * UPDATING A LIST
 * Update the parent list record and create new list_items
 * records, updated existing list_items records, and remove
 * list_items records.
 * ------------------------------------------------------
 */

CREATE OR REPLACE FUNCTION public.handle_update_list_rpc(
  p_id UUID,
  p_title TEXT,
  p_list_type TEXT,
  p_group_id UUID,
  p_new_list_items JSONB,
  p_existing_list_items JSONB,
  p_removed_list_items JSONB
)
RETURNS JSONB
SET search_path = public
AS $$
DECLARE
  new_list_id UUID;
  result JSONB;
BEGIN
  -- Update parent list record
  UPDATE public.lists
  SET
    title = p_title,
    list_type = p_list_type,
    group_id = p_group_id
  WHERE id = p_id AND user_id = auth.uid();

  -- If no rows were updated, it means the ID is invalid or doesn't belong to the user
  IF NOT FOUND THEN
    RAISE EXCEPTION 'List not found or unauthorized';
  END IF;

  -- Check if there are new list items
  IF p_new_list_items IS NOT NULL AND jsonb_array_length(p_new_list_items) > 0 THEN
    INSERT INTO public.list_items (list_id, title, content, item_order, checked)
    SELECT
        p_id,
        (item->>'title')::TEXT,
        (item->>'content')::TEXT,
        (item->>'item_order')::INTEGER,
        COALESCE((item->>'checked')::BOOLEAN, false)
    FROM jsonb_array_elements(p_new_list_items) AS item;
  END IF;

  -- Check if there are existing list items to update
  IF p_existing_list_items IS NOT NULL AND jsonb_array_length(p_existing_list_items) > 0 THEN
    UPDATE public.list_items li
    SET
        title = (item->>'title')::TEXT,
        content = (item->>'content')::TEXT,
        item_order = (item->>'item_order')::INTEGER,
        checked = COALESCE((item->>'checked')::BOOLEAN, false)
    FROM jsonb_array_elements(p_existing_list_items) AS item
    WHERE li.id = (item ->>'id')::UUID AND li.list_id = p_id;
  END IF;

  -- Check if there are list items to be removed
  IF p_removed_list_items IS NOT NULL AND jsonb_array_length(p_removed_list_items) > 0 THEN
    DELETE FROM public.list_items
    WHERE list_id = p_id
    AND id IN (
        SELECT (item->>'id')::UUID
        FROM jsonb_array_elements(p_removed_list_items) AS item
    );
  END IF;

  -- Return resulting record
  SELECT 
    to_jsonb(l) ||
    jsonb_build_object(
        -- Fetch and join the group title object (handles null automatically)
        'groups', (
          SELECT jsonb_build_object('title', g.title)
          FROM public.groups g
          WHERE g.id = l.group_id
        ),
        -- Fetch, sort, and aggregate child items into a JSON array (handles empty arrays safely)
        'list_items', COALESCE((
          SELECT jsonb_agg(items_ordered)
          FROM (
              SELECT li.*
              FROM public.list_items li
              WHERE li.list_id = l.id
              ORDER BY li.item_order ASC
          ) items_ordered
        ), '[]'::jsonb)

    )
  INTO result
  FROM public.lists l
  WHERE l.id = p_id;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;




/*
 * ------------------------------------------------------
 * CREATING A LOG
 * Create the parent log record and the child log_items records
 * ------------------------------------------------------
 */

CREATE OR REPLACE FUNCTION public.handle_create_log_rpc(
  p_title TEXT,
  p_group_id UUID,
  p_log_items JSONB
)
RETURNS JSONB
SET search_path = public
AS $$
DECLARE
  new_log_id UUID;
  result JSONB;
BEGIN
  -- Create the parent log and get the record id
  INSERT INTO public.logs (title, group_id, user_id)
  VALUES (p_title, p_group_id, auth.uid())
  RETURNING id INTO new_log_id;

  -- Check if there are log items
  IF p_log_items IS NOT NULL AND jsonb_array_length(p_log_items) > 0 THEN
    INSERT INTO public.log_items (log_id, title, content, entry_date)
    SELECT
        new_log_id,
        (item->>'title')::TEXT,
        (item->>'content')::TEXT,
        (item->>'entry_date')::TIMESTAMPTZ
    FROM jsonb_array_elements(p_log_items) AS item;
  END IF;

  -- Return resulting record
  SELECT 
    to_jsonb(l) ||
    jsonb_build_object(
        -- Fetch and join the group title object (handles null automatically)
        'groups', (
          SELECT jsonb_build_object('title', g.title)
          FROM public.groups g
          WHERE g.id = l.group_id
        ),
        -- Fetch, sort, and aggregate child items into a JSON array (handles empty arrays safely)
        'log_items', COALESCE((
          SELECT jsonb_agg(items_ordered)
          FROM (
              SELECT li.*
              FROM public.log_items li
              WHERE li.log_id = l.id
              ORDER BY li.entry_date ASC, li.created_at ASC
          ) items_ordered
        ), '[]'::jsonb)

    )
  INTO result
  FROM public.logs l
  WHERE l.id = new_log_id;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;






/*
 * ------------------------------------------------------
 * UPDATING A LOG
 * Update the parent log record and create new log_items
 * records, updated existing log_items records, and remove
 * log_items records.
 * ------------------------------------------------------
 */

CREATE OR REPLACE FUNCTION public.handle_update_log_rpc(
  p_id UUID,
  p_title TEXT,
  p_group_id UUID,
  p_new_log_items JSONB,
  p_existing_log_items JSONB,
  p_removed_log_items JSONB
)
RETURNS JSONB
SET search_path = public
AS $$
DECLARE
  new_log_id UUID;
  result JSONB;
BEGIN
  -- Update parent log record
  UPDATE public.logs
  SET
    title = p_title,
    group_id = p_group_id
  WHERE id = p_id AND user_id = auth.uid();

  -- If no rows were updated, it means the ID is invalid or doesn't belong to the user
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Log not found or unauthorized';
  END IF;

  -- Check if there are new log items
  IF p_new_log_items IS NOT NULL AND jsonb_array_length(p_new_log_items) > 0 THEN
    INSERT INTO public.log_items (log_id, title, content, entry_date)
    SELECT
        p_id,
        (item->>'title')::TEXT,
        (item->>'content')::TEXT,
        (item->>'entry_date')::TIMESTAMPTZ
    FROM jsonb_array_elements(p_new_log_items) AS item;
  END IF;

  -- Check if there are existing log items to update
  IF p_existing_log_items IS NOT NULL AND jsonb_array_length(p_existing_log_items) > 0 THEN
    UPDATE public.log_items li
    SET
        title = (item->>'title')::TEXT,
        content = (item->>'content')::TEXT,
        entry_date = (item->>'entry_date')::TIMESTAMPTZ
    FROM jsonb_array_elements(p_existing_log_items) AS item
    WHERE li.id = (item ->>'id')::UUID AND li.log_id = p_id;
  END IF;

  -- Check if there are log items to be removed
  IF p_removed_log_items IS NOT NULL AND jsonb_array_length(p_removed_log_items) > 0 THEN
    DELETE FROM public.log_items
    WHERE log_id = p_id
    AND id IN (
        SELECT (item->>'id')::UUID
        FROM jsonb_array_elements(p_removed_log_items) AS item
    );
  END IF;

  -- Return resulting record
  SELECT 
    to_jsonb(l) ||
    jsonb_build_object(
        -- Fetch and join the group title object (handles null automatically)
        'groups', (
          SELECT jsonb_build_object('title', g.title)
          FROM public.groups g
          WHERE g.id = l.group_id
        ),
        -- Fetch, sort, and aggregate child items into a JSON array (handles empty arrays safely)
        'log_items', COALESCE((
          SELECT jsonb_agg(items_ordered)
          FROM (
              SELECT li.*
              FROM public.log_items li
              WHERE li.log_id = l.id
              ORDER BY li.entry_date ASC, li.created_at ASC
          ) items_ordered
        ), '[]'::jsonb)

    )
  INTO result
  FROM public.logs l
  WHERE l.id = p_id;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;





/*
 * ------------------------------------------------------
 * FETCHING A LINK FOLDER, AND ITS SUB FOLDERS AND LINKS
 * ------------------------------------------------------
 */

CREATE OR REPLACE FUNCTION public.get_link_folder_data(p_folder_id UUID)
RETURNS JSONB
SET search_path = public
AS $$
DECLARE
  folder_data JSONB;
  folder_path JSONB;
  folder_items JSONB;
  result JSONB;
  v_uid UUID := auth.uid();
BEGIN
  -- Check if authenticated
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Fetch folder data if not null, otherwise return as root data
  IF p_folder_id IS NOT NULL THEN
    SELECT jsonb_build_object('id', l.id, 'title', l.title)
    INTO folder_data
    FROM public.links l
    WHERE id = p_folder_id AND user_id = v_uid;

    -- If no rows were found, it means the ID is invalid or doesn't belong to the user
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Link folder not found or unauthorized';
    END IF;
  ELSE
    folder_data := '{"id": null, "title": "Home"}'::JSONB;
  END IF;   

  -- Build the folder path
  WITH RECURSIVE path AS (
    SELECT id, title, folder_id, 1 as depth
    FROM public.links
    WHERE id = p_folder_id AND user_id = v_uid
    UNION ALL
    SELECT l.id, l.title, l.folder_id, p.depth + 1
    FROM public.links l
    JOIN path p ON l.id = p.folder_id
    WHERE l.user_id = v_uid
  )
  SELECT COALESCE(jsonb_agg(path_items), '[]'::JSONB)
  INTO folder_path
  FROM (
    SELECT jsonb_build_object('id', id, 'title', title) AS path_items
    FROM path
    ORDER BY depth DESC -- Note: Adjust logic if you need specific hierarchy order
  ) p_path;

  -- Get folder items
  SELECT COALESCE(jsonb_agg(item_data), '[]'::jsonb)
  INTO folder_items
  FROM (
    SELECT *
    FROM public.links
    WHERE ((p_folder_id IS NULL AND folder_id IS NULL) OR (folder_id = p_folder_id)) AND user_id = v_uid
    ORDER BY item_type ASC, created_at ASC
  ) item_data;

  -- Build the result
  SELECT jsonb_build_object(
    'folder_data', folder_data,
    'folder_path', folder_path,
    'folder_items', folder_items
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;





/*
 * ------------------------------------------------------
 * GET DASHBOARD STATS
 * ------------------------------------------------------
 */

CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS JSONB
SET search_path = public
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'notes', json_build_object(
      'count', (SELECT COUNT(*) FROM public.notes WHERE user_id = auth.uid()),
      'size', (SELECT pg_total_relation_size('public.notes'))
    ),
    'lists', json_build_object(
      'count', (SELECT COUNT(*) FROM public.lists WHERE user_id = auth.uid()),
      'size', (SELECT pg_total_relation_size('public.lists'))
    ),
    'list_items', json_build_object(
      'count', (
        SELECT COUNT(*) 
        FROM public.list_items li
        JOIN public.lists l ON li.list_id = l.id
        WHERE l.user_id = auth.uid()
      ),
      'size', (SELECT pg_total_relation_size('public.list_items'))
    ),
    'logs', json_build_object(
      'count', (SELECT COUNT(*) FROM public.logs WHERE user_id = auth.uid()),
      'size', (SELECT pg_total_relation_size('public.logs'))
    ),
    'log_items', json_build_object(
      'count', (
        SELECT COUNT(*) 
        FROM public.log_items li
        JOIN public.logs l ON li.log_id = l.id
        WHERE l.user_id = auth.uid()
      ),
      'size', (SELECT pg_total_relation_size('public.log_items'))
    ),
    'links', json_build_object(
      'folder_count', (SELECT COUNT(*) FROM public.links WHERE (user_id = auth.uid()) AND (item_type = 'folder')),
      'link_count', (SELECT COUNT(*) FROM public.links WHERE (user_id = auth.uid()) AND (item_type = 'link')),
      'size', (SELECT pg_total_relation_size('public.links'))
    ),
    'groups', json_build_object(
      'count', (SELECT COUNT(*) FROM public.groups WHERE user_id = auth.uid()),
      'size', (SELECT pg_total_relation_size('public.groups'))
    )
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;




/*
 * ------------------------------------------------------
 * GET DASHBOARD CLEANUP STATS
 * ------------------------------------------------------
 */

CREATE OR REPLACE FUNCTION get_dashboard_cleanup_stats()
RETURNS JSONB
SET search_path = public
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'empty_groups', (
      COALESCE((
        SELECT jsonb_agg(g) FROM public.groups g
        WHERE g.user_id = auth.uid()
        AND NOT EXISTS (SELECT 1 FROM public.notes n WHERE n.group_id = g.id)
        AND NOT EXISTS (SELECT 1 FROM public.lists l WHERE l.group_id = g.id)
        AND NOT EXISTS (SELECT 1 FROM public.logs l WHERE l.group_id = g.id)
      ),'[]'::jsonb)
    ),
    'ungrouped_content', (
      COALESCE((
        SELECT jsonb_agg(c) 
        FROM public.contents c 
        WHERE c.user_id = auth.uid() AND c.group_id IS NULL
      ), '[]'::jsonb)
    )
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;





/*
 * ------------------------------------------------------
 * DELETING A GROUP
 * Delete all the content records related to the group 
 * record and delete the group record or
 * Delete the group and will automtically set content 
 * records to have a group_id of NULL
 * ------------------------------------------------------
 */

CREATE OR REPLACE FUNCTION public.handle_delete_group_rpc(
  group_id_param UUID,
  delete_contents_param BOOLEAN
)
RETURNS VOID
SET search_path = public
AS $$
BEGIN
  -- If user requested for complete deletion, delete content first
  IF delete_contents_param THEN
    DELETE FROM public.notes WHERE group_id = group_id_param;
    DELETE FROM public.lists WHERE group_id = group_id_param;
    DELETE FROM public.logs WHERE group_id = group_id_param;
  END IF;

  -- If user requested to jsut delete the but keep the contents, ON DELETE SET NULL will handle it
  DELETE FROM public.groups WHERE id = group_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;





/*
 * ------------------------------------------------------
 * DELETING USER CONTENT
 * Delete all records related to the authenticated user
 * ------------------------------------------------------
 */

CREATE OR REPLACE FUNCTION public.handle_delete_user_content_rpc()
RETURNS VOID
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- 1. Force capture the authenticated user identity explicitly 
  -- while still in the main application session boundary context
  v_user_id := auth.uid();
  
  -- 2. Guard rail: If the JWT didn't pass correctly, crash immediately
  -- This ensures you get an error instead of a silent 204 if auth fails!
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication context missing or invalid JWT';
  END IF;

  -- 3. Execute deletions using the explicit memory variable
  DELETE FROM public.notes WHERE user_id = v_user_id;
  DELETE FROM public.lists WHERE user_id = v_user_id;
  DELETE FROM public.logs WHERE user_id = v_user_id;
  DELETE FROM public.links WHERE user_id = v_user_id;
  DELETE FROM public.groups WHERE user_id = v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;