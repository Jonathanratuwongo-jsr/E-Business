'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from './types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  loginWithGoogleAccount: (email: string, name: string, role: 'customer' | 'admin') => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('techsecond_google_user');
      if (saved) {
        setUser(JSON.parse(saved));
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginWithGoogleAccount = async (email: string, name: string, role: 'customer' | 'admin') => {
    setIsLoading(true);
    // Simulate real Google Identity handshake delay
    await new Promise((r) => setTimeout(r, 600));

    const initialLetter = (name.trim()[0] || email[0] || 'U').toUpperCase();
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=18181b&color=ffffff&bold=true`;

    const newUser: User = {
      id: `google_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim() || email.split('@')[0],
      email: email.trim().toLowerCase(),
      avatar: avatarUrl,
      role,
      phone: '',
      address: '',
    };

    setUser(newUser);
    localStorage.setItem('techsecond_google_user', JSON.stringify(newUser));
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('techsecond_google_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        loginWithGoogleAccount,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
