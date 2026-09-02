import mongoose from 'mongoose';

const habitSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide a habit name'],
      trim: true,
      maxlength: [100, 'Habit name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    icon: {
      type: String,
      default: 'Activity', // Lucide icon name
    },
    color: {
      type: String,
      default: '#6366F1', // Indigo accent
    },
    category: {
      type: String,
      required: [true, 'Please specify a category'],
      enum: [
        'Health',
        'Fitness',
        'Learning',
        'Work',
        'Personal',
        'Finance',
        'Social',
        'Other',
      ],
      default: 'Personal',
    },
    frequency: {
      type: String,
      required: [true, 'Please specify a frequency'],
      enum: ['daily', 'weekly', 'custom'],
      default: 'daily',
    },
    // For custom frequency: 0 (Sun), 1 (Mon), 2 (Tue), 3 (Wed), 4 (Thu), 5 (Fri), 6 (Sat)
    customDays: {
      type: [Number],
      default: [1, 2, 3, 4, 5], // Mon-Fri default for custom
      validate: {
        validator: function (v) {
          if (this.frequency === 'custom') {
            return Array.isArray(v) && v.length > 0 && v.every(d => d >= 0 && d <= 6);
          }
          return true;
        },
        message: 'Custom frequency requires at least one selected day of the week (0-6)',
      },
    },
    target: {
      type: Number,
      default: 1,
      min: [1, 'Target must be at least 1'],
    },
    unit: {
      type: String,
      trim: true,
      default: 'times',
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      default: null,
    },
    reminderTime: {
      type: String,
      default: '', // e.g. "08:00"
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for user habits
habitSchema.index({ user: 1, isActive: 1 });

const Habit = mongoose.model('Habit', habitSchema);
export default Habit;
