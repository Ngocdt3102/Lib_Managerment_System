import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types';
import { authService, type LoginParams, type RegisterParams } from '../services/authService';

export const getDefaultRouteForRole = (role?: string): string => {
  switch (role) {
    case 'Admin':
      return '/admin/dashboard';
    case 'Librarian':
      return '/librarian/dashboard';
    case 'Member':
      return '/member/catalog';
    default:
      return '/login';
  }
};

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (params: LoginParams) => Promise<User>;
  register: (params: RegisterParams) => Promise<User>;
  logout: () => void;
  updateUserLocally: (updatedData: Partial<User>) => void;
  isAdmin: boolean;
  isLibrarian: boolean;
  isMember: boolean;
  defaultPath: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('token');
  });

  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const res = await authService.getMe();
          if (res.success && res.data) {
            setUser(res.data);
            localStorage.setItem('user', JSON.stringify(res.data));
          } else {
            logout();
          }
        } catch {
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (params: LoginParams): Promise<User> => {
    const res = await authService.login(params);
    if (res.success && res.data) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      return res.data.user;
    } else {
      throw new Error(res.message || 'Đăng nhập thất bại');
    }
  };

  const register = async (params: RegisterParams): Promise<User> => {
    const res = await authService.register(params);
    if (res.success && res.data) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      return res.data.user;
    } else {
      throw new Error(res.message || 'Đăng ký thất bại');
    }
  };

  const updateUserLocally = (updatedData: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updatedData };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const isAdmin = user?.role === 'Admin';
  const isLibrarian = user?.role === 'Librarian';
  const isMember = user?.role === 'Member';
  const defaultPath = getDefaultRouteForRole(user?.role);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateUserLocally,
        isAdmin,
        isLibrarian,
        isMember,
        defaultPath,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
