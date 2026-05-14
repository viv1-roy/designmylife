import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => apiClient.post('/auth/register', data),
  login: (data) => apiClient.post('/auth/login', data),
  getProfile: () => apiClient.get('/auth/profile'),
  updateProfile: (data) => apiClient.put('/auth/profile', data),
};

// Goals API
export const goalsAPI = {
  getAll: () => apiClient.get('/goals'),
  getOne: (id) => apiClient.get(`/goals/${id}`),
  create: (data) => apiClient.post('/goals', data),
  update: (id, data) => apiClient.put(`/goals/${id}`, data),
  delete: (id) => apiClient.delete(`/goals/${id}`),
  linkHabit: (id, habitId) => apiClient.post(`/goals/${id}/link-habit`, { habitId }),
  linkTask: (id, taskId) => apiClient.post(`/goals/${id}/link-task`, { taskId }),
};

// Habits API
export const habitsAPI = {
  getAll: () => apiClient.get('/habits'),
  getOne: (id) => apiClient.get(`/habits/${id}`),
  create: (data) => apiClient.post('/habits', data),
  update: (id, data) => apiClient.put(`/habits/${id}`, data),
  delete: (id) => apiClient.delete(`/habits/${id}`),
  complete: (id, date) => apiClient.post(`/habits/${id}/complete`, { date }),
  getStats: (id) => apiClient.get(`/habits/${id}/stats`),
};

// Tasks API
export const tasksAPI = {
  getAll: (params) => apiClient.get('/tasks', { params }),
  getOne: (id) => apiClient.get(`/tasks/${id}`),
  create: (data) => apiClient.post('/tasks', data),
  update: (id, data) => apiClient.put(`/tasks/${id}`, data),
  delete: (id) => apiClient.delete(`/tasks/${id}`),
  getToday: () => apiClient.get('/tasks/today'),
  getUpcoming: () => apiClient.get('/tasks/upcoming'),
  getOverdue: () => apiClient.get('/tasks/overdue'),
};

// Simulation API
export const simulationAPI = {
  simulateGoal: (id, timeframe) => apiClient.post(`/simulation/goal/${id}`, { timeframe }),
  getSystemHealth: () => apiClient.get('/simulation/system-health'),
  getInsights: () => apiClient.get('/simulation/insights'),
};

// Files API
export const filesAPI = {
  upload: (formData) => apiClient.post('/files/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getAll: (params) => apiClient.get('/files', { params }),
  download: (id) => apiClient.get(`/files/${id}/download`, { responseType: 'blob' }),
  delete: (id) => apiClient.delete(`/files/${id}`),
  getStats: () => apiClient.get('/files/stats'),
};

// AI API
export const aiAPI = {
  decomposeGoal: (data) => apiClient.post('/ai/decompose-goal', data),
  analyzeBehavior: (data) => apiClient.post('/ai/analyze-behavior', data),
  optimizePlan: (data) => apiClient.post('/ai/optimize-plan', data),
  analyzeReflection: (data) => apiClient.post('/ai/analyze-reflection', data),
  getStatus: () => apiClient.get('/ai/status'),
};

export default apiClient;
