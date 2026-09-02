import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { habitService } from '@/services/habitService';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { queryKeys } from './queryKeys';
import { Habit } from '@/types';

export const useHabits = (params: Record<string, any> = {}) => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  const { isAuthenticated } = useAuth();

  const habitsQuery = useQuery<Habit[]>({
    queryKey: queryKeys.habits.list(params),
    queryFn: async () => {
      const res = await habitService.getHabits(params);
      return res.data || [];
    },
    enabled: isAuthenticated,
  });

  const createHabitMutation = useMutation({
    mutationFn: (habitData: Partial<Habit>) => habitService.createHabit(habitData),
    onSuccess: () => {
      success('Habit created successfully! 🎉');
      queryClient.invalidateQueries({ queryKey: queryKeys.habits.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats.all });
    },
    onError: (err: any) => {
      error(err.message || 'Failed to create habit');
    },
  });

  const updateHabitMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Habit> }) =>
      habitService.updateHabit(id, data),
    onSuccess: () => {
      success('Habit updated successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.habits.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats.all });
    },
    onError: (err: any) => {
      error(err.message || 'Failed to update habit');
    },
  });

  const deleteHabitMutation = useMutation({
    mutationFn: (habitId: string) => habitService.deleteHabit(habitId),
    onSuccess: () => {
      success('Habit and history deleted');
      queryClient.invalidateQueries({ queryKey: queryKeys.habits.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats.all });
    },
    onError: (err: any) => {
      error(err.message || 'Failed to delete habit');
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: (habitId: string) => habitService.toggleActive(habitId),
    onSuccess: () => {
      success('Habit status updated');
      queryClient.invalidateQueries({ queryKey: queryKeys.habits.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats.all });
    },
    onError: (err: any) => {
      error(err.message || 'Failed to toggle status');
    },
  });

  const toggleCompletionMutation = useMutation({
    mutationFn: ({ habitId, date }: { habitId: string; date?: string }) =>
      habitService.toggleCompletion(habitId, date),
    onSuccess: (res: any) => {
      if (res.data?.completed) {
        success('Habit completed! Keep up the momentum 🔥');
      } else {
        success('Completion undone');
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.habits.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats.all });
    },
    onError: (err: any) => {
      error(err.message || 'Failed to update completion');
    },
  });

  const createBatchHabitsMutation = useMutation({
    mutationFn: (habitsList: Partial<Habit>[]) => habitService.createBatchHabits(habitsList),
    onSuccess: (res: any, habitsList: Partial<Habit>[]) => {
      success(`Added ${habitsList.length} recommended habits! 🚀`);
      queryClient.invalidateQueries({ queryKey: queryKeys.habits.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats.all });
    },
    onError: (err: any) => {
      error(err.message || 'Failed to add recommended habits');
    },
  });

  return {
    habits: habitsQuery.data || [],
    isLoading: habitsQuery.isLoading,
    isError: habitsQuery.isError,
    error: habitsQuery.error,
    refetch: habitsQuery.refetch,
    createHabit: (data: Partial<Habit>) => createHabitMutation.mutateAsync(data),
    updateHabit: (id: string, data: Partial<Habit>) => updateHabitMutation.mutateAsync({ id, data }),
    deleteHabit: (habitId: string) => deleteHabitMutation.mutateAsync(habitId),
    toggleActive: (habitId: string) => toggleActiveMutation.mutateAsync(habitId),
    toggleCompletion: (habitId: string, date?: string) => toggleCompletionMutation.mutateAsync({ habitId, date }),
    createBatchHabits: (habitsList: Partial<Habit>[]) => createBatchHabitsMutation.mutateAsync(habitsList),
    isCreating: createHabitMutation.isPending,
    isUpdating: updateHabitMutation.isPending,
    isDeleting: deleteHabitMutation.isPending,
    isToggling: toggleCompletionMutation.isPending,
  };
};
