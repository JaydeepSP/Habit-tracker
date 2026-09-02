import Habit from '../models/Habit.js';
import HabitCompletion from '../models/HabitCompletion.js';
import asyncHandler from '../utils/asyncHandler.js';
import { getTodayString } from '../utils/dateHelpers.js';
import { calculateHabitStreak } from '../services/streakService.js';

// @desc    Get all habits for logged in user
// @route   GET /api/habits
// @access  Private
export const getHabits = asyncHandler(async (req, res, next) => {
  const { category, isActive, search } = req.query;
  const query = { user: req.user.id };

  if (category && category !== 'All') {
    query.category = category;
  }

  if (isActive !== undefined) {
    query.isActive = isActive === 'true';
  }

  if (search) {
    query.name = { $regex: search, $options: 'i' };
  }

  const habits = await Habit.find(query).sort({ createdAt: -1 }).lean();
  const habitIds = habits.map((h) => h._id);

  const todayStr = getTodayString(req.user.timezone);

  // Fetch completions for streak calculation
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

  const enrichedHabits = habits.map((h) => {
    const hCompletions = completionsByHabit[h._id.toString()] || [];
    const streakInfo = calculateHabitStreak(h, hCompletions, todayStr);
    const completedDates = hCompletions.map((c) => c.date);

    return {
      ...h,
      currentStreak: streakInfo.currentStreak,
      longestStreak: streakInfo.longestStreak,
      isCompletedToday: streakInfo.isCompletedToday,
      completedDates,
    };
  });

  res.status(200).json({
    success: true,
    count: enrichedHabits.length,
    data: enrichedHabits,
  });
});

// @desc    Get single habit by ID
// @route   GET /api/habits/:id
// @access  Private
export const getHabitById = asyncHandler(async (req, res, next) => {
  const habit = await Habit.findOne({
    _id: req.params.id,
    user: req.user.id, // Strictly isolate by user
  }).lean();

  if (!habit) {
    return res.status(404).json({
      success: false,
      message: 'Habit not found',
    });
  }

  const todayStr = getTodayString(req.user.timezone);
  const completions = await HabitCompletion.find({
    habit: habit._id,
    user: req.user.id,
    completed: true,
  }).lean();

  const streakInfo = calculateHabitStreak(habit, completions, todayStr);

  res.status(200).json({
    success: true,
    data: {
      ...habit,
      currentStreak: streakInfo.currentStreak,
      longestStreak: streakInfo.longestStreak,
      isCompletedToday: streakInfo.isCompletedToday,
    },
  });
});

// @desc    Create new habit
// @route   POST /api/habits
// @access  Private
export const createHabit = asyncHandler(async (req, res, next) => {
  const {
    name,
    description,
    icon,
    color,
    category,
    frequency,
    customDays,
    target,
    unit,
    startDate,
    endDate,
    reminderTime,
  } = req.body;

  if (!name) {
    return res.status(400).json({
      success: false,
      message: 'Habit name is required',
    });
  }

  const habit = await Habit.create({
    user: req.user.id, // Always take user from authenticated middleware
    name,
    description: description || '',
    icon: icon || 'Activity',
    color: color || '#6366F1',
    category: category || 'Personal',
    frequency: frequency || 'daily',
    customDays: customDays || [1, 2, 3, 4, 5],
    target: target || 1,
    unit: unit || 'times',
    startDate: startDate || Date.now(),
    endDate: endDate || null,
    reminderTime: reminderTime || '',
    isActive: true,
  });

  res.status(201).json({
    success: true,
    data: habit,
  });
});

// @desc    Update habit
// @route   PUT /api/habits/:id
// @access  Private
export const updateHabit = asyncHandler(async (req, res, next) => {
  let habit = await Habit.findOne({
    _id: req.params.id,
    user: req.user.id, // Guard: only user's habit
  });

  if (!habit) {
    return res.status(404).json({
      success: false,
      message: 'Habit not found',
    });
  }

  const fieldsToUpdate = [
    'name',
    'description',
    'icon',
    'color',
    'category',
    'frequency',
    'customDays',
    'target',
    'unit',
    'startDate',
    'endDate',
    'reminderTime',
    'isActive',
  ];

  fieldsToUpdate.forEach((field) => {
    if (req.body[field] !== undefined) {
      habit[field] = req.body[field];
    }
  });

  await habit.save();

  res.status(200).json({
    success: true,
    data: habit,
  });
});

// @desc    Delete habit and its completions
// @route   DELETE /api/habits/:id
// @access  Private
export const deleteHabit = asyncHandler(async (req, res, next) => {
  const habit = await Habit.findOne({
    _id: req.params.id,
    user: req.user.id,
  });

  if (!habit) {
    return res.status(404).json({
      success: false,
      message: 'Habit not found',
    });
  }

  // Delete habit
  await Habit.deleteOne({ _id: habit._id });
  // Delete associated completion history
  await HabitCompletion.deleteMany({ habit: habit._id });

  res.status(200).json({
    success: true,
    message: 'Habit and related history removed successfully',
    data: {},
  });
});

// @desc    Toggle habit active status (pause / resume)
// @route   PATCH /api/habits/:id/toggle-active
// @access  Private
export const toggleHabitActive = asyncHandler(async (req, res, next) => {
  const habit = await Habit.findOne({
    _id: req.params.id,
    user: req.user.id,
  });

  if (!habit) {
    return res.status(404).json({
      success: false,
      message: 'Habit not found',
    });
  }

  habit.isActive = !habit.isActive;
  await habit.save();

  res.status(200).json({
    success: true,
    data: habit,
  });
});

// @desc    Toggle habit completion for today (or specified date)
// @route   POST /api/habits/:id/toggle
// @access  Private
export const toggleHabitCompletion = asyncHandler(async (req, res, next) => {
  const habit = await Habit.findOne({
    _id: req.params.id,
    user: req.user.id,
  });

  if (!habit) {
    return res.status(404).json({
      success: false,
      message: 'Habit not found',
    });
  }

  const dateStr = req.body.date || getTodayString(req.user.timezone);

  // Check if completion exists
  const existingCompletion = await HabitCompletion.findOne({
    habit: habit._id,
    date: dateStr,
  });

  let completedStatus = false;

  if (existingCompletion) {
    if (existingCompletion.completed) {
      // Toggle to false / remove completion
      existingCompletion.completed = false;
      await existingCompletion.save();
      completedStatus = false;
    } else {
      existingCompletion.completed = true;
      existingCompletion.completedAt = new Date();
      await existingCompletion.save();
      completedStatus = true;
    }
  } else {
    // Create new completion record
    await HabitCompletion.create({
      habit: habit._id,
      user: req.user.id,
      date: dateStr,
      completed: true,
      completedAt: new Date(),
    });
    completedStatus = true;
  }

  // Recalculate streak after toggle
  const allCompletions = await HabitCompletion.find({
    habit: habit._id,
    completed: true,
  }).lean();

  const streakInfo = calculateHabitStreak(
    habit,
    allCompletions,
    getTodayString(req.user.timezone)
  );

  res.status(200).json({
    success: true,
    data: {
      habitId: habit._id,
      date: dateStr,
      completed: completedStatus,
      currentStreak: streakInfo.currentStreak,
      longestStreak: streakInfo.longestStreak,
      isCompletedToday: streakInfo.isCompletedToday,
    },
  });
});

// @desc    Create bulk recommended habits
// @route   POST /api/habits/batch
// @access  Private
export const createRecommendedHabits = asyncHandler(async (req, res, next) => {
  const { habits } = req.body;

  if (!Array.isArray(habits) || habits.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Please provide an array of habits to add',
    });
  }

  const habitsToInsert = habits.map((h) => ({
    user: req.user.id,
    name: h.name,
    description: h.description || '',
    icon: h.icon || 'Activity',
    color: h.color || '#6366F1',
    category: h.category || 'Personal',
    frequency: h.frequency || 'daily',
    customDays: h.customDays || [1, 2, 3, 4, 5],
    target: h.target || 1,
    unit: h.unit || 'times',
    startDate: Date.now(),
    isActive: true,
  }));

  const created = await Habit.insertMany(habitsToInsert);

  res.status(201).json({
    success: true,
    count: created.length,
    data: created,
  });
});
