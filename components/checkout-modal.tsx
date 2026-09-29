'use client';

import React, { useState } from 'react';
import { useCart } from '@/lib/cart-context';
import { useAuth } from '@/lib/auth-context';
import { Order, MidtransPaymentType } from '@/lib/types';
import { X, Truck, ShieldCheck, AlertCircle } from 'lucide-react';

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

  // As requested: Do NOT pre-fill with dummy data, start completely empty with clean example placeholders
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

  if (!isOpen) return null;

  // Admin cannot checkout
  if (user?.role === 'admin') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/50 backdrop-blur-xs">
        <div className="w-full max-w-md bg-white border border-zinc-200 rounded-xl p-6 shadow-xl text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-700">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="font-serif font-bold text-base text-zinc-900">
            Akses Pembelian Dinonaktifkan
          </h3>
          <p className="text-xs text-zinc-600 mt-2">
            Akun Anda terdaftar sebagai <strong>Admin Katalog</strong>. Admin hanya dapat melihat dan mengelola katalog produk, tidak dapat melakukan transaksi pembelian.
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
  const total = subtotal + shippingCost + insuranceCost;

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
              Formulir Pengiriman Pesanan
            </h2>
            <p className="text-[11px] text-zinc-500">
              Mohon isi data pengiriman dengan benar untuk pengantaran unit elektronik
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 sm:p-6 space-y-5 text-xs text-zinc-800">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Section 1: Customer Shipping Info */}
          <div className="space-y-3">
            <h3 className="font-semibold text-xs text-zinc-900 uppercase tracking-wider pb-1 border-b border-zinc-100">
              1. Informasi Pengiriman Pelanggan
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                  Nama Penerima *
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
                <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                  Nomor WhatsApp / Telepon *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="Contoh: 081234567890"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-md focus:outline-none focus:border-zinc-900 bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                  Alamat Email (Akun Google) *
                </label>
                <input
                  type="email"
                  required
                  placeholder="Contoh: nama.anda@gmail.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-md focus:outline-none focus:border-zinc-900 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                  Kota / Kabupaten *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Jakarta Selatan / Surabaya"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-md focus:outline-none focus:border-zinc-900 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                Alamat Lengkap Pengiriman *
              </label>
              <textarea
                required
                rows={2}
                placeholder="Contoh: Jl. Sudirman No. 45, RT 02/RW 04, Kel. Senayan, Kec. Kebayoran Baru, Kode Pos 12190"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-md focus:outline-none focus:border-zinc-900 bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                Catatan Pengiriman (Opsional)
              </label>
              <input
                type="text"
                placeholder="Contoh: Rumah pagar hitam / titipkan di satpam"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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

          {/* Section 3: Summary & Pay with Midtrans */}
          <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-lg space-y-2">
            <div className="flex justify-between text-zinc-600">
              <span>Subtotal Produk ({items.length} item)</span>
              <span className="font-mono text-zinc-900">Rp {subtotal.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between text-zinc-600">
              <span>Biaya Pengiriman</span>
              <span className="font-mono text-zinc-900">Rp {shippingCost.toLocaleString('id-ID')}</span>
            </div>
            {includeInsurance && (
              <div className="flex justify-between text-zinc-600">
                <span>Asuransi Elektronik</span>
                <span className="font-mono text-zinc-900">Rp {insuranceCost.toLocaleString('id-ID')}</span>
              </div>
            )}
            <div className="pt-2 border-t border-zinc-200 flex justify-between font-bold text-sm text-zinc-900">
              <span>Total Tagihan Pembayaran</span>
              <span className="font-mono text-base">Rp {total.toLocaleString('id-ID')}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || items.length === 0}
            className="w-full py-3 px-4 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Menyiapkan Midtrans...</span>
            ) : (
              <span>Lanjut ke Pembayaran Midtrans (Semua Bank VA & QRIS)</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
