import axios from 'axios';
import type { ApiError } from '../types';

/* ─────────────────────────────────────────────
   API CLIENT — Axios wrapper with interceptors
   Handles auth tokens, error normalization
───────────────────────────────────────────── */

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request interceptor: attach token ────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response interceptor: normalize errors ───
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const apiError: ApiError = {
      message: 'An unexpected error occurred',
      status: 500,
    };

    if (error.response) {
      apiError.status = error.response.status;
      apiError.message =
        error.response.data?.message ||
        error.response.data?.error ||
        `Error ${error.response.status}`;
      apiError.errors = error.response.data?.errors;

      // Auto-logout on 401
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('remember');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        window.location.href = '/login';
      }
    } else if (error.request) {
      apiError.message = 'Network error — please check your connection';
      apiError.status = 0;
    }

    return Promise.reject(apiError);
  },
);

export default api;
