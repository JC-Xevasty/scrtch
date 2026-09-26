import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Group, GroupContent, GroupCreate, GroupDelete, GroupUpdate, ListDetail, LogDetail, Note } from "../../types";
import { createGroup, deleteGroup, fetchGroup, fetchGroupCollection, updateGroup } from "../../services/groups";

interface MutationError { status?: string; message: string; }

/* 
 * Usage: const { data, isLoading, error } = useGroups();
 */
export const useGroups = (enabled: boolean = true) => useQuery<Group[], MutationError>({
    queryKey: ['groups', 'list'],
    queryFn: fetchGroupCollection,
    staleTime: Infinity,
    gcTime: Infinity,
    enabled
})

/* 
 * Usage: const { data, isLoading, error } = useGroup(id);
 */
export const useGroup = (id: string | undefined) => useQuery<GroupContent, MutationError>({
    queryKey: ['groups', 'detail', id],
    queryFn: () => {
        if (!id) throw new Error("Group ID is required.");
        return fetchGroup(id);
    },
    enabled: typeof id !== 'undefined' && id !== '',
    staleTime: Infinity,
    gcTime: Infinity
})

/* 
 * Usage: 
 *      const { createGroup, isCreating, updateGroup, isUpdating, deleteGroup, isDeleting } = useGroupMutation();
 *      await createGroup(GroupCreate)
 *      await updateGroup({id} & GroupUpdate)
 *      await deleteGroup()
 */
export const useGroupMutation = () => {
    const queryClient = useQueryClient();

    const createMutation = useMutation<Group, MutationError, GroupCreate>({
        mutationFn: createGroup,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["groups", "list"] })
        }
    })

    const updateMutation = useMutation<GroupContent, MutationError, { id: string } & GroupUpdate, { previousGroup?: GroupContent }>({
        mutationFn: ({ id, ...updates }) => updateGroup(id, updates),
        onMutate: async (variables) => {
            await queryClient.cancelQueries({ queryKey: ["groups", "detail", variables.id] });
            // Store the old data from cache before being overwritten
            const previousGroup = queryClient.getQueryData<GroupContent>(["groups", "detail", variables.id])
            return { previousGroup };
        },
        onSuccess: (updatedGroup, variables, onMutateResult) => {
            // Update the group
            queryClient.setQueryData(["groups", "detail", updatedGroup.id], updatedGroup)
            // Invalidate the groups collection
            queryClient.invalidateQueries({ queryKey: ["groups", "list"] })

            // Invalidates content and specific content details to reflect title changes only if title changed
            if (onMutateResult.previousGroup?.title !== updatedGroup.title) {
                queryClient.invalidateQueries({ queryKey: ["notes", "list"] });
                queryClient.setQueriesData<Note>({ queryKey: ["notes", "detail"] }, (oldNote) => {
                    if (oldNote && oldNote.group_id === updatedGroup.id) {
                        return { ...oldNote, groups: { title: updatedGroup.title } };
                    }
                    return oldNote;
                });

                queryClient.invalidateQueries({ queryKey: ["lists", "list"] });
                queryClient.setQueriesData<ListDetail>({ queryKey: ["lists", "detail"] }, (oldList) => {
                    if (oldList && oldList.group_id === updatedGroup.id) {
                        return { ...oldList, groups: { title: updatedGroup.title } };
                    }
                    return oldList;
                });

                queryClient.invalidateQueries({ queryKey: ["logs", "list"] });
                queryClient.setQueriesData<LogDetail>({ queryKey: ["logs", "detail"] }, (oldLog) => {
                    if (oldLog && oldLog.group_id === updatedGroup.id) {
                        return { ...oldLog, groups: { title: updatedGroup.title } };
                    }
                    return oldLog;
                });
            }

            // If pinned status is changed, refresh pinned items in dashboard
            if ("is_pinned_dashboard" in variables) {
                queryClient.invalidateQueries({ queryKey: ["dashboard", "pinned"] });
            }
        }
    });

    const deleteMutation = useMutation<void, MutationError, GroupDelete, { previousGroup?: GroupContent }>({
        mutationFn: deleteGroup,
        onMutate: async (variables) => {
            await queryClient.cancelQueries({ queryKey: ["groups", "detail", variables.id] });
            // Store the old data from cache before being overwritten
            const previousGroup = queryClient.getQueryData<GroupContent>(["groups", "detail", variables.id])
            return { previousGroup };
        },
        onSuccess: (_, variables, onMutateResult) => {
            // Invalidate the groups collection
            queryClient.invalidateQueries({ queryKey: ["groups", "list"] })

            // Invalidate the content collections since these are either deleted or unrouped
            queryClient.invalidateQueries({ queryKey: ["notes", "list"] })
            queryClient.invalidateQueries({ queryKey: ["lists", "list"] })
            queryClient.invalidateQueries({ queryKey: ["logs", "list"] })

            if (variables.delete_contents) {
                queryClient.removeQueries({
                    queryKey: ["notes", "detail"],
                    predicate: (query) => {
                        const note = query.state.data as Note | undefined;
                        return !!note && note.group_id === variables.id;
                    }
                });

                queryClient.removeQueries({
                    queryKey: ["lists", "detail"],
                    predicate: (query) => {
                        const list = query.state.data as ListDetail | undefined;
                        return !!list && list.group_id === variables.id;
                    }
                });

                queryClient.removeQueries({
                    queryKey: ["logs", "detail"],
                    predicate: (query) => {
                        const log = query.state.data as LogDetail | undefined;
                        return !!log && log.group_id === variables.id;
                    }
                });
            } else {
                queryClient.setQueriesData<Note | undefined>({ queryKey: ["notes", "detail"] }, (oldNote) => {
                    if (oldNote && oldNote.group_id === variables.id) {
                        return { ...oldNote, group_id: null, groups: null };
                    }
                    return oldNote;
                })

                queryClient.setQueriesData<ListDetail | undefined>({ queryKey: ["lists", "detail"] }, (oldList) => {
                    if (oldList && oldList.group_id === variables.id) {
                        return { ...oldList, group_id: null, groups: null };
                    }
                    return oldList;
                })

                queryClient.setQueriesData<LogDetail | undefined>({ queryKey: ["logs", "detail"] }, (oldLog) => {
                    if (oldLog && oldLog.group_id === variables.id) {
                        return { ...oldLog, group_id: null, groups: null };
                    }
                    return oldLog;
                })
            }

            console.log(onMutateResult)
            // Refresh pinned groups if group was pinned to dashboard
            if (onMutateResult?.previousGroup?.is_pinned_dashboard) {
                queryClient.invalidateQueries({ queryKey: ["dashboard", "pinned"] });
            }
        }
    })

    return {
        createGroup: createMutation.mutateAsync,
        isCreating: createMutation.isPending,

        updateGroup: updateMutation.mutateAsync,
        isUpdating: updateMutation.isPending,

        deleteGroup: deleteMutation.mutateAsync,
        isDeleting: deleteMutation.isPending,
    }
}