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
      color: '#3B82F6',
      frequency: 'daily',
      customDays: [1, 2, 3, 4, 5],
      target: 1,
      unit: 'times',
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
        color: habitToEdit.color || '#3B82F6',
        frequency: habitToEdit.frequency || 'daily',
        customDays: habitToEdit.customDays || [1, 2, 3, 4, 5],
        target: habitToEdit.target || 1,
        unit: habitToEdit.unit || 'times',
      });
    } else {
      reset({
        name: '',
        description: '',
        category: 'Personal',
        icon: 'Activity',
        color: '#3B82F6',
        frequency: 'daily',
        customDays: [1, 2, 3, 4, 5],
        target: 1,
        unit: 'times',
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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Habit Name */}
        <Input
          label="Habit Name"
          placeholder="e.g. Daily Meditation, Morning Run, Code"
          error={errors.name?.message}
          {...register('name', { required: 'Please enter a habit name' })}
        />

        {/* Category & Frequency */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="space-y-1">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400">
              Category
            </label>
            <select
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-slate-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-neutral-600"
              {...register('category')}
            >
              {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400">
              Frequency
            </label>
            <select
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-slate-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-neutral-600"
              {...register('frequency')}
            >
              <option value="daily">Every Day</option>
              <option value="custom">Specific Days of Week</option>
              <option value="weekly">Weekly Target</option>
            </select>
          </div>
        </div>

        {/* Custom Days Selector (Shown only when custom frequency selected) */}
        {selectedFrequency === 'custom' && (
          <div className="space-y-1 p-2.5 rounded-xl bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800">
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-neutral-400">
              Scheduled Days
            </label>
            <div className="flex gap-1 justify-between">
              {DAYS_OF_WEEK.map((d) => {
                const isSelected = selectedCustomDays.includes(d.index);
                return (
                  <button
                    type="button"
                    key={d.index}
                    onClick={() => toggleDay(d.index)}
                    className={`flex-1 py-1 text-xs font-bold rounded-lg transition-all ${
                      isSelected
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-black shadow-sm'
                        : 'bg-slate-200/80 dark:bg-neutral-800 text-slate-600 dark:text-neutral-400'
                    }`}
                  >
                    {d.short}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Color Palette Picker */}
        <div className="space-y-1">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400">
            Accent Color
          </label>
          <div className="flex items-center gap-2.5 py-1">
            {COLOR_PALETTES.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => setValue('color', c)}
                className={`w-6 h-6 rounded-full transition-transform shrink-0 ${
                  selectedColor === c
                    ? 'ring-2 ring-offset-2 ring-slate-900 dark:ring-white scale-110'
                    : 'hover:scale-105 opacity-85'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        {/* Compact Icon Picker (Clean horizontal wrap with no internal scroll) */}
        <div className="space-y-1">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400">
            Icon
          </label>
          <div className="flex flex-wrap gap-1.5 p-2 rounded-xl border border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/60">
            {AVAILABLE_ICONS.map((iconName) => (
              <button
                type="button"
                key={iconName}
                onClick={() => setValue('icon', iconName)}
                className={`p-1.5 rounded-lg flex items-center justify-center transition-all ${
                  selectedIcon === iconName
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-black ring-1 ring-slate-900 dark:ring-white scale-105'
                    : 'text-slate-500 dark:text-neutral-400 hover:bg-slate-200 dark:hover:bg-neutral-800'
                }`}
              >
                <DynamicIcon name={iconName} className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-neutral-800">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onClose}
            className="dark:bg-neutral-900 dark:border-neutral-800 dark:text-neutral-300"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            isLoading={isSubmitting}
            className="bg-slate-900 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200"
          >
            {isEditing ? 'Save Changes' : 'Create Habit'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
