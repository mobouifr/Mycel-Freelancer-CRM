import api from './api';
import type { LoginPayload, RegisterPayload, AuthResponse, User } from '../types';

/* ─────────────────────────────────────────────
   AUTH SERVICE — Cookie-based authentication
   JWT lives in an HttpOnly cookie set by the
   backend. We never touch tokens in JS.
───────────────────────────────────────────── */

/** Backend base URL for full-page redirects (42 OAuth) */
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

export const authService = {
  // ── Login ──────────────────────────────────
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/login', payload);
    return data;   // cookie is set automatically by the backend
  },

  // ── Register ───────────────────────────────
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/register', payload);
    return data;
  },

  // ── Logout ─────────────────────────────────
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch {
      // cookie clear may fail if backend is unreachable — that's ok
    }
  },

  // ── Get current user (session check) ───────
  async fetchCurrentUser(): Promise<User> {
    const { data } = await api.get<User>('/auth/me');
    return data;
  },

  // ── Forgot password ────────────────────────
  async forgotPassword(email: string): Promise<{ message: string }> {
    const { data } = await api.post<{ message: string }>('/auth/forgot-password', { email });
    return data;
  },

  // ── 42 OAuth ───────────────────────────────
  get oauthUrl(): string {
    return `${BACKEND_URL}/auth/42`;
  },
};
