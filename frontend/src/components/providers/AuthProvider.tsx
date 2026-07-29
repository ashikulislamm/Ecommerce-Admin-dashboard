'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: {
    id: string;
    name: string;
  };
  permissions?: string[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email?: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (key?: string) => boolean;
  hasAnyPermission: (keys: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
  hasPermission: () => true,
  hasAnyPermission: () => true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('accessToken');
      if (storedToken) {
        setToken(storedToken);
        try {
          const res = await apiClient<User>('/auth/me');
          if (res.success && res.data) {
            setUser(res.data);
          }
        } catch (err) {
          console.warn('Auth session check failed, token may be expired');
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email = 'admin@example.com', password = 'Admin123!') => {
    setIsLoading(true);
    try {
      const res = await apiClient<{ user: User; accessToken: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (res.success && res.data) {
        const { user: userData, accessToken } = res.data;
        setUser(userData);
        setToken(accessToken);
        localStorage.setItem('accessToken', accessToken);
      }
    } catch (err) {
      console.error('Login error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiClient('/auth/logout', { method: 'POST' }).catch(() => null);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('accessToken');
    }
  };

  const hasPermission = (key?: string): boolean => {
    if (!key) return true;
    if (!user) return false;
    if (user.role?.name === 'SUPER_ADMIN') return true;
    if (user.permissions?.includes('*')) return true;
    return user.permissions?.includes(key) ?? true;
  };

  const hasAnyPermission = (keys: string[]): boolean => {
    if (!keys || keys.length === 0) return true;
    return keys.some((k) => hasPermission(k));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token || !!user,
        isLoading,
        login,
        logout,
        hasPermission,
        hasAnyPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
