import { Request } from 'express';
import { Document, Types } from 'mongoose';

// ─── User Model Interface ─────────────────────────────────────────────────────

export interface IUserMethods {
  matchPassword(enteredPassword: string): Promise<boolean>;
  getResetPasswordToken(): string;
}

export interface IUserDoc
  extends Document<Types.ObjectId>,
    IUserMethods {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  avatar: string;
  timezone: string;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Habit Model Interface ─────────────────────────────────────────────────────

export interface IHabitDoc extends Document<Types.ObjectId> {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  name: string;
  description?: string;
  category: string;
  icon: string;
  color: string;
  frequency: string;
  customDays: number[];
  target: number;
  unit: string;
  isActive: boolean;
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  startDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Completion Model Interface ────────────────────────────────────────────────

export interface ICompletionDoc extends Document<Types.ObjectId> {
  _id: Types.ObjectId;
  habit: Types.ObjectId;
  user: Types.ObjectId;
  date: string;
  completed: boolean;
  progress: number;
  completedAt?: Date;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Augmented Express Request ─────────────────────────────────────────────────

export interface AuthRequest extends Request {
  user: IUserDoc;
}

// ─── Query filter helpers ──────────────────────────────────────────────────────

export interface HabitQueryFilter {
  user: Types.ObjectId | string;
  category?: string;
  isActive?: boolean;
  name?: { $regex: string; $options: string };
}

export interface CompletionQueryFilter {
  user: Types.ObjectId | string;
  habit?: string | Types.ObjectId;
  date?: { $gte?: string; $lte?: string } | string;
}
