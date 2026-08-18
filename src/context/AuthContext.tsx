import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import { AuthUser } from '../types';
import {
  loginApi,
  setAuthFailureHandler,
  changePasswordApi,
  clearDataCache,
  prefetchUsers,
} from '../services/api';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (name: string, password: string) => Promise<boolean>;
  logout: () => void;
  changeUserPassword: (userId: string, newPassword: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'shipment_app_token';
const USER_KEY = 'shipment_app_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const { showSuccess, showError, showInfo } = useToast();
  const [token, setToken] = useState<string | null>(() => {
    return sessionStorage.getItem(TOKEN_KEY);
  });
  const [user, setUser] = useState<AuthUser | null>(() => {
    const savedUser = sessionStorage.getItem(USER_KEY);
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch {
        return null;
      }
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    clearDataCache();
  }, []);

  // Prefetch admin users data in background on mount if admin session is already active
  useEffect(() => {
    if (token && user?.role === 'admin') {
      prefetchUsers(token);
    }
  }, [token, user?.role]);

  // Configure auth failure callback for automatic session invalidation
  useEffect(() => {
    setAuthFailureHandler((msg) => {
      logout();
      showError(msg || 'Your session has expired. Please log in again.');
    });
  }, [logout, showError]);

  const login = async (name: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await loginApi(name, password);

      if (response && response.success && response.token && response.user) {
        setToken(response.token);
        setUser(response.user);
        sessionStorage.setItem(TOKEN_KEY, response.token);
        sessionStorage.setItem(USER_KEY, JSON.stringify(response.user));
        showSuccess(`Welcome back, ${response.user.name}!`);

        // Safely prefetch users if the authenticated user is an admin
        if (response.user.role === 'admin') {
          prefetchUsers(response.token);
        }

        return true;
      } else {
        const errorMsg =
          response.message || response.error || 'Invalid username or password.';
        showError(errorMsg);
        return false;
      }
    } catch (err: any) {
      showError(err.message || 'Login failed. Please check your credentials.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const changeUserPassword = async (
    userId: string,
    newPassword: string
  ): Promise<boolean> => {
    if (!token) {
      showError('You must be logged in to change passwords.');
      return false;
    }

    try {
      const res = await changePasswordApi(token, userId, newPassword);
      if (res && res.success !== false) {
        showSuccess('Password updated successfully.');
        return true;
      } else {
        showError(res.message || res.error || 'Failed to change password.');
        return false;
      }
    } catch (err: any) {
      showError(err.message || 'Failed to change password.');
      return false;
    }
  };

  const isAuthenticated = Boolean(token && user);
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isAdmin,
        isLoading,
        login,
        logout,
        changeUserPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
