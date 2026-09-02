import api from './api';

export const userService = {
  updateProfile: async (profileData) => {
    const res = await api.put('/users/profile', profileData);
    return res.data;
  },

  changePassword: async (passwords) => {
    const res = await api.put('/users/password', passwords);
    return res.data;
  },
};
