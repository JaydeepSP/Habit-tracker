import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, Search, Filter, CheckCircle2, PauseCircle, Sparkles } from 'lucide-react';
import { useHabits, useHabitFilters } from '@/hooks';
import { CATEGORIES } from '@/utils/constants';
import { Button, Card, Input } from '@/components/ui';
import { HabitCard } from '@/components/habits/HabitCard';
import { HabitModal } from '@/components/habits/HabitModal';
import { DeleteConfirmModal } from '@/components/habits/DeleteConfirmModal';
import { RecommendedHabitsModal } from '@/components/dashboard/RecommendedHabitsModal';
import { Skeleton } from '@/components/ui/Skeleton';

import { Habit } from '@/types';

export const HabitsPage = () => {
  const { openCreateModal } = (useOutletContext<{ openCreateModal?: () => void }>() || {});

  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [deletingHabit, setDeletingHabit] = useState<Habit | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRecommendedModalOpen, setIsRecommendedModalOpen] = useState(false);

  // TanStack Query & Mutation Hook
  const { habits, isLoading, toggleCompletion, toggleActive, deleteHabit, isDeleting } = useHabits();

  // Business UI Logic Hook for Search & Filtering
  const {
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
  } = useHabitFilters(habits);

  const handleToggleCompletion = (habitId) => {
    toggleCompletion(habitId);
  };

  const handleToggleActive = (habitId) => {
    toggleActive(habitId);
  };

  const handleDelete = (habit: Habit) => {
    setDeletingHabit(habit);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingHabit) return;
    try {
      await deleteHabit(deletingHabit._id);
      setIsDeleteModalOpen(false);
      setDeletingHabit(null);
    } catch (err) {
      // toast error handled by hook
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Habit Management
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Organize, edit, pause, or create your daily routines
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={() => setIsRecommendedModalOpen(true)}
            className="text-xs dark:bg-neutral-900 dark:border-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            Recommended Habits
          </Button>
          <Button onClick={openCreateModal} className="text-xs dark:bg-white dark:text-black dark:hover:bg-neutral-200">
            <Plus className="w-4 h-4" />
            New Habit
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 space-y-4 bg-white dark:bg-[#121212] border-slate-200/90 dark:border-neutral-800">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-neutral-500" />
            <input
              type="text"
              placeholder="Search habits..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-slate-900 dark:text-neutral-100 placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-neutral-600"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex rounded-xl bg-slate-100 dark:bg-neutral-900 p-1 border border-slate-200 dark:border-neutral-800">
            <button
              onClick={() => setStatusFilter('all')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                statusFilter === 'all'
                  ? 'bg-white dark:bg-neutral-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-neutral-400'
              }`}
            >
              All ({habits.length})
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                statusFilter === 'active'
                  ? 'bg-white dark:bg-neutral-800 text-slate-900 dark:text-white font-bold shadow-sm'
                  : 'text-slate-500 dark:text-neutral-400'
              }`}
            >
              Active ({activeCount})
            </button>
            <button
              onClick={() => setStatusFilter('paused')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                statusFilter === 'paused'
                  ? 'bg-white dark:bg-neutral-800 text-slate-900 dark:text-white font-bold shadow-sm'
                  : 'text-slate-500 dark:text-neutral-400'
              }`}
            >
              Paused ({pausedCount})
            </button>
          </div>

          {/* Category Dropdown */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-slate-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-neutral-600"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'All' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Habits Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-44 rounded-2xl" />
          ))}
        </div>
      ) : filteredHabits.length === 0 ? (
        <Card className="text-center py-16 px-4 space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto text-xl">
            🔍
          </div>
          <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
            No habits matched your filters
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Try adjusting your search query, status, or category selection to find what you're looking for.
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setStatusFilter('all');
            }}
          >
            Clear Filters
          </Button>
        </Card>
      ) : (
        <div className="flex flex-col gap-5">
          {filteredHabits.map((habit) => (
            <div key={habit._id} className="relative">
              {!habit.isActive && (
                <div className="absolute top-4 right-16 z-10 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  Paused
                </div>
              )}
              <HabitCard
                habit={habit}
                onToggle={handleToggleCompletion}
                onEdit={(h) => {
                  setEditingHabit(h);
                  setIsEditModalOpen(true);
                }}
                onDelete={handleDelete}
                onToggleActive={handleToggleActive}
              />
            </div>
          ))}
        </div>
      )}

      {/* Habit Edit Modal */}
      <HabitModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingHabit(null);
        }}
        habitToEdit={editingHabit}
        onSaved={() => {
          setIsEditModalOpen(false);
          setEditingHabit(null);
        }}
      />

      {/* Recommended Habits Modal */}
      <RecommendedHabitsModal
        isOpen={isRecommendedModalOpen}
        onClose={() => setIsRecommendedModalOpen(false)}
        onAdded={() => setIsRecommendedModalOpen(false)}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingHabit(null);
        }}
        onConfirm={handleConfirmDelete}
        habitName={deletingHabit?.name || ''}
        isDeleting={isDeleting}
      />
    </div>
  );
};
