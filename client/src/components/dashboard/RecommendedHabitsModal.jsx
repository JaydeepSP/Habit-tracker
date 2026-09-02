import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui';
import { DynamicIcon } from '../../utils/constants';
import { habitService } from '../../services/habitService';
import { useToast } from '../../context/ToastContext';
import { Check } from 'lucide-react';

const RECOMMENDED_LIST = [
  {
    name: 'Wake up early (6:00 AM)',
    description: 'Start your day ahead of schedule with calm clarity',
    icon: 'SunMedium',
    color: '#F59E0B',
    category: 'Health',
    frequency: 'daily',
  },
  {
    name: 'Exercise & Workout',
    description: '30 mins of strength or cardio movement',
    icon: 'Dumbbell',
    color: '#EF4444',
    category: 'Fitness',
    frequency: 'custom',
    customDays: [1, 2, 3, 4, 5],
  },
  {
    name: 'Coding & Development',
    description: 'Build projects and sharpen programming skills',
    icon: 'Code2',
    color: '#6366F1',
    category: 'Learning',
    frequency: 'daily',
  },
  {
    name: 'Read 20 Pages',
    description: 'Continuous growth through reading non-fiction books',
    icon: 'BookOpen',
    color: '#3B82F6',
    category: 'Learning',
    frequency: 'daily',
  },
  {
    name: 'Drink 3L Water',
    description: 'Hydrate consistently throughout the day',
    icon: 'Droplets',
    color: '#06B6D4',
    category: 'Health',
    frequency: 'daily',
  },
  {
    name: 'Daily Meditation',
    description: '10 minutes of peaceful mindful breathing',
    icon: 'Sparkles',
    color: '#8B5CF6',
    category: 'Personal',
    frequency: 'daily',
  },
  {
    name: 'Night Journaling',
    description: 'Reflect on wins and learnings before sleep',
    icon: 'PenLine',
    color: '#EC4899',
    category: 'Personal',
    frequency: 'daily',
  },
  {
    name: 'Review Daily Goals',
    description: 'Plan priority tasks for the next day',
    icon: 'CheckCircle2',
    color: '#10B981',
    category: 'Work',
    frequency: 'daily',
  },
];

export const RecommendedHabitsModal = ({ isOpen, onClose, onAdded }) => {
  const [selectedHabits, setSelectedHabits] = useState([0, 1, 2, 4]); // Pre-select a few popular ones
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { success, error } = useToast();

  const toggleSelect = (index) => {
    if (selectedHabits.includes(index)) {
      setSelectedHabits(selectedHabits.filter((i) => i !== index));
    } else {
      setSelectedHabits([...selectedHabits, index]);
    }
  };

  const handleAddSelected = async () => {
    if (selectedHabits.length === 0) return;
    setIsSubmitting(true);
    try {
      const habitsToCreate = selectedHabits.map((idx) => RECOMMENDED_LIST[idx]);
      await habitService.createBatchHabits(habitsToCreate);
      success(`Added ${habitsToCreate.length} recommended habits! 🚀`);
      onAdded();
      onClose();
    } catch (err) {
      error(err.message || 'Failed to add recommended habits');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Kickstart Your Routine 🌱"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Select proven starter habits to add to your daily dashboard. You can customize them anytime.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
          {RECOMMENDED_LIST.map((h, idx) => {
            const isSelected = selectedHabits.includes(idx);
            return (
              <div
                key={h.name}
                onClick={() => toggleSelect(idx)}
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-brand-500/10 border-brand-500/50 shadow-sm'
                    : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${h.color}20`, color: h.color }}
                >
                  <DynamicIcon name={h.icon} className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                    {h.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                    {h.description}
                  </p>
                </div>
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                    isSelected
                      ? 'bg-brand-600 text-white'
                      : 'border border-slate-300 dark:border-slate-600'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {selectedHabits.length} selected
          </span>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose}>
              Skip For Now
            </Button>
            <Button
              onClick={handleAddSelected}
              disabled={selectedHabits.length === 0}
              isLoading={isSubmitting}
            >
              Add Selected Habits
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
