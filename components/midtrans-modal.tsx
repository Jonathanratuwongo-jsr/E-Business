'use client';

import React, { useState } from 'react';
import { QrCode, Building2, CreditCard, Copy, Check, Clock, X, Shield, ChevronDown } from 'lucide-react';
import { MidtransPaymentType, Order } from '@/lib/types';

interface MidtransModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onPaymentSuccess: (orderId: string) => void;
}

type VABankOption = {
  id: MidtransPaymentType;
  name: string;
  code: string;
  bankCode: string;
  instructions: {
    mobile: string[];
    atm: string[];
  };
};

const VA_BANKS: VABankOption[] = [
  {
    id: 'bca_va',
    name: 'BCA Virtual Account',
    code: 'BCA',
    bankCode: '80012',
    instructions: {
      mobile: [
        'Buka aplikasi BCA Mobile (m-BCA) dan pilih menu m-Transfer.',
        'Pilih BCA Virtual Account.',
        'Masukkan nomor Virtual Account yang tertera.',
        'Periksa detail nama penerima TechSecond ID dan total nominal, lalu konfirmasi dengan PIN Anda.',
      ],
      atm: [
        'Masukkan kartu ATM BCA dan PIN.',
        'Pilih Transaksi Lainnya > Transfer > Ke Rek BCA Virtual Account.',
        'Masukkan nomor Virtual Account dan konfirmasi pembayaran.',
      ],
    },
  },
  {
    id: 'mandiri_va',
    name: 'Mandiri Virtual Account (Bill Payment)',
    code: 'Mandiri',
    bankCode: '70012',
    instructions: {
      mobile: [
        'Buka Livin by Mandiri dan pilih Bayar.',
        'Cari penyedia jasa Midtrans / TechSecond atau masukkan kode perusahaan 70012.',
        'Masukkan nomor Virtual Account.',
        'Konfirmasi tagihan lalu masukkan PIN Livin Anda.',
      ],
      atm: [
        'Pilih menu Bayar/Beli > Lainnya > Multi Payment.',
        'Masukkan kode perusahaan 70012.',
        'Masukkan nomor Virtual Account dan selesaikan transaksi.',
      ],
    },
  },
  {
    id: 'bni_va',
    name: 'BNI Virtual Account',
    code: 'BNI',
    bankCode: '988',
    instructions: {
      mobile: [
        'Buka aplikasi BNI Mobile Banking dan pilih menu Transfer.',
        'Pilih Virtual Account Billing.',
        'Masukkan nomor Virtual Account.',
        'Pastikan data transaksi sudah sesuai dan masukkan Password Transaksi.',
      ],
      atm: [
        'Pilih Menu Lain > Transfer > Jenis Rekening > Ke Rekening Tabungan.',
        'Pilih Virtual Account Billing dan masukkan nomor VA.',
      ],
    },
  },
  {
    id: 'bri_va',
    name: 'BRI Virtual Account (BRIVA)',
    code: 'BRI',
    bankCode: '12800',
    instructions: {
      mobile: [
        'Buka aplikasi BRImo dan pilih menu BRIVA.',
        'Pilih Pembayaran Baru dan masukkan nomor BRIVA.',
        'Periksa detail pembayaran lalu konfirmasi PIN BRImo.',
      ],
      atm: [
        'Pilih menu Transaksi Lain > Pembayaran > Lainnya > BRIVA.',
        'Masukkan nomor BRIVA dan tekan Benar.',
      ],
    },
  },
  {
    id: 'permata_va',
    name: 'Permata Virtual Account',
    code: 'Permata',
    bankCode: '8528',
    instructions: {
      mobile: [
        'Buka PermataMobile X dan pilih menu Bayar Tagihan.',
        'Pilih Virtual Account dan masukkan nomor VA.',
        'Periksa nominal dan konfirmasi dengan otorisasi sidik jari/PIN.',
      ],
      atm: ['Pilih Transaksi Lainnya > Pembayaran > Virtual Account.', 'Masukkan nomor VA Permata.'],
    },
  },
  {
    id: 'cimb_va',
    name: 'CIMB Niaga Virtual Account',
    code: 'CIMB',
    bankCode: '5919',
    instructions: {
      mobile: [
        'Buka OCTO Mobile dan pilih menu Transfer > Rekening Ponsel / CIMB Niaga Lain.',
        'Pilih Rekening Virtual Account CIMB Niaga.',
        'Masukkan nomor VA dan selesaikan pembayaran.',
      ],
      atm: ['Pilih Pembayaran > Lanjut > Virtual Account.', 'Masukkan nomor VA CIMB Niaga.'],
    },
  },
  {
    id: 'bsi_va',
    name: 'BSI (Bank Syariah Indonesia) Virtual Account',
    code: 'BSI',
    bankCode: '9922',
    instructions: {
      mobile: [
        'Buka BSI Mobile dan pilih menu Bayar.',
        'Pilih Institusi / Virtual Account.',
        'Masukkan nomor VA BSI dan konfirmasi dengan PIN.',
      ],
      atm: ['Pilih Menu Utama > Pembayaran / Beli > Institusi / VA.', 'Masukkan nomor VA BSI.'],
    },
  },
];

export function MidtransModal({ isOpen, onClose, order, onPaymentSuccess }: MidtransModalProps) {
  const [paymentCategory, setPaymentCategory] = useState<'va' | 'qris' | 'card'>('va');
  const [selectedBank, setSelectedBank] = useState<VABankOption>(VA_BANKS[0]);
  const [activeInstructionTab, setActiveInstructionTab] = useState<'mobile' | 'atm'>('mobile');
  const [isCopied, setIsCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || !order) return null;

  const rawSuffix = (order.orderNumber.replace(/[^0-9]/g, '') || '88392101').slice(-7);
  const currentVANumber = `${selectedBank.bankCode}${rawSuffix}`;

  const handleCopyVA = () => {
    navigator.clipboard.writeText(currentVANumber);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSimulatePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onPaymentSuccess(order.id);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-zinc-200 overflow-hidden max-h-[92vh] flex flex-col font-sans">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
          <div className="flex items-center gap-2.5">
            <div className="px-2 py-0.5 border border-zinc-300 rounded text-[11px] font-bold text-zinc-800 bg-white tracking-wide">
              MIDTRANS SNAP
            </div>
            <div>
              <p className="text-xs font-serif font-bold text-zinc-900">Pembayaran Tagihan Pesanan</p>
              <p className="text-[10px] text-zinc-500 font-mono">No. Pesanan: {order.orderNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Amount & Expiration */}
        <div className="px-5 py-3.5 bg-zinc-100/50 border-b border-zinc-200 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-semibold text-zinc-500 tracking-wider">
              Total Pembayaran
            </span>
            <p className="text-lg font-bold font-mono text-zinc-900">
              Rp {order.total.toLocaleString('id-ID')}
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-700 font-mono bg-white border border-zinc-200 px-2.5 py-1 rounded">
            <Clock className="w-3.5 h-3.5 text-zinc-500" />
            <span>Berlaku 24 Jam</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Main Category Tabs: Virtual Account (Semua Bank), QRIS, Kartu Kredit */}
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-zinc-100 rounded-lg border border-zinc-200">
            <button
              type="button"
              onClick={() => setPaymentCategory('va')}
              className={`py-1.5 px-2 text-xs font-medium rounded transition-colors ${
                paymentCategory === 'va'
                  ? 'bg-white text-zinc-900 shadow-xs font-semibold'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Virtual Account
            </button>
            <button
              type="button"
              onClick={() => setPaymentCategory('qris')}
              className={`py-1.5 px-2 text-xs font-medium rounded transition-colors ${
                paymentCategory === 'qris'
                  ? 'bg-white text-zinc-900 shadow-xs font-semibold'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              QRIS
            </button>
            <button
              type="button"
              onClick={() => setPaymentCategory('card')}
              className={`py-1.5 px-2 text-xs font-medium rounded transition-colors ${
                paymentCategory === 'card'
                  ? 'bg-white text-zinc-900 shadow-xs font-semibold'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Kartu Kredit
            </button>
          </div>

          {/* VIRTUAL ACCOUNT SECTION: All banks selectable */}
          {paymentCategory === 'va' && (
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                  Pilih Bank Virtual Account:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {VA_BANKS.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setSelectedBank(b)}
                      className={`py-2 px-2.5 rounded-lg border text-left transition-colors flex items-center justify-between ${
                        selectedBank.id === b.id
                          ? 'border-zinc-900 bg-zinc-900 text-white'
                          : 'border-zinc-200 bg-white text-zinc-800 hover:border-zinc-300'
                      }`}
                    >
                      <span className="font-bold text-xs">{b.code}</span>
                      <Building2 className="w-3.5 h-3.5 opacity-70" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Display VA Number Box */}
              <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-lg space-y-2">
                <div className="flex items-center justify-between text-zinc-600 text-[11px]">
                  <span>Nomor {selectedBank.name}</span>
                  <span className="text-zinc-500 font-mono">Kode: {selectedBank.bankCode}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-base sm:text-lg font-mono font-bold tracking-wider text-zinc-900 select-all">
                    {currentVANumber}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyVA}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-zinc-300 hover:bg-zinc-100 rounded text-xs font-medium text-zinc-800 transition-colors"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-zinc-800" />
                        <span>Tersalin</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[10px] text-zinc-500">
                  Nama Penerima: <strong>TechSecond ID - PT Elektronik Rekondisi</strong>
                </p>
              </div>

              {/* Instructions per bank */}
              <div className="space-y-2">
                <div className="flex gap-2 border-b border-zinc-200 pb-1.5">
                  <button
                    type="button"
                    onClick={() => setActiveInstructionTab('mobile')}
                    className={`text-xs pb-1 font-medium transition-colors border-b-2 -mb-2 ${
                      activeInstructionTab === 'mobile'
                        ? 'border-zinc-900 text-zinc-900 font-bold'
                        : 'border-transparent text-zinc-500 hover:text-zinc-800'
                    }`}
                  >
                    Petunjuk Mobile Banking
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveInstructionTab('atm')}
                    className={`text-xs pb-1 font-medium transition-colors border-b-2 -mb-2 ${
                      activeInstructionTab === 'atm'
                        ? 'border-zinc-900 text-zinc-900 font-bold'
                        : 'border-transparent text-zinc-500 hover:text-zinc-800'
                    }`}
                  >
                    Petunjuk ATM
                  </button>
                </div>

                <ol className="list-decimal list-inside space-y-1 text-zinc-600 text-[11px] pt-1">
                  {selectedBank.instructions[activeInstructionTab].map((step, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}

          {/* QRIS SECTION */}
          {paymentCategory === 'qris' && (
            <div className="space-y-3 text-center py-2">
              <div className="w-48 h-48 mx-auto bg-white border-2 border-zinc-200 rounded-lg p-2 flex flex-col items-center justify-center">
                <QrCode className="w-36 h-36 text-zinc-900" />
                <span className="text-[10px] font-mono text-zinc-500 mt-1">QRIS STANDAR NASIONAL</span>
              </div>
              <p className="text-[11px] text-zinc-600 max-w-xs mx-auto">
                Pindai kode QRIS di atas menggunakan aplikasi mobile banking atau dompet digital Anda (GoPay, OVO, ShopeePay, DANA, BCA, Livin).
              </p>
            </div>
          )}

          {/* CREDIT CARD SECTION */}
          {paymentCategory === 'card' && (
            <div className="space-y-3 text-left py-1">
              <div>
                <label className="block text-[11px] font-medium text-zinc-700 mb-1">
                  Nomor Kartu Kredit / Debit
                </label>
                <input
                  type="text"
                  placeholder="4000 1234 5678 9010"
                  className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-md bg-white font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-700 mb-1">Masa Berlaku</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-md bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-zinc-700 mb-1">CVV</label>
                  <input
                    type="password"
                    placeholder="123"
                    maxLength={4}
                    className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-md bg-white font-mono"
                  />
                </div>
              </div>
              <p className="text-[10px] text-zinc-500">
                Didukung 3D-Secure OTP untuk keamanan transaksi Anda.
              </p>
            </div>
          )}

          {/* Simulation button for testing */}
          <div className="pt-2 border-t border-zinc-200">
            <button
              type="button"
              onClick={handleSimulatePayment}
              disabled={isProcessing}
              className="w-full py-2.5 px-4 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isProcessing ? (
                <span>Menghubungi Midtrans Simulator...</span>
              ) : (
                <span>Simulasikan Pembayaran Berhasil (Uji Coba Sandbox)</span>
              )}
            </button>
            <p className="text-center text-[10px] text-zinc-400 mt-1.5">
              Midtrans Payment Sandbox Mode
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
