import api from './api';

export const statsService = {
  getDashboardStats: async () => {
    const res = await api.get('/stats/dashboard');
    return res.data;
  },

  getWeeklyStats: async () => {
    const res = await api.get('/stats/weekly');
    return res.data;
  },

  getMonthlyStats: async (year, month) => {
    const res = await api.get('/stats/monthly', { params: { year, month } });
    return res.data;
  },

  getHabitStats: async () => {
    const res = await api.get('/stats/habits');
    return res.data;
  },

  getCategoryStats: async () => {
    const res = await api.get('/stats/categories');
    return res.data;
  },

  getStreakStats: async () => {
    const res = await api.get('/stats/streaks');
    return res.data;
  },
};
