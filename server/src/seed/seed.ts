import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import User from '../models/User.js';
import Habit from '../models/Habit.js';
import HabitCompletion from '../models/HabitCompletion.js';
import { recommendedHabits } from './seedData.js';
import { getDateOffset, getTodayString } from '../utils/dateHelpers.js';

const seedDatabase = async () => {
  try {
    // Append DB name so Atlas doesn't fall back to 'test'
    let mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/habit-tracker';
    if (!mongoUri.includes('/habit-tracker')) {
      mongoUri = mongoUri.replace('/?', '/habit-tracker?').replace(/\/$/, '/habit-tracker');
      if (!mongoUri.includes('/habit-tracker')) mongoUri += '/habit-tracker';
    }
    await mongoose.connect(mongoUri);
    console.log(`Connected to MongoDB for seeding: ${mongoUri}`);

    // Check if demo user already exists
    const demoEmail = 'demo@habittracker.com';
    let demoUser = await User.findOne({ email: demoEmail });

    if (demoUser) {
      console.log('Cleaning up existing demo user records...');
      const existingHabits = await Habit.find({ user: demoUser._id });
      const habitIds = existingHabits.map((h) => h._id);
      await HabitCompletion.deleteMany({ habit: { $in: habitIds } });
      await Habit.deleteMany({ user: demoUser._id });
      await User.deleteOne({ _id: demoUser._id });
      demoUser = null;
    }

    // Create demo user
    demoUser = await User.create({
      name: 'Jaydeep Prajapati',
      email: demoEmail,
      password: 'Password123!',
      timezone: 'UTC',
    });

    console.log(`Created Demo User: ${demoUser.name} (${demoUser.email})`);

    // Insert habits for demo user
    const habitDocs = recommendedHabits.map((h) => ({
      ...h,
      user: demoUser._id,
      startDate: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000), // Started 35 days ago
      isActive: true,
    }));

    const createdHabits = await Habit.insertMany(habitDocs);
    console.log(`Created ${createdHabits.length} habits for demo user`);

    // Create 30-day realistic completion history
    const todayStr = getTodayString();
    const completionsToInsert = [];

    // Probability of completion for each habit type to create varied, realistic streak graphs
    const completionWeights = [0.95, 0.85, 0.90, 0.75, 0.95, 0.70, 0.80, 0.88];

    for (let dayOffset = 30; dayOffset >= 0; dayOffset--) {
      const dateStr = getDateOffset(todayStr, -dayOffset);
      const dayOfWeek = new Date(dateStr + 'T00:00:00Z').getUTCDay();

      createdHabits.forEach((habit, idx) => {
        // Check if scheduled
        let isScheduled = true;
        if (habit.frequency === 'custom') {
          isScheduled = habit.customDays.includes(dayOfWeek);
        }

        if (isScheduled) {
          const weight = completionWeights[idx % completionWeights.length];
          // Determine if completed based on weight (higher chance on recent days for active streaks)
          const bonus = dayOffset < 10 ? 0.1 : 0;
          const isCompleted = Math.random() < Math.min(0.98, weight + bonus);

          if (isCompleted) {
            completionsToInsert.push({
              habit: habit._id,
              user: demoUser._id,
              date: dateStr,
              completed: true,
              progress: habit.target,
              completedAt: new Date(dateStr + 'T18:30:00Z'),
              note: dayOffset % 5 === 0 ? 'Felt great completing this milestone!' : '',
            });
          }
        }
      });
    }

    await HabitCompletion.insertMany(completionsToInsert);
    console.log(`Inserted ${completionsToInsert.length} completion records over past 30 days`);

    console.log('✅ Seeding completed successfully!');
    console.log('----------------------------------------------------');
    console.log('Login credentials:');
    console.log(`Email:    ${demoEmail}`);
    console.log(`Password: Password123!`);
    console.log('----------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();
