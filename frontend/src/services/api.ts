import axios from 'axios';
import type { ApiError } from '../types';

/* ─────────────────────────────────────────────
   API CLIENT — Axios wrapper with interceptors
   Auth is handled via HttpOnly cookies set by
   the backend. We just need withCredentials.
───────────────────────────────────────────── */

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true,          // ← sends HttpOnly cookie with every request
  headers: {
    'Content-Type': 'application/json',
  },
});

// No request interceptor needed — the browser
// automatically attaches the HttpOnly cookie.

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

      // Auto-redirect on 401 (cookie expired / not set)
      // Skip on /2fa — a 401 there means wrong code, not expired session
      if (error.response.status === 401) {
        const path = window.location.pathname;
        if (!path.startsWith('/login') && !path.startsWith('/2fa') && !path.startsWith('/signup') && !path.startsWith('/auth/callback')) {
          window.location.href = '/login';
        }
      }
    } else if (error.request) {
      apiError.message = 'Network error — please check your connection';
      apiError.status = 0;
    }

    return Promise.reject(apiError);
  },
);

export default api;
