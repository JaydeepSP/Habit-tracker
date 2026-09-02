import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui';
import { DynamicIcon } from '@/utils/constants';
import { useHabits } from '@/hooks';
import { Check } from 'lucide-react';
import type { HabitCategory, HabitFrequency, Habit } from '@/types';

interface RecommendedHabit {
  name: string;
  description: string;
  icon: string;
  color: string;
  category: HabitCategory;
  frequency: HabitFrequency;
  customDays?: number[];
}

const RECOMMENDED_LIST: RecommendedHabit[] = [
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

interface RecommendedHabitsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdded: () => void;
}

export const RecommendedHabitsModal: React.FC<RecommendedHabitsModalProps> = ({
  isOpen,
  onClose,
  onAdded,
}) => {
  const [selectedHabits, setSelectedHabits] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createBatchHabits } = useHabits();

  const toggleSelect = (index: number) => {
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
      const habitsToCreate: Partial<Habit>[] = selectedHabits.map((idx) => RECOMMENDED_LIST[idx]);
      await createBatchHabits(habitsToCreate);
      onAdded();
      onClose();
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
        <p className="text-sm text-slate-500 dark:text-neutral-400">
          Select proven starter habits to add to your daily dashboard. You can customize them anytime.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
          {RECOMMENDED_LIST.map((h, idx) => {
            const isSelected = selectedHabits.includes(idx);
            return (
              <div
                key={h.name}
                onClick={() => toggleSelect(idx)}
                className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'bg-slate-100 dark:bg-neutral-900 border-slate-900 dark:border-white shadow-md'
                    : 'bg-white dark:bg-[#181818] border-slate-200 dark:border-neutral-800 hover:border-slate-300 dark:hover:border-neutral-700'
                }`}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-slate-200/50 dark:border-neutral-800"
                  style={{ backgroundColor: `${h.color}15`, color: h.color }}
                >
                  <DynamicIcon name={h.icon} className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-neutral-100 truncate">
                    {h.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-neutral-400 line-clamp-1 mt-0.5">
                    {h.description}
                  </p>
                </div>
                <div
                  className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                    isSelected
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-black shadow-sm'
                      : 'border border-slate-300 dark:border-neutral-700'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-neutral-800">
          <span className="text-xs font-semibold text-slate-500 dark:text-neutral-400">
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
