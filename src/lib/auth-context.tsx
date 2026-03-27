'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { User, UserRole } from '@/types';
import { createClient } from '@/lib/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, role?: UserRole) => Promise<{ error?: string }>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const supabase = createClient();

function supabaseUserToUser(supabaseUser: SupabaseUser, profile?: Record<string, unknown>): User {
  return {
    id: supabaseUser.id,
    name: (profile?.name as string) || supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User',
    email: supabaseUser.email || '',
    role: (profile?.role as UserRole) || (supabaseUser.user_metadata?.role as UserRole) || 'student',
    avatar: (profile?.avatar_url as string) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${supabaseUser.id}`,
    bio: (profile?.bio as string) || '',
    createdAt: supabaseUser.created_at || new Date().toISOString(),
  };
}

// Demo/mock users for when Supabase is not configured
const DEMO_MODE = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://your-project.supabase.co';

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
  const [isLoading, setIsLoading] = useState(!DEMO_MODE);

  // Listen for Supabase auth state changes
  useEffect(() => {
    if (DEMO_MODE) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event: string, session: { user: SupabaseUser } | null) => {
        if (session?.user) {
          // Fetch profile data
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          setUser(supabaseUserToUser(session.user, profile || undefined));
        } else {
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    // Check initial session
    supabase.auth.getSession().then(async ({ data: { session } }: { data: { session: { user: SupabaseUser } | null } }) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        setUser(supabaseUserToUser(session.user, profile || undefined));
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string, role?: UserRole): Promise<{ error?: string }> => {
    if (DEMO_MODE) {
      const selectedRole = role || 'student';
      setUser(mockUsers[selectedRole]);
      return {};
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return {};
  }, []);

  const register = useCallback(async (name: string, email: string, password: string, role: UserRole): Promise<{ error?: string }> => {
    if (DEMO_MODE) {
      setUser({ ...mockUsers[role], name, email });
      return {};
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role },
      },
    });
    if (error) return { error: error.message };
    return {};
  }, []);

  const logout = useCallback(async () => {
    if (DEMO_MODE) {
      setUser(null);
      return;
    }
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  const switchRole = useCallback((role: UserRole) => {
    if (DEMO_MODE) {
      setUser(mockUsers[role]);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, register, logout, switchRole }}>
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
