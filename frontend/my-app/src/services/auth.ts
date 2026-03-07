import api from './api';
import type { LoginPayload, SignupPayload, AuthResponse, User } from '../types';

/* ─────────────────────────────────────────────
   AUTH SERVICE — Login, Signup, Token, Logout
   Supports "Remember me" via localStorage vs
   sessionStorage toggle.
───────────────────────────────────────────── */

const TOKEN_KEY = 'token';
const USER_KEY = 'user';
const REMEMBER_KEY = 'remember'; // "1" in localStorage when persistent

/** Pick the right storage based on the remember flag */
function getStorage(): Storage {
  return localStorage.getItem(REMEMBER_KEY) === '1'
    ? localStorage
    : sessionStorage;
}

export const authService = {
  // ── Login ──────────────────────────────────
  async login(payload: LoginPayload, remember = false): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/login', payload);
    this.setSession(data.token, data.user, remember);
    return data;
  },

  // ── Signup ─────────────────────────────────
  async signup(payload: SignupPayload): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/signup', payload);
    this.setSession(data.token, data.user, true); // signup always remembers
    return data;
  },

  // ── Logout ─────────────────────────────────
  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(REMEMBER_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    window.location.href = '/login';
  },

  // ── Token management ───────────────────────
  getToken(): string | null {
    // Check both storages — one of them will have the token
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  // ── User management ────────────────────────
  getUser(): User | null {
    const raw = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  },

  // ── Session persistence ────────────────────
  setSession(token: string, user: User, remember = true): void {
    // Clear both first to avoid stale data in the other storage
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);

    if (remember) {
      localStorage.setItem(REMEMBER_KEY, '1');
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(REMEMBER_KEY);
      sessionStorage.setItem(TOKEN_KEY, token);
      sessionStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  },

  // ── Forgot password ────────────────────────
  async forgotPassword(email: string): Promise<{ message: string }> {
    const { data } = await api.post<{ message: string }>('/auth/forgot-password', { email });
    return data;
  },

  // ── Get current user from API ──────────────
  async fetchCurrentUser(): Promise<User> {
    const { data } = await api.get<User>('/auth/me');
    const store = getStorage();
    store.setItem(USER_KEY, JSON.stringify(data));
    return data;
  },
};
