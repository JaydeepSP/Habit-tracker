/**
 * Centralized Query Keys Factory
 * Ensures consistent cache key hierarchy and type safety across all hooks
 */
export const queryKeys = {
  habits: {
    all: ['habits'],
    list: (filters) => ['habits', { filters }],
    detail: (id) => ['habits', id],
  },
  stats: {
    all: ['stats'],
    dashboard: ['stats', 'dashboard'],
    analytics: ['stats', 'analytics'],
    calendar: (year, month) => ['stats', 'calendar', year, month],
    streaks: ['stats', 'streaks'],
    weekly: ['stats', 'weekly'],
    categories: ['stats', 'categories'],
  },
  completions: {
    all: ['completions'],
    byDate: (date) => ['completions', date],
  },
  user: {
    profile: ['user', 'profile'],
  },
};
