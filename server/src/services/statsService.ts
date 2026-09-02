import Habit from '../models/Habit.js';
import HabitCompletion from '../models/HabitCompletion.js';
import {
  getTodayString,
  getDateOffset,
  getDateRange,
  getDayOfWeek,
  formatDateString,
} from '../utils/dateHelpers.js';
import {
  calculateHabitStreak,
  isHabitScheduledForDate,
} from './streakService.js';

export const getDashboardStatsService = async (userId, userTimezone = 'UTC') => {
  const todayStr = getTodayString(userTimezone);

  // 1. Fetch all active habits for user
  const habits = await Habit.find({ user: userId, isActive: true }).lean();
  const habitIds = habits.map((h) => h._id);

  // 2. Fetch completions for today
  const todayCompletions = await HabitCompletion.find({
    user: userId,
    habit: { $in: habitIds },
    date: todayStr,
    completed: true,
  }).lean();

  const completedHabitIdSet = new Set(
    todayCompletions.map((c) => c.habit.toString())
  );

  // 3. Filter habits scheduled for today
  const todayScheduledHabits = habits.filter((h) =>
    isHabitScheduledForDate(h, todayStr)
  );

  const totalScheduledToday = todayScheduledHabits.length;
  const completedTodayCount = todayScheduledHabits.filter((h) =>
    completedHabitIdSet.has(h._id.toString())
  ).length;

  const todayPercentage =
    totalScheduledToday > 0
      ? Math.round((completedTodayCount / totalScheduledToday) * 100)
      : 0;

  // 4. Fetch all user completions for streak calculations
  const allCompletions = await HabitCompletion.find({
    user: userId,
    completed: true,
  }).lean();

  // Group completions by habit ID
  const completionsByHabit = {};
  allCompletions.forEach((c) => {
    const hid = c.habit.toString();
    if (!completionsByHabit[hid]) completionsByHabit[hid] = [];
    completionsByHabit[hid].push(c);
  });

  // Calculate streaks for all habits and enrich habits
  let overallLongestStreak = 0;
  let overallCurrentStreak = 0;

  const enrichedHabits = habits.map((h) => {
    const habitCompletions = completionsByHabit[h._id.toString()] || [];
    const streakInfo = calculateHabitStreak(h, habitCompletions, todayStr);
    const completedDates = habitCompletions.map((c) => c.date);

    if (streakInfo.currentStreak > overallCurrentStreak) {
      overallCurrentStreak = streakInfo.currentStreak;
    }
    if (streakInfo.longestStreak > overallLongestStreak) {
      overallLongestStreak = streakInfo.longestStreak;
    }

    return {
      ...h,
      currentStreak: streakInfo.currentStreak,
      longestStreak: streakInfo.longestStreak,
      isCompletedToday: streakInfo.isCompletedToday,
      isScheduledToday: isHabitScheduledForDate(h, todayStr),
      completedDates,
    };
  });

  // 5. Get Last 7 Days mini progress overview
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const dStr = getDateOffset(todayStr, -i);
    const dayScheduled = habits.filter((h) => isHabitScheduledForDate(h, dStr));
    const dayCompleted = allCompletions.filter(
      (c) => c.date === dStr && habitIds.some((hid) => hid.equals(c.habit))
    ).length;

    const rate =
      dayScheduled.length > 0
        ? Math.min(100, Math.round((dayCompleted / dayScheduled.length) * 100))
        : 0;

    last7Days.push({
      date: dStr,
      day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][
        getDayOfWeek(dStr)
      ],
      completed: dayCompleted,
      total: dayScheduled.length,
      rate,
    });
  }

  return {
    today: {
      date: todayStr,
      completed: completedTodayCount,
      total: totalScheduledToday,
      percentage: todayPercentage,
    },
    streaks: {
      currentStreak: overallCurrentStreak,
      longestStreak: overallLongestStreak,
    },
    totalHabitsCount: habits.length,
    habits: enrichedHabits,
    last7Days,
  };
};

export const getWeeklyStatsService = async (userId, userTimezone = 'UTC') => {
  const todayStr = getTodayString(userTimezone);
  const habits = await Habit.find({ user: userId }).lean();
  const habitIds = habits.map((h) => h._id);

  // Past 7 days (including today)
  const days = [];
  for (let i = 6; i >= 0; i--) {
    days.push(getDateOffset(todayStr, -i));
  }

  const completions = await HabitCompletion.find({
    user: userId,
    habit: { $in: habitIds },
    date: { $in: days },
    completed: true,
  }).lean();

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const weeklyData = days.map((dateStr) => {
    const scheduledHabits = habits.filter(
      (h) => h.isActive && isHabitScheduledForDate(h, dateStr)
    );
    const completedForDay = completions.filter((c) => c.date === dateStr).length;
    const totalScheduled = scheduledHabits.length;
    const rate =
      totalScheduled > 0
        ? Math.min(100, Math.round((completedForDay / totalScheduled) * 100))
        : 0;

    return {
      date: dateStr,
      dayName: daysOfWeek[getDayOfWeek(dateStr)],
      completed: completedForDay,
      total: totalScheduled,
      completionRate: rate,
    };
  });

  const totalWeeklyScheduled = weeklyData.reduce((acc, d) => acc + d.total, 0);
  const totalWeeklyCompleted = weeklyData.reduce(
    (acc, d) => acc + d.completed,
    0
  );
  const weeklyAverageRate =
    totalWeeklyScheduled > 0
      ? Math.round((totalWeeklyCompleted / totalWeeklyScheduled) * 100)
      : 0;

  return {
    weeklyData,
    summary: {
      totalScheduled: totalWeeklyScheduled,
      totalCompleted: totalWeeklyCompleted,
      averageRate: weeklyAverageRate,
    },
  };
};

export const getMonthlyStatsService = async (
  userId,
  year,
  month,
  userTimezone = 'UTC'
) => {
  const habits = await Habit.find({ user: userId }).lean();
  const habitIds = habits.map((h) => h._id);

  // Pad month to 2 digits
  const monthStr = String(month).padStart(2, '0');
  const startOfMonth = `${year}-${monthStr}-01`;

  // Determine days in month
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const endOfMonth = `${year}-${monthStr}-${String(lastDay).padStart(2, '0')}`;

  const allMonthDates = getDateRange(startOfMonth, endOfMonth);

  const completions = await HabitCompletion.find({
    user: userId,
    habit: { $in: habitIds },
    date: { $gte: startOfMonth, $lte: endOfMonth },
    completed: true,
  }).lean();

  const monthlyCalendar = allMonthDates.map((dateStr) => {
    const scheduledHabits = habits.filter(
      (h) => h.isActive && isHabitScheduledForDate(h, dateStr)
    );
    const dayCompletions = completions.filter((c) => c.date === dateStr);
    const completedCount = dayCompletions.length;
    const totalScheduled = scheduledHabits.length;

    let rate = 0;
    if (totalScheduled > 0) {
      rate = Math.min(100, Math.round((completedCount / totalScheduled) * 100));
    }

    // Status level for styling: 0 (none), 1 (low <40%), 2 (med 40-79%), 3 (high 80-99%), 4 (100%)
    let level = 0;
    if (completedCount > 0) {
      if (rate === 100) level = 4;
      else if (rate >= 80) level = 3;
      else if (rate >= 40) level = 2;
      else level = 1;
    }

    return {
      date: dateStr,
      dayNumber: parseInt(dateStr.split('-')[2], 10),
      dayOfWeek: getDayOfWeek(dateStr),
      completedCount,
      totalScheduled,
      rate,
      level,
    };
  });

  const activeDays = monthlyCalendar.filter((d) => d.completedCount > 0).length;
  const perfectDays = monthlyCalendar.filter(
    (d) => d.totalScheduled > 0 && d.rate === 100
  ).length;

  return {
    year: parseInt(year, 10),
    month: parseInt(month, 10),
    calendar: monthlyCalendar,
    summary: {
      activeDays,
      perfectDays,
      totalDays: allMonthDates.length,
    },
  };
};

export const getCategoryStatsService = async (userId) => {
  const habits = await Habit.find({ user: userId }).lean();
  const habitIds = habits.map((h) => h._id);

  const allCompletions = await HabitCompletion.find({
    user: userId,
    habit: { $in: habitIds },
    completed: true,
  }).lean();

  const categories = [
    'Health',
    'Fitness',
    'Learning',
    'Work',
    'Personal',
    'Finance',
    'Social',
    'Other',
  ];

  const categoryStats = categories
    .map((category) => {
      const categoryHabits = habits.filter((h) => h.category === category);
      const catHabitIds = new Set(
        categoryHabits.map((h) => h._id.toString())
      );

      const categoryCompletions = allCompletions.filter((c) =>
        catHabitIds.has(c.habit.toString())
      );

      return {
        category,
        totalHabits: categoryHabits.length,
        totalCompletions: categoryCompletions.length,
      };
    })
    .filter((c) => c.totalHabits > 0);

  return categoryStats;
};

export const getHabitPerformanceService = async (
  userId,
  userTimezone = 'UTC'
) => {
  const todayStr = getTodayString(userTimezone);
  const habits = await Habit.find({ user: userId }).lean();
  const habitIds = habits.map((h) => h._id);

  const allCompletions = await HabitCompletion.find({
    user: userId,
    habit: { $in: habitIds },
    completed: true,
  }).lean();

  const completionsByHabit = {};
  allCompletions.forEach((c) => {
    const hid = c.habit.toString();
    if (!completionsByHabit[hid]) completionsByHabit[hid] = [];
    completionsByHabit[hid].push(c);
  });

  // Calculate 30-day performance for each habit
  const last30Days = [];
  for (let i = 29; i >= 0; i--) {
    last30Days.push(getDateOffset(todayStr, -i));
  }

  const performanceList = habits.map((h) => {
    const hCompletions = completionsByHabit[h._id.toString()] || [];
    const completedDatesSet = new Set(hCompletions.map((c) => c.date));

    let scheduledCount = 0;
    let completedCount = 0;

    last30Days.forEach((dateStr) => {
      if (isHabitScheduledForDate(h, dateStr)) {
        scheduledCount++;
        if (completedDatesSet.has(dateStr)) {
          completedCount++;
        }
      }
    });

    const completionRate =
      scheduledCount > 0
        ? Math.round((completedCount / scheduledCount) * 100)
        : 0;

    const streakInfo = calculateHabitStreak(h, hCompletions, todayStr);

    return {
      habitId: h._id,
      name: h.name,
      icon: h.icon,
      color: h.color,
      category: h.category,
      isActive: h.isActive,
      completionRate,
      completedIn30Days: completedCount,
      scheduledIn30Days: scheduledCount,
      currentStreak: streakInfo.currentStreak,
      longestStreak: streakInfo.longestStreak,
    };
  });

  // Sort by highest completion rate
  performanceList.sort((a, b) => b.completionRate - a.completionRate);

  return performanceList;
};
