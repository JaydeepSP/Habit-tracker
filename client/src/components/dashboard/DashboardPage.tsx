import React, { useState } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import {
  Flame,
  Plus,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useDashboardStats, useAnalyticsStats } from '@/hooks';
import { Button, Card } from '@/components/ui';
import { RecommendedHabitsModal } from '@/components/dashboard/RecommendedHabitsModal';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import { CATEGORY_COLORS, DynamicIcon } from '@/utils/constants';
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
} from 'recharts';

const getBarColor = (rate: number) => {
  if (rate >= 100) return '#15803D';
  if (rate >= 80) return '#22C55E';
  if (rate >= 40) return '#7C3AED';
  if (rate > 0) return '#A78BFA';
  return '#525252';
};

const CustomBarTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const rate = payload[0].value;
    const color = getBarColor(rate);
    return (
      <div className="p-2 rounded-xl shadow-xl border bg-white dark:bg-neutral-900 border-slate-200 dark:border-neutral-800 text-slate-900 dark:text-white text-xs space-y-0.5">
        <p className="font-semibold text-slate-500 dark:text-neutral-400">{label}</p>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
          <span className="font-bold">{rate}% Completed</span>
        </div>
      </div>
    );
  }
  return null;
};

export const DashboardPage = () => {
  const { user } = useAuth();
  const { openCreateModal } = (useOutletContext<{ openCreateModal?: () => void }>() || {});

  const [isRecommendedModalOpen, setIsRecommendedModalOpen] = useState(false);

  // Custom API hooks
  const { today, last7Days, streaks, isLoading } = useDashboardStats();
  const {
    weeklyData,
    habitPerformance,
    categoryStats,
    dashboardSummary,
  } = useAnalyticsStats();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  // Formatted date string for greeting
  const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric' };
  const formattedToday = new Date().toLocaleDateString('en-US', dateOptions);

  return (
    <div className="space-y-8">
      {/* Dynamic Header & Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Good day, {user?.name?.split(' ')[0] || 'there'} 👋
          </h2>
          <p className="text-sm font-medium text-slate-500 dark:text-neutral-400 mt-1">
            {formattedToday} • <span className="text-slate-900 dark:text-white font-semibold">Stay consistent. Small steps every day.</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={() => setIsRecommendedModalOpen(true)}
            className="text-xs dark:bg-neutral-900 dark:border-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            Recommended Habits
          </Button>
          <Button onClick={openCreateModal} className="text-xs dark:bg-white dark:text-black dark:hover:bg-neutral-200">
            <Plus className="w-4 h-4" />
            New Habit
          </Button>
        </div>
      </div>

      {/* Progress & Stat Cards Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Circular Progress Banner */}
        <Card className="lg:col-span-2 relative overflow-hidden bg-white dark:bg-[#121212] border-slate-200/90 dark:border-neutral-800 shadow-md dark:shadow-xl">
          <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
            {/* Circular Progress Gauge */}
            <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="stroke-slate-100 dark:stroke-neutral-800"
                  strokeWidth="10"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="stroke-slate-900 dark:stroke-white transition-all duration-1000 ease-out"
                  strokeWidth="10"
                  strokeDasharray={2 * Math.PI * 40}
                  strokeDashoffset={
                    2 * Math.PI * 40 * (1 - (today.total > 0 ? today.percentage / 100 : 0))
                  }
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {today.percentage}%
                </span>
                <span className="text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-widest">
                  Done
                </span>
              </div>
            </div>

            {/* Description & Mini Week Overview */}
            <div className="flex-1 text-center sm:text-left space-y-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Today's Progress
                </h3>
                <p className="text-sm font-medium text-slate-500 dark:text-neutral-400">
                  {today.completed} of {today.total} habits completed for today
                </p>
              </div>

              {/* Mini 7-day strip */}
              <div className="pt-2 border-t border-slate-100 dark:border-neutral-800">
                <div className="flex items-center justify-between gap-1 max-w-sm mx-auto sm:mx-0">
                  {last7Days.map((d) => (
                    <div key={d.date} className="flex flex-col items-center gap-1">
                      <span className="text-[10px] font-semibold text-slate-400 dark:text-neutral-500">
                        {d.day}
                      </span>
                      <div
                        className={`size-10 rounded-md flex items-center justify-center text-[10px] font-bold ${
                          d.rate === 100
                            ? 'bg-slate-900 text-white dark:bg-white dark:text-black shadow-sm'
                            : d.rate > 0
                            ? 'bg-slate-200 dark:bg-neutral-800 text-slate-900 dark:text-white border border-slate-300 dark:border-neutral-700'
                            : 'bg-slate-100 dark:bg-neutral-900 text-slate-400 dark:text-neutral-600'
                        }`}
                        title={`${d.date}: ${d.completed}/${d.total} completed`}
                      >
                        {d.rate === 100 ? '✓' : `${d.rate}%`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Streak & Milestone Card */}
        <Card className="flex flex-col justify-between p-6 bg-white dark:bg-[#121212] border-slate-200/90 dark:border-neutral-800 shadow-md dark:shadow-xl">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-neutral-400">
                Active Streak
              </span>
              <div className="p-2 rounded-xl bg-slate-100 dark:bg-neutral-900 text-slate-900 dark:text-white border border-slate-200 dark:border-neutral-800">
                <Flame className="w-5 h-5 fill-current" />
              </div>
            </div>
            <div className="mt-3">
              <h4 className="text-3xl font-black text-slate-900 dark:text-white">
                {streaks.currentStreak}{' '}
                <span className="text-base font-semibold text-slate-500 dark:text-neutral-400">
                  {streaks.currentStreak === 1 ? 'day' : 'days'}
                </span>
              </h4>
              <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1">
                Your personal best is{' '}
                <span className="font-bold text-slate-800 dark:text-white">
                  {streaks.longestStreak} days
                </span>
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-neutral-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-neutral-400">Detailed Analytics</span>
            <Link
              to="/analytics"
              className="inline-flex items-center gap-1 font-semibold text-slate-900 dark:text-white hover:underline"
            >
              View Stats <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </Card>
      </div>

      {/* Brief Analytics Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Performance Insights
            </h3>
            <p className="text-xs text-slate-500 dark:text-neutral-400">
              Brief summary of your completion consistency and routine breakdown
            </p>
          </div>
          <Link
            to="/analytics"
            className="text-xs font-bold text-slate-900 dark:text-white hover:underline flex items-center gap-1"
          >
            Full Analytics <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Weekly Bar Chart (Brief) */}
          <Card className="lg:col-span-2 p-5 bg-white dark:bg-[#121212] border-slate-200/90 dark:border-neutral-800 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400">
                Weekly Completion Rates
              </span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                Last 7 Days
              </span>
            </div>
            <div className="h-44 w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} stroke="#525252" />
                  <XAxis dataKey="dayName" stroke="#737373" fontSize={11} tickLine={false} />
                  <YAxis unit="%" domain={[0, 100]} stroke="#737373" fontSize={11} tickLine={false} />
                  <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(150, 150, 150, 0.1)' }} />
                  <Bar dataKey="completionRate" radius={[4, 4, 0, 0]}>
                    {weeklyData.map((entry, index) => (
                      <Cell key={`bar-${index}`} fill={getBarColor(entry.completionRate)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Category Distribution / Donut (Brief) */}
          <Card className="p-5 bg-white dark:bg-[#121212] border-slate-200/90 dark:border-neutral-800 shadow-md space-y-3 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400">
                Categories
              </span>
              <span className="text-xs font-semibold text-indigo-500">
                {categoryStats.length} active
              </span>
            </div>

            <div className="h-36 w-full flex items-center justify-center">
              {categoryStats.length === 0 ? (
                <p className="text-xs text-slate-400">No category data yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryStats}
                      dataKey="totalCompletions"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={55}
                      innerRadius={32}
                      paddingAngle={3}
                    >
                      {categoryStats.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CATEGORY_COLORS[entry.category] || '#64748B'}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Category legends mini */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2 border-t border-slate-100 dark:border-neutral-800/80">
              {categoryStats.slice(0, 3).map((c) => (
                <div key={c.category} className="flex items-center gap-1 text-[10px] font-medium text-slate-600 dark:text-neutral-400">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: CATEGORY_COLORS[c.category] || '#64748B' }}
                  />
                  <span>{c.category}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Recommended Habits Modal */}
      <RecommendedHabitsModal
        isOpen={isRecommendedModalOpen}
        onClose={() => setIsRecommendedModalOpen(false)}
        onAdded={() => setIsRecommendedModalOpen(false)}
      />
    </div>
  );
};
