import axios from 'axios';

// Normalize API Base URL (handles relative path, full URL, trailing slashes)
const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl || envUrl.trim() === '') {
    return '/api';
  }
  const cleanUrl = envUrl.trim().replace(/\/+$/, '');
  return cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000
});

// Request Interceptor: Inject JWT token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('agenticsync_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Intercept 401 Unauthorized and clear expired sessions
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register') {
        localStorage.removeItem('agenticsync_token');
        localStorage.removeItem('agenticsync_user');
        window.location.href = `/login?expired=true&redirect=${encodeURIComponent(currentPath)}`;
      }
    }
    return Promise.reject(error);
  }
);

// Authentication API Services
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me')
};

// Code Verification API Services
export const codeAPI = {
  uploadCode: (codeData) => api.post('/code/upload', codeData),
  getMyUploads: () => api.get('/code/my-uploads'),
  getCodeById: (id) => api.get(`/code/${id}`),
  reverifyCode: (id) => api.post(`/code/${id}/reverify`)
};

// Helper to extract clear, accurate error messages from any API response or network error
export const getApiErrorMessage = (error, defaultFallback = 'An unexpected error occurred') => {
  if (!error) return defaultFallback;

  // 1. Backend returned an HTTP response with error details
  if (error.response) {
    const data = error.response.data;

    // Handle Zod validation errors array
    if (data?.errors && Array.isArray(data.errors) && data.errors.length > 0) {
      return data.errors.map(e => e.message || e.field).join('. ');
    }

    // Handle specific backend error message
    if (data?.message) {
      if (data.error && data.error !== data.message) {
        return `${data.message} (${data.error})`;
      }
      return data.message;
    }

    if (error.response.status === 409) {
      return 'A user with this email address already exists. Please sign in or use a different email.';
    }

    if (error.response.status === 401) {
      return 'Invalid email or password. Please check your credentials.';
    }

    if (error.response.status === 403) {
      return 'Access forbidden: You do not have permission for this action.';
    }

    if (error.response.status === 404) {
      return 'The requested API endpoint was not found on the server.';
    }

    return `Server responded with error (HTTP ${error.response.status})`;
  }

  // 2. Network error / Backend unreachable / CORS blocked
  if (error.code === 'ERR_NETWORK' || error.message === 'Network Error' || !error.response) {
    const targetUrl = api.defaults.baseURL || '/api';
    return `Cannot connect to backend server (${targetUrl}). If deploying on Render, the free tier may take ~45 seconds to spin up. Please ensure your backend service is running.`;
  }

  return error.message || defaultFallback;
};

// Admin Dashboard & Management API Services
export const adminAPI = {
  getMetrics: () => api.get('/admin/metrics'),
  getUsers: () => api.get('/admin/users'),
  createUser: (userData) => api.post('/admin/users', userData),
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
  getAllUploads: () => api.get('/admin/code-uploads'),
  getActivityLogs: () => api.get('/admin/activity-logs')
};

export default api;
