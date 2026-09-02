import mongoose from 'mongoose';

const habitCompletionSchema = new mongoose.Schema(
  {
    habit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Habit',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    // Standardized date string formatted as YYYY-MM-DD
    date: {
      type: String,
      required: [true, 'Date string is required in YYYY-MM-DD format'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Please provide date in YYYY-MM-DD format'],
      index: true,
    },
    completed: {
      type: Boolean,
      default: true,
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
    progress: {
      type: Number,
      default: 1,
    },
    note: {
      type: String,
      trim: true,
      maxlength: [300, 'Note cannot exceed 300 characters'],
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Unique compound index so the same habit cannot have multiple completion records for the same date
habitCompletionSchema.index({ habit: 1, date: 1 }, { unique: true });
// Index for fast query by user and date
habitCompletionSchema.index({ user: 1, date: 1 });

const HabitCompletion = mongoose.model('HabitCompletion', habitCompletionSchema);
export default HabitCompletion;
