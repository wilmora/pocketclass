'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { User, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role?: UserRole) => void;
  register: (name: string, email: string, password: string, role: UserRole) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mockUsers: Record<UserRole, User> = {
  student: {
    id: 'student-1',
    name: 'Jordan Mitchell',
    email: 'student@pocketclass.com',
    role: 'student',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan',
    bio: 'Passionate learner exploring web development and design.',
    createdAt: '2024-06-01',
  },
  instructor: {
    id: 'inst-1',
    name: 'Sarah Chen',
    email: 'instructor@pocketclass.com',
    role: 'instructor',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    bio: 'Full-stack developer with 10+ years of experience.',
    createdAt: '2024-01-15',
  },
  admin: {
    id: 'admin-1',
    name: 'Platform Admin',
    email: 'admin@pocketclass.com',
    role: 'admin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
    bio: 'Platform administrator.',
    createdAt: '2024-01-01',
  },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback((email: string, _password: string, role?: UserRole) => {
    // Mock login — in production, this hits Supabase Auth
    const selectedRole = role || 'student';
    setUser(mockUsers[selectedRole]);
  }, []);

  const register = useCallback((name: string, email: string, _password: string, role: UserRole) => {
    setUser({
      ...mockUsers[role],
      name,
      email,
    });
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const switchRole = useCallback((role: UserRole) => {
    setUser(mockUsers[role]);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
