import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Calendar as CalendarIcon, Tag, AlertCircle, CheckCircle2, MessageSquare } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui';
import { Habit } from '@/types';
import { noteService } from '@/services/noteService';
import { useToast } from '@/context/ToastContext';
import { DynamicIcon } from '@/utils/constants';

interface HabitNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  habit: Habit | null;
  defaultDate?: string;
  isMissed?: boolean;
  onSaved?: () => void;
}

const PRESET_MISSED_REASONS = [
  'Feeling unwell / sick',
  'Too busy with work / studies',
  'Travel / Away from routine',
  'Forgot / Low energy',
  'Rest day / Recovery',
];

export const HabitNoteModal: React.FC<HabitNoteModalProps> = ({
  isOpen,
  onClose,
  habit,
  defaultDate,
  isMissed = false,
  onSaved,
}) => {
  const { success, error } = useToast();
  const todayStr = new Intl.DateTimeFormat('en-CA').format(new Date());

  const [date, setDate] = useState(defaultDate || todayStr);
  const [noteType, setNoteType] = useState<'missed' | 'log' | 'reminder'>(
    isMissed ? 'missed' : 'log'
  );
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const selectedDate = defaultDate || todayStr;
      setDate(selectedDate);
      if (isMissed) {
        setNoteType('missed');
        setTitle(`Missed: ${habit?.name || 'Habit'} (${selectedDate})`);
        setTags(['missed-habit', habit?.name?.toLowerCase().replace(/\s+/g, '-') || 'habit']);
      } else {
        setNoteType('log');
        setTitle(`Log: ${habit?.name || 'Habit'} (${selectedDate})`);
        setTags([habit?.name?.toLowerCase().replace(/\s+/g, '-') || 'habit']);
      }
      setContent('');
      setTagInput('');
    }
  }, [isOpen, habit, defaultDate, isMissed]);

  if (!habit) return null;

  const handleSelectPresetReason = (reason: string) => {
    setContent((prev) => (prev ? `${prev}\n• ${reason}` : reason));
  };

  const handleAddTag = () => {
    const trimmed = tagInput.trim().replace(/^#/, '');
    if (trimmed && !tags.includes(trimmed) && tags.length < 5) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !title.trim()) {
      error('Please provide a reason or note content');
      return;
    }

    setIsSubmitting(true);
    try {
      await noteService.createNote({
        title: title || `${habit.name} - ${date}`,
        content: content.trim(),
        habit: habit._id,
        targetDate: date,
        type: 'text',
        color: noteType === 'missed' ? 'red' : 'default',
        tags,
      });

      success(
        noteType === 'missed'
          ? 'Missed habit reason recorded'
          : 'Note saved successfully'
      );
      if (onSaved) onSaved();
      onClose();
    } catch (err: any) {
      error(err.message || 'Failed to save note');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
            style={{
              backgroundColor: `${habit.color || '#3B82F6'}20`,
              color: habit.color || '#3B82F6',
            }}
          >
            <DynamicIcon name={habit.icon || 'Activity'} className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {habit.name} Note
            </h3>
            <p className="text-xs text-slate-500 dark:text-neutral-400">
              Log reflection, missed reason, or set a date reminder
            </p>
          </div>
        </div>
      }
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Note category toggle */}
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800">
          <button
            type="button"
            onClick={() => {
              setNoteType('missed');
              setTitle(`Missed: ${habit.name} (${date})`);
            }}
            className={`py-1.5 px-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              noteType === 'missed'
                ? 'bg-red-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            Missed Reason
          </button>
          <button
            type="button"
            onClick={() => {
              setNoteType('log');
              setTitle(`Log: ${habit.name} (${date})`);
            }}
            className={`py-1.5 px-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              noteType === 'log'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-black shadow-sm'
                : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Daily Log
          </button>
          <button
            type="button"
            onClick={() => {
              setNoteType('reminder');
              setTitle(`Reminder: ${habit.name} (${date})`);
            }}
            className={`py-1.5 px-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              noteType === 'reminder'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Reminder
          </button>
        </div>

        {/* Date & Habit Indicator (Read-only as requested) */}
        <div className="grid grid-cols-2 gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-neutral-900/80 border border-slate-200 dark:border-neutral-800">
          <div className="space-y-0.5">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-500">
              Habit
            </span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-neutral-200 truncate">
              <DynamicIcon name={habit.icon || 'Activity'} className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="truncate">{habit.name}</span>
            </div>
          </div>

          <div className="space-y-0.5">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-500">
              Date
            </span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-neutral-200">
              <CalendarIcon className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>{date}</span>
            </div>
          </div>
        </div>

        {/* Note Title (Fixed / locked display) */}
        <div className="space-y-1">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400">
            Title
          </label>
          <div className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100/70 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-700 dark:text-neutral-300">
            {title}
          </div>
        </div>

        {/* Quick Reason Presets (for missed notes) */}
        {noteType === 'missed' && (
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-neutral-400">
              Quick Reasons:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_MISSED_REASONS.map((reason) => (
                <button
                  key={reason}
                  type="button"
                  onClick={() => handleSelectPresetReason(reason)}
                  className="text-xs px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/60 transition-colors"
                >
                  + {reason}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Content Details */}
        <div className="space-y-1">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400">
            {noteType === 'missed'
              ? 'Reason & Reflection'
              : noteType === 'reminder'
              ? 'Reminder Note'
              : 'Details'}
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={2}
            placeholder={
              noteType === 'missed'
                ? 'What happened today? How will you recover tomorrow?'
                : 'Write your notes or thoughts here...'
            }
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-slate-900 dark:text-neutral-100 placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-neutral-600 resize-none"
          />
        </div>

        {/* Tags */}
        <div className="space-y-1">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400">
            Tags
          </label>
          <div className="flex flex-wrap gap-1 items-center p-1.5 rounded-xl border border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/50">
            <Tag className="w-3 h-3 text-slate-400 dark:text-neutral-500 shrink-0" />
            {tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-200/80 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300"
              >
                #{t}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(t)}
                  className="hover:text-red-500"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            ))}
            {tags.length < 5 && (
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Add tag..."
                className="text-xs bg-transparent text-slate-700 dark:text-neutral-300 placeholder:text-slate-400 dark:placeholder:text-neutral-600 outline-none w-20"
              />
            )}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-neutral-800">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            isLoading={isSubmitting}
            className={
              noteType === 'missed'
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-slate-900 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200'
            }
          >
            Save Note
          </Button>
        </div>
      </form>
    </Modal>
  );
};
