import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Check, Edit3, Trash2, Pause, Play } from 'lucide-react';
import { DynamicIcon } from '../../utils/constants';
import { HabitContributionGraph } from './HabitContributionGraph';
import { useCompletions } from '../../hooks';

// Get today's date string formatted as YYYY-MM-DD
const getTodayStr = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const HabitCard = React.memo(({
  habit,
  onToggle,
  onEdit,
  onDelete,
  onToggleActive,
  onRefresh, // optional callback to refresh habits after date-toggle
}) => {
  const { toggleDateCompletion } = useCompletions();
  const [isToggling, setIsToggling] = useState(false);
  const todayStr = getTodayStr();

  // Optimistic local set of completed dates
  const [localCompletedDates, setLocalCompletedDates] = useState(
    habit.completedDates || []
  );

  // Keep local completed dates in sync when habit prop updates
  React.useEffect(() => {
    setLocalCompletedDates(habit.completedDates || []);
  }, [habit.completedDates]);

  // Today is completed if todayStr is in localCompletedDates or habit.isCompletedToday
  const isCompleted = localCompletedDates.includes(todayStr);

  const handleToggle = async (e) => {
    e.stopPropagation();
    if (isToggling) return;
    setIsToggling(true);

    const willBeCompleted = !isCompleted;
    // Optimistically update today's square in the heatmap
    setLocalCompletedDates((prev) =>
      willBeCompleted ? [...prev.filter((d) => d !== todayStr), todayStr] : prev.filter((d) => d !== todayStr)
    );

    try {
      await onToggle(habit._id);
    } catch (err) {
      // Rollback on error
      setLocalCompletedDates((prev) =>
        isCompleted ? [...prev.filter((d) => d !== todayStr), todayStr] : prev.filter((d) => d !== todayStr)
      );
    } finally {
      setIsToggling(false);
    }
  };

  // Click on any heatmap cell → toggle that specific date
  const handleDayClick = useCallback(
    async (day) => {
      if (day.isFuture) return; // can't mark future dates

      const isCurrentlyDone = localCompletedDates.includes(day.date);
      const newCompleted = !isCurrentlyDone;

      // Optimistic UI update
      setLocalCompletedDates((prev) =>
        newCompleted ? [...prev, day.date] : prev.filter((d) => d !== day.date)
      );

      try {
        await toggleDateCompletion(habit._id, day.date, newCompleted);
        if (onRefresh) onRefresh();
      } catch (err) {
        // Roll back optimistic update on error
        setLocalCompletedDates((prev) =>
          isCurrentlyDone ? [...prev, day.date] : prev.filter((d) => d !== day.date)
        );
      }
    },
    [localCompletedDates, habit._id, onRefresh, toggleDateCompletion]
  );

  const streak = habit.currentStreak || 0;
  const longestStreak = habit.longestStreak || 0;

  // Completion % based on local dates (updates instantly on click)
  const completionPercentage =
    localCompletedDates.length > 0
      ? Math.min(100, Math.round((localCompletedDates.length / 365) * 100))
      : 0;

  const accentColor = habit.color || '#3B82F6';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group relative flex flex-col justify-between p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#121212] border border-slate-200/90 dark:border-neutral-800 text-slate-900 dark:text-neutral-100 shadow-lg dark:shadow-2xl transition-all duration-300 hover:border-slate-300 dark:hover:border-neutral-700"
    >
      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          {/* Circular Complete Button */}
          <button
            onClick={handleToggle}
            disabled={isToggling}
            style={{
              backgroundColor: isCompleted ? accentColor : undefined,
              boxShadow: isCompleted ? `0 0 16px ${accentColor}60` : undefined,
            }}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer shrink-0 ${
              isCompleted
                ? 'text-white scale-105'
                : 'bg-slate-100 dark:bg-neutral-900 hover:bg-slate-200 dark:hover:bg-neutral-800 text-slate-400 dark:text-neutral-500 border border-slate-300/80 dark:border-neutral-800'
            }`}
            title={isCompleted ? 'Mark uncompleted' : 'Mark completed today'}
          >
            <Check className={`w-5 h-5 stroke-[3] ${isCompleted ? 'text-white' : 'opacity-30'}`} />
          </button>

          {/* Icon Badge */}
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border"
            style={{
              backgroundColor: `${accentColor}18`,
              borderColor: `${accentColor}40`,
              color: accentColor,
            }}
          >
            <DynamicIcon name={habit.icon} className="w-5 h-5" />
          </div>

          {/* Title & Streak Badges */}
          <div className="min-w-0">
            <h3 className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 dark:text-white truncate">
              {habit.name}
            </h3>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border"
                style={{
                  backgroundColor: `${accentColor}15`,
                  borderColor: `${accentColor}35`,
                  color: accentColor,
                }}
              >
                {streak > 0 ? `${streak}-day streak` : 'No streak'}
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100/80 dark:bg-neutral-900/80 text-slate-600 dark:text-neutral-400 border border-slate-200/50 dark:border-neutral-800">
                Best: {longestStreak}
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100/80 dark:bg-neutral-900/80 text-slate-600 dark:text-neutral-400 border border-slate-200/50 dark:border-neutral-800">
                {completionPercentage}%
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium text-slate-500 dark:text-neutral-400">
                {habit.category}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onToggleActive && onToggleActive(habit._id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
            title={habit.isActive ? 'Pause habit' : 'Resume habit'}
          >
            {habit.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />}
          </button>
          <button
            onClick={() => onEdit(habit)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
            title="Edit habit"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(habit)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
            title="Delete habit"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Contribution Heatmap — click any cell to toggle that date */}
      <div className="mt-5 pt-3 border-t border-slate-100 dark:border-neutral-800/80">
        <HabitContributionGraph
          completedDates={localCompletedDates}
          color={accentColor}
          onDayClick={handleDayClick}
        />
      </div>
    </motion.div>
  );
});

HabitCard.displayName = 'HabitCard';
