import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api/client';

const AuthContext = createContext(null);

const DEFAULT_USER = {
  id: 'usr_manikanth',
  name: 'Koneti Manikanth',
  email: 'manikanth9878@gmail.com',
  role: 'Associate L1. Intern',
  department: 'Web Development',
  organization: 'Infotact Solutions',
  phone: '+91 7989612028',
  refNo: 'ITS/WEB/1849',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('nexus_user');
    return saved ? JSON.parse(saved) : DEFAULT_USER;
  });
  const [token, setToken] = useState(() => localStorage.getItem('nexus_token') || 'demo_token_1849');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('nexus_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('nexus_user');
    }
  }, [user]);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const res = await authAPI.login({ email, password });
      setUser(res.data.user);
      setToken(res.data.token);
      localStorage.setItem('nexus_token', res.data.token);
      localStorage.setItem('nexus_user', JSON.stringify(res.data.user));
      return { success: true };
    } catch (err) {
      console.warn('API login failed, using local session:', err.message);
      // Fallback local login
      const fallback = {
        ...DEFAULT_USER,
        email: email || DEFAULT_USER.email,
        name: email ? email.split('@')[0] : DEFAULT_USER.name,
      };
      setUser(fallback);
      return { success: true };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('nexus_token');
    localStorage.removeItem('nexus_user');
  };

  const switchUser = (type) => {
    if (type === 'admin') {
      const adminUser = {
        id: 'usr_admin',
        name: 'Nexus Admin',
        email: 'admin@nexusflow.io',
        role: 'System Administrator',
        department: 'Operations',
        organization: 'Infotact Solutions',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&q=80',
      };
      setUser(adminUser);
      localStorage.setItem('nexus_user', JSON.stringify(adminUser));
    } else {
      setUser(DEFAULT_USER);
      localStorage.setItem('nexus_user', JSON.stringify(DEFAULT_USER));
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, switchUser }}>
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
