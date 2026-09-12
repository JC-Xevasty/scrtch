import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { List, ListCreate, ListDetail, ListRecordUpdate, ListUpdate } from "../types";
import { createList, deleteList, fetchList, fetchListCollection, updateList, updateListRecord } from "../services/lists";

interface MutationError { status?: string; message: string; }

/* 
 * Usage: const { data, isLoading, error } = useLists();
 */
export const useLists = () => useQuery<List[], MutationError>({
    queryKey: ['lists', 'list'],
    queryFn: fetchListCollection,
    staleTime: Infinity,
    gcTime: Infinity
})


/* 
 * Usage: const { data, isLoading, error } = useList(id);
 */
export const useList = (id: string | undefined) => useQuery<ListDetail, MutationError>({
    queryKey: ['lists', 'detail', id],
    queryFn: () => {
        if (!id) throw new Error("List ID is required.");
        return fetchList(id);
    },
    enabled: typeof id !== 'undefined' && id !== '' && id !== "new",
    staleTime: Infinity,
    gcTime: Infinity
})

export const useListMutation = () => {
    const queryClient = useQueryClient();

    const createMutation = useMutation<ListDetail, MutationError, ListCreate>({
        mutationFn: createList,
        onSuccess: (newList) => {
            queryClient.setQueryData(["lists", "detail", newList.id], newList)
            queryClient.invalidateQueries({ queryKey: ["lists", "list"] })

            // If moved to a group, invalidate that group to refetch the note
            if (newList.group_id) {
                queryClient.invalidateQueries({ queryKey: ["groups", "detail", newList.group_id] })
            }

            // Refresh recent
            queryClient.invalidateQueries({ queryKey: ["dashboard", "recent"] });
            // Refresh dashboard count
            queryClient.invalidateQueries({ queryKey: ["dashboard", "stats"] });
        }
    });

    const updateMutation = useMutation<ListDetail, MutationError, ListUpdate, { previousList?: ListDetail }>({
        mutationFn: updateList,
        onMutate: async (variables) => {
            await queryClient.cancelQueries({ queryKey: ["lists", "detail", variables.id] });
            // Store the old data from cache before being overwritten
            const previousList = queryClient.getQueryData<ListDetail>(["lists", "detail", variables.id])
            return { previousList };
        },
        onSuccess: (updatedList, _, onMutateResult) => {
            // Update the list
            queryClient.setQueryData(["lists", "detail", updatedList.id], updatedList)
            // Invalidate the lists collection so it fetches the updated list
            queryClient.invalidateQueries({ queryKey: ["lists", "list"] })

            // If the list before being updated belongs to a group, invalidate that group to refetch the updated list.
            const oldGroupId = onMutateResult?.previousList?.group_id;
            if (oldGroupId) {
                queryClient.invalidateQueries({ queryKey: ["groups", "detail", oldGroupId] })
            }

            // If moved to a group, invalidate that group to refetch the list
            if (updatedList.group_id && updatedList.group_id !== oldGroupId) {
                queryClient.invalidateQueries({ queryKey: ["groups", "detail", updatedList.group_id] })
            }

            // Refresh recent
            queryClient.invalidateQueries({ queryKey: ["dashboard", "recent"] });
        }
    })

    const updateRecordMutation = useMutation<ListDetail, MutationError, { id: string } & ListRecordUpdate, { previousList?: ListDetail }>({
        mutationFn: ({ id, ...updates }) => updateListRecord(id, updates),
        onMutate: async (variables) => {
            await queryClient.cancelQueries({ queryKey: ["lists", "detail", variables.id] });
            // Store the old data from cache before being overwritten
            const previousList = queryClient.getQueryData<ListDetail>(["lists", "detail", variables.id])
            return { previousList };
        },
        onSuccess: (updatedList, variables, onMutateResult) => {
            // Update the list
            queryClient.setQueryData(["lists", "detail", updatedList.id], updatedList)
            // Invalidate the lists collection so it fetches the updated list
            queryClient.invalidateQueries({ queryKey: ["lists", "list"] })

            // If the list before being updated belongs to a group, invalidate that group to refetch the updated list.
            const oldGroupId = onMutateResult?.previousList?.group_id;
            if (oldGroupId) {
                queryClient.invalidateQueries({ queryKey: ["groups", "detail", oldGroupId] })
            }

            // If moved to a group, invalidate that group to refetch the list
            if (updatedList.group_id && updatedList.group_id !== oldGroupId) {
                queryClient.invalidateQueries({ queryKey: ["groups", "detail", updatedList.group_id] })
            }

            // If pinned status is changed, refresh pinned items in dashboard
            if ("is_pinned_dashboard" in variables) {
                queryClient.invalidateQueries({ queryKey: ["dashboard", "pinned"] });
            }
            // Refresh recent
            queryClient.invalidateQueries({ queryKey: ["dashboard", "recent"] });
        }
    })

    const deleteMutation = useMutation<void, MutationError, string, { previousList?: ListDetail }>({
        mutationFn: deleteList,
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: ["lists", "detail", id] });
            // Store the old data from cache before being overwritten
            const previousList = queryClient.getQueryData<ListDetail>(["lists", "detail", id])
            return { previousList };
        },
        onSuccess: (_, __, onMutateResult) => {
            // Refetch list collection
            queryClient.invalidateQueries({ queryKey: ["lists", "list"] })

            // If the list before being updated belongs to a group, invalidate that group to refetch the updated list.
            const oldGroupId = onMutateResult?.previousList?.group_id;
            if (oldGroupId) {
                queryClient.invalidateQueries({ queryKey: ["groups", "detail", oldGroupId] })
            }

            // If list is pinned to dashboard before deletion, refresh pinned items in dashboard
            if (onMutateResult.previousList?.is_pinned_dashboard) {
                queryClient.invalidateQueries({ queryKey: ["dashboard", "pinned"] });
            }
            // Refresh recent
            queryClient.invalidateQueries({ queryKey: ["dashboard", "recent"] });
            // Refresh dashboard count
            queryClient.invalidateQueries({ queryKey: ["dashboard", "stats"] });
            // Refresh pinned items if list was pinned to dashboard
            if (onMutateResult?.previousList?.is_pinned_dashboard) {
                queryClient.invalidateQueries({ queryKey: ["dashboard", "pinned"] });
            }
        }
    })

    return {
        createList: createMutation.mutateAsync,
        isCreating: createMutation.isPending,

        updateList: updateMutation.mutateAsync,
        updateListRecord: updateRecordMutation.mutateAsync,
        isUpdating: updateMutation.isPending || updateRecordMutation.isPending,

        deleteList: deleteMutation.mutateAsync,
        isDeleting: deleteMutation.isPending
    }
}