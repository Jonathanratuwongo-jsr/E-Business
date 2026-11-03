'use client';

import React, { useState, useEffect } from 'react';
import { CustomerProfile, CRMMetrics, RetentionVoucher, RetentionActivity, CustomerSegment, Order } from '@/lib/types';
import {
  Users,
  Repeat,
  DollarSign,
  Award,
  Sparkles,
  TrendingUp,
  Search,
  Filter,
  Mail,
  Send,
  Eye,
  Calendar,
  Phone,
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle,
  Gift,
  Tag,
  FileText,
  X,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  Info,
  Package,
} from 'lucide-react';

export function CRMDashboard() {
  const [metrics, setMetrics] = useState<CRMMetrics | null>(null);
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [vouchers, setVouchers] = useState<RetentionVoucher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSegment, setSelectedSegment] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState('');

  // Customer Detail Modal
  const [selectedCustomerEmail, setSelectedCustomerEmail] = useState<string | null>(null);
  const [customerDetail, setCustomerDetail] = useState<{ customer: CustomerProfile; orders: Order[] } | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [activeDetailTab, setActiveDetailTab] = useState<'profile' | 'orders' | 'activities'>('profile');

  // Customer Notes & Points Edit
  const [editNotes, setEditNotes] = useState('');
  const [pointsAdjustment, setPointsAdjustment] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  // Retention Email Modal
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailTarget, setEmailTarget] = useState<{ type: 'single' | 'segment'; email?: string; name?: string; segment?: CustomerSegment }>({
    type: 'single',
  });
  const [emailTemplate, setEmailTemplate] = useState<'welcome_onboarding' | 'loyal_vip_reward' | 'winback_reactivation' | 'custom'>('welcome_onboarding');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailCustomMessage, setEmailCustomMessage] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  const fetchCRMData = async () => {
    setIsLoading(true);
    try {
      const [resMetrics, resCustomers, resVouchers] = await Promise.all([
        fetch('/api/crm/metrics').then((r) => r.json()),
        fetch('/api/crm/customers').then((r) => r.json()),
        fetch('/api/crm/retention').then((r) => r.json()),
      ]);

      if (resMetrics.success) setMetrics(resMetrics.data);
      if (resCustomers.success) setCustomers(resCustomers.data);
      if (resVouchers.success && resVouchers.data?.vouchers) setVouchers(resVouchers.data.vouchers);
    } catch (err) {
      console.error('Error fetching CRM data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCRMData();
  }, []);

  // Fetch single customer detail
  const openCustomerDetail = async (email: string) => {
    setSelectedCustomerEmail(email);
    setIsLoadingDetail(true);
    setActiveDetailTab('profile');
    try {
      const res = await fetch(`/api/crm/customers/${encodeURIComponent(email)}`);
      const data = await res.json();
      if (data.success && data.data) {
        setCustomerDetail(data.data);
        setEditNotes(data.data.customer.notes || '');
      }
    } catch (err) {
      console.error('Error loading customer detail:', err);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!customerDetail) return;
    setIsSavingNotes(true);
    try {
      const res = await fetch(`/api/crm/customers/${encodeURIComponent(customerDetail.customer.email)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes: editNotes,
          pointsDelta: pointsAdjustment ? parseInt(pointsAdjustment, 10) : 0,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCustomerDetail((prev) => (prev ? { ...prev, customer: data.data } : null));
        setPointsAdjustment('');
        showNotification('Catatan CRM & Poin pelanggan berhasil diperbarui!');
        fetchCRMData();
      }
    } catch {
      alert('Gagal menyimpan catatan CRM.');
    } finally {
      setIsSavingNotes(false);
    }
  };

  const showNotification = (msg: string) => {
    setActionSuccessMessage(msg);
    setTimeout(() => setActionSuccessMessage(null), 4000);
  };

  // Open Email Modal
  const openSingleEmailModal = (customer: CustomerProfile) => {
    setEmailTarget({
      type: 'single',
      email: customer.email,
      name: customer.name,
      segment: customer.segment,
    });

    if (customer.segment === 'Pelanggan Loyal') {
      setEmailTemplate('loyal_vip_reward');
      setEmailSubject(`Apresiasi Spesial Member VIP TechSecond ID: Bonus 50 Poin & Diskon 10%`);
    } else if (customer.segment === 'Pelanggan Tidak Aktif') {
      setEmailTemplate('winback_reactivation');
      setEmailSubject(`Kami Rindu Anda di TechSecond ID — Diskon Spesial Rp 100.000 untuk Anda`);
    } else {
      setEmailTemplate('welcome_onboarding');
      setEmailSubject(`Selamat Datang di TechSecond ID — Voucher Sambutan Rp 50.000`);
    }
    setIsEmailModalOpen(true);
  };

  const openSegmentBroadcastModal = (segment: CustomerSegment) => {
    setEmailTarget({
      type: 'segment',
      segment,
    });
    if (segment === 'Pelanggan Loyal') {
      setEmailTemplate('loyal_vip_reward');
      setEmailSubject(`Apresiasi Spesial Member VIP TechSecond ID`);
    } else if (segment === 'Pelanggan Tidak Aktif') {
      setEmailTemplate('winback_reactivation');
      setEmailSubject(`Penaung Rindu TechSecond ID: Voucher Winback Reaktivasi`);
    } else {
      setEmailTemplate('welcome_onboarding');
      setEmailSubject(`Voucher Spesial Sambutan Pelanggan Baru TechSecond ID`);
    }
    setIsEmailModalOpen(true);
  };

  const handleSendRetentionAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSendingEmail(true);
    try {
      const payload: any = {
        action: 'send_email',
        templateType: emailTemplate,
        title: emailSubject,
        message: emailCustomMessage,
      };

      if (emailTarget.type === 'segment') {
        payload.segment = emailTarget.segment;
      } else {
        payload.customerEmail = emailTarget.email;
      }

      const res = await fetch('/api/crm/retention', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setIsEmailModalOpen(false);
        showNotification(data.message || 'Aksi retensi berhasil diproses!');
        fetchCRMData();
        if (selectedCustomerEmail && emailTarget.email === selectedCustomerEmail) {
          openCustomerDetail(selectedCustomerEmail);
        }
      } else {
        alert(data.error || 'Gagal mengirim aksi retensi.');
      }
    } catch {
      alert('Terjadi kesalahan koneksi.');
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Filtered customer list
  const filteredCustomers = customers.filter((c) => {
    const matchSegment = selectedSegment === 'Semua' || c.segment === selectedSegment;
    const matchQuery =
      !searchQuery.trim() ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      c.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchSegment && matchQuery;
  });

  return (
    <div className="space-y-8 font-sans">
      {/* Toast Notification */}
      {actionSuccessMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-900 text-white px-4 py-3 rounded-lg shadow-xl border border-zinc-700 flex items-center gap-3 text-xs animate-in slide-in-from-bottom-2">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionSuccessMessage}</span>
          <button onClick={() => setActionSuccessMessage(null)} className="ml-2 text-zinc-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Banner / Explanation of CRM Integration */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 text-white rounded-xl shadow-xs border border-zinc-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-zinc-700 text-zinc-200">
              CRM Engine v2.0
            </span>
            <span className="text-[11px] text-zinc-400">Customer Relationship & Retention Management</span>
          </div>
          <h2 className="text-lg font-serif font-bold text-white tracking-tight">
            Dashboard Metrik & Retensi Pelanggan TechSecond ID
          </h2>
          <p className="text-xs text-zinc-300 mt-1 max-w-2xl leading-relaxed">
            Pantau profil pelanggan, aturan segmentasi RFM transparan, otomatisasi poin loyalitas, serta kirim promo tertarget dan email follow-up untuk meningkatkan retensi pembeli elektronik bekas.
          </p>
        </div>

        <button
          onClick={fetchCRMData}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-colors shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Segarkan Metrik</span>
        </button>
      </div>

      {/* ==================== 1. DASHBOARD METRIK (KPI UTAMA) ==================== */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-700 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-zinc-900" />
              <span>Metrik Utama CRM (Key Performance Indicators)</span>
            </h3>
            <p className="text-[11px] text-zinc-500">
              Dihitung real-time dari data transaksi dan histori belanja pelanggan
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Metrik 1: Jumlah Pelanggan */}
          <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs relative overflow-hidden group hover:border-zinc-400 transition-colors">
            <div className="flex items-center justify-between text-zinc-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">1. Jumlah Pelanggan</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-serif text-zinc-900">
                {metrics ? metrics.totalCustomers : '...'}
              </span>
              <span className="text-xs text-zinc-500">Orang Terdata</span>
            </div>
            <div className="mt-3 pt-3 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-500">
              <span>Aktif Berbelanja:</span>
              <span className="font-semibold text-zinc-800">
                {metrics ? `${metrics.activeOrderingCustomers} Pelanggan` : '-'}
              </span>
            </div>
          </div>

          {/* Metrik 2: Repeat Purchase Rate */}
          <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs relative overflow-hidden group hover:border-zinc-400 transition-colors">
            <div className="flex items-center justify-between text-zinc-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">2. Repeat Purchase Rate</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Repeat className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-serif text-emerald-600">
                {metrics ? `${metrics.repeatPurchaseRate}%` : '...'}
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                Sehat (&gt;25%)
              </span>
            </div>
            <div className="mt-3 pt-3 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-500">
              <span>Formula:</span>
              <span className="font-mono text-zinc-700">
                {metrics ? `${metrics.repeatCustomers}/${metrics.activeOrderingCustomers} Pembeli Repeat` : '-'}
              </span>
            </div>
          </div>

          {/* Metrik 3: Rata-rata Nilai Order (AOV) */}
          <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs relative overflow-hidden group hover:border-zinc-400 transition-colors">
            <div className="flex items-center justify-between text-zinc-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">3. Rata-rata Nilai Order</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold font-serif text-zinc-900">
                {metrics ? `Rp ${metrics.averageOrderValue.toLocaleString('id-ID')}` : '...'}
              </span>
            </div>
            <div className="mt-3 pt-3 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-500">
              <span>Total Volume:</span>
              <span className="font-semibold text-zinc-800">
                {metrics ? `${metrics.totalOrders} Pesanan Selesai` : '-'}
              </span>
            </div>
          </div>

          {/* Metrik 4: Nilai Poin Loyalitas Beredar */}
          <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs relative overflow-hidden group hover:border-zinc-400 transition-colors">
            <div className="flex items-center justify-between text-zinc-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">4. Poin Loyalitas Beredar</span>
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-serif text-zinc-900">
                {metrics ? `${metrics.totalLoyaltyPointsIssued.toLocaleString('id-ID')} Pts` : '...'}
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">
                {metrics ? `≈ Rp ${(metrics.totalLoyaltyPointsIssued * 100).toLocaleString('id-ID')}` : ''}
              </span>
            </div>
            <div className="mt-3 pt-3 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-500">
              <span>Telah Ditebus:</span>
              <span className="font-semibold text-purple-700">
                {metrics ? `${metrics.totalLoyaltyPointsRedeemed} Poin Terpakai` : '-'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== 2. SEGMENTASI 3 KELOMPOK DENGAN ATURAN JELAS ==================== */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-700 flex items-center gap-2">
              <Filter className="w-4 h-4 text-zinc-900" />
              <span>Segmentasi Pelanggan (Aturan Klasifikasi RFM Jelas)</span>
            </h3>
            <p className="text-[11px] text-zinc-500">
              Pelanggan dikelompokkan ke dalam 3 segmen dengan kriteria transparan untuk aksi retensi terarah.
            </p>
          </div>
          <div className="text-xs text-zinc-500">
            Klik kartu segmen di bawah untuk memfilter daftar pelanggan.
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Segmen 1: Pelanggan Baru */}
          <div
            onClick={() => setSelectedSegment(selectedSegment === 'Pelanggan Baru' ? 'Semua' : 'Pelanggan Baru')}
            className={`cursor-pointer rounded-xl p-5 border transition-all ${
              selectedSegment === 'Pelanggan Baru'
                ? 'border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/30'
                : 'border-zinc-200 bg-white hover:border-zinc-300'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                1. Pelanggan Baru
              </span>
              <span className="text-xs font-mono font-bold text-blue-700">
                {metrics?.segmentBreakdown.find((s) => s.segment === 'Pelanggan Baru')?.count || 0} Akun (
                {metrics?.segmentBreakdown.find((s) => s.segment === 'Pelanggan Baru')?.percentage || 0}%)
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <p className="font-semibold text-zinc-900 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>Aturan Kriteria:</span>
                </p>
                <p className="text-[11px] text-zinc-600 bg-zinc-50 p-2 rounded mt-1 border border-zinc-200 font-mono">
                  Total Order = 1 kali ATAU Terdaftar ≤ 30 hari.
                </p>
              </div>

              <div>
                <p className="font-semibold text-zinc-900">Fokus & Rekomendasi Retensi:</p>
                <p className="text-[11px] text-zinc-600">
                  Onboarding pembeli pertama, edukasi garansi toko 90 hari, dan pemberian voucher diskon khusus pembelian ke-2 (<strong>BARUHEMAT50</strong>).
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  openSegmentBroadcastModal('Pelanggan Baru');
                }}
                className="text-[11px] font-semibold text-blue-700 hover:text-blue-900 inline-flex items-center gap-1"
              >
                <Send className="w-3 h-3" />
                <span>Broadcast Sambutan</span>
              </button>
              <span className="text-[10px] text-zinc-400">Filter Segmen →</span>
            </div>
          </div>

          {/* Segmen 2: Pelanggan Loyal */}
          <div
            onClick={() => setSelectedSegment(selectedSegment === 'Pelanggan Loyal' ? 'Semua' : 'Pelanggan Loyal')}
            className={`cursor-pointer rounded-xl p-5 border transition-all ${
              selectedSegment === 'Pelanggan Loyal'
                ? 'border-emerald-600 ring-2 ring-emerald-500/20 bg-emerald-50/30'
                : 'border-zinc-200 bg-white hover:border-zinc-300'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>2. Pelanggan Loyal</span>
              </span>
              <span className="text-xs font-mono font-bold text-emerald-700">
                {metrics?.segmentBreakdown.find((s) => s.segment === 'Pelanggan Loyal')?.count || 0} Akun (
                {metrics?.segmentBreakdown.find((s) => s.segment === 'Pelanggan Loyal')?.percentage || 0}%)
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <p className="font-semibold text-zinc-900 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Aturan Kriteria:</span>
                </p>
                <p className="text-[11px] text-zinc-600 bg-zinc-50 p-2 rounded mt-1 border border-zinc-200 font-mono">
                  Order ≥ 2 Kali DAN Total Belanja ≥ Rp 10.000.000.
                </p>
              </div>

              <div>
                <p className="font-semibold text-zinc-900">Fokus & Rekomendasi Retensi:</p>
                <p className="text-[11px] text-zinc-600">
                  Program VIP Loyalty: Hak penukaran poin 1.5x multiplier, prioritas klaim garansi, dan kode promo eksklusif 10% (<strong>LOYALVIP10</strong>).
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  openSegmentBroadcastModal('Pelanggan Loyal');
                }}
                className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 inline-flex items-center gap-1"
              >
                <Send className="w-3 h-3" />
                <span>Kirim Reward VIP</span>
              </button>
              <span className="text-[10px] text-zinc-400">Filter Segmen →</span>
            </div>
          </div>

          {/* Segmen 3: Pelanggan Tidak Aktif */}
          <div
            onClick={() => setSelectedSegment(selectedSegment === 'Pelanggan Tidak Aktif' ? 'Semua' : 'Pelanggan Tidak Aktif')}
            className={`cursor-pointer rounded-xl p-5 border transition-all ${
              selectedSegment === 'Pelanggan Tidak Aktif'
                ? 'border-red-600 ring-2 ring-red-500/20 bg-red-50/30'
                : 'border-zinc-200 bg-white hover:border-zinc-300'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                <span>3. Pelanggan Tidak Aktif</span>
              </span>
              <span className="text-xs font-mono font-bold text-red-700">
                {metrics?.segmentBreakdown.find((s) => s.segment === 'Pelanggan Tidak Aktif')?.count || 0} Akun (
                {metrics?.segmentBreakdown.find((s) => s.segment === 'Pelanggan Tidak Aktif')?.percentage || 0}%)
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <p className="font-semibold text-zinc-900 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-red-600" />
                  <span>Aturan Kriteria:</span>
                </p>
                <p className="text-[11px] text-zinc-600 bg-zinc-50 p-2 rounded mt-1 border border-zinc-200 font-mono">
                  Tidak ada order baru selama &gt; 45 hari (At-Risk Churn).
                </p>
              </div>

              <div>
                <p className="font-semibold text-zinc-900">Fokus & Rekomendasi Retensi:</p>
                <p className="text-[11px] text-zinc-600">
                  Kampanye Reaktivasi Winback: Kirim email reminder follow-up personal dan voucher potong langsung Rp 100.000 (<strong>COMEBACK100</strong>).
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  openSegmentBroadcastModal('Pelanggan Tidak Aktif');
                }}
                className="text-[11px] font-semibold text-red-700 hover:text-red-900 inline-flex items-center gap-1"
              >
                <Send className="w-3 h-3" />
                <span>Kirim Winback Email</span>
              </button>
              <span className="text-[10px] text-zinc-400">Filter Segmen →</span>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== 3. AKSI RETENSI YANG BERJALAN ==================== */}
      <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-200 pb-3">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900 flex items-center gap-2">
              <Gift className="w-4 h-4 text-zinc-800" />
              <span>Aksi Retensi yang Berjalan (Active Retention Programs)</span>
            </h3>
            <p className="text-[11px] text-zinc-500">
              Tiga instrumen retensi aktif: Promo Tertarget, Email Follow-up Terjadwal, dan Poin Loyalitas Otomatis.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Retention Action 1: Targeted Promos */}
          <div className="bg-white p-4 rounded-lg border border-zinc-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-zinc-900 flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-blue-600" />
                <span>1. Promo Tertarget Segmen</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-blue-100 text-blue-800 font-bold">
                Aktif di Checkout
              </span>
            </div>
            <p className="text-[11px] text-zinc-600 leading-relaxed">
              Voucher divalidasi langsung di formulir checkout. Sistem menolak penggunaan kupon yang tidak sesuai dengan segmen akun pelanggan.
            </p>
            <div className="space-y-1.5 pt-1">
              {vouchers.slice(0, 3).map((v) => (
                <div
                  key={v.code}
                  className="p-2 rounded bg-zinc-50 border border-zinc-200 flex items-center justify-between text-[11px]"
                >
                  <div>
                    <span className="font-mono font-bold text-zinc-900">{v.code}</span>
                    <p className="text-[10px] text-zinc-500">Target: {v.targetSegment}</p>
                  </div>
                  <span className="font-semibold text-emerald-700">
                    {v.discountType === 'fixed'
                      ? `Rp ${v.discountValue.toLocaleString('id-ID')}`
                      : `${v.discountValue}%`}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Retention Action 2: Retention Email & Follow-up */}
          <div className="bg-white p-4 rounded-lg border border-zinc-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-zinc-900 flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-amber-600" />
                <span>2. Email Follow-up & Reaktivasi</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-amber-100 text-amber-800 font-bold">
                Template Siap
              </span>
            </div>
            <p className="text-[11px] text-zinc-600 leading-relaxed">
              Kirim email follow-up personal atau blast per segmen dengan template HTML resmi TechSecond ID. Riwayat interaksi tersimpan di kartu profil pelanggan.
            </p>
            <div className="space-y-1.5 pt-1 text-[11px]">
              <div className="p-2 rounded bg-zinc-50 border border-zinc-200">
                <p className="font-semibold text-zinc-900">Template Onboarding:</p>
                <p className="text-[10px] text-zinc-500">Panduan rawat unit & voucher kedua.</p>
              </div>
              <div className="p-2 rounded bg-zinc-50 border border-zinc-200">
                <p className="font-semibold text-zinc-900">Template Reaktivasi Winback:</p>
                <p className="text-[10px] text-zinc-500">Pengingat & voucher diskon Rp 100.000.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => openSegmentBroadcastModal('Pelanggan Tidak Aktif')}
              className="w-full py-2 bg-zinc-900 text-white rounded-md text-[11px] font-semibold hover:bg-zinc-800 transition-colors flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Buka Tool Follow-up CRM</span>
            </button>
          </div>

          {/* Retention Action 3: Loyalty Points System */}
          <div className="bg-white p-4 rounded-lg border border-zinc-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-zinc-900 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-purple-600" />
                <span>3. Poin Loyalitas Pembeli</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-purple-100 text-purple-800 font-bold">
                Otomatis
              </span>
            </div>
            <p className="text-[11px] text-zinc-600 leading-relaxed">
              Setiap Rp 10.000 transaksi mendapatkan 1 poin. Nilai 1 poin setara Rp 100 potongan belanja langsung di checkout. Pelanggan Loyal mendapat bonus 1.5x multiplier.
            </p>
            <div className="p-2.5 rounded bg-purple-50/60 border border-purple-200 text-[11px] space-y-1">
              <div className="flex justify-between">
                <span className="text-zinc-600">Rate Reguler:</span>
                <span className="font-bold text-zinc-900">1 Poin / Rp 10.000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600">Rate Member Loyal:</span>
                <span className="font-bold text-purple-700">1.5 Poin / Rp 10.000 (1.5x)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600">Nilai Tukar Poin:</span>
                <span className="font-bold text-emerald-700">1 Pts = Rp 100 Diskon</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== 4. DIREKTORI & TABEL PELANGGAN ==================== */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-serif font-bold text-zinc-900">
              Direktori Profil Pelanggan ({filteredCustomers.length})
            </h3>
            <p className="text-xs text-zinc-500">
              Daftar seluruh pelanggan terdaftar beserta metrik individu, segmen, riwayat transaksi, dan catatan CRM.
            </p>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Cari nama, email, hp..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-white border border-zinc-300 rounded-md focus:outline-none focus:border-zinc-900 w-48 sm:w-60"
              />
            </div>

            <select
              value={selectedSegment}
              onChange={(e) => setSelectedSegment(e.target.value)}
              className="text-xs border border-zinc-300 rounded-md px-2.5 py-1.5 bg-white text-zinc-800 focus:outline-none focus:border-zinc-900"
            >
              <option value="Semua">Semua Segmen</option>
              <option value="Pelanggan Baru">Pelanggan Baru</option>
              <option value="Pelanggan Loyal">Pelanggan Loyal</option>
              <option value="Pelanggan Tidak Aktif">Pelanggan Tidak Aktif</option>
            </select>
          </div>
        </div>

        {/* Customer Table */}
        <div className="border border-zinc-200 rounded-xl overflow-hidden bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 uppercase text-[10px] tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Pelanggan</th>
                  <th className="py-3 px-4">Segmen & Aturan</th>
                  <th className="py-3 px-4 text-center">Total Order</th>
                  <th className="py-3 px-4 text-right">Akumulasi Belanja</th>
                  <th className="py-3 px-4 text-right">AOV Pribadi</th>
                  <th className="py-3 px-4 text-center">Poin Loyalitas</th>
                  <th className="py-3 px-4">Terakhir Belanja</th>
                  <th className="py-3 px-4 text-right">Aksi CRM</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-zinc-500">
                      Tidak ada pelanggan yang cocok dengan kriteria filter saat ini.
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((cust) => {
                    const isLoyal = cust.segment === 'Pelanggan Loyal';
                    const isNew = cust.segment === 'Pelanggan Baru';
                    const isInactive = cust.segment === 'Pelanggan Tidak Aktif';

                    return (
                      <tr key={cust.id} className="hover:bg-zinc-50/80 transition-colors">
                        {/* Name & Email */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={cust.avatar}
                              alt={cust.name}
                              className="w-8 h-8 rounded-full border border-zinc-300 object-cover"
                            />
                            <div>
                              <p className="font-semibold text-zinc-900">{cust.name}</p>
                              <p className="text-[11px] text-zinc-500 font-mono">{cust.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Segment Badge with Rule Reason */}
                        <td className="py-3 px-4">
                          <div>
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${
                                isLoyal
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : isNew
                                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                                  : 'bg-red-50 text-red-700 border-red-200'
                              }`}
                            >
                              {isLoyal && <Sparkles className="w-3 h-3" />}
                              {isInactive && <AlertTriangle className="w-3 h-3" />}
                              <span>{cust.segment}</span>
                            </span>
                            <p className="text-[10px] text-zinc-500 mt-1 truncate max-w-[200px]" title={cust.segmentReason}>
                              {cust.segmentReason}
                            </p>
                          </div>
                        </td>

                        {/* Total Orders */}
                        <td className="py-3 px-4 text-center">
                          <span className="font-bold text-zinc-900">{cust.totalOrders}x</span>
                          <p className="text-[10px] text-zinc-400">selesai</p>
                        </td>

                        {/* Total Spent */}
                        <td className="py-3 px-4 text-right font-medium text-zinc-900 font-mono">
                          Rp {cust.totalSpent.toLocaleString('id-ID')}
                        </td>

                        {/* Personal AOV */}
                        <td className="py-3 px-4 text-right font-mono text-zinc-700">
                          Rp {cust.averageOrderValue.toLocaleString('id-ID')}
                        </td>

                        {/* Loyalty Points */}
                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex items-center gap-1 font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded text-[11px]">
                            <Award className="w-3 h-3" />
                            <span>{cust.loyaltyPoints}</span>
                          </span>
                        </td>

                        {/* Last Order Date */}
                        <td className="py-3 px-4 text-[11px] text-zinc-600">
                          {cust.lastOrderDate ? (
                            <div>
                              <span>
                                {new Date(cust.lastOrderDate).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </span>
                              <p className="text-[10px] text-zinc-400">
                                {Math.floor((Date.now() - new Date(cust.lastOrderDate).getTime()) / (1000 * 60 * 60 * 24))} hari lalu
                              </p>
                            </div>
                          ) : (
                            <span className="text-zinc-400">Belum order</span>
                          )}
                        </td>

                        {/* Action buttons */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => openCustomerDetail(cust.email)}
                              className="px-2.5 py-1 bg-zinc-900 text-white rounded text-[11px] font-medium hover:bg-zinc-800 transition-colors inline-flex items-center gap-1"
                              title="Buka Profil & Riwayat Order"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Profil & Order</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => openSingleEmailModal(cust)}
                              className="p-1 border border-zinc-300 rounded hover:bg-zinc-100 text-zinc-600 transition-colors"
                              title="Kirim Email Follow-up"
                            >
                              <Mail className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ==================== 5. MODAL DETAIL PROFIL PELANGGAN + RIWAYAT ORDER ==================== */}
      {selectedCustomerEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-3xl bg-white rounded-xl shadow-xl border border-zinc-200 overflow-hidden max-h-[92vh] flex flex-col font-sans">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
              <div className="flex items-center gap-3">
                <img
                  src={customerDetail?.customer.avatar || 'https://ui-avatars.com/api/?name=User'}
                  alt="Customer Avatar"
                  className="w-10 h-10 rounded-full border border-zinc-300 object-cover"
                />
                <div>
                  <h3 className="text-base font-serif font-bold text-zinc-900 flex items-center gap-2">
                    <span>{customerDetail?.customer.name || 'Memuat...'}</span>
                    {customerDetail && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          customerDetail.customer.segment === 'Pelanggan Loyal'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : customerDetail.customer.segment === 'Pelanggan Baru'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}
                      >
                        {customerDetail.customer.segment}
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-zinc-500 font-mono">{customerDetail?.customer.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {customerDetail && (
                  <button
                    type="button"
                    onClick={() => openSingleEmailModal(customerDetail.customer)}
                    className="px-2.5 py-1.5 bg-zinc-900 text-white rounded text-xs font-semibold hover:bg-zinc-800 inline-flex items-center gap-1.5 transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Follow-Up</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedCustomerEmail(null)}
                  className="p-1 rounded text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Sub-navigation Tabs */}
            <div className="px-5 border-b border-zinc-200 bg-white flex items-center gap-4 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveDetailTab('profile')}
                className={`py-3 border-b-2 transition-colors ${
                  activeDetailTab === 'profile'
                    ? 'border-zinc-900 text-zinc-900 font-bold'
                    : 'border-transparent text-zinc-500 hover:text-zinc-800'
                }`}
              >
                Ringkasan Profil & CRM
              </button>
              <button
                type="button"
                onClick={() => setActiveDetailTab('orders')}
                className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeDetailTab === 'orders'
                    ? 'border-zinc-900 text-zinc-900 font-bold'
                    : 'border-transparent text-zinc-500 hover:text-zinc-800'
                }`}
              >
                <span>Riwayat Order</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-zinc-100 text-zinc-700 font-mono">
                  {customerDetail?.orders.length || 0}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveDetailTab('activities')}
                className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeDetailTab === 'activities'
                    ? 'border-zinc-900 text-zinc-900 font-bold'
                    : 'border-transparent text-zinc-500 hover:text-zinc-800'
                }`}
              >
                <span>Log Interaksi & Retensi</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-zinc-100 text-zinc-700 font-mono">
                  {customerDetail?.customer.retentionActivities.length || 0}
                </span>
              </button>
            </div>

            {/* Modal Content Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
              {isLoadingDetail || !customerDetail ? (
                <div className="py-16 text-center text-zinc-500">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-zinc-400" />
                  <p>Memuat profil lengkap pelanggan...</p>
                </div>
              ) : activeDetailTab === 'profile' ? (
                <div className="space-y-4">
                  {/* KPI Cards Pelanggan */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200">
                      <p className="text-[10px] uppercase text-zinc-500 font-semibold">Total Belanja</p>
                      <p className="text-sm font-bold font-mono text-zinc-900 mt-0.5">
                        Rp {customerDetail.customer.totalSpent.toLocaleString('id-ID')}
                      </p>
                    </div>
                    <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200">
                      <p className="text-[10px] uppercase text-zinc-500 font-semibold">Frekuensi Order</p>
                      <p className="text-sm font-bold text-zinc-900 mt-0.5">
                        {customerDetail.customer.totalOrders} Transaksi
                      </p>
                    </div>
                    <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200">
                      <p className="text-[10px] uppercase text-zinc-500 font-semibold">Rata-rata Order (AOV)</p>
                      <p className="text-sm font-bold font-mono text-zinc-900 mt-0.5">
                        Rp {customerDetail.customer.averageOrderValue.toLocaleString('id-ID')}
                      </p>
                    </div>
                    <div className="p-3 bg-purple-50/70 rounded-lg border border-purple-200">
                      <p className="text-[10px] uppercase text-purple-700 font-semibold">Saldo Poin Loyalitas</p>
                      <p className="text-sm font-bold text-purple-900 mt-0.5 flex items-center gap-1">
                        <Award className="w-3.5 h-3.5" />
                        <span>{customerDetail.customer.loyaltyPoints} Pts</span>
                      </p>
                    </div>
                  </div>

                  {/* Kriteria & Alasan Segmentasi */}
                  <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-lg space-y-2">
                    <p className="font-semibold text-zinc-900 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-zinc-700" />
                      <span>Evaluasi Aturan Segmentasi:</span>
                    </p>
                    <p className="text-zinc-700 leading-relaxed bg-white p-3 rounded border border-zinc-200 text-xs font-mono">
                      {customerDetail.customer.segmentReason}
                    </p>
                  </div>

                  {/* Informasi Kontak & Pengiriman */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 border border-zinc-200 rounded-lg space-y-2 bg-white">
                      <p className="font-semibold text-zinc-900 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-zinc-500" />
                        <span>Nomor Telepon:</span>
                      </p>
                      <p className="font-mono text-zinc-800">{customerDetail.customer.phone || 'Belum diisi'}</p>

                      <p className="font-semibold text-zinc-900 flex items-center gap-1.5 pt-2">
                        <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                        <span>Alamat Pengiriman Default:</span>
                      </p>
                      <p className="text-zinc-700 leading-relaxed">{customerDetail.customer.address || 'Belum diisi'}</p>
                    </div>

                    <div className="p-4 border border-zinc-200 rounded-lg space-y-2 bg-white">
                      <p className="font-semibold text-zinc-900 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                        <span>Tanggal Bergabung:</span>
                      </p>
                      <p className="text-zinc-800">
                        {new Date(customerDetail.customer.joinedAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>

                      <p className="font-semibold text-zinc-900 flex items-center gap-1.5 pt-2">
                        <Tag className="w-3.5 h-3.5 text-zinc-500" />
                        <span>Tag Pelanggan:</span>
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {customerDetail.customer.tags.map((t, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded text-[10px] bg-zinc-100 text-zinc-700 border border-zinc-300">
                            #{t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Catatan Internal CRM & Penyesuaian Poin */}
                  <div className="p-4 border border-zinc-200 rounded-lg bg-zinc-50/50 space-y-3">
                    <p className="font-semibold text-zinc-900 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-zinc-700" />
                      <span>Catatan Khusus Admin & Penyesuaian Poin:</span>
                    </p>
                    <textarea
                      rows={3}
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      placeholder="Tulis catatan internal CRM (mis. minat barang, histori keluhan, preferensi kurir)..."
                      className="w-full p-2.5 bg-white border border-zinc-300 rounded-md text-xs focus:outline-none focus:border-zinc-900"
                    />

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-zinc-600 font-semibold">Bonus/Koreksi Poin:</span>
                        <input
                          type="number"
                          placeholder="mis. 50 atau -20"
                          value={pointsAdjustment}
                          onChange={(e) => setPointsAdjustment(e.target.value)}
                          className="w-28 p-1.5 bg-white border border-zinc-300 rounded text-xs font-mono"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={handleSaveNotes}
                        disabled={isSavingNotes}
                        className="px-3.5 py-1.5 bg-zinc-900 text-white rounded text-xs font-semibold hover:bg-zinc-800 disabled:opacity-50 transition-colors"
                      >
                        {isSavingNotes ? 'Menyimpan...' : 'Simpan Catatan & Poin'}
                      </button>
                    </div>
                  </div>
                </div>
              ) : activeDetailTab === 'orders' ? (
                /* Riwayat Order Lengkap */
                <div className="space-y-3">
                  {customerDetail.orders.length === 0 ? (
                    <div className="text-center py-12 text-zinc-500">
                      <Package className="w-8 h-8 mx-auto mb-2 text-zinc-300 stroke-1" />
                      <p>Pelanggan belum pernah melakukan transaksi pembelian.</p>
                    </div>
                  ) : (
                    customerDetail.orders.map((order) => (
                      <div key={order.id} className="bg-white border border-zinc-200 rounded-lg p-4 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 pb-2">
                          <div>
                            <span className="font-mono font-bold text-zinc-900 text-xs">{order.orderNumber}</span>
                            <p className="text-[10px] text-zinc-400">
                              {new Date(order.createdAt).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                order.status === 'Selesai' || order.status === 'Sudah Dibayar'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : 'bg-zinc-100 text-zinc-800 border-zinc-300'
                              }`}
                            >
                              {order.status}
                            </span>
                            <span className="font-mono font-bold text-zinc-900 text-xs">
                              Rp {order.total.toLocaleString('id-ID')}
                            </span>
                          </div>
                        </div>

                        {/* List items */}
                        <div className="space-y-2">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between gap-3 text-xs">
                              <div className="flex items-center gap-2">
                                <img
                                  src={item.productImage}
                                  alt={item.productName}
                                  className="w-9 h-9 object-cover rounded border border-zinc-200"
                                />
                                <div>
                                  <p className="font-semibold text-zinc-900 text-[11px] line-clamp-1">{item.productName}</p>
                                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-600 font-medium">
                                    {item.grade}
                                  </span>
                                </div>
                              </div>
                              <span className="font-mono text-zinc-600 text-[11px] shrink-0">
                                {item.quantity} x Rp {item.price.toLocaleString('id-ID')}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Shipping & Payment Meta */}
                        <div className="pt-2 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-2 text-[10px] text-zinc-500">
                          <div>
                            <span className="font-medium text-zinc-700">Kurir:</span> {order.courier}{' '}
                            {order.trackingNumber && (
                              <span className="font-mono font-bold text-zinc-800">(Resi: {order.trackingNumber})</span>
                            )}
                          </div>
                          <div>
                            <span className="font-medium text-zinc-700">Metode Bayar:</span>{' '}
                            <span className="uppercase font-mono">{order.paymentType}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                /* Tab Log Interaksi & Retensi */
                <div className="space-y-3">
                  {customerDetail.customer.retentionActivities.length === 0 ? (
                    <div className="text-center py-12 text-zinc-500">
                      <Mail className="w-8 h-8 mx-auto mb-2 text-zinc-300 stroke-1" />
                      <p>Belum ada riwayat aktivitas retensi yang tercatat untuk pelanggan ini.</p>
                      <button
                        type="button"
                        onClick={() => openSingleEmailModal(customerDetail.customer)}
                        className="mt-3 px-3 py-1.5 bg-zinc-900 text-white rounded text-xs font-semibold inline-flex items-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Kirim Follow-up Sekarang</span>
                      </button>
                    </div>
                  ) : (
                    customerDetail.customer.retentionActivities.map((act) => (
                      <div key={act.id} className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-zinc-900 flex items-center gap-1.5">
                            {act.type === 'email_follow_up' ? (
                              <Mail className="w-3.5 h-3.5 text-blue-600" />
                            ) : act.type === 'voucher_sent' ? (
                              <Tag className="w-3.5 h-3.5 text-amber-600" />
                            ) : (
                              <Award className="w-3.5 h-3.5 text-purple-600" />
                            )}
                            <span>{act.title}</span>
                          </span>
                          <span className="text-[10px] text-zinc-400">
                            {new Date(act.createdAt).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-600 leading-relaxed">{act.description}</p>
                        <div className="flex items-center gap-2 pt-1 text-[10px] text-zinc-500">
                          <span>Saluran: <strong>{act.channel || 'Email'}</strong></span>
                          <span>•</span>
                          <span>Status: <strong className="text-emerald-700">{act.status}</strong></span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between text-xs">
              <span className="text-zinc-500">ID CRM: {customerDetail?.customer.id}</span>
              <button
                type="button"
                onClick={() => setSelectedCustomerEmail(null)}
                className="px-4 py-2 border border-zinc-300 rounded bg-white hover:bg-zinc-100 text-zinc-700 font-semibold transition-colors"
              >
                Tutup Profil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== 6. MODAL RETENSI EMAIL & BROADCAST ==================== */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-xl bg-white rounded-xl shadow-xl border border-zinc-200 overflow-hidden flex flex-col font-sans">
            <div className="px-5 py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
              <div>
                <h3 className="text-base font-serif font-bold text-zinc-900 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-zinc-900" />
                  <span>
                    {emailTarget.type === 'segment'
                      ? `Kirim Broadcast Retensi: Segmen ${emailTarget.segment}`
                      : `Kirim Follow-Up: ${emailTarget.name}`}
                  </span>
                </h3>
                <p className="text-[11px] text-zinc-500">
                  {emailTarget.type === 'segment'
                    ? `Email akan dikirimkan otomatis ke seluruh member dalam segmen ${emailTarget.segment}`
                    : `Tujuan: ${emailTarget.email}`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEmailModalOpen(false)}
                className="p-1 rounded text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendRetentionAction} className="p-5 space-y-4 text-xs">
              {/* Template selector */}
              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                  Pilih Template Retensi:
                </label>
                <select
                  value={emailTemplate}
                  onChange={(e) => {
                    const val = e.target.value as any;
                    setEmailTemplate(val);
                    if (val === 'welcome_onboarding') {
                      setEmailSubject('Selamat Datang di TechSecond ID — Voucher Sambutan Rp 50.000');
                    } else if (val === 'loyal_vip_reward') {
                      setEmailSubject('Apresiasi Member VIP TechSecond ID: Bonus 50 Poin & Diskon 10%');
                    } else if (val === 'winback_reactivation') {
                      setEmailSubject('Kami Rindu Anda di TechSecond ID — Diskon Reaktivasi Rp 100.000');
                    } else {
                      setEmailSubject('');
                    }
                  }}
                  className="w-full p-2 border border-zinc-300 rounded bg-white text-zinc-800 focus:outline-none focus:border-zinc-900"
                >
                  <option value="welcome_onboarding">1. Onboarding Pelanggan Baru (+ Voucher BARUHEMAT50)</option>
                  <option value="loyal_vip_reward">2. Apresiasi Pelanggan Loyal (+ Bonus 50 Poin & LOYALVIP10)</option>
                  <option value="winback_reactivation">3. Winback Pelanggan Tidak Aktif (+ Voucher COMEBACK100)</option>
                  <option value="custom">4. Pesan Kustom Bebas</option>
                </select>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                  Subjek Email:
                </label>
                <input
                  type="text"
                  required
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full p-2 border border-zinc-300 rounded text-xs focus:outline-none focus:border-zinc-900"
                />
              </div>

              {/* Email Live Preview Box */}
              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                  Pratinjau Isi Pesan Email (Brand TechSecond ID):
                </label>
                <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-lg text-[11px] text-zinc-700 space-y-2 leading-relaxed">
                  <div className="border-b border-zinc-200 pb-2 flex items-center justify-between">
                    <span className="font-serif font-bold text-zinc-900">TechSecond ID</span>
                    <span className="text-[10px] text-zinc-400">Garansi 90 Hari Toko</span>
                  </div>
                  <p>
                    Halo <strong>{emailTarget.name || `Pelanggan Setia`}</strong>,
                  </p>
                  {emailTemplate === 'welcome_onboarding' && (
                    <p>
                      Terima kasih telah mempercayakan kebutuhan elektronik bekas Anda kepada TechSecond ID. Semua unit kami telah lulus uji kelayakan 35 titik teknisi bersertifikasi. Khusus untuk pesanan berikutnya, gunakan kode voucher{' '}
                      <span className="font-mono font-bold bg-zinc-200 px-1 py-0.5 rounded text-zinc-900">BARUHEMAT50</span>{' '}
                      untuk potongan langsung Rp 50.000!
                    </p>
                  )}
                  {emailTemplate === 'loyal_vip_reward' && (
                    <p>
                      Terima kasih atas kesetiaan Anda berbelanja berulang di TechSecond ID. Sebagai apresiasi member loyal, kami telah menambahkan{' '}
                      <strong>50 Poin Loyalitas</strong> ke akun Anda, serta kupon diskon 10% eksklusif{' '}
                      <span className="font-mono font-bold bg-zinc-200 px-1 py-0.5 rounded text-zinc-900">LOYALVIP10</span>.
                    </p>
                  )}
                  {emailTemplate === 'winback_reactivation' && (
                    <p>
                      Sudah lebih dari 45 hari kami tidak melihat Anda! Stok unit MacBook, iPhone, dan kamera second grade A+ baru saja tiba di katalog. Gunakan kupon istimewa{' '}
                      <span className="font-mono font-bold bg-zinc-200 px-1 py-0.5 rounded text-zinc-900">COMEBACK100</span>{' '}
                      untuk potongan Rp 100.000 khusus kepulangan Anda.
                    </p>
                  )}
                  {emailTemplate === 'custom' && (
                    <textarea
                      rows={3}
                      required
                      value={emailCustomMessage}
                      onChange={(e) => setEmailCustomMessage(e.target.value)}
                      placeholder="Ketik isi pesan kustom Anda di sini..."
                      className="w-full p-2 bg-white border border-zinc-300 rounded text-xs focus:outline-none focus:border-zinc-900"
                    />
                  )}
                  <p className="pt-2 text-[10px] text-zinc-500 border-t border-zinc-200">
                    Salam hangat, Tim CRM & Kepuasan Pelanggan TechSecond ID.
                  </p>
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="pt-3 border-t border-zinc-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEmailModalOpen(false)}
                  className="px-3.5 py-2 border border-zinc-300 rounded text-zinc-700 hover:bg-zinc-100 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSendingEmail}
                  className="px-4 py-2 bg-zinc-900 text-white rounded font-semibold hover:bg-zinc-800 disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSendingEmail ? 'Mengirim...' : 'Kirim Email Sekarang'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

