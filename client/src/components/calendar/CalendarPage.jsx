import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Check, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { statsService } from '../../services/statsService';
import { completionService } from '../../services/completionService';
import { habitService } from '../../services/habitService';
import { useToast } from '../../context/ToastContext';
import { Card, Button, Badge } from '../ui';
import { Modal } from '../ui/Modal';
import { DynamicIcon } from '../../utils/constants';
import { Skeleton } from '../ui/Skeleton';

export const CalendarPage = () => {
  const { success, error } = useToast();
  const today = new Date();

  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1); // 1-12
  const [calendarData, setCalendarData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Selected date details modal
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDateCompletions, setSelectedDateCompletions] = useState([]);
  const [dateModalOpen, setDateModalOpen] = useState(false);
  const [dateLoading, setDateLoading] = useState(false);

  const fetchCalendar = async () => {
    setLoading(true);
    try {
      const res = await statsService.getMonthlyStats(currentYear, currentMonth);
      if (res.success) {
        setCalendarData(res.data);
      }
    } catch (err) {
      error(err.message || 'Failed to load calendar data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendar();
  }, [currentYear, currentMonth]);

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

  const handleDateClick = async (dayObj) => {
    setSelectedDate(dayObj);
    setDateModalOpen(true);
    setDateLoading(true);

    try {
      const res = await completionService.getCompletionsByDate(dayObj.date);
      if (res.success) {
        setSelectedDateCompletions(res.data);
      }
    } catch (err) {
      error(err.message || 'Failed to load date details');
    } finally {
      setDateLoading(false);
    }
  };

  // Month name formatter
  const monthName = new Date(currentYear, currentMonth - 1).toLocaleString('default', {
    month: 'long',
  });

  const weekHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Calculate starting blank padding days for the calendar grid
  const firstDayOfMonthIndex =
    calendarData?.calendar?.length > 0 ? calendarData.calendar[0].dayOfWeek : 0;

  // Level color indicator classes
  const getLevelClasses = (level, isSelected) => {
    switch (level) {
      case 4: // 100%
        return 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30';
      case 3: // 80-99%
        return 'bg-emerald-500/80 text-white';
      case 2: // 40-79%
        return 'bg-brand-500/70 text-white';
      case 1: // <40%
        return 'bg-brand-500/20 text-brand-600 dark:text-brand-400 border border-brand-500/30';
      default: // 0%
        return 'bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Month Navigator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Calendar History
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track daily consistency and review completion records over time
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

      {/* Main Calendar Grid */}
      <Card className="p-6">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-2 text-center mb-3">
          {weekHeaders.map((day) => (
            <div
              key={day}
              className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 py-1"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Days Matrix */}
        {loading ? (
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-2">
            {/* Blank leading days */}
            {Array.from({ length: firstDayOfMonthIndex }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="h-20 sm:h-24 rounded-xl bg-slate-50/50 dark:bg-slate-900/30 border border-transparent opacity-40"
              />
            ))}

            {/* Actual month days */}
            {calendarData?.calendar?.map((day) => {
              const isToday =
                day.date ===
                new Intl.DateTimeFormat('en-CA', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                }).format(new Date());

              return (
                <button
                  key={day.date}
                  onClick={() => handleDateClick(day)}
                  className={`h-20 sm:h-24 p-2 sm:p-2.5 rounded-xl border flex flex-col justify-between transition-all duration-200 text-left cursor-pointer group ${
                    isToday
                      ? 'border-brand-500 ring-2 ring-brand-500/20'
                      : 'border-slate-200/80 dark:border-slate-800'
                  } ${getLevelClasses(day.level)}`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-xs sm:text-sm font-bold ${
                        isToday ? 'underline underline-offset-2' : ''
                      }`}
                    >
                      {day.dayNumber}
                    </span>
                    {day.rate === 100 && (
                      <span className="text-[10px] font-extrabold bg-white/20 px-1 rounded">
                        ✓
                      </span>
                    )}
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
        <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
          <span className="font-semibold text-slate-700 dark:text-slate-300">Legend:</span>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700" />
            <span>0%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded bg-brand-500/30" />
            <span>&lt;40%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded bg-brand-500/70" />
            <span>40-79%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded bg-emerald-500/80" />
            <span>80-99%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded bg-emerald-600" />
            <span>100%</span>
          </div>
        </div>
      </Card>

      {/* Day Details Modal */}
      <Modal
        isOpen={dateModalOpen}
        onClose={() => setDateModalOpen(false)}
        title={selectedDate ? `Activity for ${selectedDate.date}` : 'Day Details'}
        maxWidth="max-w-lg"
      >
        {dateLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        ) : selectedDateCompletions.length === 0 ? (
          <div className="text-center py-8 space-y-2">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No habit completions recorded on this day.
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Check in daily to build your consistent routine!
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {selectedDateCompletions.map((comp) => {
              const habit = comp.habit;
              if (!habit) return null;

              return (
                <div
                  key={comp._id}
                  className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50"
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${habit.color}20`, color: habit.color }}
                  >
                    <DynamicIcon name={habit.icon} className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {habit.name}
                      </h4>
                      <Badge color={habit.color}>{habit.category}</Badge>
                    </div>
                    {comp.note && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 italic">
                        "{comp.note}"
                      </p>
                    )}
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                      ✓ Completed
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Modal>
    </div>
  );
};
