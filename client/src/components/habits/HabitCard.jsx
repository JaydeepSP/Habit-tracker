import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Edit3, Trash2, Pause, Play } from 'lucide-react';
import { DynamicIcon } from '../../utils/constants';
import { HabitContributionGraph } from './HabitContributionGraph';

export const HabitCard = ({
  habit,
  onToggle,
  onEdit,
  onDelete,
  onToggleActive,
}) => {
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = async (e) => {
    e.stopPropagation();
    if (isToggling) return;
    setIsToggling(true);
    try {
      await onToggle(habit._id);
    } finally {
      setIsToggling(false);
    }
  };

  const isCompleted = habit.isCompletedToday;
  const streak = habit.currentStreak || 0;
  const longestStreak = habit.longestStreak || 0;
  const completedDates = habit.completedDates || [];
  
  // Calculate completion percentage over active days or 365 days
  const completionPercentage = completedDates.length > 0 
    ? Math.min(100, Math.round((completedDates.length / 365) * 100))
    : 0;

  const cardColor = habit.color || '#3B82F6';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group relative flex flex-col justify-between p-5 sm:p-6 rounded-3xl bg-[#0F172A] border border-slate-800/90 text-slate-100 shadow-xl transition-all duration-300 hover:border-slate-700/80"
    >
      {/* Top Header Row matching Habi.app */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          {/* Circular Complete Checkmark Button */}
          <button
            onClick={handleToggle}
            disabled={isToggling}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer shrink-0 shadow-md ${
              isCompleted
                ? 'bg-[#3B82F6] text-white shadow-[#3B82F6]/30 scale-105'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700/80'
            }`}
            title={isCompleted ? 'Mark uncompleted' : 'Mark completed today'}
          >
            <Check className={`w-5 h-5 stroke-[3] ${isCompleted ? 'text-white' : 'opacity-40'}`} />
          </button>

          {/* Emoji / Icon */}
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 text-xl"
            style={{ backgroundColor: `${cardColor}20`, color: cardColor }}
          >
            <DynamicIcon name={habit.icon} className="w-5 h-5" />
          </div>

          {/* Title & Streak Badges */}
          <div className="min-w-0">
            <h3 className="font-extrabold text-base sm:text-lg tracking-tight text-white truncate">
              {habit.name}
            </h3>
            
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {/* Streak Badge */}
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#1E293B] text-[#3B82F6] border border-[#3B82F6]/30">
                {streak}-day streak
              </span>

              {/* Best Streak */}
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-800/80 text-slate-400">
                Best: {longestStreak}
              </span>

              {/* 365d Rate */}
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-800/80 text-slate-400">
                {completionPercentage}%
              </span>

              {/* Category */}
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium text-slate-400">
                {habit.category}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls (Edit, Pause, Delete) */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onToggleActive && onToggleActive(habit._id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title={habit.isActive ? 'Pause habit' : 'Resume habit'}
          >
            {habit.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-emerald-400" />}
          </button>
          <button
            onClick={() => onEdit(habit)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title="Edit habit"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(habit)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
            title="Delete habit"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* GitHub Contribution Heatmap */}
      <div className="mt-5 pt-3 border-t border-slate-800/70">
        <HabitContributionGraph
          completedDates={completedDates}
          color={cardColor}
        />
      </div>
    </motion.div>
  );
};
