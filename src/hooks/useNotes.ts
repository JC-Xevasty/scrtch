import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Note, NoteCreate, NoteUpdate } from '../types';
import { createNote, deleteNote, fetchNote, fetchNoteCollection, updateNote } from '../services/notes';

interface MutationError { status?: string; message: string; }

/* 
 * Usage: const { data, isLoading, error } = useNotes();
 */
export const useNotes = () => useQuery<Note[], MutationError>({
    queryKey: ['notes', 'list'],
    queryFn: fetchNoteCollection,
    staleTime: Infinity,
    gcTime: Infinity
})

/* 
 * Usage: const { data, isLoading, error } = useNote(id);
 */
export const useNote = (id: string | undefined) => useQuery<Note, MutationError>({
    queryKey: ['notes', 'detail', id],
    queryFn: () => {
        if (!id) throw new Error("Note ID is required.");
        return fetchNote(id);
    },
    enabled: typeof id !== 'undefined' && id !== '' && id !== "new",
    staleTime: Infinity,
    gcTime: Infinity
})

/* 
 * Usage: 
 *      const { createNote, isCreating, updateNote, isUpdating, deleteNote, isDeleting } = useNoteMutation();
 *      await createNote(NoteCreate)
 *      await updateNote({id} & NoteUpdate)
 *      await deleteNote()
 */
export const useNoteMutation = () => {
    const queryClient = useQueryClient();

    const createMutation = useMutation<Note, MutationError, NoteCreate>({
        mutationFn: createNote,
        onSuccess: (newNote) => {
            queryClient.setQueryData(["notes", "detail", newNote.id], newNote)
            queryClient.invalidateQueries({ queryKey: ["notes", "list"] })

            // If moved to a group, invalidate that group to refetch the note
            if (newNote.group_id) {
                queryClient.invalidateQueries({ queryKey: ["groups", "detail", newNote.group_id] })
            }

            // Refresh recent
            queryClient.invalidateQueries({ queryKey: ["dashboard", "recent"] });
            // Refresh dashboard count
            queryClient.invalidateQueries({ queryKey: ["dashboard", "stats"] });
        }
    })

    const updateMutation = useMutation<Note, MutationError, { id: string } & NoteUpdate, { previousNote?: Note }>({
        mutationFn: ({ id, ...updates }) => updateNote(id, updates),
        onMutate: async (variables) => {
            await queryClient.cancelQueries({ queryKey: ["notes", "detail", variables.id] });
            // Store the old data from cache before being overwritten
            const previousNote = queryClient.getQueryData<Note>(["notes", "detail", variables.id])
            return { previousNote };
        },
        onSuccess: (updatedNote, variables, onMutateResult) => {
            // Update the note
            queryClient.setQueryData(["notes", "detail", updatedNote.id], updatedNote)
            // Invalidate the notes collection so it fetches the updated note
            queryClient.invalidateQueries({ queryKey: ["notes", "list"] })

            // If the note before being updated belongs to a group, invalidate that group to refetch the updated note.
            const oldGroupId = onMutateResult?.previousNote?.group_id;
            if (oldGroupId) {
                queryClient.invalidateQueries({ queryKey: ["groups", "detail", oldGroupId] })
            }

            // If moved to a group, invalidate that group to refetch the note
            if (updatedNote.group_id && updatedNote.group_id !== oldGroupId) {
                queryClient.invalidateQueries({ queryKey: ["groups", "detail", updatedNote.group_id] })
            }

            // If pinned status is changed, refresh pinned items in dashboard
            if ("is_pinned_dashboard" in variables) {
                queryClient.invalidateQueries({ queryKey: ["dashboard", "pinned"] });
            }
            // Refresh recent
            queryClient.invalidateQueries({ queryKey: ["dashboard", "recent"] });
        }
    })

    const deleteMutation = useMutation<void, MutationError, string, { previousNote?: Note }>({
        mutationFn: deleteNote,
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: ["notes", "detail", id] });
            // Store the old data from cache before being overwritten
            const previousNote = queryClient.getQueryData<Note>(["notes", "detail", id])
            return { previousNote };
        },
        onSuccess: (_, __, onMutateResult) => {
            // Refetch notes collection
            queryClient.invalidateQueries({ queryKey: ["notes", "list"] })

            // If the note before being updated belongs to a group, invalidate that group to refetch the updated note.
            const oldGroupId = onMutateResult?.previousNote?.group_id;
            if (oldGroupId) {
                queryClient.invalidateQueries({ queryKey: ["groups", "detail", oldGroupId] })
            }

            // Refresh recent
            queryClient.invalidateQueries({ queryKey: ["dashboard", "recent"] });
            // Refresh dashboard count
            queryClient.invalidateQueries({ queryKey: ["dashboard", "stats"] });
            // Refresh pinned items if note was pinned to dashboard
            if (onMutateResult?.previousNote?.is_pinned_dashboard) {
                queryClient.invalidateQueries({ queryKey: ["dashboard", "pinned"] });
            }
        }
    })


    return {
        createNote: createMutation.mutateAsync,
        isCreating: createMutation.isPending,

        updateNote: updateMutation.mutateAsync,
        isUpdating: updateMutation.isPending,

        deleteNote: deleteMutation.mutateAsync,
        isDeleting: deleteMutation.isPending,
    }
}