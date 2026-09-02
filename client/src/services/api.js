import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true, // Crucial for sending & receiving HTTP-only cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor to format responses or handle 401s gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Return custom error message if available from server
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

export default api;
