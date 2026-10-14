import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { AuthState, LoginRequest, User } from '../types/auth.types';
import authApi from '../services/authApi';

interface AuthContextValue extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const getStoredAuth = (): Partial<AuthState> => {
  try {
    const userStr = localStorage.getItem('user');
    const user: User | null = userStr ? (JSON.parse(userStr) as User) : null;
    return { user };
  } catch {
    return {};
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const stored = useMemo(() => getStoredAuth(), []);
  const [user, setUser] = useState<User | null>(stored.user ?? null);
  const [isLoading, setIsLoading] = useState(false);

  const isAuthenticated = user !== null;

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('access_token', user.username);
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  }, [user]);

  const login = useCallback(async (credentials: LoginRequest) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(credentials);
      const userData: User = response.user || { username: credentials.username };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('access_token', userData.username);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      try {
        await authApi.logout();
      } catch {
        // ignore errors on logout
      }
    } finally {
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setIsLoading(false);
    }
  }, []);

  const value: AuthContextValue = {
    user,
    isAuthenticated,
    accessToken: user?.username || null,
    refreshToken: null,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default useAuth;
