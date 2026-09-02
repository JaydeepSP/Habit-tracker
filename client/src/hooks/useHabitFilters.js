import { useMemo, useState } from 'react';

/**
 * Custom Hook for Local Habit Filtering & Searching
 * Encapsulates search and multi-facet filtering logic
 */
export const useHabitFilters = (habits = []) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'paused'

  const filteredHabits = useMemo(() => {
    return habits.filter((h) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        h.name.toLowerCase().includes(query) ||
        (h.description && h.description.toLowerCase().includes(query));

      const matchesCategory =
        selectedCategory === 'All' || h.category === selectedCategory;

      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'active'
          ? h.isActive
          : !h.isActive;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [habits, searchQuery, selectedCategory, statusFilter]);

  const activeCount = useMemo(
    () => habits.filter((h) => h.isActive).length,
    [habits]
  );
  const pausedCount = useMemo(
    () => habits.filter((h) => !h.isActive).length,
    [habits]
  );

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setStatusFilter('all');
  };

  return {
    filteredHabits,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    statusFilter,
    setStatusFilter,
    activeCount,
    pausedCount,
    resetFilters,
  };
};
