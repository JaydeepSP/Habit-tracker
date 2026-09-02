import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  Flame,
  Award,
  TrendingUp,
  CheckCircle2,
  Calendar,
  Layers,
} from 'lucide-react';
import { statsService } from '../../services/statsService';
import { useToast } from '../../context/ToastContext';
import { Card, Badge } from '../ui';
import { DynamicIcon } from '../../utils/constants';
import { Skeleton } from '../ui/Skeleton';

export const AnalyticsPage = () => {
  const { error } = useToast();
  const [loading, setLoading] = useState(true);
  const [weeklyData, setWeeklyData] = useState([]);
  const [habitPerformance, setHabitPerformance] = useState([]);
  const [categoryStats, setCategoryStats] = useState([]);
  const [streakStats, setStreakStats] = useState(null);
  const [dashboardSummary, setDashboardSummary] = useState(null);

  useEffect(() => {
    const fetchAllAnalytics = async () => {
      try {
        const [weeklyRes, habitsRes, catRes, streakRes, dashRes] =
          await Promise.all([
            statsService.getWeeklyStats(),
            statsService.getHabitStats(),
            statsService.getCategoryStats(),
            statsService.getStreakStats(),
            statsService.getDashboardStats(),
          ]);

        if (weeklyRes.success) setWeeklyData(weeklyRes.data.weeklyData || []);
        if (habitsRes.success) setHabitPerformance(habitsRes.data || []);
        if (catRes.success) setCategoryStats(catRes.data || []);
        if (streakRes.success) setStreakStats(streakRes.data || {});
        if (dashRes.success) setDashboardSummary(dashRes.data || {});
      } catch (err) {
        error(err.message || 'Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchAllAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 rounded-2xl" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </div>
    );
  }

  // Monochrome shade array for pie charts
  const monochromePieColors = [
    '#FFFFFF',
    '#D4D4D4',
    '#A3A3A3',
    '#737373',
    '#525252',
    '#404040',
    '#262626',
    '#171717',
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Performance Analytics
        </h2>
        <p className="text-sm text-slate-500 dark:text-neutral-400 mt-1">
          Deep insights into your completion consistency, streaks, and habits breakdown
        </p>
      </div>

      {/* Top 4 Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 flex items-center justify-between bg-white dark:bg-[#121212] border-slate-200/90 dark:border-neutral-800">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400 dark:text-neutral-500 tracking-wider">
              Total Habits
            </p>
            <h4 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {dashboardSummary?.totalHabitsCount || 0}
            </h4>
            <span className="text-[11px] text-slate-500 dark:text-neutral-400">Active tracked routines</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-100 dark:bg-neutral-900 text-slate-900 dark:text-white border border-slate-200 dark:border-neutral-800">
            <Layers className="w-6 h-6" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between bg-white dark:bg-[#121212] border-slate-200/90 dark:border-neutral-800">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400 dark:text-neutral-500 tracking-wider">
              Today's Rate
            </p>
            <h4 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {dashboardSummary?.today?.percentage || 0}%
            </h4>
            <span className="text-[11px] text-slate-700 dark:text-neutral-300 font-semibold">
              {dashboardSummary?.today?.completed} completed
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-100 dark:bg-neutral-900 text-slate-900 dark:text-white border border-slate-200 dark:border-neutral-800">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between bg-white dark:bg-[#121212] border-slate-200/90 dark:border-neutral-800">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400 dark:text-neutral-500 tracking-wider">
              Current Streak
            </p>
            <h4 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {streakStats?.maxCurrentStreak || 0} Days
            </h4>
            <span className="text-[11px] text-slate-500 dark:text-neutral-400 truncate max-w-32 block">
              {streakStats?.bestCurrentStreakHabit || 'None active'}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-100 dark:bg-neutral-900 text-slate-900 dark:text-white border border-slate-200 dark:border-neutral-800">
            <Flame className="w-6 h-6 fill-current" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between bg-white dark:bg-[#121212] border-slate-200/90 dark:border-neutral-800">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400 dark:text-neutral-500 tracking-wider">
              All-Time Best
            </p>
            <h4 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {streakStats?.maxLongestStreak || 0} Days
            </h4>
            <span className="text-[11px] text-slate-500 dark:text-neutral-400 truncate max-w-32 block">
              {streakStats?.bestLongestStreakHabit || 'None yet'}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-100 dark:bg-neutral-900 text-slate-900 dark:text-white border border-slate-200 dark:border-neutral-800">
            <Award className="w-6 h-6" />
          </div>
        </Card>
      </div>

      {/* Charts Section: Weekly Bar Chart + Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Completion Bar Chart (Solid White Bars in Dark Theme) */}
        <Card className="p-6 space-y-4 bg-white dark:bg-[#121212] border-slate-200/90 dark:border-neutral-800">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Past 7 Days Completion Rate
              </h3>
              <p className="text-xs text-slate-500 dark:text-neutral-400">
                Daily completion performance percentage
              </p>
            </div>
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-neutral-900 text-slate-900 dark:text-white border border-slate-200 dark:border-neutral-800">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} stroke="#525252" />
                <XAxis
                  dataKey="dayName"
                  stroke="#737373"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis
                  unit="%"
                  domain={[0, 100]}
                  stroke="#737373"
                  fontSize={12}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(value) => [`${value}%`, 'Completion Rate']}
                  contentStyle={{
                    backgroundColor: '#171717',
                    borderRadius: '12px',
                    border: '1px solid #404040',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar
                  dataKey="completionRate"
                  fill="#FFFFFF"
                  className="fill-slate-900 dark:fill-white"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Category Breakdown Donut / Pie Chart */}
        <Card className="p-6 space-y-4 bg-white dark:bg-[#121212] border-slate-200/90 dark:border-neutral-800">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Category Distribution
              </h3>
              <p className="text-xs text-slate-500 dark:text-neutral-400">
                Completed actions grouped by categories
              </p>
            </div>
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-neutral-900 text-slate-900 dark:text-white border border-slate-200 dark:border-neutral-800">
              <Layers className="w-4 h-4" />
            </div>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {categoryStats.length === 0 ? (
              <p className="text-xs text-slate-400">No category completion data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryStats}
                    dataKey="totalCompletions"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={45}
                    paddingAngle={3}
                  >
                    {categoryStats.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={monochromePieColors[index % monochromePieColors.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [`${value} completions`, name]}
                    contentStyle={{
                      backgroundColor: '#171717',
                      borderRadius: '12px',
                      border: '1px solid #404040',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => (
                      <span className="text-xs text-slate-700 dark:text-neutral-300 font-medium">
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

      {/* Habit Performance Leaderboard Table */}
      <Card className="p-6 space-y-4 bg-white dark:bg-[#121212] border-slate-200/90 dark:border-neutral-800">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            30-Day Habit Performance Leaderboard
          </h3>
          <p className="text-xs text-slate-500 dark:text-neutral-400">
            Ranked by overall consistency and completion rate over the last 30 days
          </p>
        </div>

        {habitPerformance.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">No habits recorded.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-neutral-800 text-slate-400 dark:text-neutral-500 text-xs font-semibold uppercase tracking-wider">
                  <th className="pb-3">Habit</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">30-Day Rate</th>
                  <th className="pb-3">Completed / Scheduled</th>
                  <th className="pb-3">Streak</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-neutral-800/80">
                {habitPerformance.map((h) => (
                  <tr key={h.habitId} className="hover:bg-slate-50 dark:hover:bg-neutral-900/60 transition-colors">
                    <td className="py-3.5 pr-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-slate-100 dark:bg-neutral-900 text-slate-800 dark:text-white border border-slate-200 dark:border-neutral-800">
                        <DynamicIcon name={h.icon} className="w-4 h-4" />
                      </div>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {h.name}
                      </span>
                    </td>
                    <td className="py-3.5 pr-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-neutral-900 text-slate-700 dark:text-neutral-300 border border-slate-200 dark:border-neutral-800">
                        {h.category}
                      </span>
                    </td>
                    <td className="py-3.5 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-slate-100 dark:bg-neutral-800 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-slate-900 dark:bg-white h-full rounded-full transition-all duration-500"
                            style={{ width: `${h.completionRate}%` }}
                          />
                        </div>
                        <span className="font-bold text-xs text-slate-700 dark:text-neutral-300">
                          {h.completionRate}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 pr-4 text-xs text-slate-500 dark:text-neutral-400">
                      {h.completedIn30Days} / {h.scheduledIn30Days} days
                    </td>
                    <td className="py-3.5">
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-neutral-900 text-slate-900 dark:text-white text-xs font-bold border border-slate-200 dark:border-neutral-800">
                        <Flame className="w-3.5 h-3.5 fill-current" />
                        {h.currentStreak} d
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
