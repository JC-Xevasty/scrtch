
import { supabase } from "../utils/supabase";
import type { Link, LinkCreate, LinkDelete, LinkFolder, LinkUpdate } from "../types";

export const fetchLinksByFolder = async (folder_id: Link["folder_id"]): Promise<LinkFolder> => {
    const { data, error } = await supabase.rpc("get_link_folder_data", {
        p_folder_id: folder_id,
    })

    if (error) {
        throw { status: "error", message: error.message }
    }

    return (data as LinkFolder) ?? [];
}

export const createLinkItem = async (link: LinkCreate): Promise<Link> => {
    const { data, error } = await supabase
        .from("links")
        .insert([link])
        .select("*")
        .single();

    if (error) {
        throw { status: "error", message: error.message }
    }

    return (data as Link);
}

export const updateLinkItem = async (id: string, updates: LinkUpdate): Promise<Link> => {
    const { data, error } = await supabase
        .from("links")
        .update(updates)
        .eq("id", id)
        .select("*")
        .single();

    if (error) {
        throw { status: "error", message: error.message }
    }

    return (data as Link);
}

export const deleteLinkItem = async (link: LinkDelete): Promise<void> => {
    const { error } = await supabase
        .from("links")
        .delete()
        .eq("id", link.id)

    if (error) {
        throw { status: "error", message: error.message }
    }
}