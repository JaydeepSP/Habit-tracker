import api from './api';

export const habitService = {
  getHabits: async (params = {}) => {
    const res = await api.get('/habits', { params });
    return res.data;
  },

  getHabitById: async (id) => {
    const res = await api.get(`/habits/${id}`);
    return res.data;
  },

  createHabit: async (habitData) => {
    const res = await api.post('/habits', habitData);
    return res.data;
  },

  updateHabit: async (id, habitData) => {
    const res = await api.put(`/habits/${id}`, habitData);
    return res.data;
  },

  deleteHabit: async (id) => {
    const res = await api.delete(`/habits/${id}`);
    return res.data;
  },

  toggleActive: async (id) => {
    const res = await api.patch(`/habits/${id}/toggle-active`);
    return res.data;
  },

  toggleCompletion: async (id, date) => {
    const res = await api.post(`/habits/${id}/toggle`, { date });
    return res.data;
  },

  createBatchHabits: async (habits) => {
    const res = await api.post('/habits/batch', { habits });
    return res.data;
  },
};
