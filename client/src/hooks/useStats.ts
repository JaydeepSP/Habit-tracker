import { useQuery } from '@tanstack/react-query';
import { statsService } from '@/services/statsService';
import { queryKeys } from './queryKeys';

/**
 * Custom Hook for Dashboard Statistics
 */
export const useDashboardStats = () => {
  const query = useQuery({
    queryKey: queryKeys.stats.dashboard,
    queryFn: async () => {
      const res = await statsService.getDashboardStats();
      return res.data;
    },
  });

  return {
    dashboardData: query.data,
    today: query.data?.today || { completed: 0, total: 0, percentage: 0 },
    streaks: query.data?.streaks || { currentStreak: 0, longestStreak: 0 },
    habits: query.data?.habits || [],
    last7Days: query.data?.last7Days || [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};

/**
 * Custom Hook for Monthly Calendar History
 */
export const useCalendarStats = (year?: number, month?: number) => {
  const query = useQuery({
    queryKey: queryKeys.stats.calendar(year, month),
    queryFn: async () => {
      const res = await statsService.getMonthlyStats(year!, month!);
      return res.data;
    },
    enabled: !!year && !!month,
  });

  return {
    calendarData: query.data,
    calendar: query.data?.calendar || [],
    summary: query.data?.summary || null,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};

/**
 * Custom Hook for Comprehensive Performance Analytics
 */
export const useAnalyticsStats = () => {
  const query = useQuery({
    queryKey: queryKeys.stats.analytics,
    queryFn: async () => {
      const [weeklyRes, habitsRes, catRes, streakRes, dashRes] =
        await Promise.all([
          statsService.getWeeklyStats(),
          statsService.getHabitStats(),
          statsService.getCategoryStats(),
          statsService.getStreakStats(),
          statsService.getDashboardStats(),
        ]);

      return {
        weeklyData: weeklyRes.success ? weeklyRes.data.weeklyData || [] : [],
        habitPerformance: habitsRes.success ? habitsRes.data || [] : [],
        categoryStats: catRes.success ? catRes.data || [] : [],
        streakStats: streakRes.success ? streakRes.data || {} : {},
        dashboardSummary: dashRes.success ? dashRes.data || {} : {},
      };
    },
  });

  return {
    analyticsData: query.data,
    weeklyData: query.data?.weeklyData || [],
    habitPerformance: query.data?.habitPerformance || [],
    categoryStats: query.data?.categoryStats || [],
    streakStats: query.data?.streakStats || null,
    dashboardSummary: query.data?.dashboardSummary || null,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};
