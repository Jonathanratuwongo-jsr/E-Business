'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from './types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  loginWithGoogle: (role?: 'customer' | 'admin') => Promise<void>;
  logout: () => void;
  switchRole: (role: 'customer' | 'admin') => void;
}

const DEFAULT_CUSTOMER: User = {
  id: 'usr-customer-1',
  name: 'Budi Santoso',
  email: 'budi.santoso@gmail.com',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  role: 'customer',
  phone: '081234567890',
  address: 'Jl. Sudirman No. 45, Kebayoran Baru, Jakarta Selatan',
};

const DEFAULT_ADMIN: User = {
  id: 'usr-admin-1',
  name: 'Hendrawan (Admin TechSecond)',
  email: 'admin@techsecond.id',
  avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
  role: 'admin',
  phone: '081199887766',
  address: 'Headquarters TechSecond ID, Lt. 3, Jakarta Pusat',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check saved user in localStorage
    try {
      const saved = localStorage.getItem('techsecond_user');
      if (saved) {
        setUser(JSON.parse(saved));
      } else {
        // Default customer logged in for smooth exploration
        setUser(DEFAULT_CUSTOMER);
        localStorage.setItem('techsecond_user', JSON.stringify(DEFAULT_CUSTOMER));
      }
    } catch {
      setUser(DEFAULT_CUSTOMER);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginWithGoogle = async (role: 'customer' | 'admin' = 'customer') => {
    setIsLoading(true);
    // Simulate real Google OAuth authentication handshake
    await new Promise((r) => setTimeout(r, 800));
    const targetUser = role === 'admin' ? DEFAULT_ADMIN : DEFAULT_CUSTOMER;
    setUser(targetUser);
    localStorage.setItem('techsecond_user', JSON.stringify(targetUser));
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('techsecond_user');
  };

  const switchRole = (role: 'customer' | 'admin') => {
    const newUser = role === 'admin' ? DEFAULT_ADMIN : DEFAULT_CUSTOMER;
    setUser(newUser);
    localStorage.setItem('techsecond_user', JSON.stringify(newUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        loginWithGoogle,
        logout,
        switchRole,
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
