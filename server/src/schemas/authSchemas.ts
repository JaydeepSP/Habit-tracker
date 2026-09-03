import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').max(50, 'Name cannot exceed 50 characters'),
    email: z.string().trim().toLowerCase().email('Please provide a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters').max(100, 'Password is too long'),
    timezone: z.string().optional().default('UTC'),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().toLowerCase().email('Please provide a valid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().trim().toLowerCase().email('Please provide a valid email address'),
  }),
});

export const resetPasswordSchema = z.object({
  params: z.object({
    token: z.string().min(1, 'Reset token is required'),
  }),
  body: z.object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
  }),
});
