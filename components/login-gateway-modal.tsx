'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { AlertCircle, Lock } from 'lucide-react';

interface LoginGatewayModalProps {
  isOpen: boolean;
}

export function LoginGatewayModal({ isOpen }: LoginGatewayModalProps) {
  const { loginWithGoogleAccount, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'customer' | 'admin'>('customer');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    if (!cleanEmail) {
      setError('Harap masukkan alamat email Google Anda.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setError('Format email tidak valid. Masukkan email Google resmi.');
      return;
    }

    if (!cleanName) {
      setError('Harap masukkan nama lengkap Anda.');
      return;
    }

    setIsSubmitting(true);
    try {
      await loginWithGoogleAccount(cleanEmail, cleanName, role);
    } catch {
      setError('Terjadi kendala saat menghubungkan akun. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-md bg-white border border-zinc-200 rounded-xl p-6 sm:p-8 shadow-xl">
        <div className="text-center mb-6">
          <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-800 border border-zinc-200">
            <Lock className="w-4 h-4" />
          </div>
          <h2 className="text-xl font-serif font-bold text-zinc-900">
            TechSecond ID
          </h2>
          <p className="text-xs text-zinc-600 mt-1">
            Silakan masuk dengan akun Google Anda terlebih dahulu untuk mengakses katalog toko.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Role selector */}
          <div>
            <label className="block text-[11px] font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
              Tipe Pengguna:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole('customer')}
                className={`py-2 px-3 font-medium rounded-lg border text-center transition-colors ${
                  role === 'customer'
                    ? 'border-zinc-900 bg-zinc-900 text-white'
                    : 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100'
                }`}
              >
                Pelanggan
              </button>
              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`py-2 px-3 font-medium rounded-lg border text-center transition-colors ${
                  role === 'admin'
                    ? 'border-zinc-900 bg-zinc-900 text-white'
                    : 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100'
                }`}
              >
                Admin Katalog
              </button>
            </div>
            {role === 'admin' && (
              <p className="text-[10px] text-zinc-500 mt-1.5">
                *Akun Admin hanya berwenang melihat dan mengelola katalog produk. Pembelian dinonaktifkan.
              </p>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-zinc-700 uppercase tracking-wider mb-1">
              Email Google (Gmail)
            </label>
            <input
              type="email"
              required
              placeholder="nama.anda@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-900 bg-white"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-zinc-700 uppercase tracking-wider mb-1">
              Nama Lengkap
            </label>
            <input
              type="text"
              required
              placeholder="Nama sesuai akun Google"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-900 bg-white"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="w-full mt-2 flex items-center justify-center gap-2.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50"
          >
            {/* Google G icon */}
            <svg className="w-4 h-4 shrink-0 bg-white p-0.5 rounded-full" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{isSubmitting ? 'Memverifikasi Google...' : 'Masuk dengan Google'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
