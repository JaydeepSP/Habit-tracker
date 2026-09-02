import React, { useMemo } from "react";

/**
 * GitHub Contribution Style Heatmap Grid
 * Fixed 12×12px cells with 3px gap — always perfectly square.
 * Month labels placed at exact pixel positions (no overlap).
 * Uses the habit's selected accent color with shades for Less → More.
 */

const CELL_SIZE = 12; // px — square cell
const GAP = 3; // px — gap between cells
const COL_STEP = CELL_SIZE + GAP; // 15px per column

const formatLocalDate = (d) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const HabitContributionGraph = ({
  completedDates = [],
  color = "#3B82F6",
  onDayClick,
}) => {
  const completedSet = useMemo(() => new Set(completedDates), [completedDates]);

  const { weeks, monthLabels } = useMemo(() => {
    const today = new Date();
    const todayStr = formatLocalDate(today);
    const dayOfWeek = today.getDay();
    const totalDaysToGenerate = 52 * 7 + (dayOfWeek + 1);

    const startDate = new Date(today);
    startDate.setDate(today.getDate() - totalDaysToGenerate + 1);

    const generatedWeeks = [];
    let currentWeek = [];
    const months = [];
    let lastMonth = -1;
    let lastColIndex = -4; // Enforce min 4-column gap between labels

    for (let i = 0; i < totalDaysToGenerate; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);

      const dateStr = formatLocalDate(d);
      const isDone = completedSet.has(dateStr);
      const monthIndex = d.getMonth();
      const dayIndex = d.getDay();

      if (dayIndex === 0 && currentWeek.length > 0) {
        generatedWeeks.push(currentWeek);
        currentWeek = [];
      }

      // Place month label only if: new month AND at least 4 cols gap from prev label
      if (
        dayIndex === 0 &&
        monthIndex !== lastMonth &&
        generatedWeeks.length - lastColIndex >= 4
      ) {
        months.push({
          colIndex: generatedWeeks.length,
          name: d.toLocaleString("default", { month: "short" }),
        });
        lastMonth = monthIndex;
        lastColIndex = generatedWeeks.length;
      }

      currentWeek.push({
        date: dateStr,
        dayOfWeek: dayIndex,
        isDone,
        isToday: dateStr === todayStr,
      });
    }

    if (currentWeek.length > 0) generatedWeeks.push(currentWeek);

    return { weeks: generatedWeeks, monthLabels: months };
  }, [completedSet]);

  const daysOfWeekLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Total grid width in px (used for the month label row)
  const gridWidth = weeks.length * COL_STEP - GAP;
  // Label column width (for "Sun" etc.)
  const labelColWidth = 28;

  return (
    <div className="w-full select-none overflow-x-auto pt-2 pb-1">
      <div style={{ minWidth: gridWidth + labelColWidth + 8 }}>
        {/* Month Labels — exact px positioning, no overlap */}
        <div
          className="relative h-4 mb-2 text-[11px] font-medium text-slate-400 dark:text-neutral-500"
          style={{ marginLeft: labelColWidth + 8 }}
        >
          {monthLabels.map((m, idx) => (
            <span
              key={idx}
              className="absolute"
              style={{ left: m.colIndex * COL_STEP }}
            >
              {m.name}
            </span>
          ))}
        </div>

        {/* Graph Body */}
        <div className="flex items-start" style={{ gap: 8 }}>
          {/* Day-of-week labels — each row is exactly CELL_SIZE px tall */}
          <div
            className="flex flex-col shrink-0"
            style={{ gap: GAP, width: labelColWidth }}
          >
            {daysOfWeekLabels.map((day) => (
              <div
                key={day}
                style={{ height: CELL_SIZE }}
                className="flex items-center text-[10px] font-medium text-slate-400 dark:text-neutral-500 leading-none"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Grid — fixed-size square cells */}
          <div className="flex" style={{ gap: GAP }}>
            {weeks.map((week, wIdx) => (
              <div key={wIdx} className="flex flex-col" style={{ gap: GAP }}>
                {week.map((day) => (
                  <div
                    key={day.date}
                    onClick={() => onDayClick && onDayClick(day)}
                    title={`${day.date}: ${day.isDone ? "Completed" : "No activity"}`}
                    style={{
                      width: CELL_SIZE,
                      height: CELL_SIZE,
                      backgroundColor: day.isDone ? color : undefined,
                      boxShadow: day.isDone ? `0 0 8px ${color}55` : undefined,
                      flexShrink: 0,
                    }}
                    className={`rounded-[3px] cursor-pointer transition-colors ${
                      day.isDone
                        ? ""
                        : "bg-slate-200/80 dark:bg-neutral-900 hover:bg-slate-300 dark:hover:bg-neutral-800 border border-slate-300/40 dark:border-neutral-800/80"
                    } ${day.isToday ? "ring-1 ring-offset-0 ring-white/80 dark:ring-neutral-300" : ""}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Legend — shades of selected accent color */}
        <div className="flex items-center justify-end gap-1.5 mt-3 text-[11px] text-slate-400 dark:text-neutral-500">
          <span>Less</span>
          <div
            style={{ width: CELL_SIZE, height: CELL_SIZE }}
            className="rounded-[2px] bg-slate-200 dark:bg-neutral-900 border border-slate-300/40 dark:border-neutral-800"
          />
          <div
            style={{
              width: CELL_SIZE,
              height: CELL_SIZE,
              backgroundColor: `${color}35`,
            }}
            className="rounded-[2px]"
          />
          <div
            style={{
              width: CELL_SIZE,
              height: CELL_SIZE,
              backgroundColor: `${color}80`,
            }}
            className="rounded-[2px]"
          />
          <div
            style={{
              width: CELL_SIZE,
              height: CELL_SIZE,
              backgroundColor: color,
              boxShadow: `0 0 4px ${color}80`,
            }}
            className="rounded-[2px]"
          />
          <span>More</span>
        </div>
      </div>
    </div>
  );
};
