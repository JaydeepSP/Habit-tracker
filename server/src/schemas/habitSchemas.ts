import { z } from 'zod';

const categoryEnum = z.enum(['Health', 'Fitness', 'Productivity', 'Learning', 'Mindfulness', 'Personal', 'Work']);
const frequencyEnum = z.enum(['daily', 'weekly', 'custom']);

export const createHabitSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, 'Habit name is required').max(100, 'Name cannot exceed 100 characters'),
    description: z.string().trim().max(300, 'Description cannot exceed 300 characters').optional().default(''),
    category: categoryEnum.optional().default('Personal'),
    frequency: frequencyEnum.optional().default('daily'),
    customDays: z.array(z.number().int().min(0).max(6)).optional().default([]),
    target: z.number().int().min(1).optional().default(1),
    unit: z.string().trim().max(30).optional().default('times'),
    color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid color hex code').optional().default('#6366F1'),
    icon: z.string().trim().optional().default('Activity'),
    startDate: z.string().optional(),
    endDate: z.string().nullable().optional(),
  }),
});

export const updateHabitSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Habit ID is required'),
  }),
  body: z.object({
    name: z.string().trim().min(1).max(100).optional(),
    description: z.string().trim().max(300).optional(),
    category: categoryEnum.optional(),
    frequency: frequencyEnum.optional(),
    customDays: z.array(z.number().int().min(0).max(6)).optional(),
    target: z.number().int().min(1).optional(),
    unit: z.string().trim().max(30).optional(),
    color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).optional(),
    icon: z.string().trim().optional(),
    isActive: z.boolean().optional(),
  }),
});
