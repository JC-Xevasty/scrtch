import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteUserContent } from '../../services/auth';

interface MutationError { status?: string; message: string; }

export const useAccountMutation = () => {
    const queryClient = useQueryClient();

    const deleteMutation = useMutation<void, MutationError>({
        mutationFn: deleteUserContent,
        onSuccess: () => {
            queryClient.removeQueries({ queryKey: ["groups"] })
            queryClient.removeQueries({ queryKey: ["notes"] })
            queryClient.removeQueries({ queryKey: ["lists"] })
            queryClient.removeQueries({ queryKey: ["logs"] })
            queryClient.removeQueries({ queryKey: ["links"] })
        }
    })

    return {
        deleteUserContent: deleteMutation.mutateAsync,
        isDeletingUserContent: deleteMutation.isPending
    }
}