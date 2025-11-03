import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  register: async (data) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },
  login: async (data) => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },
};

// User Profile API
export const userAPI = {
  getProfile: async () => {
    const response = await api.get('/user/profile');
    return response.data;
  },
  updateProfile: async (data) => {
    const response = await api.put('/user/profile', data);
    return response.data;
  },
  updatePassword: async (data) => {
    const response = await api.put('/user/password', data);
    return response.data;
  },
};

// Reports API
export const reportsAPI = {
  create: async (formData) => {
    const response = await api.post('/reports/create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  getUserReports: async (userId) => {
    const response = await api.get(`/reports/user/${userId}`);
    return response.data;
  },
  getAllReports: async () => {
    const response = await api.get('/reports/all');
    return response.data;
  },
  updateReport: async (reportId, data) => {
    const response = await api.put(`/reports/update/${reportId}`, data);
    return response.data;
  },
  getStats: async () => {
    const response = await api.get('/reports/stats');
    return response.data;
  },
};

export default api;