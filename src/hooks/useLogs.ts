import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Log, LogCreate, LogDetail, LogRecordUpdate, LogUpdate } from "../types";
import { createLog, deleteLog, fetchLog, fetchLogCollection, updateLog, updateLogRecord } from "../services/logs";

interface MutationError { status?: string; message: string; }

/* 
 * Usage: const { data, isLoading, error } = useLogs();
 */
export const useLogs = () => useQuery<Log[], MutationError>({
    queryKey: ['logs', 'list'],
    queryFn: fetchLogCollection,
    staleTime: Infinity,
    gcTime: Infinity
})

/* 
 * Usage: const { data, isLoading, error } = useLog(id);
 */
export const useLog = (id: string | undefined) => useQuery<LogDetail, MutationError>({
    queryKey: ['logs', 'detail', id],
    queryFn: () => {
        if (!id) throw new Error("Log ID is required.");
        return fetchLog(id);
    },
    enabled: typeof id !== 'undefined' && id !== '' && id !== "new",
    staleTime: Infinity,
    gcTime: Infinity
})

export const useLogMutation = () => {
    const queryClient = useQueryClient();

    const createMutation = useMutation<LogDetail, MutationError, LogCreate>({
        mutationFn: createLog,
        onSuccess: (newLog) => {
            queryClient.setQueryData(["logs", "detail", newLog.id], newLog)
            queryClient.invalidateQueries({ queryKey: ["logs", "list"] })

            // If moved to a group, invalidate that group to refetch the note
            if (newLog.group_id) {
                queryClient.invalidateQueries({ queryKey: ["groups", "detail", newLog.group_id] })
            }

            // Refresh recent
            queryClient.invalidateQueries({ queryKey: ["dashboard", "recent"] });
            // Refresh dashboard count
            queryClient.invalidateQueries({ queryKey: ["dashboard", "stats"] });
        }
    });

    const updateMutation = useMutation<LogDetail, MutationError, LogUpdate, { previousLog?: LogDetail }>({
        mutationFn: updateLog,
        onMutate: async (variables) => {
            await queryClient.cancelQueries({ queryKey: ["logs", "detail", variables.id] });
            // Store the old data from cache before being overwritten
            const previousLog = queryClient.getQueryData<LogDetail>(["logs", "detail", variables.id])
            return { previousLog };
        },
        onSuccess: (updatedLog, _, onMutateResult) => {
            // Update the log
            queryClient.setQueryData(["logs", "detail", updatedLog.id], updatedLog)
            // Invalidate the logs collection so it fetches the updated log
            queryClient.invalidateQueries({ queryKey: ["logs", "list"] })

            // If the log before being updated belongs to a group, invalidate that group to refetch the updated log.
            const oldGroupId = onMutateResult?.previousLog?.group_id;
            if (oldGroupId) {
                queryClient.invalidateQueries({ queryKey: ["groups", "detail", oldGroupId] })
            }

            // If moved to a group, invalidate that group to refetch the log
            if (updatedLog.group_id && updatedLog.group_id !== oldGroupId) {
                queryClient.invalidateQueries({ queryKey: ["groups", "detail", updatedLog.group_id] })
            }

            // Refresh recent
            queryClient.invalidateQueries({ queryKey: ["dashboard", "recent"] });
        }
    })

    const updateRecordMutation = useMutation<LogDetail, MutationError, { id: string } & LogRecordUpdate, { previousLog?: LogDetail }>({
        mutationFn: ({ id, ...updates }) => updateLogRecord(id, updates),
        onMutate: async (variables) => {
            await queryClient.cancelQueries({ queryKey: ["logs", "detail", variables.id] });
            // Store the old data from cache before being overwritten
            const previousLog = queryClient.getQueryData<LogDetail>(["logs", "detail", variables.id])
            return { previousLog };
        },
        onSuccess: (updatedLog, variables, onMutateResult) => {
            // Update the log
            queryClient.setQueryData(["logs", "detail", updatedLog.id], updatedLog)
            // Invalidate the logs collection so it fetches the updated log
            queryClient.invalidateQueries({ queryKey: ["logs", "list"] })

            // If the log before being updated belongs to a group, invalidate that group to refetch the updated log.
            const oldGroupId = onMutateResult?.previousLog?.group_id;
            if (oldGroupId) {
                queryClient.invalidateQueries({ queryKey: ["groups", "detail", oldGroupId] })
            }

            // If moved to a group, invalidate that group to refetch the log
            if (updatedLog.group_id && updatedLog.group_id !== oldGroupId) {
                queryClient.invalidateQueries({ queryKey: ["groups", "detail", updatedLog.group_id] })
            }

            // If pinned status is changed, refresh pinned items in dashboard
            if ("is_pinned_dashboard" in variables) {
                queryClient.invalidateQueries({ queryKey: ["dashboard", "pinned"] });
            }

            // Refresh recent
            queryClient.invalidateQueries({ queryKey: ["dashboard", "recent"] });
        }
    })

    const deleteMutation = useMutation<void, MutationError, string, { previousLog?: LogDetail }>({
        mutationFn: deleteLog,
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: ["logs", "detail", id] });
            // Store the old data from cache before being overwritten
            const previousLog = queryClient.getQueryData<LogDetail>(["logs", "detail", id])
            return { previousLog };
        },
        onSuccess: (_, __, onMutateResult) => {
            // Refetch log collection
            queryClient.invalidateQueries({ queryKey: ["logs", "list"] })

            // If the list before being updated belongs to a group, invalidate that group to refetch the updated list.
            const oldGroupId = onMutateResult?.previousLog?.group_id;
            if (oldGroupId) {
                queryClient.invalidateQueries({ queryKey: ["groups", "detail", oldGroupId] })
            }

            // Refresh recent
            queryClient.invalidateQueries({ queryKey: ["dashboard", "recent"] });
            // Refresh dashboard count
            queryClient.invalidateQueries({ queryKey: ["dashboard", "stats"] });
            // Refresh pinned items if log was pinned to dashboard
            if (onMutateResult?.previousLog?.is_pinned_dashboard) {
                queryClient.invalidateQueries({ queryKey: ["dashboard", "pinned"] });
            }
        }
    })

    return {
        createLog: createMutation.mutateAsync,
        isCreating: createMutation.isPending,

        updateLog: updateMutation.mutateAsync,
        updateLogRecord: updateRecordMutation.mutateAsync,
        isUpdating: updateMutation.isPending || updateRecordMutation.isPending,

        deleteLog: deleteMutation.mutateAsync,
        isDeleting: deleteMutation.isPending
    }
}