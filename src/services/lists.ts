import { supabase } from "../utils/supabase";
import type { List, ListCreate, ListDetail, ListRecordUpdate, ListUpdate } from "../types";

/* Fetch all lists which belongs to the authenticated user */
export const fetchListCollection = async (): Promise<List[]> => {
    const { data, error } = await supabase
        .from("lists")
        .select("*, groups(title)")
        .order("updated_at", { ascending: false });

    if (error) {
        throw { status: "error", message: error.message }
    }

    return (data as unknown as List[]) ?? [];
}

/* Fetch a single list by id */
export const fetchList = async (id: string): Promise<ListDetail> => {
    const { data, error } = await supabase
        .from("lists")
        .select("*, groups(title), list_items(*)")
        .order("item_order", { referencedTable: "list_items", ascending: true })
        .eq("id", id)
        .maybeSingle();

    if (error) {
        throw { status: "error", message: error.message }
    }

    return data as unknown as ListDetail;
}

/* Create list and items */
export const createList = async (list: ListCreate): Promise<ListDetail> => {
    const { data, error } = await supabase.rpc("handle_create_list_rpc", {
        p_title: list.title,
        p_list_type: list.list_type,
        p_group_id: list.group_id,
        p_list_items: list.list_items
    })

    if (error) {
        throw { status: "error", message: error.message }
    }

    return data as unknown as ListDetail;
}

/* Update parent list record */
export const updateListRecord = async (id: string, updates: ListRecordUpdate): Promise<ListDetail> => {
    const { data, error } = await supabase
        .from("lists")
        .update(updates)
        .eq('id', id)
        .select("*, groups(title), list_items(*)")
        .order("item_order", { referencedTable: "list_items", ascending: true })
        .single();

    if (error) {
        throw { status: "error", message: error.message }
    }

    return data as unknown as ListDetail;
}

/* Update a list and its items */
export const updateList = async (list: ListUpdate): Promise<ListDetail> => {
    const { data, error } = await supabase.rpc("handle_update_list_rpc", {
        p_id: list.id,
        p_title: list.title,
        p_list_type: list.list_type,
        p_group_id: list.group_id,
        p_new_list_items: list.new_list_items,
        p_existing_list_items: list.existing_list_items,
        p_removed_list_items: list.removed_list_items,
    })

    if (error) {
        throw { status: "error", message: error.message }
    }

    return data as unknown as ListDetail;
}

/* Delete a list by id */
export const deleteList = async (id: string): Promise<void> => {
    const { error } = await supabase
        .from("lists")
        .delete()
        .eq("id", id)

    if (error) {
        throw { status: "error", message: error.message }
    }
}