'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { ShieldCheck, ArrowLeft, CheckCircle2, Laptop, Smartphone, Sparkles, Lock } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { user, loginWithGoogle, isLoading } = useAuth();
  const [selectedRole, setSelectedRole] = useState<'customer' | 'admin'>('customer');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleGoogleSignIn = async (roleToUse = selectedRole) => {
    setIsLoggingIn(true);
    await loginWithGoogle(roleToUse);
    setIsLoggingIn(false);
    if (roleToUse === 'admin') {
      router.push('/admin');
    } else {
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 flex flex-col justify-between p-4 sm:p-6 text-white relative overflow-hidden">
      {/* Background ambient orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Navbar */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 px-3.5 py-1.5 rounded-full transition-colors backdrop-blur-sm border border-white/10"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Beranda Toko</span>
        </Link>
        <div className="flex items-center gap-1.5 text-xs text-blue-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>OAuth 2.0 Google Security Verified</span>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="max-w-md w-full mx-auto z-10 my-8">
        <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
          {/* Logo & Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 mb-4 shadow-lg shadow-blue-500/30">
              <Laptop className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              TechSecond <span className="text-blue-400">ID</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Marketplace Elektronik Bekas Bergaransi & Terpercaya
            </p>
          </div>

          {/* Role selection tab */}
          <div className="bg-slate-800/80 p-1 rounded-2xl flex gap-1 mb-6 border border-white/5">
            <button
              type="button"
              onClick={() => setSelectedRole('customer')}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
                selectedRole === 'customer'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sebagai Pelanggan
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole('admin')}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
                selectedRole === 'admin'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sebagai Admin Toko
            </button>
          </div>

          {/* Google Sign In Button */}
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => handleGoogleSignIn()}
              disabled={isLoggingIn || isLoading}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-100 text-slate-800 font-bold py-3.5 px-4 rounded-2xl shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 group"
            >
              {isLoggingIn ? (
                <>
                  <div className="w-5 h-5 border-2 border-slate-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm font-semibold text-slate-700">Menghubungkan ke Google...</span>
                </>
              ) : (
                <>
                  {/* Google 4-Color G Logo SVG */}
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
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
                  <span className="text-sm">Lanjutkan dengan Google</span>
                </>
              )}
            </button>

            {/* Quick One-Click Switchers */}
            <div className="relative my-5 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <span className="relative bg-slate-900 px-3 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                Atau Pilih Akun Cepat
              </span>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleGoogleSignIn('customer')}
                className="w-full text-left p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-white/5 hover:border-blue-500/50 flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80"
                    alt="Budi Santoso"
                    className="w-9 h-9 rounded-full object-cover border border-white/20"
                  />
                  <div>
                    <p className="text-xs font-bold text-white flex items-center gap-1">
                      Budi Santoso <span className="text-[10px] bg-blue-500/30 text-blue-300 px-1.5 rounded">Pelanggan</span>
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono">budi.santoso@gmail.com</p>
                  </div>
                </div>
                <div className="text-xs text-blue-400 font-semibold">Masuk &rarr;</div>
              </button>

              <button
                type="button"
                onClick={() => handleGoogleSignIn('admin')}
                className="w-full text-left p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-white/5 hover:border-indigo-500/50 flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80"
                    alt="Admin TechSecond"
                    className="w-9 h-9 rounded-full object-cover border border-white/20"
                  />
                  <div>
                    <p className="text-xs font-bold text-white flex items-center gap-1">
                      Hendrawan <span className="text-[10px] bg-indigo-500/30 text-indigo-300 px-1.5 rounded">Admin Toko</span>
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono">admin@techsecond.id</p>
                  </div>
                </div>
                <div className="text-xs text-indigo-400 font-semibold">Masuk &rarr;</div>
              </button>
            </div>
          </div>

          {/* Security note */}
          <div className="mt-6 pt-5 border-t border-white/10 text-center">
            <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              Data Anda terlindungi oleh enkripsi SSL dan Google Sign-in API resmi.
            </p>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="max-w-6xl w-full mx-auto text-center z-10 text-xs text-slate-400">
        <p>© 2026 TechSecond ID • Powered by Cloudflare D1 Database & Midtrans Payment Gateway</p>
      </div>
    </div>
  );
}
