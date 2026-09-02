import asyncHandler from '../utils/asyncHandler.js';
import {
  getDashboardStatsService,
  getWeeklyStatsService,
  getMonthlyStatsService,
  getCategoryStatsService,
  getHabitPerformanceService,
} from '../services/statsService.js';
import Habit from '../models/Habit.js';
import HabitCompletion from '../models/HabitCompletion.js';
import { calculateHabitStreak } from '../services/streakService.js';
import { getTodayString } from '../utils/dateHelpers.js';

// @desc    Get complete dashboard summary
// @route   GET /api/stats/dashboard
// @access  Private
export const getDashboardStats = asyncHandler(async (req, res, next) => {
  const stats = await getDashboardStatsService(
    req.user.id,
    req.user.timezone || 'UTC'
  );
  res.status(200).json({
    success: true,
    data: stats,
  });
});

// @desc    Get 7-day weekly statistics
// @route   GET /api/stats/weekly
// @access  Private
export const getWeeklyStats = asyncHandler(async (req, res, next) => {
  const stats = await getWeeklyStatsService(
    req.user.id,
    req.user.timezone || 'UTC'
  );
  res.status(200).json({
    success: true,
    data: stats,
  });
});

// @desc    Get monthly calendar statistics
// @route   GET /api/stats/monthly
// @access  Private
export const getMonthlyStats = asyncHandler(async (req, res, next) => {
  const today = new Date();
  const year = req.query.year || today.getUTCFullYear();
  const month = req.query.month || today.getUTCMonth() + 1; // 1-12

  const stats = await getMonthlyStatsService(
    req.user.id,
    year,
    month,
    req.user.timezone || 'UTC'
  );

  res.status(200).json({
    success: true,
    data: stats,
  });
});

// @desc    Get habit completion performance
// @route   GET /api/stats/habits
// @access  Private
export const getHabitStats = asyncHandler(async (req, res, next) => {
  const stats = await getHabitPerformanceService(
    req.user.id,
    req.user.timezone || 'UTC'
  );
  res.status(200).json({
    success: true,
    data: stats,
  });
});

// @desc    Get stats broken down by category
// @route   GET /api/stats/categories
// @access  Private
export const getCategoryStats = asyncHandler(async (req, res, next) => {
  const stats = await getCategoryStatsService(req.user.id);
  res.status(200).json({
    success: true,
    data: stats,
  });
});

// @desc    Get streak overview across all habits
// @route   GET /api/stats/streaks
// @access  Private
export const getStreakStats = asyncHandler(async (req, res, next) => {
  const habits = await Habit.find({ user: req.user.id, isActive: true }).lean();
  const habitIds = habits.map((h) => h._id);

  const completions = await HabitCompletion.find({
    user: req.user.id,
    habit: { $in: habitIds },
    completed: true,
  }).lean();

  const completionsByHabit = {};
  completions.forEach((c) => {
    const hid = c.habit.toString();
    if (!completionsByHabit[hid]) completionsByHabit[hid] = [];
    completionsByHabit[hid].push(c);
  });

  const todayStr = getTodayString(req.user.timezone);
  let bestCurrentStreakHabit = null;
  let bestLongestStreakHabit = null;
  let maxCurrent = 0;
  let maxLongest = 0;

  const habitStreaks = habits.map((h) => {
    const hCompletions = completionsByHabit[h._id.toString()] || [];
    const info = calculateHabitStreak(h, hCompletions, todayStr);

    if (info.currentStreak > maxCurrent) {
      maxCurrent = info.currentStreak;
      bestCurrentStreakHabit = h.name;
    }
    if (info.longestStreak > maxLongest) {
      maxLongest = info.longestStreak;
      bestLongestStreakHabit = h.name;
    }

    return {
      habitId: h._id,
      name: h.name,
      icon: h.icon,
      color: h.color,
      currentStreak: info.currentStreak,
      longestStreak: info.longestStreak,
      isCompletedToday: info.isCompletedToday,
    };
  });

  res.status(200).json({
    success: true,
    data: {
      maxCurrentStreak: maxCurrent,
      maxLongestStreak: maxLongest,
      bestCurrentStreakHabit,
      bestLongestStreakHabit,
      habitStreaks,
    },
  });
});
