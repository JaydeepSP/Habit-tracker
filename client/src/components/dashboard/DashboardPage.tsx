import React, { useState } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Flame,
  Plus,
  Sparkles,
  Trophy,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useDashboardStats, useHabits } from '@/hooks';
import { Button, Card } from '@/components/ui';
import { HabitCard } from '@/components/habits/HabitCard';
import { HabitModal } from '@/components/habits/HabitModal';
import { DeleteConfirmModal } from '@/components/habits/DeleteConfirmModal';
import { RecommendedHabitsModal } from './RecommendedHabitsModal';
import { DashboardSkeleton } from '@/components/ui/Skeleton';

export const DashboardPage = () => {
  const { user } = useAuth();
  const { openCreateModal } = (useOutletContext<{ openCreateModal?: () => void }>() || {});

  const [editingHabit, setEditingHabit] = useState<any>(null);
  const [deletingHabit, setDeletingHabit] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRecommendedModalOpen, setIsRecommendedModalOpen] = useState(false);

  // Custom API hooks
  const { today, habits, last7Days, streaks, isLoading } = useDashboardStats();
  const { toggleCompletion, toggleActive, deleteHabit, isDeleting } = useHabits();

  const handleToggleCompletion = (habitId: string) => {
    toggleCompletion(habitId);
  };

  const handleToggleActive = (habitId: string) => {
    toggleActive(habitId);
  };

  const handleDelete = (habit: any) => {
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

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const scheduledTodayHabits = habits.filter((h: any) => h.isScheduledToday);

  // Formatted date string for greeting
  const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric' };
  const formattedToday = new Date().toLocaleDateString('en-US', dateOptions);

  return (
    <div className="space-y-8">
      {/* Dynamic Header & Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Good day, {user?.name?.split(' ')[0] || 'there'} 👋
          </h2>
          <p className="text-sm font-medium text-slate-500 dark:text-neutral-400 mt-1">
            {formattedToday} • <span className="text-slate-900 dark:text-white font-semibold">Stay consistent. Small steps every day.</span>
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

      {/* Progress & Stat Cards Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Circular Progress Banner (Monochrome Black & White) */}
        <Card className="lg:col-span-2 relative overflow-hidden bg-white dark:bg-[#121212] border-slate-200/90 dark:border-neutral-800 shadow-md dark:shadow-xl">
          <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
            {/* Circular Progress Gauge (Solid White Stroke in Dark Theme) */}
            <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="stroke-slate-100 dark:stroke-neutral-800"
                  strokeWidth="10"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="stroke-slate-900 dark:stroke-white transition-all duration-1000 ease-out"
                  strokeWidth="10"
                  strokeDasharray={2 * Math.PI * 40}
                  strokeDashoffset={
                    2 * Math.PI * 40 * (1 - (today.total > 0 ? today.percentage / 100 : 0))
                  }
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {today.percentage}%
                </span>
                <span className="text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-widest">
                  Done
                </span>
              </div>
            </div>

            {/* Description & Mini Week Overview */}
            <div className="flex-1 text-center sm:text-left space-y-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Today's Progress
                </h3>
                <p className="text-sm font-medium text-slate-500 dark:text-neutral-400">
                  {today.completed} of {today.total} habits completed for today
                </p>
              </div>

              {/* Mini 7-day strip */}
              <div className="pt-2 border-t border-slate-100 dark:border-neutral-800">
                <div className="flex items-center justify-between gap-1 max-w-sm mx-auto sm:mx-0">
                  {last7Days.map((d) => (
                    <div key={d.date} className="flex flex-col items-center gap-1">
                      <span className="text-[10px] font-semibold text-slate-400 dark:text-neutral-500">
                        {d.day}
                      </span>
                      <div
                        className={`size-10 rounded-md flex items-center justify-center text-[10px] font-bold ${
                          d.rate === 100
                            ? 'bg-slate-900 text-white dark:bg-white dark:text-black shadow-sm'
                            : d.rate > 0
                            ? 'bg-slate-200 dark:bg-neutral-800 text-slate-900 dark:text-white border border-slate-300 dark:border-neutral-700'
                            : 'bg-slate-100 dark:bg-neutral-900 text-slate-400 dark:text-neutral-600'
                        }`}
                        title={`${d.date}: ${d.completed}/${d.total} completed`}
                      >
                        {d.rate === 100 ? '✓' : `${d.rate}%`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Streak & Milestone Card */}
        <Card className="flex flex-col justify-between p-6 bg-white dark:bg-[#121212] border-slate-200/90 dark:border-neutral-800 shadow-md dark:shadow-xl">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-neutral-400">
                Active Streak
              </span>
              <div className="p-2 rounded-xl bg-slate-100 dark:bg-neutral-900 text-slate-900 dark:text-white border border-slate-200 dark:border-neutral-800">
                <Flame className="w-5 h-5 fill-current" />
              </div>
            </div>
            <div className="mt-3">
              <h4 className="text-3xl font-black text-slate-900 dark:text-white">
                {streaks.currentStreak}{' '}
                <span className="text-base font-semibold text-slate-500 dark:text-neutral-400">
                  {streaks.currentStreak === 1 ? 'day' : 'days'}
                </span>
              </h4>
              <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1">
                Your personal best is{' '}
                <span className="font-bold text-slate-800 dark:text-white">
                  {streaks.longestStreak} days
                </span>
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-neutral-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-neutral-400">Detailed Analytics</span>
            <Link
              to="/analytics"
              className="inline-flex items-center gap-1 font-semibold text-slate-900 dark:text-white hover:underline"
            >
              View Stats <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </Card>
      </div>

      {/* Today's Habits Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Today's Habits
            </h3>
            <p className="text-xs text-slate-500 dark:text-neutral-400">
              Check off your daily habits to maintain your streak
            </p>
          </div>
          <Link
            to="/habits"
            className="text-xs font-semibold text-slate-900 dark:text-white hover:underline flex items-center gap-1"
          >
            Manage All ({habits.length}) <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {scheduledTodayHabits.length === 0 ? (
          <Card className="text-center py-12 px-4 space-y-4 bg-white dark:bg-[#121212] border-slate-200/90 dark:border-neutral-800">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-neutral-900 text-slate-900 dark:text-white flex items-center justify-center mx-auto text-2xl">
              🌱
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                {habits.length === 0 ? 'No habits yet' : 'No habits scheduled for today'}
              </h4>
              <p className="text-xs text-slate-500 dark:text-neutral-400">
                {habits.length === 0
                  ? 'Start building your routine by creating your first habit or choosing from recommended presets.'
                  : 'You have no habits scheduled on this day of the week.'}
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <Button onClick={() => setIsRecommendedModalOpen(true)} variant="secondary" size="sm" className="dark:bg-neutral-900 dark:border-neutral-800 dark:text-neutral-200">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Explore Presets
              </Button>
              <Button onClick={openCreateModal} size="sm" className="dark:bg-white dark:text-black dark:hover:bg-neutral-200">
                <Plus className="w-4 h-4" />
                Create Habit
              </Button>
            </div>
          </Card>
        ) : (
          <div className="flex flex-col gap-5">
            {scheduledTodayHabits.map((habit) => (
              <HabitCard
                key={habit._id}
                habit={habit}
                onToggle={handleToggleCompletion}
                onEdit={(h) => {
                  setEditingHabit(h);
                  setIsEditModalOpen(true);
                }}
                onDelete={handleDelete}
                onToggleActive={handleToggleActive}
              />
            ))}
          </div>
        )}
      </div>

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
