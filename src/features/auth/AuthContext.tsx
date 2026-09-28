'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface AuthUser {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  role: 'CITIZEN' | 'OFFICER' | 'ADMIN' | 'SUPER_ADMIN';
  departmentId?: string;
  preferredLanguage?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loginAs: (role: 'CITIZEN' | 'OFFICER' | 'ADMIN') => void;
  loginCustom: (user: AuthUser) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isOfficer: boolean;
}

const DEMO_ACCOUNTS = {
  ADMIN: {
    id: 'admin-1',
    name: 'Suhas Kulkarni',
    mobile: '9822001122',
    email: 'admin@cleantrack.nashik.in',
    role: 'ADMIN' as const,
  },
  OFFICER: {
    id: 'officer-1',
    name: 'Sunil Jadhav',
    mobile: '9822113344',
    email: 'officer.panchavati@cleantrack.nashik.in',
    role: 'OFFICER' as const,
  },
  CITIZEN: {
    id: 'citizen-1',
    name: 'Ramesh Patil',
    mobile: '9876543210',
    email: 'ramesh.patil@example.com',
    role: 'CITIZEN' as const,
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('cleantrack_user');
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved user');
      }
    }
  }, []);

  const loginAs = (role: 'CITIZEN' | 'OFFICER' | 'ADMIN') => {
    const account = DEMO_ACCOUNTS[role];
    setUser(account);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cleantrack_user', JSON.stringify(account));
    }
  };

  const loginCustom = (newUser: AuthUser) => {
    setUser(newUser);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cleantrack_user', JSON.stringify(newUser));
    }
  };

  const logout = () => {
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cleantrack_user');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loginAs,
        loginCustom,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN',
        isOfficer: user?.role === 'OFFICER',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
