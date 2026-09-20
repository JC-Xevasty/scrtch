import { supabase } from "../utils/supabase";
import type { Group, GroupContent, GroupCreate, GroupDelete, GroupUpdate } from "../types";


/* Fetch all groups which belongs to the authenticated user */
export const fetchGroupCollection = async (): Promise<Group[]> => {
    const { data, error } = await supabase
        .from("groups")
        .select("*")
        .order("updated_at", { ascending: false });

    if (error) {
        throw { status: "error", message: error.message }
    }

    return (data as unknown as Group[]) ?? [];
}

/* Fetch a single group by id */
export const fetchGroup = async (id: string): Promise<GroupContent> => {
    const { data: groupData, error: groupError } = await supabase
        .from("groups")
        .select("*")
        .eq("id", id)
        .maybeSingle();

    if (groupError) {
        throw { status: "error", message: groupError.message }
    }

    if (!groupData) {
        return groupData as unknown as GroupContent;
    }

    const { data: contentData, error: contentError } = await supabase.from("contents").select("*").eq("group_id", id);

    if (contentError) {
        throw { status: "error", message: contentError.message }
    }

    const groupContent: GroupContent = {
        ...(groupData as Group),
        content: contentData ?? []
    }

    return groupContent;
}

/* Create a group */
export const createGroup = async (group: GroupCreate): Promise<Group> => {
    const { data, error } = await supabase
        .from("groups")
        .insert([group])
        .select("*")
        .single();

    if (error) {
        throw { status: "error", message: error.message }
    }

    return data as unknown as Group;
}

/* Update a group by id */
export const updateGroup = async (id: string, updates: GroupUpdate): Promise<GroupContent> => {
    const { data: groupData, error: groupError } = await supabase
        .from("groups")
        .update(updates)
        .eq('id', id)
        .select("*")
        .single();

    if (groupError) {
        throw { status: "error", message: groupError.message }
    }

    const { data: contentData, error: contentError } = await supabase.from("contents").select("*").eq("group_id", id);

    if (contentError) {
        throw { status: "error", message: contentError.message }
    }

    const groupContent: GroupContent = {
        ...(groupData as Group),
        content: contentData ?? []
    }

    return groupContent;
}

/* Delete a group */
export const deleteGroup = async ({ id, delete_contents }: GroupDelete) => {
    const { error } = await supabase.rpc("handle_delete_group_rpc", {
        group_id_param: id,
        delete_contents_param: delete_contents
    })

    if (error) {
        throw { status: "error", message: error.message }
    }
}
