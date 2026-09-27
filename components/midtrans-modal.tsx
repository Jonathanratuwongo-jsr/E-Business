'use client';

import React, { useState } from 'react';
import { QrCode, CreditCard, Building2, CheckCircle2, Copy, ShieldCheck, Clock, X } from 'lucide-react';
import { MidtransPaymentType, Order } from '@/lib/types';

interface MidtransModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onPaymentSuccess: (orderId: string) => void;
}

export function MidtransModal({ isOpen, onClose, order, onPaymentSuccess }: MidtransModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<MidtransPaymentType>('qris');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen || !order) return null;

  const vaNumber = `827708${order.orderNumber.replace(/[^0-9]/g, '').slice(-8) || '12345678'}`;

  const handleSimulateSuccess = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onPaymentSuccess(order.id);
    }, 1200);
  };

  const handleCopyVA = () => {
    navigator.clipboard.writeText(vaNumber);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-background rounded-2xl shadow-2xl border border-border overflow-hidden">
        {/* Midtrans Snap Header */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white px-2 py-1 rounded text-blue-900 font-black text-xs tracking-wider flex items-center gap-1 shadow-sm">
              <span className="text-blue-600 font-extrabold text-sm">mid</span>trans
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold bg-blue-500/40 border border-blue-300/30 px-2 py-0.5 rounded-full">
                  SNAP Secure Gateway
                </span>
                <span className="text-xs bg-amber-400 text-amber-950 font-bold px-2 py-0.5 rounded-full">
                  Sandbox Active
                </span>
              </div>
              <p className="text-xs text-blue-100 mt-0.5 font-mono">No. {order.orderNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Amount & Countdown banner */}
        <div className="bg-blue-50/70 dark:bg-blue-950/30 px-5 py-3 border-b border-border flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium">Total Tagihan</p>
            <p className="text-xl font-bold text-foreground">
              Rp {order.total.toLocaleString('id-ID')}
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 px-2.5 py-1 rounded-lg">
            <Clock className="w-3.5 h-3.5" />
            <span>Selesaikan dalam 23:59:45</span>
          </div>
        </div>

        {/* Payment Methods Nav */}
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">
              Pilih Metode Pembayaran
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedMethod('qris')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                  selectedMethod === 'qris'
                    ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 shadow-sm ring-1 ring-blue-600'
                    : 'border-border hover:bg-muted/50 text-foreground'
                }`}
              >
                <QrCode className="w-5 h-5 mb-1" />
                <span className="text-xs font-bold">QRIS Instant</span>
                <span className="text-[10px] text-muted-foreground">GoPay, OVO, Shopee</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('bca_va')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                  selectedMethod === 'bca_va'
                    ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 shadow-sm ring-1 ring-blue-600'
                    : 'border-border hover:bg-muted/50 text-foreground'
                }`}
              >
                <Building2 className="w-5 h-5 mb-1" />
                <span className="text-xs font-bold">BCA VA</span>
                <span className="text-[10px] text-muted-foreground">Virtual Account</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('credit_card')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                  selectedMethod === 'credit_card'
                    ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 shadow-sm ring-1 ring-blue-600'
                    : 'border-border hover:bg-muted/50 text-foreground'
                }`}
              >
                <CreditCard className="w-5 h-5 mb-1" />
                <span className="text-xs font-bold">Kartu Kredit</span>
                <span className="text-[10px] text-muted-foreground">Visa, Mastercard</span>
              </button>
            </div>
          </div>

          {/* Tab Content: QRIS */}
          {selectedMethod === 'qris' && (
            <div className="bg-card border border-border rounded-xl p-4 flex flex-col items-center text-center space-y-3">
              <div className="flex items-center justify-center gap-2 text-xs font-bold text-muted-foreground">
                <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded font-black text-[11px]">QRIS</span>
                <span>Didukung semua e-Wallet & m-Banking</span>
              </div>
              <div className="bg-white p-3 rounded-xl border shadow-inner">
                {/* Simulated QR Code SVG */}
                <div className="w-48 h-48 bg-gray-900 rounded-lg p-2 flex flex-col items-center justify-center relative overflow-hidden">
                  <div className="w-full h-full bg-white p-2 rounded flex flex-col justify-between">
                    <div className="flex justify-between">
                      <div className="w-8 h-8 bg-black rounded-sm p-1"><div className="w-full h-full bg-white p-1"><div className="w-full h-full bg-black"></div></div></div>
                      <div className="w-8 h-8 bg-black rounded-sm p-1"><div className="w-full h-full bg-white p-1"><div className="w-full h-full bg-black"></div></div></div>
                    </div>
                    <div className="flex items-center justify-center">
                      <div className="w-9 h-9 bg-red-600 rounded-md flex items-center justify-center text-white font-black text-[10px]">
                        QRIS
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <div className="w-8 h-8 bg-black rounded-sm p-1"><div className="w-full h-full bg-white p-1"><div className="w-full h-full bg-black"></div></div></div>
                      <div className="grid grid-cols-2 gap-1 w-8 h-8">
                        <div className="bg-black"></div>
                        <div className="bg-black"></div>
                        <div className="bg-black"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Scan kode QR di atas menggunakan GoPay, ShopeePay, DANA, OVO, atau BCA Mobile
              </p>
            </div>
          )}

          {/* Tab Content: Virtual Account */}
          {selectedMethod === 'bca_va' && (
            <div className="bg-card border border-border rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Nomor Virtual Account BCA</p>
                  <p className="text-lg font-mono font-bold text-foreground tracking-wider">{vaNumber}</p>
                </div>
                <button
                  onClick={handleCopyVA}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-border bg-muted/60 hover:bg-muted text-foreground transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {isCopied ? 'Tersalin!' : 'Salin'}
                </button>
              </div>
              <div className="pt-2 border-t border-border text-xs text-muted-foreground space-y-1.5">
                <p className="font-semibold text-foreground">Petunjuk Pembayaran m-BCA:</p>
                <ol className="list-decimal pl-4 space-y-0.5">
                  <li>Pilih menu <strong>m-Transfer</strong> {'>'} <strong>BCA Virtual Account</strong></li>
                  <li>Masukkan nomor VA <strong>{vaNumber}</strong></li>
                  <li>Pastikan nama merchant: <strong>TECHSECOND ID</strong></li>
                  <li>Masukkan PIN m-BCA Anda dan pembayaran selesai otomatis</li>
                </ol>
              </div>
            </div>
          )}

          {/* Tab Content: Credit Card */}
          {selectedMethod === 'credit_card' && (
            <div className="bg-card border border-border rounded-xl p-4 space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Nomor Kartu Kredit</label>
                <input
                  type="text"
                  placeholder="4000 0012 3456 7890"
                  defaultValue="4000 0012 3456 7890"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background font-mono"
                  readOnly
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Masa Berlaku</label>
                  <input
                    type="text"
                    defaultValue="12/28"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background font-mono"
                    readOnly
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">CVV</label>
                  <input
                    type="text"
                    defaultValue="123"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background font-mono"
                    readOnly
                  />
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Terlindungi oleh 3D Secure OTP & PCI-DSS Level 1 Midtrans
              </p>
            </div>
          )}

          {/* Simulator Action Button */}
          <div className="pt-2">
            <button
              onClick={handleSimulateSuccess}
              disabled={isProcessing}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 hover:shadow-lg disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Memverifikasi Pembayaran Midtrans...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Simulasikan Pembayaran Berhasil (Sandbox)</span>
                </>
              )}
            </button>
            <p className="text-center text-[11px] text-muted-foreground mt-2">
              Klik tombol di atas untuk simulasi webhook sukses dari server Midtrans.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-muted/40 p-3 px-5 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> Transaksi Terenkripsi 256-bit
          </span>
          <span>Midtrans Payment Gateway</span>
        </div>
      </div>
    </div>
  );
}
