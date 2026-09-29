'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { ArrowLeft, Shield, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { user, loginWithGoogleAccount, logout, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'customer' | 'admin'>('customer');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGoogleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    if (!cleanEmail) {
      setError('Masukkan alamat email Google Anda.');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setError('Format email tidak valid. Masukkan email Google yang benar.');
      return;
    }

    if (!cleanName) {
      setError('Masukkan nama lengkap sesuai akun Google Anda.');
      return;
    }

    setIsSubmitting(true);
    try {
      await loginWithGoogleAccount(cleanEmail, cleanName, role);
      if (role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    } catch {
      setError('Gagal menghubungkan ke akun Google. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900 flex flex-col justify-between p-4 sm:p-6 font-sans">
      {/* Top Header */}
      <div className="max-w-4xl w-full mx-auto flex items-center justify-between py-2 border-b border-zinc-200">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Beranda</span>
        </Link>
        <div className="flex items-center gap-1 text-[11px] text-zinc-500 font-mono">
          <Shield className="w-3 h-3 text-zinc-700" />
          <span>Autentikasi Akun Google</span>
        </div>
      </div>

      {/* Main Card */}
      <div className="max-w-md w-full mx-auto my-12">
        <div className="bg-white border border-zinc-300 rounded-xl p-6 sm:p-8 shadow-xs">
          {/* Logo & Heading */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-serif tracking-tight text-zinc-900 font-bold">
              TechSecond ID
            </h1>
            <p className="text-xs text-zinc-500 mt-1">
              Katalog Elektronik Bekas Terverifikasi
            </p>
          </div>

          {user ? (
            /* Already logged in view */
            <div className="space-y-4 text-center">
              <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-lg text-left text-xs space-y-1">
                <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">
                  Saat ini masuk sebagai:
                </p>
                <p className="font-bold text-zinc-900 text-sm">{user.name}</p>
                <p className="text-zinc-600 font-mono">{user.email}</p>
                <p className="text-zinc-500 text-[11px] pt-1">
                  Peran:{' '}
                  <span className="font-semibold text-zinc-800">
                    {user.role === 'admin' ? 'Admin Toko (Kelola Katalog)' : 'Pelanggan'}
                  </span>
                </p>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <Link
                  href={user.role === 'admin' ? '/admin' : '/'}
                  className="w-full py-2.5 px-4 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold rounded-lg transition-colors text-center"
                >
                  {user.role === 'admin' ? 'Buka Panel Katalog Admin' : 'Lanjut Belanja di Toko'}
                </Link>
                <button
                  type="button"
                  onClick={() => logout()}
                  className="w-full py-2 px-4 border border-zinc-300 hover:bg-zinc-50 text-zinc-700 text-xs font-medium rounded-lg transition-colors"
                >
                  Keluar / Masuk Akun Lain
                </button>
              </div>
            </div>
          ) : (
            /* Login Form */
            <form onSubmit={handleGoogleSubmit} className="space-y-4">
              <div className="text-center pb-2">
                <h2 className="text-sm font-semibold text-zinc-800">
                  Masuk dengan Akun Google Anda
                </h2>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  Masukkan email Google aktif Anda untuk verifikasi identitas
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-700">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Role Selection */}
              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                  Tipe Akses:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('customer')}
                    className={`py-2 px-3 text-xs font-medium rounded-lg border text-center transition-colors ${
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
                    className={`py-2 px-3 text-xs font-medium rounded-lg border text-center transition-colors ${
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
                    *Admin hanya berwenang melihat dan mengelola katalog produk, tidak dapat melakukan pembelian.
                  </p>
                )}
              </div>

              {/* Google Email Input */}
              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                  Email Google (Gmail / Google Workspace)
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

              {/* Full Name Input */}
              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                  Nama Lengkap Pemilik Akun
                </label>
                <input
                  type="text"
                  required
                  placeholder="Sesuai nama profil Google Anda"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-900 bg-white"
                />
              </div>

              {/* Google Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="w-full mt-2 flex items-center justify-center gap-2.5 bg-white border border-zinc-300 hover:border-zinc-400 hover:bg-zinc-50 text-zinc-800 text-xs font-semibold py-2.5 px-4 rounded-lg shadow-xs transition-colors disabled:opacity-50"
              >
                {/* Official Google G Logo */}
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
                <span>
                  {isSubmitting ? 'Memverifikasi Google ID...' : 'Masuk dengan Akun Google'}
                </span>
              </button>

              <div className="pt-2 text-center text-[10px] text-zinc-500">
                Data akun Google Anda digunakan secara langsung untuk otentikasi sesi pemesanan Anda.
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Bottom info */}
      <div className="max-w-4xl w-full mx-auto text-center py-4 text-[11px] text-zinc-500 border-t border-zinc-200">
        TechSecond ID — E-Commerce Elektronik Bekas Berstandar Kurasi Resmi
      </div>
    </div>
  );
}
