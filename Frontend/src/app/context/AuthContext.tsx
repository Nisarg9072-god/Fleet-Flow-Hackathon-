import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../lib/api';

interface User {
  email: string;
  name: string;
  role: 'FLEET_MANAGER' | 'DISPATCHER' | 'SAFETY_OFFICER' | 'FINANCE_ANALYST';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role?: User['role']) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('fleetops_token');
    const userData = localStorage.getItem('fleetops_user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
      setToken(token);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: jwt, user } = res.data;
    localStorage.setItem('fleetops_token', jwt);
    localStorage.setItem('fleetops_user', JSON.stringify(user));
    setUser(user);
    setToken(jwt);
  };

  const register = async (name: string, email: string, password: string, role?: User['role']) => {
    await api.post('/auth/register', { name, email, password, role });
    // Do not auto-login; let the user sign in explicitly
  };

  const logout = () => {
    localStorage.removeItem('fleetops_token');
    localStorage.removeItem('fleetops_user');
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
