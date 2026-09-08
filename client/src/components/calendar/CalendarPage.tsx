import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Check, Calendar as CalendarIcon, Clock, StickyNote, Plus } from 'lucide-react';
import { useCalendarStats, useDateCompletions, useHabits } from '@/hooks';
import { Card, Button, Badge } from '@/components/ui';
import { Modal } from '@/components/ui/Modal';
import { DynamicIcon } from '@/utils/constants';
import { Skeleton } from '@/components/ui/Skeleton';
import { noteService } from '@/services/noteService';
import { Note, Habit } from '@/types';
import { useToast } from '@/context/ToastContext';

export const CalendarPage = () => {
  const today = new Date();
  const { success, error } = useToast();

  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1); // 1-12

  // Selected date details modal
  const [selectedDate, setSelectedDate] = useState<any>(null);
  const [dateModalOpen, setDateModalOpen] = useState(false);

  // Date-linked notes
  const [dateNotes, setDateNotes] = useState<Note[]>([]);
  const [monthNotes, setMonthNotes] = useState<Note[]>([]);
  const [notesLoading, setNotesLoading] = useState(false);

  // Quick note creation on date
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteHabitId, setNewNoteHabitId] = useState('');
  const [newNoteColor, setNewNoteColor] = useState('default');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  // Habits list for linking
  const { habits } = useHabits();

  // Custom TanStack Hooks
  const { calendarData, isLoading: loading } = useCalendarStats(currentYear, currentMonth);
  const { completions: selectedDateCompletions, isLoading: dateLoading } = useDateCompletions(
    selectedDate?.date,
    dateModalOpen
  );

  const fetchMonthNotes = async () => {
    try {
      const res = await noteService.getNotes({});
      setMonthNotes(res.data || []);
    } catch (err) {
      // ignore
    }
  };

  useEffect(() => {
    fetchMonthNotes();
  }, [currentYear, currentMonth]);

  const fetchDateNotes = async (dateStr: string) => {
    setNotesLoading(true);
    try {
      const res = await noteService.getNotes({ targetDate: dateStr });
      setDateNotes(res.data || []);
    } catch (err) {
      // ignore or handle quietly
    } finally {
      setNotesLoading(false);
    }
  };

  useEffect(() => {
    if (dateModalOpen && selectedDate?.date) {
      fetchDateNotes(selectedDate.date);
      setIsAddingNote(false);
      setNewNoteTitle('');
      setNewNoteContent('');
      setNewNoteHabitId('');
      setNewNoteColor('default');
    }
  }, [dateModalOpen, selectedDate?.date]);

  const handleCreateDateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim() && !newNoteContent.trim()) return;

    setIsSubmittingNote(true);
    try {
      await noteService.createNote({
        title: newNoteTitle.trim() || `Note (${selectedDate.date})`,
        content: newNoteContent.trim(),
        targetDate: selectedDate.date,
        habit: newNoteHabitId || null,
        color: newNoteColor,
        type: 'text',
      });
      success('Note added for ' + selectedDate.date);
      setNewNoteTitle('');
      setNewNoteContent('');
      setNewNoteHabitId('');
      setIsAddingNote(false);
      await fetchDateNotes(selectedDate.date);
    } catch (err: any) {
      error(err.message || 'Failed to add note');
    } finally {
      setIsSubmittingNote(false);
    }
  };

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleDateClick = (dayObj: any) => {
    setSelectedDate(dayObj);
    setDateModalOpen(true);
  };

  // Month name formatter
  const monthName = new Date(currentYear, currentMonth - 1).toLocaleString('default', {
    month: 'long',
  });

  const weekHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Calculate starting blank padding days for the calendar grid
  const firstDayOfMonthIndex =
    calendarData?.calendar?.length > 0 ? calendarData.calendar[0].dayOfWeek : 0;

  // 5-level color scale — matches heatmap legend
  const getLevelStyles = (level: number) => {
    switch (level) {
      case 4: // 100%
        return { bg: '#15803D', text: 'white', shadow: '0 0 12px #15803D80' };
      case 3: // 80-99%
        return { bg: '#22C55E', text: 'white', shadow: '0 0 8px #22C55E60' };
      case 2: // 40-79%
        return { bg: '#7C3AED', text: 'white', shadow: undefined };
      case 1: // <40%
        return { bg: '#A78BFA', text: 'white', shadow: undefined };
      default: // 0%
        return { bg: null, text: null, shadow: null };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Month Navigator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Calendar & Daily Activity
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track daily consistency, review habit reasons, and keep date reminders
          </p>
        </div>

        {/* Month switcher */}
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="px-4 py-1 font-bold text-sm text-slate-900 dark:text-white min-w-36 text-center">
            {monthName} {currentYear}
          </div>
          <button
            onClick={handleNextMonth}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Summary Chips */}
      {calendarData?.summary && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Card className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
              <Check className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Perfect Days (100%)
              </p>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                {calendarData.summary.perfectDays} days
              </h4>
            </div>
          </Card>

          <Card className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-500">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Active Days
              </p>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                {calendarData.summary.activeDays} / {calendarData.summary.totalDays}
              </h4>
            </div>
          </Card>

          <Card className="col-span-2 sm:col-span-1 p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Consistency Ratio
              </p>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                {calendarData.summary.totalDays > 0
                  ? Math.round((calendarData.summary.activeDays / calendarData.summary.totalDays) * 100)
                  : 0}
                %
              </h4>
            </div>
          </Card>
        </div>
      )}

      {/* Main Calendar View */}
      <Card className="p-6 bg-white dark:bg-[#121212] border-slate-200/90 dark:border-neutral-800">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-2 mb-3 text-center">
          {weekHeaders.map((day) => (
            <div
              key={day}
              className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-500 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        {loading ? (
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }).map((_, i) => (
              <Skeleton key={i} className="h-20 sm:h-24 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-2">
            {/* Blank offset tiles */}
            {Array.from({ length: firstDayOfMonthIndex }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="h-20 sm:h-24 rounded-xl border border-dashed border-slate-200/40 dark:border-neutral-800/40 opacity-30"
              />
            ))}

            {/* Actual month days */}
            {calendarData?.calendar?.map((day: any) => {
              const isToday =
                day.date ===
                new Intl.DateTimeFormat('en-CA', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                }).format(new Date());

              const dayNotes = monthNotes.filter((n) => n.targetDate === day.date);
              const hasNotes = dayNotes.length > 0;
              const hasMissedReason = dayNotes.some((n) => n.tags?.includes('missed-habit') || n.color === 'red');

              const levelStyle = getLevelStyles(day.level);
              return (
                <button
                  key={day.date}
                  onClick={() => handleDateClick(day)}
                  style={{
                    backgroundColor: levelStyle.bg || undefined,
                    color: levelStyle.text || undefined,
                    boxShadow: levelStyle.shadow || undefined,
                  }}
                  className={`h-20 sm:h-24 p-2 sm:p-2.5 rounded-xl border flex flex-col justify-between transition-all duration-200 text-left cursor-pointer group relative ${
                    levelStyle.bg
                      ? 'border-transparent'
                      : 'bg-slate-100 dark:bg-neutral-900/90 text-slate-700 dark:text-neutral-400 hover:bg-slate-200 dark:hover:bg-neutral-800 border border-slate-200/60 dark:border-neutral-800/80'
                  } ${
                    isToday ? 'ring-2 ring-offset-1 ring-slate-400 dark:ring-neutral-300' : ''
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-xs sm:text-sm font-bold ${
                        isToday ? 'underline underline-offset-2' : ''
                      }`}
                    >
                      {day.dayNumber}
                    </span>
                    <div className="flex items-center gap-1">
                      {hasNotes && (
                        <span
                          className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-black ${
                            hasMissedReason
                              ? 'bg-red-500 text-white shadow-sm'
                              : 'bg-amber-400 text-black shadow-sm'
                          }`}
                          title={`${dayNotes.length} note(s) on this date`}
                        >
                          ✎
                        </span>
                      )}
                      {day.rate === 100 && (
                        <span className="text-[10px] font-extrabold bg-white/20 px-1 rounded">
                          ✓
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    {day.totalScheduled > 0 ? (
                      <>
                        <div className="text-[10px] sm:text-xs font-semibold opacity-90">
                          {day.completedCount}/{day.totalScheduled}
                        </div>
                        <div className="text-[9px] sm:text-[10px] opacity-75 font-medium">
                          {day.rate}%
                        </div>
                      </>
                    ) : (
                      <div className="text-[10px] opacity-40 font-medium">-</div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-neutral-800 text-xs text-slate-500 dark:text-neutral-400">
          <span className="font-semibold text-slate-700 dark:text-neutral-300">Legend:</span>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded bg-slate-100 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-800" />
            <span>0%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded" style={{ backgroundColor: '#A78BFA' }} />
            <span>&lt;40%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded" style={{ backgroundColor: '#7C3AED' }} />
            <span>40-79%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded" style={{ backgroundColor: '#22C55E' }} />
            <span>80-99%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded" style={{ backgroundColor: '#15803D' }} />
            <span>100%</span>
          </div>
        </div>
      </Card>

      {/* Day Details Modal */}
      <Modal
        isOpen={dateModalOpen}
        onClose={() => setDateModalOpen(false)}
        title={selectedDate ? `Activity & Notes for ${selectedDate.date}` : 'Day Details'}
        maxWidth="max-w-xl"
      >
        <div className="space-y-4">
          {/* Quick Add Note Toggle Button */}
          <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-neutral-800">
            <span className="text-xs font-bold text-slate-700 dark:text-neutral-300 uppercase tracking-wider">
              Completions & Logs
            </span>
            <button
              type="button"
              onClick={() => setIsAddingNote(!isAddingNote)}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-900 text-white dark:bg-white dark:text-black hover:opacity-90 transition-opacity"
            >
              <Plus className="w-3.5 h-3.5" />
              {isAddingNote ? 'Cancel Note' : 'Add Note / Reason'}
            </button>
          </div>

          {/* New Note Form on Selected Date */}
          {isAddingNote && (
            <form onSubmit={handleCreateDateNote} className="p-3 rounded-xl border border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-900/60 space-y-3">
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-600 dark:text-neutral-400">
                  Connect Habit (Optional)
                </label>
                <select
                  value={newNoteHabitId}
                  onChange={(e) => setNewNoteHabitId(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="">General Date Note / Reminder</option>
                  {habits.map((h) => (
                    <option key={h._id} value={h._id}>
                      {h.name} ({h.category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <input
                  type="text"
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  placeholder="Title (e.g. Reason for missing gym, Daily Reflection)"
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <textarea
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  rows={3}
                  placeholder="Write your note or reason here..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-slate-900 dark:text-white focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingNote(false)}
                  className="px-3 py-1 text-xs rounded-lg text-slate-600 dark:text-neutral-400 hover:bg-slate-200 dark:hover:bg-neutral-800"
                >
                  Cancel
                </button>
                <Button
                  type="submit"
                  size="sm"
                  isLoading={isSubmittingNote}
                  className="bg-slate-900 text-white dark:bg-white dark:text-black text-xs"
                >
                  Save Note for Date
                </Button>
              </div>
            </form>
          )}

          {/* Date Notes / Reminders Section */}
          {dateNotes.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                <StickyNote className="w-3.5 h-3.5" />
                Notes & Reminders ({dateNotes.length})
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {dateNotes.map((note) => {
                  const habit =
                    typeof note.habit === 'object' && note.habit !== null
                      ? (note.habit as Habit)
                      : null;

                  return (
                    <div
                      key={note._id}
                      className="p-3 rounded-xl border border-slate-200 dark:border-neutral-800 bg-amber-50/40 dark:bg-neutral-900/50 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <h5 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          {note.title || 'Note'}
                        </h5>
                        {habit && (
                          <span
                            className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded border"
                            style={{
                              backgroundColor: `${habit.color || '#3B82F6'}15`,
                              borderColor: `${habit.color || '#3B82F6'}35`,
                              color: habit.color || '#3B82F6',
                            }}
                          >
                            <DynamicIcon name={habit.icon || 'Activity'} className="w-2.5 h-2.5" />
                            {habit.name}
                          </span>
                        )}
                      </div>
                      {note.content && (
                        <p className="text-xs text-slate-700 dark:text-neutral-300 whitespace-pre-wrap">
                          {note.content}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Habit Completions for Date */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">
              Completed Habits
            </h4>
            {dateLoading ? (
              <div className="space-y-2">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-14 rounded-xl" />
                ))}
              </div>
            ) : selectedDateCompletions.length === 0 ? (
              <div className="text-center py-5 space-y-1 border border-dashed border-slate-200 dark:border-neutral-800 rounded-xl">
                <p className="text-xs font-semibold text-slate-600 dark:text-neutral-300">
                  No habit completions recorded on this day.
                </p>
                <p className="text-[11px] text-slate-400 dark:text-neutral-500">
                  Log your reasons or track upcoming routines above!
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {selectedDateCompletions.map((comp: any) => {
                  const habit = comp.habit || comp.habitId;
                  if (!habit) return null;

                  return (
                    <div
                      key={comp._id}
                      className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-900/50"
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${habit.color || '#3B82F6'}20`, color: habit.color || '#3B82F6' }}
                      >
                        <DynamicIcon name={habit.icon || 'Activity'} className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                            {habit.name}
                          </h4>
                          <Badge variant="primary">{habit.category}</Badge>
                        </div>
                        {(comp.notes || comp.note) && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 italic">
                            "{comp.notes || comp.note}"
                          </p>
                        )}
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                          ✓ Completed
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};
