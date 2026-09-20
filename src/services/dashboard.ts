import { supabase } from "../utils/supabase";
import type { Content, DashboardCleanupStats, DashboardPinnedItems, DashboardStats, Group } from "../types";

export const fetchDashboardStats = async (): Promise<DashboardStats> => {
    const { data, error } = await supabase.rpc("get_dashboard_stats");

    if (error) {
        throw { status: "error", message: error.message }
    }

    return data as DashboardStats
}

export const fetchDashboardCleanupStats = async (): Promise<DashboardCleanupStats> => {
    const { data, error } = await supabase.rpc("get_dashboard_cleanup_stats");

    if (error) {
        throw { status: "error", message: error.message }
    }

    return data as DashboardCleanupStats
}

export const fetchDashboardPinned = async (): Promise<DashboardPinnedItems> => {
    const { data: pinnedContent, error: contentError } = await supabase
        .from("contents")
        .select("*")
        .order('updated_at', { ascending: false })
        .eq("is_pinned_dashboard", true);

    if (contentError) {
        throw { status: "error", message: contentError.message }
    }

    const { data: pinnedGroups, error: groupError } = await supabase
        .from("groups")
        .select("*")
        .order('updated_at', { ascending: false })
        .eq("is_pinned_dashboard", true);

    if (groupError) {
        throw { status: "error", message: groupError.message };
    }

    const dashboardPinnedItems: DashboardPinnedItems = {
        content: pinnedContent as Content[] ?? [],
        groups: pinnedGroups as Group[] ?? []
    };

    return dashboardPinnedItems

}

export const fetchRecentActivity = async (): Promise<Content[]> => {
    const { data, error } = await supabase
        .from('contents')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(15);

    if (error) {
        throw { status: "error", message: error.message }
    }

    return (data as Content[]) ?? [];
}