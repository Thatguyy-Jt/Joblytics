import axios from 'axios';
import { toast } from 'sonner';

// API base URL - defaults to localhost:5000 in development
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important: sends cookies (JWT tokens) with requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;
    
    // Handle 401 Unauthorized - redirect to login only if on protected route
    if (response?.status === 401) {
      const currentPath = window.location.pathname;
      // Only redirect if on a protected route (dashboard), not on public pages
      if (currentPath.startsWith('/dashboard') && 
          !currentPath.includes('/login') && 
          !currentPath.includes('/register')) {
        window.location.href = '/login';
      }
      // Don't redirect if on home page, login, or register
    }
    
    // Handle 403 Forbidden
    if (response?.status === 403) {
      toast.error('You do not have permission to perform this action');
    }
    
    // Handle 409 Conflict
    if (response?.status === 409) {
      const message = response?.data?.message || 'This email is already registered';
      toast.error(message);
    }
    
    // Handle 404 Not Found
    if (response?.status === 404) {
      toast.error('Resource not found');
    }
    
    // Handle 500 Server Error
    if (response?.status === 500) {
      toast.error('Server error. Please try again later');
    }
    
    // Handle network errors
    if (!response) {
      toast.error('Network error. Please check your connection');
    }
    
    return Promise.reject(error);
  }
);

// API methods organized by feature
export const authAPI = {
  register: (data: { firstName: string; lastName: string; email: string; password: string }) => 
    api.post('/auth/register', data),
    login: (data: { email: string; password: string; rememberMe?: boolean }) => 
      api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  refresh: () => api.post('/auth/refresh'),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data: any) => api.put('/auth/profile', data),
  requestPasswordReset: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPasswordWithToken: (token: string, newPassword: string) => 
    api.post('/auth/reset-password', { token, newPassword }),
};

export const applicationsAPI = {
  getAll: (params?: any) => api.get('/applications', { params }),
  getById: (id: string) => api.get(`/applications/${id}`),
  create: (data: any) => api.post('/applications', data),
  update: (id: string, data: any) => api.put(`/applications/${id}`, data),
  delete: (id: string) => api.delete(`/applications/${id}`),
  getStatistics: () => api.get('/applications/statistics'),
  generateResumeMatch: (id: string) => api.post(`/applications/${id}/ai/resume-match`),
  generateInterviewPrep: (id: string) => api.post(`/applications/${id}/ai/interview-prep`),
  generateResumeImprovement: (id: string, data: any) => 
    api.post(`/applications/${id}/ai/resume-improvement`, data),
};

export const analyticsAPI = {
  getComprehensive: () => api.get('/analytics'),
  getStatusDistribution: () => api.get('/analytics/status-distribution'),
  getMonthlyTrends: () => api.get('/analytics/monthly-trends'),
  getSuccessRate: () => api.get('/analytics/success-rate'),
  getTimeline: () => api.get('/analytics/timeline'),
};

export const aiAPI = {
  analyzeResumeMatch: (data: any) => api.post('/ai/resume-match', data),
  getInterviewPrep: (data: any) => api.post('/ai/interview-prep', data),
  getResumeImprovement: (data: any) => api.post('/ai/resume-improvement', data),
};

export const remindersAPI = {
  getAll: (params?: any) => api.get('/reminders', { params }),
  getById: (id: string) => api.get(`/reminders/${id}`),
  create: (data: any) => api.post('/reminders', data),
  update: (id: string, data: any) => api.put(`/reminders/${id}`, data),
  delete: (id: string) => api.delete(`/reminders/${id}`),
};

export default api;

