import { supabase } from "../utils/supabase";
import type { Log, LogCreate, LogDetail, LogRecordUpdate, LogUpdate } from "../types";

/* Fetch all logs which belongs to the authenticated user */
export const fetchLogCollection = async (): Promise<Log[]> => {
    const { data, error } = await supabase
        .from("logs")
        .select("*, groups(title)")
        .order("updated_at", { ascending: false });

    if (error) {
        throw { status: "error", message: error.message }
    }

    return (data as unknown as Log[]) ?? [];
}

/* Fetch a single log by id */
export const fetchLog = async (id: string): Promise<LogDetail> => {
    const { data, error } = await supabase
        .from("logs")
        .select("*, groups(title), log_items(*)")
        .order("entry_date", { referencedTable: "log_items", ascending: true })
        .order("created_at", { referencedTable: "log_items", ascending: true })
        .eq("id", id)
        .maybeSingle();

    if (error) {
        throw { status: "error", message: error.message }
    }

    return data as unknown as LogDetail;
}

/* Create log and items */
export const createLog = async (log: LogCreate): Promise<LogDetail> => {
    const { data, error } = await supabase.rpc("handle_create_log_rpc", {
        p_title: log.title,
        p_group_id: log.group_id,
        p_log_items: log.log_items
    })

    if (error) {
        throw { status: "error", message: error.message }
    }

    return data as unknown as LogDetail;
}

/* Update parent log record */
export const updateLogRecord = async (id: string, updates: LogRecordUpdate): Promise<LogDetail> => {
    const { data, error } = await supabase
        .from("logs")
        .update(updates)
        .eq('id', id)
        .select("*, groups(title), log_items(*)")
        .order("entry_date", { referencedTable: "log_items", ascending: true })
        .order("created_at", { referencedTable: "log_items", ascending: true })
        .single();

    if (error) {
        throw { status: "error", message: error.message }
    }

    return data as unknown as LogDetail;
}


/* Update a log and its items */
export const updateLog = async (log: LogUpdate): Promise<LogDetail> => {
    const { data, error } = await supabase.rpc("handle_update_log_rpc", {
        p_id: log.id,
        p_title: log.title,
        p_group_id: log.group_id,
        p_new_log_items: log.new_log_items,
        p_existing_log_items: log.existing_log_items,
        p_removed_log_items: log.removed_log_items,
    })

    if (error) {
        throw { status: "error", message: error.message }
    }

    return data as unknown as LogDetail;
}


/* Delete a log by id */
export const deleteLog = async (id: string): Promise<void> => {
    const { error } = await supabase
        .from("logs")
        .delete()
        .eq("id", id)

    if (error) {
        throw { status: "error", message: error.message }
    }
}