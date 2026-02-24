import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CurrentSession } from '@/lib/types';
import { getSession, setSession, clearSession, getAdmins, getUsers, addUser, initializeDefaults } from '@/lib/storage';

interface AuthContextType {
  session: CurrentSession | null;
  login: (username: string, email: string, password: string) => boolean;
  signup: (username: string, email: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<CurrentSession | null>(null);

  useEffect(() => {
    initializeDefaults();
    const s = getSession();
    if (s) setSessionState(s);
  }, []);

  const login = (username: string, email: string, password: string): boolean => {
    const admins = getAdmins();
    const admin = admins.find(a => a.username === username && a.email === email && a.password === password);
    if (admin) {
      const s: CurrentSession = { id: admin.id, username: admin.username, email: admin.email, role: 'admin' };
      setSession(s);
      setSessionState(s);
      return true;
    }

    const users = getUsers();
    const user = users.find(u => u.username === username && u.email === email && u.password === password);
    if (user) {
      const s: CurrentSession = { id: user.id, username: user.username, email: user.email, role: 'user' };
      setSession(s);
      setSessionState(s);
      return true;
    }

    return false;
  };

  const signup = (username: string, email: string, password: string): boolean => {
    const users = getUsers();
    if (users.find(u => u.email === email)) return false;

    const user = {
      id: `user-${Date.now()}`,
      username,
      email,
      password,
      createdAt: new Date().toISOString(),
    };
    addUser(user);
    const s: CurrentSession = { id: user.id, username: user.username, email: user.email, role: 'user' };
    setSession(s);
    setSessionState(s);
    return true;
  };

  const logout = () => {
    clearSession();
    setSessionState(null);
  };

  return (
    <AuthContext.Provider value={{ session, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
