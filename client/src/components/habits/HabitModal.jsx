import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Modal } from '../ui/Modal';
import { Button, Input } from '../ui';
import {
  CATEGORIES,
  COLOR_PALETTES,
  AVAILABLE_ICONS,
  DynamicIcon,
  DAYS_OF_WEEK,
} from '../../utils/constants';
import { habitService } from '../../services/habitService';
import { useToast } from '../../context/ToastContext';

export const HabitModal = ({ isOpen, onClose, habitToEdit = null, onSaved }) => {
  const { success, error } = useToast();
  const isEditing = !!habitToEdit;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: '',
      description: '',
      category: 'Personal',
      icon: 'Activity',
      color: '#6366F1',
      frequency: 'daily',
      customDays: [1, 2, 3, 4, 5],
      target: 1,
      unit: 'times',
      reminderTime: '',
    },
  });

  const selectedCategory = watch('category');
  const selectedIcon = watch('icon');
  const selectedColor = watch('color');
  const selectedFrequency = watch('frequency');
  const selectedCustomDays = watch('customDays') || [];

  // Sync edit mode values
  useEffect(() => {
    if (habitToEdit) {
      reset({
        name: habitToEdit.name || '',
        description: habitToEdit.description || '',
        category: habitToEdit.category || 'Personal',
        icon: habitToEdit.icon || 'Activity',
        color: habitToEdit.color || '#6366F1',
        frequency: habitToEdit.frequency || 'daily',
        customDays: habitToEdit.customDays || [1, 2, 3, 4, 5],
        target: habitToEdit.target || 1,
        unit: habitToEdit.unit || 'times',
        reminderTime: habitToEdit.reminderTime || '',
      });
    } else {
      reset({
        name: '',
        description: '',
        category: 'Personal',
        icon: 'Activity',
        color: '#6366F1',
        frequency: 'daily',
        customDays: [1, 2, 3, 4, 5],
        target: 1,
        unit: 'times',
        reminderTime: '',
      });
    }
  }, [habitToEdit, isOpen, reset]);

  const toggleDay = (dayIndex) => {
    let current = [...selectedCustomDays];
    if (current.includes(dayIndex)) {
      if (current.length === 1) return; // Keep at least one
      current = current.filter((d) => d !== dayIndex);
    } else {
      current.push(dayIndex);
    }
    setValue('customDays', current);
  };

  const onSubmit = async (data) => {
    try {
      if (isEditing) {
        await habitService.updateHabit(habitToEdit._id, data);
        success('Habit updated successfully');
      } else {
        await habitService.createHabit(data);
        success('Habit created successfully! 🎉');
      }
      onSaved();
    } catch (err) {
      error(err.message || 'Failed to save habit');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Habit' : 'Create New Habit'}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Habit Name */}
        <Input
          label="Habit Name"
          placeholder="e.g. Daily Meditation, Morning Run, Code for 1hr"
          error={errors.name?.message}
          {...register('name', { required: 'Please enter a habit name' })}
        />

        {/* Description */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Description / Motivation (Optional)
          </label>
          <textarea
            rows="2"
            placeholder="Why is this habit important to you?"
            className="w-full px-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
            {...register('description')}
          />
        </div>

        {/* Category & Frequency Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Category
            </label>
            <select
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
              {...register('category')}
            >
              {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Frequency
            </label>
            <select
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
              {...register('frequency')}
            >
              <option value="daily">Every Day</option>
              <option value="custom">Specific Days of Week</option>
              <option value="weekly">Weekly Target</option>
            </select>
          </div>
        </div>

        {/* Custom Days Selector */}
        {selectedFrequency === 'custom' && (
          <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
              Select Scheduled Days
            </label>
            <div className="flex gap-1.5 justify-between">
              {DAYS_OF_WEEK.map((d) => {
                const isSelected = selectedCustomDays.includes(d.index);
                return (
                  <button
                    type="button"
                    key={d.index}
                    onClick={() => toggleDay(d.index)}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      isSelected
                        ? 'bg-brand-600 text-white shadow-sm'
                        : 'bg-slate-200/70 dark:bg-slate-700/60 text-slate-600 dark:text-slate-400 hover:bg-slate-300'
                    }`}
                  >
                    {d.short}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Target & Unit */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            type="number"
            min="1"
            label="Daily Target Goal"
            placeholder="1"
            {...register('target', { valueAsNumber: true })}
          />
          <Input
            label="Unit of measure"
            placeholder="e.g. mins, pages, times"
            {...register('unit')}
          />
        </div>

        {/* Color Picker */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Accent Color
          </label>
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            {COLOR_PALETTES.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => setValue('color', c)}
                className={`w-7 h-7 rounded-full transition-transform shrink-0 ${
                  selectedColor === c
                    ? 'ring-2 ring-offset-2 ring-brand-500 scale-110'
                    : 'hover:scale-105'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        {/* Icon Picker */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Habit Icon
          </label>
          <div className="grid grid-cols-10 gap-2 p-2 rounded-xl border border-slate-200 dark:border-slate-800 max-h-32 overflow-y-auto">
            {AVAILABLE_ICONS.map((iconName) => (
              <button
                type="button"
                key={iconName}
                onClick={() => setValue('icon', iconName)}
                className={`p-2 rounded-lg flex items-center justify-center transition-all ${
                  selectedIcon === iconName
                    ? 'bg-brand-500/20 text-brand-600 dark:text-brand-400 ring-2 ring-brand-500'
                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <DynamicIcon name={iconName} className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {isEditing ? 'Save Changes' : 'Create Habit'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
