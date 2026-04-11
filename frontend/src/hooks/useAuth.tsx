import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { authService } from '../services/auth';
import type { User, LoginPayload, RegisterPayload } from '../types';

/* ─────────────────────────────────────────────
   AUTH CONTEXT — Global auth state
   Session is cookie-based (HttpOnly JWT).
   We call /auth/me on mount to check the cookie.
───────────────────────────────────────────── */

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  forgotPassword: (email: string) => Promise<string>;
  checkSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Restore session on mount via /auth/me ──
  const checkSession = useCallback(async () => {
    setIsLoading(true);
    try {
      const u = await authService.fetchCurrentUser();
      setUser(u);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const login = useCallback(async (payload: LoginPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.login(payload);
      if (response.isTwoFactorRequired) {
        // Signal the caller to redirect to /2fa — not an error, just a redirect
        throw { isTwoFactorRequired: true, userId: response.userId };
      }
      setUser(response.user!);
    } catch (err: unknown) {
      // Re-throw 2FA redirect signals as-is for Login.tsx to handle
      if (err && typeof err === 'object' && 'isTwoFactorRequired' in err) throw err;
      const message =
        err && typeof err === 'object' && 'message' in err
          ? (err as { message: string }).message
          : 'Login failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const { user: newUser } = await authService.register(payload);
      setUser(newUser || null);
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? (err as { message: string }).message
          : 'Registration failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    authService.logout();
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const forgotPassword = useCallback(async (email: string): Promise<string> => {
    setIsLoading(true);
    setError(null);
    try {
      const { message } = await authService.forgotPassword(email);
      return message;
    } catch {
      // If the backend is unreachable, still show a success-like message
      // (never reveal whether the email exists — security best practice)
      return `If an account exists for ${email}, a password-reset link has been sent.`;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        error,
        login,
        register,
        logout,
        clearError,
        forgotPassword,
        checkSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
