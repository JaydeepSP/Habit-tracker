import {
  getTodayString,
  getDateOffset,
  getDayOfWeek,
  formatDateString,
} from '../utils/dateHelpers.js';

/**
 * Checks whether a habit is scheduled on a given date string (YYYY-MM-DD)
 */
export const isHabitScheduledForDate = (habit, dateStr) => {
  // If habit has a start date after dateStr, not scheduled
  if (habit.startDate && formatDateString(habit.startDate) > dateStr) {
    return false;
  }
  // If habit has an end date before dateStr, not scheduled
  if (habit.endDate && formatDateString(habit.endDate) < dateStr) {
    return false;
  }

  if (habit.frequency === 'daily') {
    return true;
  }

  if (habit.frequency === 'weekly') {
    // For weekly, we consider every day a valid candidate until target is reached
    return true;
  }

  if (habit.frequency === 'custom') {
    const dayOfWeek = getDayOfWeek(dateStr); // 0=Sun, 1=Mon, ..., 6=Sat
    return Array.isArray(habit.customDays) && habit.customDays.includes(dayOfWeek);
  }

  return true;
};

/**
 * Calculates current streak and longest streak for a habit
 * @param {Object} habit - Habit Mongoose doc or object
 * @param {Array} completions - Array of completion objects or strings (YYYY-MM-DD)
 * @param {string} userTodayStr - Today's date string in user timezone (YYYY-MM-DD)
 * @returns {Object} { currentStreak: number, longestStreak: number, isCompletedToday: boolean }
 */
export const calculateHabitStreak = (habit, completions, userTodayStr) => {
  const todayStr = userTodayStr || getTodayString();
  
  // Normalize completions into a Set of date strings
  const completedDates = new Set();
  completions.forEach((c) => {
    if (typeof c === 'string') {
      completedDates.add(c);
    } else if (c.completed && c.date) {
      completedDates.add(c.date);
    }
  });

  const isCompletedToday = completedDates.has(todayStr);

  // 1. Calculate Current Streak
  let currentStreak = 0;
  let checkDate = todayStr;

  // If not completed today, start checking from yesterday if today was scheduled
  if (!isCompletedToday) {
    // If today is scheduled, we haven't completed it yet today, so streak is based on yesterday
    // If today is NOT scheduled, streak is also based on previous scheduled day
    checkDate = getDateOffset(todayStr, -1);
  }

  const habitStartStr = habit.startDate ? formatDateString(habit.startDate) : '2020-01-01';

  // Walk backwards to count current streak
  let lookbackLimit = 365; // Max 1 year back
  let activeCheck = checkDate;

  while (lookbackLimit > 0 && activeCheck >= habitStartStr) {
    const isScheduled = isHabitScheduledForDate(habit, activeCheck);

    if (isScheduled) {
      if (completedDates.has(activeCheck)) {
        currentStreak++;
      } else {
        // Missed a scheduled day - break streak!
        break;
      }
    }
    // If not scheduled, skip day without breaking streak
    activeCheck = getDateOffset(activeCheck, -1);
    lookbackLimit--;
  }

  // 2. Calculate Longest Streak across all history
  // Sort all unique completion dates chronologically
  const sortedDates = Array.from(completedDates).sort();
  let longestStreak = 0;

  if (sortedDates.length > 0) {
    const firstDate = sortedDates[0];
    const lastDate = sortedDates[sortedDates.length - 1];

    let runningStreak = 0;
    let scanDate = firstDate;

    while (scanDate <= lastDate) {
      const isScheduled = isHabitScheduledForDate(habit, scanDate);

      if (isScheduled) {
        if (completedDates.has(scanDate)) {
          runningStreak++;
          if (runningStreak > longestStreak) {
            longestStreak = runningStreak;
          }
        } else {
          runningStreak = 0;
        }
      }
      scanDate = getDateOffset(scanDate, 1);
    }
  }

  longestStreak = Math.max(longestStreak, currentStreak);

  return {
    currentStreak,
    longestStreak,
    isCompletedToday,
  };
};
