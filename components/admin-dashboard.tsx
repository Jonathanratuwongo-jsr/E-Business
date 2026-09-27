'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Product, Order, OrderStatus, ConditionGrade } from '@/lib/types';
import { INITIAL_PRODUCTS } from '@/lib/db/initial-data';
import {
  Package,
  ShoppingBag,
  TrendingUp,
  Database,
  Plus,
  Trash2,
  Edit3,
  ExternalLink,
  Truck,
  CheckCircle,
  AlertCircle,
  Search,
  ArrowLeft,
  RefreshCw,
  Copy,
  Shield,
  Layers,
  BatteryCharging,
} from 'lucide-react';

export function AdminDashboard() {
  const { user, switchRole } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'd1'>('overview');
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Modal New Product
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProd, setNewProd] = useState({
    name: '',
    brand: 'Apple',
    category: 'Smartphone' as Product['category'],
    grade: 'Grade A+' as ConditionGrade,
    originalPrice: 15000000,
    price: 8500000,
    stock: 1,
    image: 'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=800&auto=format&fit=crop&q=80',
    description: '',
    batteryHealth: 90,
    imeiStatus: 'Terdaftar Kemenperin' as const,
    accessories: 'Fullset Box + Charger Original',
    warrantyDays: 60,
  });

  // Resi update state
  const [trackingModalOrder, setTrackingModalOrder] = useState<Order | null>(null);
  const [trackingNumberInput, setTrackingNumberInput] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [resProd, resOrders] = await Promise.all([
        fetch('/api/products').then((r) => r.json()),
        fetch('/api/orders').then((r) => r.json()),
      ]);
      if (resProd.success) setProducts(resProd.data);
      if (resOrders.success) setOrders(resOrders.data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: Omit<Product, 'id' | 'createdAt'> = {
        name: newProd.name,
        slug: newProd.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        brand: newProd.brand,
        category: newProd.category,
        grade: newProd.grade,
        originalPrice: Number(newProd.originalPrice),
        price: Number(newProd.price),
        stock: Number(newProd.stock),
        image: newProd.image,
        gallery: [newProd.image],
        description: newProd.description || 'Unit bekas mulus lolos 35 titik uji teknisi.',
        qc: {
          batteryHealth: Number(newProd.batteryHealth),
          imeiStatus: newProd.imeiStatus,
          screenCondition: 'Mulus 100% No Scratch',
          bodyCondition: 'Mulus Seperti Baru 99%',
          cameraFunction: '100% Normal & Jernih',
          speakersMicrophone: '100% Normal Bersuara Jernih',
          faceIdFingerprint: '100% Normal Aktif',
          accessories: newProd.accessories,
          warrantyDays: Number(newProd.warrantyDays),
        },
        specs: {
          'Kondisi': newProd.grade,
          'Garansi Toko': `${newProd.warrantyDays} Hari Tukar Unit`,
        },
      };

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsAddModalOpen(false);
        fetchData();
        alert('Produk elektronik bekas berhasil ditambahkan ke database D1!');
      }
    } catch {
      alert('Gagal menambahkan produk');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Hapus produk ini dari database D1?')) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      }
    } catch {
      alert('Gagal menghapus');
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus, trackingNo?: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, trackingNumber: trackingNo }),
      });
      if (res.ok) {
        fetchData();
        setTrackingModalOrder(null);
      }
    } catch {
      alert('Gagal update status pesanan');
    }
  };

  // Analytics calculation
  const totalRevenue = orders
    .filter((o) => o.status !== 'Menunggu Pembayaran' && o.status !== 'Dibatalkan')
    .reduce((sum, o) => sum + o.total, 0);
  const activeOrders = orders.filter(
    (o) => o.status === 'Sudah Dibayar' || o.status === 'Diproses' || o.status === 'Dikirim'
  ).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-30 px-4 sm:px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-colors border border-slate-700"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Ke Toko Pelanggan</span>
          </Link>
          <div className="h-5 w-px bg-slate-800 hidden sm:block" />
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h1 className="text-sm font-bold text-white flex items-center gap-2">
              TechSecond <span className="text-blue-400">Admin Portal</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-xl">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100'}
              alt="Admin"
              className="w-5 h-5 rounded-full object-cover"
            />
            <span className="font-medium text-slate-200 hidden sm:inline">{user?.name}</span>
            <span className="bg-indigo-500/20 text-indigo-300 font-bold px-1.5 py-0.5 rounded text-[10px]">
              Admin
            </span>
          </div>

          <button
            onClick={() => {
              switchRole('customer');
              router.push('/');
            }}
            className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium px-3 py-1.5 rounded-xl transition-colors"
          >
            Ganti Mode Pelanggan
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'overview'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <TrendingUp className="w-4 h-4" /> Ringkasan Toko
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'products'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Package className="w-4 h-4" /> Kelola Produk Bekas ({products.length})
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'orders'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <ShoppingBag className="w-4 h-4" /> Transaksi Midtrans ({orders.length})
          </button>

          <button
            onClick={() => setActiveTab('d1')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'd1'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Database className="w-4 h-4" /> Cloudflare D1 Console
          </button>

          <button
            onClick={fetchData}
            className="ml-auto text-xs text-slate-400 hover:text-white flex items-center gap-1.5 p-2 rounded-lg bg-slate-900 border border-slate-800"
            title="Refresh Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-400 font-medium">Total Pendapatan Bersih</p>
                  <span className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
                    <TrendingUp className="w-4 h-4" />
                  </span>
                </div>
                <p className="text-2xl font-black text-white mt-2">
                  Rp {totalRevenue.toLocaleString('id-ID')}
                </p>
                <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                  +18.4% bulan ini via Midtrans Gateway
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-400 font-medium">Pesanan Diproses / Dikirim</p>
                  <span className="p-2 bg-blue-500/10 text-blue-400 rounded-xl">
                    <Truck className="w-4 h-4" />
                  </span>
                </div>
                <p className="text-2xl font-black text-white mt-2">{activeOrders} Pesanan</p>
                <p className="text-[11px] text-blue-400 mt-1">Perlu pengecekan nomor resi kurir</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-400 font-medium">Total Unit Gadget Bekas</p>
                  <span className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
                    <Package className="w-4 h-4" />
                  </span>
                </div>
                <p className="text-2xl font-black text-white mt-2">{products.length} SKU</p>
                <p className="text-[11px] text-slate-400 mt-1">Lolos 35 titik uji teknisi</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-400 font-medium">Engine Database</p>
                  <span className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
                    <Database className="w-4 h-4" />
                  </span>
                </div>
                <p className="text-lg font-black text-white mt-2">Cloudflare D1</p>
                <p className="text-[11px] text-amber-400 mt-1">SQLite Serverless Edge</p>
              </div>
            </div>

            {/* Recent Orders Preview */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-blue-400" /> Transaksi Terbaru
                </h3>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
                >
                  Lihat Semua Pesanan &rarr;
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 pb-2">
                      <th className="pb-2 font-medium">No. Pesanan</th>
                      <th className="pb-2 font-medium">Pelanggan</th>
                      <th className="pb-2 font-medium">Barang</th>
                      <th className="pb-2 font-medium">Total</th>
                      <th className="pb-2 font-medium">Metode</th>
                      <th className="pb-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {orders.slice(0, 5).map((order) => (
                      <tr key={order.id} className="hover:bg-slate-800/40">
                        <td className="py-3 font-mono font-bold text-blue-400">{order.orderNumber}</td>
                        <td className="py-3">
                          <p className="font-semibold text-white">{order.customerName}</p>
                          <p className="text-[11px] text-slate-400">{order.customerEmail}</p>
                        </td>
                        <td className="py-3">
                          {order.items.map((it) => (
                            <div key={it.productId} className="flex items-center gap-1.5">
                              <span className="font-medium text-slate-200 truncate max-w-[200px]">
                                {it.productName}
                              </span>
                              <span className="text-slate-400">({it.quantity}x)</span>
                            </div>
                          ))}
                        </td>
                        <td className="py-3 font-bold text-white">
                          Rp {order.total.toLocaleString('id-ID')}
                        </td>
                        <td className="py-3 uppercase text-[10px] font-bold text-slate-300">
                          {order.paymentType.replace('_', ' ')}
                        </td>
                        <td className="py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              order.status === 'Selesai'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : order.status === 'Dikirim'
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                : order.status === 'Diproses' || order.status === 'Sudah Dibayar'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-slate-700 text-slate-300'
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PRODUCTS */}
        {activeTab === 'products' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <div>
                <h3 className="font-bold text-white text-base">Katalog Elektronik Bekas (D1)</h3>
                <p className="text-xs text-slate-400">
                  Total {products.length} unit gadget siap jual dengan transparansi kondisi
                </p>
              </div>

              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md"
              >
                <Plus className="w-4 h-4" /> Tambah Unit Bekas Baru
              </button>
            </div>

            {/* Products Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800/70 text-slate-400">
                    <tr>
                      <th className="p-3 pl-4">Produk & Kondisi</th>
                      <th className="p-3">Kategori</th>
                      <th className="p-3">Grade & QC</th>
                      <th className="p-3">Harga Bekas</th>
                      <th className="p-3">Stok</th>
                      <th className="p-3 pr-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3 pl-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={p.image}
                              alt={p.name}
                              className="w-12 h-12 rounded-xl object-cover bg-slate-800 shrink-0 border border-slate-700"
                            />
                            <div>
                              <p className="font-bold text-white text-xs">{p.name}</p>
                              <p className="text-[11px] text-slate-400 font-mono">
                                Brand: {p.brand} • Kelengkapan: {p.qc?.accessories?.slice(0, 30)}...
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-slate-300 font-medium">{p.category}</td>
                        <td className="p-3">
                          <div className="space-y-1">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                p.grade === 'Grade A+'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : p.grade === 'Grade A'
                                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              }`}
                            >
                              {p.grade}
                            </span>
                            {p.qc?.batteryHealth && (
                              <p className="text-[10px] text-slate-400 flex items-center gap-1">
                                <BatteryCharging className="w-3 h-3 text-emerald-400" />
                                BH: {p.qc.batteryHealth}%
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <p className="font-bold text-white">Rp {p.price.toLocaleString('id-ID')}</p>
                          <p className="text-[10px] text-slate-500 line-through">
                            Rp {p.originalPrice.toLocaleString('id-ID')}
                          </p>
                        </td>
                        <td className="p-3">
                          <span
                            className={`font-bold ${
                              p.stock > 0 ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {p.stock} Unit
                          </span>
                        </td>
                        <td className="p-3 pr-4 text-right">
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-1.5 hover:bg-rose-500/20 text-rose-400 rounded-lg transition-colors"
                            title="Hapus Produk"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ORDERS */}
        {activeTab === 'orders' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <h3 className="font-bold text-white text-base">Kelola Pesanan & Resi Pengiriman</h3>
              <p className="text-xs text-slate-400">
                Pantau pembayaran Midtrans, input resi JNE/J&T, dan perbarui status pengiriman pelanggan
              </p>
            </div>

            <div className="space-y-3">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-blue-400 text-sm">
                          {order.orderNumber}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            order.status === 'Selesai'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : order.status === 'Dikirim'
                              ? 'bg-blue-500/20 text-blue-300'
                              : order.status === 'Diproses' || order.status === 'Sudah Dibayar'
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-slate-700 text-slate-300'
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Dipesan oleh: <strong className="text-white">{order.customerName}</strong> ({order.customerPhone})
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-slate-400">Total Pembayaran (Midtrans)</p>
                      <p className="text-lg font-black text-white">
                        Rp {order.total.toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>

                  {/* Items and Address */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="text-slate-400 font-semibold mb-1">Item Pesanan:</p>
                      <div className="space-y-2">
                        {order.items.map((it) => (
                          <div key={it.productId} className="flex items-center gap-3 bg-slate-800/50 p-2 rounded-xl">
                            <img
                              src={it.productImage}
                              alt={it.productName}
                              className="w-10 h-10 rounded-lg object-cover bg-slate-700"
                            />
                            <div className="flex-1">
                              <p className="font-semibold text-white">{it.productName}</p>
                              <p className="text-[11px] text-slate-400">
                                {it.quantity}x @ Rp {it.price.toLocaleString('id-ID')} ({it.grade})
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-slate-800/30 p-3 rounded-xl border border-slate-800 space-y-1.5">
                      <p className="text-slate-400 font-semibold">Alamat Tujuan & Kurir:</p>
                      <p className="text-white">{order.shippingAddress}</p>
                      <p className="text-blue-400 font-medium">Kurir: {order.courier}</p>
                      {order.trackingNumber ? (
                        <p className="text-emerald-400 font-mono font-bold flex items-center gap-1.5">
                          <Truck className="w-3.5 h-3.5" /> No. Resi: {order.trackingNumber}
                        </p>
                      ) : (
                        <p className="text-amber-400 italic">Nomor resi belum dimasukkan</p>
                      )}
                    </div>
                  </div>

                  {/* Status Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
                    <div className="flex items-center gap-1 text-[11px] text-slate-400">
                      <span>Midtrans Ref:</span>
                      <code className="text-slate-300 font-mono">{order.midtransTransactionId}</code>
                    </div>

                    <div className="flex items-center gap-2">
                      {order.status === 'Menunggu Pembayaran' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(order.id, 'Sudah Dibayar')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold"
                        >
                          Tandai Sudah Dibayar
                        </button>
                      )}

                      {(order.status === 'Sudah Dibayar' || order.status === 'Diproses') && (
                        <button
                          onClick={() => {
                            setTrackingModalOrder(order);
                            setTrackingNumberInput(order.trackingNumber || '');
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Kirim & Input Resi</span>
                        </button>
                      )}

                      {order.status === 'Dikirim' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(order.id, 'Selesai')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold"
                        >
                          Selesaikan Pesanan
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: CLOUDFLARE D1 CONSOLE */}
        {activeTab === 'd1' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
                    <Database className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      Cloudflare D1 Database Engine
                      <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2 py-0.5 rounded-full border border-emerald-500/30">
                        Operational
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Database SQLite Serverless terdistribusi di edge global Cloudflare
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xs text-slate-400">Binding Name</p>
                  <p className="text-xs font-mono font-bold text-amber-400">DB (Cloudflare D1)</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-800 text-xs">
                <div className="bg-slate-800/40 p-3 rounded-xl">
                  <p className="text-slate-400">Database ID</p>
                  <p className="font-mono text-white mt-0.5 truncate">
                    d1-techsecond-id-prod-01
                  </p>
                </div>
                <div className="bg-slate-800/40 p-3 rounded-xl">
                  <p className="text-slate-400">Tabel Aktif</p>
                  <p className="font-bold text-white mt-0.5">
                    users, products, qc_reports, orders, order_items
                  </p>
                </div>
                <div className="bg-slate-800/40 p-3 rounded-xl">
                  <p className="text-slate-400">Latency Read/Write</p>
                  <p className="font-bold text-emerald-400 mt-0.5">&lt; 15ms (Edge SQLite)</p>
                </div>
              </div>
            </div>

            {/* D1 DDL & CLI Instruction */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-400" /> Cloudflare Wrangler CLI Execution
                </h4>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText('npx wrangler d1 execute techsecond-db --file=./lib/db/schema.sql');
                    alert('Command wrangler berhasil disalin!');
                  }}
                  className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                >
                  <Copy className="w-3.5 h-3.5" /> Salin CLI Command
                </button>
              </div>

              <pre className="bg-slate-950 p-3.5 rounded-xl text-xs font-mono text-slate-300 overflow-x-auto border border-slate-800">
{`# 1. Buat database D1 di akun Cloudflare Anda:
npx wrangler d1 create techsecond-db

# 2. Eksekusi file schema DDL TechSecond ID:
npx wrangler d1 execute techsecond-db --file=./lib/db/schema.sql

# 3. Query produk bekas via CLI:
npx wrangler d1 execute techsecond-db --command="SELECT id, name, grade, price FROM products LIMIT 5;"`}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Tambah Unit Bekas Baru */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 text-white space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-400" /> Tambah Gadget Bekas ke D1
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Nama Produk Gadget</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: iPhone 14 Pro Max 256GB Deep Purple"
                  value={newProd.name}
                  onChange={(e) => setNewProd({ ...newProd, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Brand</label>
                  <input
                    type="text"
                    required
                    value={newProd.brand}
                    onChange={(e) => setNewProd({ ...newProd, brand: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Kategori</label>
                  <select
                    value={newProd.category}
                    onChange={(e) => setNewProd({ ...newProd, category: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="Smartphone">Smartphone</option>
                    <option value="Laptop">Laptop</option>
                    <option value="Kamera">Kamera</option>
                    <option value="Tablet">Tablet</option>
                    <option value="Audio">Audio</option>
                    <option value="Gaming">Gaming</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Grade Kondisi</label>
                  <select
                    value={newProd.grade}
                    onChange={(e) => setNewProd({ ...newProd, grade: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="Grade A+">Grade A+ (Like New 99%)</option>
                    <option value="Grade A">Grade A (Very Good 95%)</option>
                    <option value="Grade B">Grade B (Good 85-90%)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Battery Health (%)</label>
                  <input
                    type="number"
                    min="70"
                    max="100"
                    value={newProd.batteryHealth}
                    onChange={(e) => setNewProd({ ...newProd, batteryHealth: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Harga Baru (Rp)</label>
                  <input
                    type="number"
                    required
                    value={newProd.originalPrice}
                    onChange={(e) => setNewProd({ ...newProd, originalPrice: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Harga Jual Bekas (Rp)</label>
                  <input
                    type="number"
                    required
                    value={newProd.price}
                    onChange={(e) => setNewProd({ ...newProd, price: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">URL Foto Produk</label>
                <input
                  type="url"
                  required
                  value={newProd.image}
                  onChange={(e) => setNewProd({ ...newProd, image: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Kelengkapan Paket</label>
                <input
                  type="text"
                  value={newProd.accessories}
                  onChange={(e) => setNewProd({ ...newProd, accessories: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  Simpan ke D1
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Input Resi Pengiriman */}
      {trackingModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 text-white space-y-4">
            <h3 className="font-bold text-base flex items-center gap-2">
              <Truck className="w-5 h-5 text-blue-400" /> Input Nomor Resi Pengiriman
            </h3>
            <p className="text-xs text-slate-400">
              Order: <strong className="text-white">{trackingModalOrder.orderNumber}</strong> • Kurir:{' '}
              {trackingModalOrder.courier}
            </p>

            <div className="space-y-2">
              <label className="block text-xs text-slate-300 font-medium">Nomor Resi Resmi</label>
              <input
                type="text"
                placeholder="Misal: JNE12903849102"
                value={trackingNumberInput}
                onChange={(e) => setTrackingNumberInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm font-mono text-white uppercase focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setTrackingModalOrder(null)}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-white text-xs font-semibold"
              >
                Batal
              </button>
              <button
                onClick={() =>
                  handleUpdateOrderStatus(
                    trackingModalOrder.id,
                    'Dikirim',
                    trackingNumberInput || `JNE${Math.floor(10000000000 + Math.random() * 90000000000)}`
                  )
                }
                className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
              >
                Simpan & Update Dikirim
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
