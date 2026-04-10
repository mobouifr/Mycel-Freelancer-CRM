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

  // ── Update user profile ────────────────────
  async updateProfile(updates: Partial<User>): Promise<User> {
    const { data } = await api.put<User>('/auth/profile', updates);
    return data;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.post('/auth/change-password', { currentPassword, newPassword });
  },

  // ── Forgot password ────────────────────────
  async forgotPassword(email: string): Promise<{ message: string }> {
    const { data } = await api.post<{ message: string }>('/auth/forgot-password', { email });
    return data;
  },

  // ── 2FA ────────────────────────────────────

  /** Ask backend to generate a TOTP secret + QR code data URL */
  async generate2FA(): Promise<{ qrCodeUrl: string }> {
    const { data } = await api.post<{ qrCodeUrl: string }>('/auth/2fa/generate');
    return data;
  },

  /** Verify the 6-digit code and enable 2FA on the account */
  async enable2FA(code: string): Promise<void> {
    const res = await api.post('/auth/2fa/turn-on', { code }, {
      validateStatus: (s: number) => s < 500,
    });
    if (res.status !== 200) {
      throw { message: (res.data as any)?.message || 'Invalid 2FA code', status: res.status };
    }
  },

  /** Disable 2FA on the account */
  async disable2FA(): Promise<void> {
    await api.post('/auth/2fa/turn-off');
  },

  /** Verify 2FA during login — backend sets JWT cookie on success */
  async verify2FA(userId: string, code: string): Promise<AuthResponse> {
    // Use validateStatus so 401 (wrong code) doesn't hit the global
    // interceptor which would redirect to /login before we can show
    // the inline error on the 2FA page.
    const res = await api.post<AuthResponse>('/auth/2fa/authenticate',
      { userId, code },
      { validateStatus: (s: number) => s < 500 },
    );
    if (res.status !== 200) {
      throw { message: (res.data as any)?.message || 'Invalid 2FA code', status: res.status };
    }
    return res.data;
  },

  // ── 42 OAuth ───────────────────────────────
  get oauthUrl(): string {
    return `${BACKEND_URL}/api/auth/42`;
  },
};
