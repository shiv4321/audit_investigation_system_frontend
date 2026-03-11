/**
 * Centralized API service layer.
 * All backend calls go through here.
 */

import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
});

// Request logging
api.interceptors.request.use((config) => {
  console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
  return config;
});

// Error handling
api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error('[API Error]', err.response?.data || err.message);
    return Promise.reject(err);
  }
);

export const investigationApi = {
  trigger: (transactionId) =>
    api.post('/api/v1/investigate', { transaction_id: transactionId }),

  get: (investigationId) =>
    api.get(`/api/v1/investigations/${investigationId}`),

  downloadReport: (investigationId) =>
    `${BASE_URL}/api/v1/reports/${investigationId}/download`,
};

export const transactionApi = {
  list: (params = {}) =>
    api.get('/api/v1/transactions', { params }),

  get: (transactionId) =>
    api.get(`/api/v1/transactions/${transactionId}`),
};

export const dashboardApi = {
  stats: () => api.get('/api/v1/dashboard/stats'),
};

export const integrationApi = {
  status: () => api.get('/api/v1/integrations/status'),
};

export default api;
