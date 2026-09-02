import api from './api';

export const completionService = {
  getCompletions: async (params = {}) => {
    const res = await api.get('/completions', { params });
    return res.data;
  },

  getCompletionsByDate: async (date) => {
    const res = await api.get(`/completions/date/${date}`);
    return res.data;
  },

  createCompletion: async (data) => {
    const res = await api.post('/completions', data);
    return res.data;
  },

  updateCompletion: async (id, data) => {
    const res = await api.patch(`/completions/${id}`, data);
    return res.data;
  },

  deleteCompletion: async (id) => {
    const res = await api.delete(`/completions/${id}`);
    return res.data;
  },
};
