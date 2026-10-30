import axios from 'axios';

// Dynamic API Base URL configured for production (Vercel/Render) and local dev
const rawApiUrl = import.meta.env.VITE_API_URL || '/api';
const API_BASE = rawApiUrl.endsWith('/') ? rawApiUrl.slice(0, -1) : rawApiUrl;

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Attach token if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('agenticsync_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response Interceptor: Handle auth expirations
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if expired or invalid
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        localStorage.removeItem('agenticsync_token');
        localStorage.removeItem('agenticsync_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth Services
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me')
};

// Code Verification Services
export const codeAPI = {
  uploadCode: (codeData) => api.post('/code/upload', codeData),
  getMyUploads: () => api.get('/code/my-uploads'),
  getCodeById: (id) => api.get(`/code/${id}`),
  reverifyCode: (id) => api.post(`/code/${id}/reverify`)
};

// Admin Services
export const adminAPI = {
  getMetrics: () => api.get('/admin/metrics'),
  getUsers: () => api.get('/admin/users'),
  createUser: (userData) => api.post('/admin/users', userData),
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
  getAllUploads: () => api.get('/admin/code-uploads'),
  getActivityLogs: () => api.get('/admin/activity-logs')
};

export default api;
