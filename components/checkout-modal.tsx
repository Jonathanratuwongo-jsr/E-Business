'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '@/lib/cart-context';
import { useAuth } from '@/lib/auth-context';
import { Order, MidtransPaymentType, RetentionVoucher, CustomerProfile } from '@/lib/types';
import { X, Truck, ShieldCheck, AlertCircle, Award, Tag, Check, Sparkles } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderCreated: (order: Order) => void;
}

const COURIER_OPTIONS = [
  { id: 'jne_yes', name: 'JNE Express (YES - 1 Hari Kerja)', cost: 35000 },
  { id: 'sicepat_best', name: 'SiCepat Ekspres (BEST - 1 Hari Kerja)', cost: 32000 },
  { id: 'jnt_reg', name: 'J&T Express (Reguler 2-3 Hari)', cost: 24000 },
];

export function CheckoutModal({ isOpen, onClose, onOrderCreated }: CheckoutModalProps) {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    notes: '',
    courierId: 'jne_yes',
    paymentType: 'qris' as MidtransPaymentType,
  });

  const [includeInsurance, setIncludeInsurance] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // CRM: Loyalty Points & Segment Vouchers
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile | null>(null);
  const [useLoyaltyPoints, setUseLoyaltyPoints] = useState(false);
  const [pointsToRedeem, setPointsToRedeem] = useState<number>(0);

  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<RetentionVoucher | null>(null);
  const [voucherDiscount, setVoucherDiscount] = useState(0);
  const [promoMessage, setPromoMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);

  // Load customer CRM data for loyalty points and segment benefits
  useEffect(() => {
    const emailToFetch = user?.email || formData.email;
    if (isOpen && emailToFetch) {
      fetch(`/api/crm/customers/${encodeURIComponent(emailToFetch)}`)
        .then((r) => r.json())
        .then((res) => {
          if (res.success && res.data) {
            setCustomerProfile(res.data.customer);
          }
        })
        .catch(() => {});
    }
  }, [isOpen, user?.email, formData.email]);

  useEffect(() => {
    if (user?.name && !formData.name) {
      setFormData((prev) => ({ ...prev, name: user.name, email: user.email }));
    }
  }, [user]);

  if (!isOpen) return null;

  // Admin cannot checkout
  if (user?.role === 'admin') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/50 backdrop-blur-xs">
        <div className="w-full max-w-md bg-white border border-zinc-200 rounded-xl p-6 shadow-xl text-center font-sans">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-700">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="font-serif font-bold text-base text-zinc-900">
            Akses Pembelian Dinonaktifkan
          </h3>
          <p className="text-xs text-zinc-600 mt-2">
            Akun Anda terdaftar sebagai <strong>Admin Katalog</strong>. Admin hanya dapat melihat dan mengelola katalog produk serta modul CRM.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="mt-5 w-full py-2.5 bg-zinc-900 text-white rounded-lg text-xs font-semibold hover:bg-zinc-800 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    );
  }

  const selectedCourier = COURIER_OPTIONS.find((c) => c.id === formData.courierId) || COURIER_OPTIONS[0];
  const shippingCost = selectedCourier.cost;
  const insuranceCost = includeInsurance ? 25000 : 0;

  // Loyalty Points conversion: 1 pt = Rp 100
  const maxAvailablePoints = customerProfile?.loyaltyPoints || 0;
  const maxDeductiblePoints = Math.min(maxAvailablePoints, Math.floor(subtotal / 100));
  const pointsDiscount = useLoyaltyPoints ? pointsToRedeem * 100 : 0;

  // Final Total calculation
  const total = Math.max(0, subtotal - pointsDiscount - voucherDiscount) + shippingCost + insuranceCost;

  // Estimated Loyalty points to earn: 1 pt per Rp 10.000 belanja (1.5x for Loyal segment)
  const isCustomerLoyal = customerProfile?.segment === 'Pelanggan Loyal';
  const basePointsEarn = Math.floor(subtotal / 10000);
  const estimatedPointsEarned = isCustomerLoyal ? Math.floor(basePointsEarn * 1.5) : basePointsEarn;

  const handleApplyPromo = async () => {
    if (!promoCodeInput.trim()) return;
    setIsValidatingPromo(true);
    setPromoMessage(null);
    try {
      const activeEmail = formData.email || user?.email || '';
      const res = await fetch('/api/crm/validate-promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: promoCodeInput.trim(),
          customerEmail: activeEmail,
          subtotal,
        }),
      });
      const data = await res.json();
      if (data.success && data.data?.valid) {
        setAppliedVoucher(data.data.voucher);
        setVoucherDiscount(data.data.discount);
        setPromoMessage({ text: data.data.message, isError: false });
      } else {
        setAppliedVoucher(null);
        setVoucherDiscount(0);
        setPromoMessage({
          text: data.data?.message || data.error || 'Voucher tidak valid untuk pesanan ini.',
          isError: true,
        });
      }
    } catch {
      setPromoMessage({ text: 'Gagal memvalidasi kode voucher.', isError: true });
    } finally {
      setIsValidatingPromo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (items.length === 0) {
      setErrorMessage('Keranjang belanja kosong.');
      return;
    }

    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.address.trim()) {
      setErrorMessage('Harap lengkapi semua data pengiriman pelanggan.');
      return;
    }

    setIsSubmitting(true);
    try {
      const fullShippingAddress = `${formData.address.trim()}${
        formData.city ? `, Kota/Kab: ${formData.city.trim()}` : ''
      }${formData.notes ? ` (Catatan: ${formData.notes.trim()})` : ''}`;

      const orderPayload = {
        customerName: formData.name.trim(),
        customerEmail: formData.email.trim(),
        customerPhone: formData.phone.trim(),
        shippingAddress: fullShippingAddress,
        courier: selectedCourier.name,
        items: items.map(({ product, quantity }) => ({
          productId: product.id,
          productName: product.name,
          productImage: product.image,
          grade: product.grade,
          price: product.price,
          quantity,
        })),
        subtotal,
        shippingCost,
        insuranceCost,
        discountAmount: voucherDiscount + pointsDiscount,
        loyaltyPointsUsed: useLoyaltyPoints ? pointsToRedeem : 0,
        loyaltyDiscount: pointsDiscount,
        voucherCode: appliedVoucher?.code || undefined,
        loyaltyPointsEarned: estimatedPointsEarned,
        total,
        status: 'Menunggu Pembayaran' as const,
        paymentType: formData.paymentType,
        midtransTransactionId: `MID-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();
      if (data.success && data.data) {
        clearCart();
        onClose();
        onOrderCreated(data.data);
      } else {
        throw new Error('Gagal memproses pesanan.');
      }
    } catch {
      setErrorMessage('Terjadi kendala saat memproses pesanan ke server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-xl border border-zinc-200 overflow-hidden max-h-[92vh] flex flex-col font-sans">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/50">
          <div>
            <h2 className="text-base font-serif font-bold text-zinc-900">
              Formulir Pengiriman & Checkout Pesanan
            </h2>
            <p className="text-[11px] text-zinc-500">
              Pengiriman berasuransi resmi & poin reward loyalitas TechSecond ID
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error message banner */}
        {errorMessage && (
          <div className="mx-5 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-6 text-xs">
          {/* Section 1: Customer Info */}
          <div className="space-y-3">
            <h3 className="font-semibold text-xs text-zinc-900 uppercase tracking-wider pb-1 border-b border-zinc-100">
              1. Informasi Pelanggan & Alamat Tujuan
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-zinc-700 mb-1">
                  Nama Lengkap Penerima <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Budi Santoso"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-md focus:outline-none focus:border-zinc-900 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-700 mb-1">
                  Alamat Email Google <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="budi.santoso@gmail.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-md focus:outline-none focus:border-zinc-900 bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-zinc-700 mb-1">
                  Nomor WhatsApp / HP Aktif <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="081234567890"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-md focus:outline-none focus:border-zinc-900 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-700 mb-1">
                  Kota / Kabupaten
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Jakarta Selatan"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-md focus:outline-none focus:border-zinc-900 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-zinc-700 mb-1">
                Alamat Lengkap (Jalan, RT/RW, No. Rumah/Kantor) <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={2}
                placeholder="Jl. Sudirman No. 45, Gedung Menara Sentosa Lt. 8..."
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-md focus:outline-none focus:border-zinc-900 bg-white"
              />
            </div>
          </div>

          {/* Section 2: Courier Selection */}
          <div className="space-y-3">
            <h3 className="font-semibold text-xs text-zinc-900 uppercase tracking-wider pb-1 border-b border-zinc-100 flex items-center justify-between">
              <span>2. Jasa Ekspedisi Pengiriman</span>
              <span className="text-[10px] text-zinc-500 font-normal">Packing Kayu & Bubble Wrap Tebal</span>
            </h3>

            <div className="space-y-2">
              {COURIER_OPTIONS.map((c) => (
                <label
                  key={c.id}
                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                    formData.courierId === c.id
                      ? 'border-zinc-900 bg-zinc-50/70'
                      : 'border-zinc-200 hover:border-zinc-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="courier"
                      value={c.id}
                      checked={formData.courierId === c.id}
                      onChange={() => setFormData({ ...formData, courierId: c.id })}
                      className="accent-zinc-900"
                    />
                    <span className="font-medium text-zinc-900">{c.name}</span>
                  </div>
                  <span className="font-mono text-zinc-800">
                    Rp {c.cost.toLocaleString('id-ID')}
                  </span>
                </label>
              ))}
            </div>

            {/* Insurance option */}
            <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeInsurance}
                  onChange={(e) => setIncludeInsurance(e.target.checked)}
                  className="rounded border-zinc-300 accent-zinc-900"
                />
                <div>
                  <p className="font-medium text-zinc-900 text-xs">
                    Asuransi Pengiriman Elektronik
                  </p>
                  <p className="text-[10px] text-zinc-500">
                    Perlindungan ganti rugi 100% jika terjadi kehilangan atau kerusakan di perjalanan
                  </p>
                </div>
              </label>
              <span className="font-mono text-zinc-800 shrink-0">Rp 25.000</span>
            </div>
          </div>

          {/* Section 3: CRM Loyalty & Segmented Vouchers */}
          <div className="space-y-3 bg-zinc-50/80 p-4 rounded-xl border border-zinc-200">
            <h3 className="font-semibold text-xs text-zinc-900 uppercase tracking-wider pb-1 border-b border-zinc-200 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-purple-600" />
                <span>3. Program Loyalitas & Promo CRM</span>
              </span>
              {customerProfile && (
                <span className="text-[10px] font-bold text-zinc-600 bg-white px-2 py-0.5 rounded border border-zinc-300">
                  Segmen: {customerProfile.segment}
                </span>
              )}
            </h3>

            {/* Loyalty Points Redemption */}
            <div className="p-3 bg-white border border-zinc-200 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useLoyaltyPoints}
                    disabled={maxAvailablePoints <= 0}
                    onChange={(e) => {
                      setUseLoyaltyPoints(e.target.checked);
                      if (e.target.checked && pointsToRedeem === 0) {
                        setPointsToRedeem(maxDeductiblePoints);
                      }
                    }}
                    className="rounded border-zinc-300 accent-purple-700"
                  />
                  <div>
                    <p className="font-medium text-zinc-900 text-xs flex items-center gap-1">
                      <span>Tukarkan Poin Loyalitas</span>
                      <span className="text-[10px] text-purple-700 font-bold bg-purple-50 px-1.5 py-0.2 rounded border border-purple-200">
                        {maxAvailablePoints} Pts Tersedia
                      </span>
                    </p>
                    <p className="text-[10px] text-zinc-500">
                      Nilai tukar: 1 Poin = Rp 100 potongan belanja langsung
                    </p>
                  </div>
                </label>
                {useLoyaltyPoints && (
                  <span className="font-mono font-bold text-purple-700">
                    -Rp {pointsDiscount.toLocaleString('id-ID')}
                  </span>
                )}
              </div>

              {useLoyaltyPoints && (
                <div className="pt-2 border-t border-zinc-100 flex items-center gap-2 text-[11px]">
                  <span className="text-zinc-600">Gunakan Poin:</span>
                  <input
                    type="number"
                    min={1}
                    max={maxDeductiblePoints}
                    value={pointsToRedeem}
                    onChange={(e) => {
                      const val = Math.max(0, Math.min(maxDeductiblePoints, parseInt(e.target.value, 10) || 0));
                      setPointsToRedeem(val);
                    }}
                    className="w-24 px-2 py-1 border border-zinc-300 rounded font-mono text-xs"
                  />
                  <span className="text-[10px] text-zinc-400">
                    (Maks. {maxDeductiblePoints} Pts untuk pesanan ini)
                  </span>
                </div>
              )}
            </div>

            {/* Segment-Targeted Promo Code Input */}
            <div className="p-3 bg-white border border-zinc-200 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-zinc-900 text-xs flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-blue-600" />
                  <span>Kode Voucher Promo Tertarget</span>
                </span>
                {appliedVoucher && (
                  <button
                    type="button"
                    onClick={() => {
                      setAppliedVoucher(null);
                      setVoucherDiscount(0);
                      setPromoCodeInput('');
                      setPromoMessage(null);
                    }}
                    className="text-[10px] text-red-600 hover:underline"
                  >
                    Hapus Kupon
                  </button>
                )}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Contoh: BARUHEMAT50 / LOYALVIP10 / COMEBACK100"
                  value={promoCodeInput}
                  onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                  disabled={Boolean(appliedVoucher)}
                  className="flex-1 px-3 py-1.5 text-xs uppercase font-mono border border-zinc-300 rounded focus:outline-none focus:border-zinc-900 bg-white disabled:bg-zinc-100"
                />
                <button
                  type="button"
                  onClick={handleApplyPromo}
                  disabled={isValidatingPromo || Boolean(appliedVoucher) || !promoCodeInput.trim()}
                  className="px-3.5 py-1.5 bg-zinc-900 text-white rounded font-semibold text-xs hover:bg-zinc-800 disabled:opacity-50 transition-colors"
                >
                  {isValidatingPromo ? 'Mengecek...' : 'Terapkan'}
                </button>
              </div>

              {promoMessage && (
                <p
                  className={`text-[11px] leading-relaxed p-2 rounded border ${
                    promoMessage.isError
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200 font-medium'
                  }`}
                >
                  {promoMessage.text}
                </p>
              )}
            </div>
          </div>

          {/* Section 4: Summary & Pay with Midtrans */}
          <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-lg space-y-2">
            <div className="flex justify-between text-zinc-600">
              <span>Subtotal Produk ({items.length} item)</span>
              <span className="font-mono text-zinc-900">Rp {subtotal.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between text-zinc-600">
              <span>Biaya Pengiriman ({selectedCourier.name.split(' ')[0]})</span>
              <span className="font-mono text-zinc-900">Rp {shippingCost.toLocaleString('id-ID')}</span>
            </div>
            {includeInsurance && (
              <div className="flex justify-between text-zinc-600">
                <span>Asuransi Elektronik</span>
                <span className="font-mono text-zinc-900">Rp {insuranceCost.toLocaleString('id-ID')}</span>
              </div>
            )}
            {useLoyaltyPoints && pointsDiscount > 0 && (
              <div className="flex justify-between text-purple-700 font-medium">
                <span>Diskon Poin Loyalitas ({pointsToRedeem} Pts)</span>
                <span className="font-mono">-Rp {pointsDiscount.toLocaleString('id-ID')}</span>
              </div>
            )}
            {appliedVoucher && voucherDiscount > 0 && (
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>Voucher Promo ({appliedVoucher.code})</span>
                <span className="font-mono">-Rp {voucherDiscount.toLocaleString('id-ID')}</span>
              </div>
            )}

            <div className="pt-2 border-t border-zinc-200 flex justify-between font-bold text-sm text-zinc-900">
              <span>Total Tagihan Pembayaran</span>
              <span className="font-mono text-base">Rp {total.toLocaleString('id-ID')}</span>
            </div>

            {/* Loyalty points will be earned notification */}
            <div className="mt-2 p-2 bg-purple-50/80 border border-purple-200 rounded flex items-center justify-between text-[11px] text-purple-900">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                <span>Poin Loyalitas yang akan Anda dapatkan:</span>
              </span>
              <span className="font-bold font-mono">+{estimatedPointsEarned} Pts</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || items.length === 0}
            className="w-full py-3 px-4 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Menyiapkan Pembayaran...</span>
            ) : (
              <span>Lanjut ke Pembayaran Midtrans (Semua Bank VA & QRIS)</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
