import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { habitService } from '../services/habitService';
import { useToast } from '../context/ToastContext';
import { queryKeys } from './queryKeys';

/**
 * Custom Hook for Habit Queries & Mutations
 * Encapsulates all habit CRUD and toggle logic with optimistic cache invalidation
 */
export const useHabits = (params = {}) => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  // Query: Get habits list
  const habitsQuery = useQuery({
    queryKey: queryKeys.habits.list(params),
    queryFn: async () => {
      const res = await habitService.getHabits(params);
      return res.data || [];
    },
  });

  // Mutation: Create habit
  const createHabitMutation = useMutation({
    mutationFn: (habitData) => habitService.createHabit(habitData),
    onSuccess: () => {
      success('Habit created successfully! 🎉');
      queryClient.invalidateQueries({ queryKey: queryKeys.habits.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats.all });
    },
    onError: (err) => {
      error(err.message || 'Failed to create habit');
    },
  });

  // Mutation: Update habit
  const updateHabitMutation = useMutation({
    mutationFn: ({ id, data }) => habitService.updateHabit(id, data),
    onSuccess: () => {
      success('Habit updated successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.habits.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats.all });
    },
    onError: (err) => {
      error(err.message || 'Failed to update habit');
    },
  });

  // Mutation: Delete habit
  const deleteHabitMutation = useMutation({
    mutationFn: (habitId) => habitService.deleteHabit(habitId),
    onSuccess: () => {
      success('Habit and history deleted');
      queryClient.invalidateQueries({ queryKey: queryKeys.habits.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats.all });
    },
    onError: (err) => {
      error(err.message || 'Failed to delete habit');
    },
  });

  // Mutation: Toggle Active/Paused status
  const toggleActiveMutation = useMutation({
    mutationFn: (habitId) => habitService.toggleActive(habitId),
    onSuccess: () => {
      success('Habit status updated');
      queryClient.invalidateQueries({ queryKey: queryKeys.habits.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats.all });
    },
    onError: (err) => {
      error(err.message || 'Failed to toggle status');
    },
  });

  // Mutation: Toggle Today Completion
  const toggleCompletionMutation = useMutation({
    mutationFn: ({ habitId, date }) => habitService.toggleCompletion(habitId, date),
    onSuccess: (res) => {
      if (res.data?.completed) {
        success('Habit completed! Keep up the momentum 🔥');
      } else {
        success('Completion undone');
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.habits.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats.all });
    },
    onError: (err) => {
      error(err.message || 'Failed to update completion');
    },
  });

  // Mutation: Batch Create Recommended Habits
  const createBatchHabitsMutation = useMutation({
    mutationFn: (habitsList) => habitService.createBatchHabits(habitsList),
    onSuccess: (res, habitsList) => {
      success(`Added ${habitsList.length} recommended habits! 🚀`);
      queryClient.invalidateQueries({ queryKey: queryKeys.habits.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats.all });
    },
    onError: (err) => {
      error(err.message || 'Failed to add recommended habits');
    },
  });

  return {
    habits: habitsQuery.data || [],
    isLoading: habitsQuery.isLoading,
    isError: habitsQuery.isError,
    error: habitsQuery.error,
    refetch: habitsQuery.refetch,
    // Mutations
    createHabit: createHabitMutation.mutateAsync,
    updateHabit: (id, data) => updateHabitMutation.mutateAsync({ id, data }),
    deleteHabit: deleteHabitMutation.mutateAsync,
    toggleActive: toggleActiveMutation.mutateAsync,
    toggleCompletion: (habitId, date) => toggleCompletionMutation.mutateAsync({ habitId, date }),
    createBatchHabits: createBatchHabitsMutation.mutateAsync,
    // Status states
    isCreating: createHabitMutation.isPending,
    isUpdating: updateHabitMutation.isPending,
    isDeleting: deleteHabitMutation.isPending,
    isToggling: toggleCompletionMutation.isPending,
  };
};
