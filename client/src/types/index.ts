export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
  theme?: string;
  timezone?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type HabitCategory =
  | 'All'
  | 'Health'
  | 'Fitness'
  | 'Learning'
  | 'Work'
  | 'Mindfulness'
  | 'Finance'
  | 'Personal';

export type HabitFrequency = 'daily' | 'weekly' | 'custom';

export interface Habit {
  _id: string;
  userId: string;
  name: string;
  description?: string;
  category: HabitCategory;
  icon: string;
  color: string;
  frequency: HabitFrequency;
  customDays?: number[];
  target: number;
  unit: string;
  isActive: boolean;
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  isCompletedToday?: boolean;
  isScheduledToday?: boolean;
  completedDates?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface DayCompletion {
  date: string; // YYYY-MM-DD
  isCompleted: boolean;
  isFuture: boolean;
  dayOfWeek: number; // 0-6
  isToday: boolean;
}

export interface HabitCompletion {
  _id: string;
  habitId: string;
  userId: string;
  date: string;
  completed: boolean;
  notes?: string;
  createdAt?: string;
}

export interface NoteChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

export type NoteColor =
  | 'default'
  | 'red'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'blue'
  | 'purple'
  | 'pink';

export type NoteType = 'text' | 'checklist';

export interface Note {
  _id: string;
  userId?: string;
  title: string;
  content: string;
  type: NoteType;
  checklist: NoteChecklistItem[];
  color: NoteColor;
  tags: string[];
  habit?: Habit | string | null;
  targetDate?: string | null;
  isPinned: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DayPerformance {
  date: string;
  day: string;
  completed: number;
  total: number;
  rate: number;
}

export interface DashboardStats {
  today: {
    completed: number;
    total: number;
    percentage: number;
  };
  streaks: {
    currentStreak: number;
    longestStreak: number;
  };
  habits: Habit[];
  last7Days: DayPerformance[];
}

export interface CalendarDayStat {
  date: string;
  dayOfMonth: number;
  dayOfWeek: number;
  totalHabits: number;
  completedHabits: number;
  rate: number;
  isFuture: boolean;
  isToday: boolean;
  isCurrentMonth: boolean;
}

export interface CalendarMonthData {
  calendar: CalendarDayStat[];
  summary: {
    totalCompletions: number;
    perfectDays: number;
    averageRate: number;
  };
}

export interface CategoryStat {
  name: string;
  count: number;
  completed: number;
  rate: number;
  color: string;
}

export interface HabitPerformanceStat {
  _id: string;
  name: string;
  category: string;
  color: string;
  icon: string;
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  completionRate: number;
}

export interface AnalyticsStats {
  weeklyData: DayPerformance[];
  habitPerformance: HabitPerformanceStat[];
  categoryStats: CategoryStat[];
  streakStats: {
    currentStreak: number;
    longestStreak: number;
    activeHabitsCount: number;
  };
  dashboardSummary: {
    totalHabits: number;
    activeHabits: number;
    totalCompletions: number;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
  count?: number;
}
