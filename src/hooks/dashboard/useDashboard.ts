import { useQuery } from "@tanstack/react-query";
import { fetchDashboardCleanupStats, fetchDashboardPinned, fetchDashboardStats, fetchRecentActivity } from "../../services/dashboard";
import type { Content, DashboardCleanupStats, DashboardPinnedItems, DashboardStats } from "../../types";

interface MutationError { status?: string; message: string; }

/* 
 * Usage: const { data, isLoading, error } = useLinks();
 */
export const useDashboardStats = () => useQuery<DashboardStats, MutationError>({
    queryKey: ['dashboard', 'stats'],
    queryFn: fetchDashboardStats,
    staleTime: Infinity,
    gcTime: Infinity
})

export const useDashboardPinned = () => useQuery<DashboardPinnedItems, MutationError>({
    queryKey: ['dashboard', 'pinned'],
    queryFn: fetchDashboardPinned,
    staleTime: Infinity,
    gcTime: Infinity
})

export const useDashboardCleanupStats = () => useQuery<DashboardCleanupStats, MutationError>({
    queryKey: ['dashboard', 'cleanup'],
    queryFn: fetchDashboardCleanupStats,
    staleTime: Infinity,
    gcTime: Infinity
})

export const useRecentActivity = () => useQuery<Content[], MutationError>({
    queryKey: ['dashboard', 'recent'],
    queryFn: fetchRecentActivity,
    staleTime: Infinity,
    gcTime: Infinity
})