import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nexus_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

export const deviceAPI = {
  getAll: (params) => api.get('/devices', { params }),
  getById: (id) => api.get(`/devices/${id}`),
  create: (data) => api.post('/devices', data),
  update: (id, data) => api.put(`/devices/${id}`, data),
  delete: (id) => api.delete(`/devices/${id}`),
  toggleStatus: (id, status) => api.post(`/devices/${id}/status`, { status }),
};

export const telemetryAPI = {
  ingest: (data) => api.post('/telemetry', data),
  getAll: (params) => api.get('/telemetry', { params }),
  getByDevice: (deviceId, params) => api.get(`/telemetry/device/${deviceId}`, { params }),
  getStats: () => api.get('/telemetry/stats'),
};

export const ruleAPI = {
  getAll: (params) => api.get('/rules', { params }),
  getById: (id) => api.get(`/rules/${id}`),
  create: (data) => api.post('/rules', data),
  update: (id, data) => api.put(`/rules/${id}`, data),
  delete: (id) => api.delete(`/rules/${id}`),
  toggle: (id) => api.post(`/rules/${id}/toggle`),
  test: (data) => api.post('/rules/test', data),
};

export const alertAPI = {
  getAll: (params) => api.get('/alerts', { params }),
  getStats: () => api.get('/alerts/stats'),
  acknowledge: (id, user) => api.post(`/alerts/${id}/acknowledge`, { user }),
  resolve: (id, user, resolutionNote) => api.post(`/alerts/${id}/resolve`, { user, resolutionNote }),
  clearResolved: () => api.delete('/alerts/clear-resolved'),
};

export const analyticsAPI = {
  getTrends: (params) => api.get('/analytics/trends', { params }),
  getComparison: () => api.get('/analytics/comparison'),
  getSensorStats: () => api.get('/analytics/sensor-stats'),
};

export const logAPI = {
  getAll: (params) => api.get('/logs', { params }),
  clear: () => api.delete('/logs/clear'),
};

export const settingsAPI = {
  get: () => api.get('/settings'),
  update: (data) => api.put('/settings', data),
  resetDemo: () => api.post('/settings/reset-demo'),
  getDiagnostics: () => api.get('/settings/diagnostics'),
};

export const simulatorAPI = {
  getStatus: () => api.get('/simulator/status'),
  start: (data) => api.post('/simulator/start', data || {}),
  stop: () => api.post('/simulator/stop'),
  inject: (data) => api.post('/simulator/inject', data),
};

export default api;
