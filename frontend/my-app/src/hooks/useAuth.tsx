import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { authService } from '../services/auth';
import type { User, LoginPayload, SignupPayload } from '../types';

/* ─────────────────────────────────────────────
   AUTH CONTEXT — Global auth state
───────────────────────────────────────────── */

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (payload: LoginPayload, rememberMe?: boolean) => Promise<void>;
  signup: (payload: SignupPayload) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  forgotPassword: (email: string) => Promise<string>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Restore session on mount ───────────────
  useEffect(() => {
    const storedUser = authService.getUser();
    const token = authService.getToken();
    if (token && storedUser) {
      setUser(storedUser);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (payload: LoginPayload, rememberMe = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const { user: loggedInUser } = await authService.login(payload, rememberMe);
      setUser(loggedInUser);
    } catch (err: unknown) {
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

  const signup = useCallback(async (payload: SignupPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const { user: newUser } = await authService.signup(payload);
      setUser(newUser);
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? (err as { message: string }).message
          : 'Signup failed';
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
        signup,
        logout,
        clearError,
        forgotPassword,
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
