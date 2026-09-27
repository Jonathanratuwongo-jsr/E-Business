'use client';

import React, { useState } from 'react';
import { useCart } from '@/lib/cart-context';
import { useAuth } from '@/lib/auth-context';
import { Order, MidtransPaymentType } from '@/lib/types';
import { X, ShieldCheck, Truck, Lock, CreditCard } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderCreated: (order: Order) => void;
}

const COURIER_OPTIONS = [
  { id: 'jne_yes', name: 'JNE YES (Yakin Esok Sampai)', cost: 35000, est: '1 Hari' },
  { id: 'sicepat_best', name: 'SiCepat BEST (Besok Sampai Tujuan)', cost: 32000, est: '1 Hari' },
  { id: 'jnt_reg', name: 'J&T Express Regular', cost: 24000, est: '2-3 Hari' },
];

export function CheckoutModal({ isOpen, onClose, onOrderCreated }: CheckoutModalProps) {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || 'Budi Santoso',
    email: user?.email || 'budi.santoso@gmail.com',
    phone: user?.phone || '081234567890',
    address: user?.address || 'Jl. Sudirman No. 45, Kebayoran Baru, Jakarta Selatan, 12190',
    courierId: 'jne_yes',
    paymentType: 'qris' as MidtransPaymentType,
  });

  const [includeInsurance, setIncludeInsurance] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const selectedCourier = COURIER_OPTIONS.find((c) => c.id === formData.courierId) || COURIER_OPTIONS[0];
  const shippingCost = selectedCourier.cost;
  const insuranceCost = includeInsurance ? 25000 : 0;
  const total = subtotal + shippingCost + insuranceCost;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    setIsSubmitting(true);
    try {
      const orderPayload = {
        customerName: formData.name,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        shippingAddress: formData.address,
        courier: `${selectedCourier.name} (${selectedCourier.est})`,
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
        throw new Error('Gagal membuat pesanan');
      }
    } catch {
      alert('Terjadi kesalahan saat memproses pesanan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-background rounded-3xl shadow-2xl border border-border overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-foreground">Checkout Gadget Bekas</h2>
            <p className="text-xs text-muted-foreground">
              Dilindungi Midtrans Payment Gateway & Garansi Toko
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-4 sm:p-6 space-y-5 text-xs">
          {/* Customer Info */}
          <div className="space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
              1. Informasi Pengiriman Pelanggan
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-muted-foreground font-medium mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-muted/40 border border-input rounded-xl px-3 py-2 text-foreground focus:ring-1 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-muted-foreground font-medium mb-1">No. WhatsApp / HP</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-muted/40 border border-input rounded-xl px-3 py-2 text-foreground focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-muted-foreground font-medium mb-1">Email Google (Notifikasi)</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-muted/40 border border-input rounded-xl px-3 py-2 text-foreground focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-muted-foreground font-medium mb-1">Alamat Lengkap Tujuan</label>
              <textarea
                required
                rows={2}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-muted/40 border border-input rounded-xl px-3 py-2 text-foreground focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* Courier Selection */}
          <div className="space-y-2.5">
            <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
              2. Pilihan Kurir Ekspedisi
            </h3>
            <div className="space-y-2">
              {COURIER_OPTIONS.map((c) => (
                <label
                  key={c.id}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    formData.courierId === c.id
                      ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 ring-1 ring-blue-600'
                      : 'border-border hover:bg-muted/40'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="courier"
                      checked={formData.courierId === c.id}
                      onChange={() => setFormData({ ...formData, courierId: c.id })}
                      className="text-blue-600"
                    />
                    <div>
                      <p className="font-bold text-foreground text-xs">{c.name}</p>
                      <p className="text-[11px] text-muted-foreground">Estimasi tiba: {c.est}</p>
                    </div>
                  </div>
                  <span className="font-bold text-foreground">
                    Rp {c.cost.toLocaleString('id-ID')}
                  </span>
                </label>
              ))}
            </div>

            {/* Insurance Checkbox */}
            <label className="flex items-center gap-2.5 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/30 cursor-pointer">
              <input
                type="checkbox"
                checked={includeInsurance}
                onChange={(e) => setIncludeInsurance(e.target.checked)}
                className="rounded text-emerald-600"
              />
              <div className="flex-1">
                <p className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Asuransi Kehilangan & Kerusakan Elektronik Bekas (+Rp 25.000)
                </p>
                <p className="text-[10px] text-emerald-700 dark:text-emerald-300">
                  Ganti rugi 100% uang kembali jika gadget lecet atau hilang saat kurir kirim.
                </p>
              </div>
            </label>
          </div>

          {/* Price Breakdown */}
          <div className="bg-muted/40 p-4 rounded-2xl border border-border space-y-2">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal ({items.length} Barang)</span>
              <span className="font-semibold text-foreground">
                Rp {subtotal.toLocaleString('id-ID')}
              </span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Ongkos Kirim ({selectedCourier.est})</span>
              <span className="font-semibold text-foreground">
                Rp {shippingCost.toLocaleString('id-ID')}
              </span>
            </div>
            {includeInsurance && (
              <div className="flex justify-between text-muted-foreground">
                <span>Asuransi Gadget</span>
                <span className="font-semibold text-foreground">Rp 25.000</span>
              </div>
            )}
            <div className="pt-2 border-t border-border flex justify-between text-sm font-bold text-foreground">
              <span>Total Tagihan Pembayaran</span>
              <span className="text-base text-blue-600 dark:text-blue-400">
                Rp {total.toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Memproses Pesanan & Membuka Midtrans...</span>
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4" />
                <span>Bayar Sekarang dengan Midtrans</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
