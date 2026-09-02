import HabitCompletion from '../models/HabitCompletion.js';
import Habit from '../models/Habit.js';
import asyncHandler from '../utils/asyncHandler.js';

// @desc    Get all completions for user (optional filters by startDate, endDate, habitId)
// @route   GET /api/completions
// @access  Private
export const getCompletions = asyncHandler(async (req, res, next) => {
  const { startDate, endDate, habitId } = req.query;
  const query = { user: req.user.id };

  if (habitId) {
    query.habit = habitId;
  }

  if (startDate && endDate) {
    query.date = { $gte: startDate, $lte: endDate };
  } else if (startDate) {
    query.date = { $gte: startDate };
  } else if (endDate) {
    query.date = { $lte: endDate };
  }

  const completions = await HabitCompletion.find(query)
    .populate('habit', 'name icon color category frequency')
    .sort({ date: -1 })
    .lean();

  res.status(200).json({
    success: true,
    count: completions.length,
    data: completions,
  });
});

// @desc    Get completions for a specific date
// @route   GET /api/completions/date/:date
// @access  Private
export const getCompletionsByDate = asyncHandler(async (req, res, next) => {
  const { date } = req.params;

  const completions = await HabitCompletion.find({
    user: req.user.id,
    date,
  })
    .populate('habit', 'name icon color category frequency target unit isActive')
    .lean();

  res.status(200).json({
    success: true,
    count: completions.length,
    data: completions,
  });
});

// @desc    Create or update custom completion entry (with notes or progress)
// @route   POST /api/completions
// @access  Private
export const createCompletion = asyncHandler(async (req, res, next) => {
  const { habitId, date, completed, note, progress } = req.body;

  if (!habitId || !date) {
    return res.status(400).json({
      success: false,
      message: 'Please provide habitId and date (YYYY-MM-DD)',
    });
  }

  // Ensure habit belongs to user
  const habit = await Habit.findOne({ _id: habitId, user: req.user.id });
  if (!habit) {
    return res.status(404).json({
      success: false,
      message: 'Habit not found',
    });
  }

  let completion = await HabitCompletion.findOne({
    habit: habitId,
    date,
  });

  if (completion) {
    completion.completed = completed !== undefined ? completed : true;
    if (note !== undefined) completion.note = note;
    if (progress !== undefined) completion.progress = progress;
    if (completion.completed) completion.completedAt = new Date();
    await completion.save();
  } else {
    completion = await HabitCompletion.create({
      habit: habitId,
      user: req.user.id,
      date,
      completed: completed !== undefined ? completed : true,
      note: note || '',
      progress: progress || 1,
      completedAt: new Date(),
    });
  }

  res.status(200).json({
    success: true,
    data: completion,
  });
});

// @desc    Update completion entry note/progress
// @route   PATCH /api/completions/:id
// @access  Private
export const updateCompletion = asyncHandler(async (req, res, next) => {
  const completion = await HabitCompletion.findOne({
    _id: req.params.id,
    user: req.user.id,
  });

  if (!completion) {
    return res.status(404).json({
      success: false,
      message: 'Completion record not found',
    });
  }

  const { completed, note, progress } = req.body;
  if (completed !== undefined) completion.completed = completed;
  if (note !== undefined) completion.note = note;
  if (progress !== undefined) completion.progress = progress;

  await completion.save();

  res.status(200).json({
    success: true,
    data: completion,
  });
});

// @desc    Delete completion
// @route   DELETE /api/completions/:id
// @access  Private
export const deleteCompletion = asyncHandler(async (req, res, next) => {
  const completion = await HabitCompletion.findOne({
    _id: req.params.id,
    user: req.user.id,
  });

  if (!completion) {
    return res.status(404).json({
      success: false,
      message: 'Completion record not found',
    });
  }

  await HabitCompletion.deleteOne({ _id: completion._id });

  res.status(200).json({
    success: true,
    message: 'Completion record removed',
    data: {},
  });
});
