import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { completionService } from '@/services/completionService';
import { useToast } from '@/context/ToastContext';
import { queryKeys } from './queryKeys';
import { HabitCompletion } from '@/types';

export const useCompletions = () => {
  const queryClient = useQueryClient();
  const { error } = useToast();

  const toggleCompletionDateMutation = useMutation({
    mutationFn: ({
      habitId,
      date,
      completed,
    }: {
      habitId: string;
      date: string;
      completed: boolean;
    }) => completionService.createCompletion({ habitId, date, completed }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.habits.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.completions.all });
    },
    onError: (err: any) => {
      error(err.message || 'Failed to update completion');
    },
  });

  return {
    toggleDateCompletion: (habitId: string, date: string, completed: boolean) =>
      toggleCompletionDateMutation.mutateAsync({ habitId, date, completed }),
    isToggling: toggleCompletionDateMutation.isPending,
  };
};

export const useDateCompletions = (date?: string, enabled = true) => {
  const query = useQuery<HabitCompletion[]>({
    queryKey: queryKeys.completions.byDate(date || ''),
    queryFn: async () => {
      if (!date) return [];
      const res = await completionService.getCompletionsByDate(date);
      return res.data || [];
    },
    enabled: !!date && enabled,
  });

  return {
    completions: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};
