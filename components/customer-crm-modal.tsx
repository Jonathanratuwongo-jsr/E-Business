'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { CustomerProfile, Order, RetentionVoucher } from '@/lib/types';
import {
  X,
  Award,
  Sparkles,
  Tag,
  ShoppingBag,
  Truck,
  Copy,
  Check,
  Calendar,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

interface CustomerCRMModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenOrderTrack?: () => void;
}

export function CustomerCRMModal({ isOpen, onClose, onOpenOrderTrack }: CustomerCRMModalProps) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [vouchers, setVouchers] = useState<RetentionVoucher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const fetchCustomerData = async () => {
    if (!user?.email) return;
    setIsLoading(true);
    try {
      const [resCustomer, resVouchers] = await Promise.all([
        fetch(`/api/crm/customers/${encodeURIComponent(user.email)}`).then((r) => r.json()),
        fetch('/api/crm/retention').then((r) => r.json()),
      ]);

      if (resCustomer.success && resCustomer.data) {
        setProfile(resCustomer.data.customer);
        setOrders(resCustomer.data.orders);
      }
      if (resVouchers.success && resVouchers.data?.vouchers) {
        setVouchers(resVouchers.data.vouchers);
      }
    } catch (err) {
      console.error('Error fetching customer CRM info:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && user?.email) {
      fetchCustomerData();
    }
  }, [isOpen, user?.email]);

  if (!isOpen) return null;

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const isLoyal = profile?.segment === 'Pelanggan Loyal';
  const isNew = profile?.segment === 'Pelanggan Baru';
  const isInactive = profile?.segment === 'Pelanggan Tidak Aktif';

  // Filter vouchers that this user is eligible for
  const eligibleVouchers = vouchers.filter(
    (v) => v.isActive && (v.targetSegment === 'Semua' || v.targetSegment === profile?.segment)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-zinc-200 overflow-hidden max-h-[92vh] flex flex-col font-sans">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
          <div>
            <h2 className="text-base font-serif font-bold text-zinc-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-zinc-900" />
              <span>Kartu Member & Profil Loyalitas</span>
            </h2>
            <p className="text-[11px] text-zinc-500">
              TechSecond ID Loyalty & Rewards Program
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchCustomerData}
              className="p-1.5 rounded hover:bg-zinc-200 text-zinc-600 transition-colors"
              title="Perbarui Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
          {isLoading || !profile ? (
            <div className="py-16 text-center text-zinc-500">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-zinc-400" />
              <p>Memuat profil keanggotaan Anda...</p>
            </div>
          ) : (
            <>
              {/* Digital Membership Card */}
              <div
                className={`p-5 rounded-xl border relative overflow-hidden text-white shadow-md transition-all ${
                  isLoyal
                    ? 'bg-gradient-to-br from-emerald-900 via-zinc-900 to-emerald-950 border-emerald-700'
                    : isInactive
                    ? 'bg-gradient-to-br from-zinc-800 via-zinc-900 to-red-950 border-zinc-700'
                    : 'bg-gradient-to-br from-zinc-900 via-zinc-800 to-blue-950 border-zinc-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] tracking-widest uppercase font-mono text-zinc-400 block">
                      TechSecond ID Club
                    </span>
                    <h3 className="text-lg font-serif font-bold text-white mt-0.5">{profile.name}</h3>
                    <p className="text-xs text-zinc-300 font-mono">{profile.email}</p>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
                      isLoyal
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                        : isInactive
                        ? 'bg-red-500/20 text-red-300 border-red-400/40'
                        : 'bg-blue-500/20 text-blue-300 border-blue-400/40'
                    }`}
                  >
                    {isLoyal && <Sparkles className="w-3.5 h-3.5" />}
                    {isInactive && <AlertTriangle className="w-3.5 h-3.5" />}
                    <span>{profile.segment}</span>
                  </span>
                </div>

                {/* Points & Stats Banner */}
                <div className="mt-6 pt-4 border-t border-white/10 grid grid-cols-3 gap-2">
                  <div>
                    <span className="text-[10px] text-zinc-400 block">Saldo Poin:</span>
                    <span className="text-lg font-bold font-serif text-white flex items-center gap-1">
                      <Award className="w-4 h-4 text-amber-400" />
                      <span>{profile.loyaltyPoints}</span>
                    </span>
                    <span className="text-[9px] text-zinc-400 font-mono block">
                      ≈ Rp {(profile.loyaltyPoints * 100).toLocaleString('id-ID')} diskon
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-zinc-400 block">Total Pesanan:</span>
                    <span className="text-lg font-bold text-white">{profile.totalOrders}x</span>
                    <span className="text-[9px] text-zinc-400 block">Transaksi</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-zinc-400 block">Total Belanja:</span>
                    <span className="text-sm font-bold text-white font-mono mt-1 block">
                      Rp {profile.totalSpent.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Aturan & Keuntungan Segmen Saat Ini */}
              <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-lg space-y-2">
                <p className="font-semibold text-zinc-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-zinc-700" />
                  <span>Status Keanggotaan Anda:</span>
                </p>
                <p className="text-zinc-700 leading-relaxed text-[11px]">
                  {profile.segmentReason}
                </p>
                {isLoyal && (
                  <p className="text-[11px] text-emerald-800 bg-emerald-50 p-2 rounded border border-emerald-200 font-medium">
                    ⭐ Keuntungan VIP Anda: Cashback Poin 1.5x setiap transaksi, kupon eksklusif LOYALVIP10, dan prioritas layanan teknisi.
                  </p>
                )}
                {isNew && (
                  <p className="text-[11px] text-blue-800 bg-blue-50 p-2 rounded border border-blue-200 font-medium">
                    🎁 Selamat datang! Gunakan kode kupon sambutan <strong>BARUHEMAT50</strong> saat checkout untuk diskon Rp 50.000.
                  </p>
                )}
                {isInactive && (
                  <p className="text-[11px] text-red-800 bg-red-50 p-2 rounded border border-red-200 font-medium">
                    🔥 Kami kangen Anda! Nikmati promo spesial reaktivasi potongan Rp 100.000 dengan kode <strong>COMEBACK100</strong>.
                  </p>
                )}
              </div>

              {/* Promo & Kupon yang Berlaku untuk Segmen Anda */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-serif font-bold text-zinc-900 text-xs flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-zinc-800" />
                    <span>Kupon Promo Tertarget untuk Anda ({eligibleVouchers.length})</span>
                  </h4>
                  <span className="text-[10px] text-zinc-500">Salin kode dan pakai di checkout</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {eligibleVouchers.map((v) => (
                    <div
                      key={v.code}
                      className="p-3 bg-white border border-zinc-200 rounded-lg hover:border-zinc-400 transition-colors space-y-2 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-xs text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-300">
                            {v.code}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-700">
                            {v.discountType === 'fixed'
                              ? `Potongan Rp ${v.discountValue.toLocaleString('id-ID')}`
                              : `Diskon ${v.discountValue}%`}
                          </span>
                        </div>
                        <p className="font-semibold text-zinc-800 text-[11px] mt-1.5">{v.name}</p>
                        <p className="text-[10px] text-zinc-500 mt-0.5 line-clamp-2">{v.description}</p>
                      </div>

                      <div className="pt-2 border-t border-zinc-100 flex items-center justify-between">
                        <span className="text-[9px] text-zinc-400">Min. Rp {v.minSpend.toLocaleString('id-ID')}</span>
                        <button
                          type="button"
                          onClick={() => handleCopyCode(v.code)}
                          className="px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-white text-[10px] font-semibold inline-flex items-center gap-1 transition-colors"
                        >
                          {copiedCode === v.code ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span>Tersalin!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Salin Kode</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Riwayat Order Terakhir */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-serif font-bold text-zinc-900 text-xs flex items-center gap-1.5">
                    <ShoppingBag className="w-3.5 h-3.5 text-zinc-800" />
                    <span>Riwayat Pesanan Saya ({orders.length})</span>
                  </h4>
                  {onOpenOrderTrack && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenOrderTrack();
                      }}
                      className="text-[10px] text-zinc-600 hover:text-zinc-900 font-semibold inline-flex items-center gap-1"
                    >
                      <Truck className="w-3 h-3" />
                      <span>Lacak Pesanan →</span>
                    </button>
                  )}
                </div>

                {orders.length === 0 ? (
                  <div className="p-6 text-center border border-dashed border-zinc-200 rounded-lg text-zinc-500">
                    <ShoppingBag className="w-6 h-6 mx-auto mb-1 text-zinc-300" />
                    <p>Anda belum memiliki riwayat pesanan.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {orders.map((o) => (
                      <div key={o.id} className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-zinc-900">{o.orderNumber}</span>
                          <span className="font-bold text-zinc-900 font-mono">
                            Rp {o.total.toLocaleString('id-ID')}
                          </span>
                        </div>
                        <div className="text-[10px] text-zinc-500 flex items-center justify-between">
                          <span>
                            {new Date(o.createdAt).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded font-medium border ${
                              o.status === 'Selesai' || o.status === 'Sudah Dibayar'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-white text-zinc-700 border-zinc-300'
                            }`}
                          >
                            {o.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between text-xs">
          <p className="text-[10px] text-zinc-500">
            Poin Anda otomatis terakumulasi setiap kali pesanan berhasil diverifikasi.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-zinc-900 text-white rounded text-xs font-semibold hover:bg-zinc-800 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

