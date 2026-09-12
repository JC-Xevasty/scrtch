import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Link, LinkCreate, LinkDelete, LinkFolder, LinkUpdate } from '../types';
import { createLinkItem, deleteLinkItem, fetchLinksByFolder, updateLinkItem } from '../services/links';

interface MutationError { status?: string; message: string; }

/* 
 * Usage: const { data, isLoading, error } = useLinks();
 */
export const useLinks = (folder_id: Link["folder_id"]) => useQuery<LinkFolder, MutationError>({
    queryKey: ['links', folder_id ?? 'root'],
    queryFn: () => fetchLinksByFolder(folder_id),
    enabled: typeof folder_id !== 'undefined' && folder_id !== '',
    staleTime: Infinity,
    gcTime: Infinity
})

export const useLinkMutation = () => {
    const queryClient = useQueryClient();

    const createMutation = useMutation<Link, MutationError, LinkCreate>({
        mutationFn: createLinkItem,
        onSuccess: (newLink) => {
            queryClient.invalidateQueries({ queryKey: ["links", newLink.folder_id ?? "root"] })
        }
    })

    const updateMutation = useMutation<Link, MutationError, { id: string } & LinkUpdate>({
        mutationFn: ({ id, ...updates }) => updateLinkItem(id, updates),
        onSuccess: (updatedLink, variables) => {
            queryClient.invalidateQueries({ queryKey: ["links", updatedLink.folder_id ?? "root"] });

            if ("folder_id" in variables && (updatedLink.folder_id !== variables.folder_id)) {
                queryClient.invalidateQueries({ queryKey: ["links", variables.folder_id ?? "root"] });
            }
        }
    })

    const deleteMutation = useMutation<void, MutationError, LinkDelete>({
        mutationFn: deleteLinkItem,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["links", variables.folder_id ?? "root"] });
        }
    })

    return {
        createLink: createMutation.mutateAsync,
        isCreating: createMutation.isPending,

        updateLink: updateMutation.mutateAsync,
        isUpdating: updateMutation.isPending,

        deleteLink: deleteMutation.mutateAsync,
        isDeleting: deleteMutation.isPending,
    }
}