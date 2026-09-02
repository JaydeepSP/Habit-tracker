import React, { useState, useEffect } from 'react';
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
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { statsService } from '../../services/statsService';
import { habitService } from '../../services/habitService';
import { Button, Card } from '../ui';
import { HabitCard } from '../habits/HabitCard';
import { HabitModal } from '../habits/HabitModal';
import { RecommendedHabitsModal } from './RecommendedHabitsModal';
import { DashboardSkeleton } from '../ui/Skeleton';

export const DashboardPage = () => {
  const { user } = useAuth();
  const { success, error } = useToast();
  const { openCreateModal } = useOutletContext() || {};

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingHabit, setEditingHabit] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRecommendedModalOpen, setIsRecommendedModalOpen] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const res = await statsService.getDashboardStats();
      if (res.success) {
        setDashboardData(res.data);
      }
    } catch (err) {
      error(err.message || 'Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Listen to custom global events
    const handleDataChanged = () => fetchDashboardData();
    window.addEventListener('habit-data-changed', handleDataChanged);
    return () => window.removeEventListener('habit-data-changed', handleDataChanged);
  }, []);

  const handleToggleCompletion = async (habitId) => {
    try {
      const res = await habitService.toggleCompletion(habitId);
      if (res.success) {
        if (res.data.completed) {
          success('Habit completed! Keep up the momentum 🔥');
        } else {
          success('Completion undone');
        }
        // Update local state smoothly
        fetchDashboardData();
      }
    } catch (err) {
      error(err.message || 'Failed to update habit');
    }
  };

  const handleToggleActive = async (habitId) => {
    try {
      await habitService.toggleActive(habitId);
      success('Habit status updated');
      fetchDashboardData();
    } catch (err) {
      error(err.message || 'Failed to update habit status');
    }
  };

  const handleDelete = async (habit) => {
    if (window.confirm(`Are you sure you want to delete "${habit.name}"?`)) {
      try {
        await habitService.deleteHabit(habit._id);
        success('Habit deleted');
        fetchDashboardData();
      } catch (err) {
        error(err.message || 'Failed to delete habit');
      }
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  const today = dashboardData?.today || { completed: 0, total: 0, percentage: 0 };
  const streaks = dashboardData?.streaks || { currentStreak: 0, longestStreak: 0 };
  const habits = dashboardData?.habits || [];
  const scheduledTodayHabits = habits.filter((h) => h.isScheduledToday);

  // Formatted date string for greeting
  const dateOptions = { weekday: 'long', month: 'long', day: 'numeric' };
  const formattedToday = new Date().toLocaleDateString('en-US', dateOptions);

  return (
    <div className="space-y-8">
      {/* Dynamic Header & Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Good day, {user?.name?.split(' ')[0] || 'there'} 👋
          </h2>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            {formattedToday} • <span className="text-brand-600 dark:text-brand-400 font-semibold">Stay consistent. Small steps every day.</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={() => setIsRecommendedModalOpen(true)}
            className="text-xs"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            Recommended Habits
          </Button>
          <Button onClick={openCreateModal} className="text-xs">
            <Plus className="w-4 h-4" />
            New Habit
          </Button>
        </div>
      </div>

      {/* Progress & Stat Cards Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Circular Progress Banner */}
        <Card className="lg:col-span-2 relative overflow-hidden bg-gradient-to-br from-brand-900/10 via-white to-white dark:from-brand-950/40 dark:via-slate-900 dark:to-slate-900 border-brand-200/60 dark:border-brand-900/40 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
            {/* Circular Progress Gauge */}
            <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="stroke-slate-200 dark:stroke-slate-800"
                  strokeWidth="10"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="stroke-brand-500 transition-all duration-1000 ease-out"
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
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
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
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  {today.completed} of {today.total} habits completed for today
                </p>
              </div>

              {/* Mini 7-day strip */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between gap-1 max-w-sm mx-auto sm:mx-0">
                  {dashboardData?.last7Days?.map((d) => (
                    <div key={d.date} className="flex flex-col items-center gap-1">
                      <span className="text-[10px] font-semibold text-slate-400">
                        {d.day}
                      </span>
                      <div
                        className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold ${
                          d.rate === 100
                            ? 'bg-emerald-500 text-white'
                            : d.rate > 0
                            ? 'bg-brand-500/20 text-brand-500 border border-brand-500/40'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
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
        <Card className="flex flex-col justify-between p-6 bg-gradient-to-br from-amber-500/5 via-white to-white dark:from-amber-950/20 dark:via-slate-900 dark:to-slate-900 border-amber-200/50 dark:border-amber-900/30">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Active Streak
              </span>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                <Flame className="w-5 h-5 fill-current" />
              </div>
            </div>
            <div className="mt-3">
              <h4 className="text-3xl font-black text-slate-900 dark:text-white">
                {streaks.currentStreak}{' '}
                <span className="text-base font-semibold text-slate-500 dark:text-slate-400">
                  {streaks.currentStreak === 1 ? 'day' : 'days'}
                </span>
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Your personal best is{' '}
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {streaks.longestStreak} days
                </span>
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">Detailed Analytics</span>
            <Link
              to="/analytics"
              className="inline-flex items-center gap-1 font-semibold text-brand-600 dark:text-brand-400 hover:underline"
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
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Check off your daily habits to maintain your streak
            </p>
          </div>
          <Link
            to="/habits"
            className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
          >
            Manage All ({habits.length}) <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {scheduledTodayHabits.length === 0 ? (
          <Card className="text-center py-12 px-4 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto text-2xl">
              🌱
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {habits.length === 0 ? 'No habits yet' : 'No habits scheduled for today'}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {habits.length === 0
                  ? 'Start building your routine by creating your first habit or choosing from recommended presets.'
                  : 'You have no habits scheduled on this day of the week.'}
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <Button onClick={() => setIsRecommendedModalOpen(true)} variant="secondary" size="sm">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Explore Presets
              </Button>
              <Button onClick={openCreateModal} size="sm">
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
          fetchDashboardData();
        }}
      />

      {/* Recommended Habits Modal */}
      <RecommendedHabitsModal
        isOpen={isRecommendedModalOpen}
        onClose={() => setIsRecommendedModalOpen(false)}
        onAdded={() => fetchDashboardData()}
      />
    </div>
  );
};
