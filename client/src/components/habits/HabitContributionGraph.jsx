import React, { useMemo } from 'react';

/**
 * GitHub Contribution Style Heatmap Grid
 * Displays ~52 weeks (365 days) aligned by day-of-week (Sun-Sat or Mon-Sun)
 */
export const HabitContributionGraph = ({
  completedDates = [],
  color = '#3B82F6', // Default blue matching habi.app
  onDayClick,
}) => {
  const completedSet = useMemo(() => new Set(completedDates), [completedDates]);

  // Generate 52 weeks of dates ending on today
  const { weeks, monthLabels, totalDays, completedCount } = useMemo(() => {
    const today = new Date();
    const dates = [];

    // Go back 52 full weeks (364 days + current week offset)
    const dayOfWeek = today.getDay(); // 0 = Sun, 6 = Sat
    const totalDaysToGenerate = 52 * 7 + (dayOfWeek + 1);

    const startDate = new Date(today);
    startDate.setDate(today.getDate() - totalDaysToGenerate + 1);

    const generatedWeeks = [];
    let currentWeek = [];
    const months = [];
    let lastMonth = -1;
    let completed = 0;

    for (let i = 0; i < totalDaysToGenerate; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);

      const dateStr = d.toISOString().split('T')[0];
      const isDone = completedSet.has(dateStr);
      if (isDone) completed++;

      const monthIndex = d.getMonth();
      const dayIndex = d.getDay(); // 0=Sun ... 6=Sat

      // If Sunday (start of new column/week), push previous week
      if (dayIndex === 0 && currentWeek.length > 0) {
        generatedWeeks.push(currentWeek);
        currentWeek = [];
      }

      // Check if we should place a month label for this week column
      if (dayIndex === 0 && monthIndex !== lastMonth) {
        months.push({
          colIndex: generatedWeeks.length,
          name: d.toLocaleString('default', { month: 'short' }),
        });
        lastMonth = monthIndex;
      }

      currentWeek.push({
        date: dateStr,
        dayOfWeek: dayIndex,
        isDone,
        isToday: dateStr === today.toISOString().split('T')[0],
        isFuture: d > today,
      });
    }

    if (currentWeek.length > 0) {
      generatedWeeks.push(currentWeek);
    }

    return {
      weeks: generatedWeeks,
      monthLabels: months,
      totalDays: totalDaysToGenerate,
      completedCount: completed,
    };
  }, [completedSet]);

  const daysOfWeekLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="w-full select-none overflow-x-auto pt-2 pb-1 scrollbar-thin">
      <div className="min-w-[720px] max-w-full">
        {/* Month Labels Header */}
        <div className="relative h-4 mb-1.5 ml-8 text-[11px] font-semibold text-slate-400 dark:text-slate-500">
          {monthLabels.map((m, idx) => (
            <span
              key={idx}
              className="absolute transform -translate-x-1/2"
              style={{ left: `${(m.colIndex / weeks.length) * 100}%` }}
            >
              {m.name}
            </span>
          ))}
        </div>

        {/* Graph Body */}
        <div className="flex items-start gap-2">
          {/* Day of week labels on left */}
          <div className="flex flex-col justify-between h-[98px] text-[10px] font-medium text-slate-400 dark:text-slate-500 pr-1 select-none">
            {daysOfWeekLabels.map((day, idx) => (
              <span key={day} className="leading-none">
                {day}
              </span>
            ))}
          </div>

          {/* Grid Columns (Weeks) */}
          <div className="flex-1 flex gap-[3px]">
            {weeks.map((week, wIdx) => (
              <div key={wIdx} className="flex flex-col gap-[3px] flex-1">
                {week.map((day) => {
                  return (
                    <div
                      key={day.date}
                      onClick={() => onDayClick && onDayClick(day)}
                      title={`${day.date}: ${day.isDone ? 'Completed' : 'No activity'}`}
                      style={{
                        backgroundColor: day.isDone
                          ? color
                          : undefined,
                      }}
                      className={`w-full aspect-square rounded-[3px] transition-all cursor-pointer ${
                        day.isDone
                          ? 'shadow-[0_0_8px_rgba(59,130,246,0.5)]'
                          : 'bg-slate-200/80 dark:bg-slate-800/80 hover:bg-slate-300 dark:hover:bg-slate-700/80 border border-slate-300/40 dark:border-slate-800/60'
                      } ${day.isToday ? 'ring-1 ring-white dark:ring-slate-300' : ''}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end gap-1.5 mt-3 text-[11px] text-slate-400 dark:text-slate-500">
          <span>Less</span>
          <div className="w-2.5 h-2.5 rounded-[2px] bg-slate-200 dark:bg-slate-800" />
          <div
            className="w-2.5 h-2.5 rounded-[2px]"
            style={{ backgroundColor: `${color}55` }}
          />
          <div
            className="w-2.5 h-2.5 rounded-[2px]"
            style={{ backgroundColor: `${color}99` }}
          />
          <div
            className="w-2.5 h-2.5 rounded-[2px] shadow-sm"
            style={{ backgroundColor: color }}
          />
          <span>More</span>
        </div>
      </div>
    </div>
  );
};
