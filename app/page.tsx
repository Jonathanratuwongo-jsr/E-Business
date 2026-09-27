'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useCart } from '@/lib/cart-context';
import { Product, Order, ConditionGrade } from '@/lib/types';
import { ProductCard } from '@/components/product-card';
import { ProductDetailModal } from '@/components/product-detail-modal';
import { CartDrawer } from '@/components/cart-drawer';
import { CheckoutModal } from '@/components/checkout-modal';
import { MidtransModal } from '@/components/midtrans-modal';
import { OrderHistoryModal } from '@/components/order-history-modal';
import { AIChatbot } from '@/components/ai-chatbot';
import {
  Laptop,
  Smartphone,
  Camera,
  Tablet,
  Headphones,
  Gamepad2,
  Search,
  ShoppingBag,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Truck,
  CheckCircle2,
  User as UserIcon,
  LogIn,
  SlidersHorizontal,
  Database,
  ArrowRight,
  Flame,
} from 'lucide-react';

import { INITIAL_PRODUCTS } from '@/lib/db/initial-data';

const CATEGORIES = [
  { id: 'Semua', name: 'Semua Gadget', icon: Sparkles },
  { id: 'Smartphone', name: 'Smartphone', icon: Smartphone },
  { id: 'Laptop', name: 'Laptop & PC', icon: Laptop },
  { id: 'Kamera', name: 'Kamera & Lensa', icon: Camera },
  { id: 'Tablet', name: 'iPad & Tablet', icon: Tablet },
  { id: 'Audio', name: 'Audio & Headphone', icon: Headphones },
  { id: 'Gaming', name: 'Konsol Gaming', icon: Gamepad2 },
];

const GRADES: { id: string; label: string; desc: string }[] = [
  { id: 'Semua', label: 'Semua Grade', desc: 'Semua kondisi' },
  { id: 'Grade A+', label: 'Grade A+', desc: 'Mulus 99% Seperti Baru' },
  { id: 'Grade A', label: 'Grade A', desc: 'Mulus 95% Pemakaian Wajar' },
  { id: 'Grade B', label: 'Grade B', desc: 'Lecet Halus, Nilai Terbaik' },
];

export default function HomePage() {
  const { user, switchRole } = useAuth();
  const { totalItems, setIsOpen: setCartOpen } = useCart();

  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [selectedGrade, setSelectedGrade] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isMidtransOpen, setIsMidtransOpen] = useState(false);
  const [isOrderHistoryOpen, setIsOrderHistoryOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [paymentSuccessOrder, setPaymentSuccessOrder] = useState<Order | null>(null);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'Semua') params.set('category', selectedCategory);
      if (selectedGrade !== 'Semua') params.set('grade', selectedGrade);
      if (searchQuery.trim()) params.set('q', searchQuery.trim());

      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, selectedGrade, searchQuery]);

  const handleOrderCreated = (order: Order) => {
    setActiveOrder(order);
    setIsMidtransOpen(true);
  };

  const handlePaymentSuccess = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Sudah Dibayar' }),
      });
      const data = await res.json();
      if (data.success) {
        setActiveOrder(data.data);
        setPaymentSuccessOrder(data.data);
      }
    } catch {
      // Ignore
    } finally {
      setIsMidtransOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* 1. Header Notification Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white text-[11px] py-2 px-4 text-center font-medium flex items-center justify-center gap-3">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Garansi Resmi Toko 30 - 90 Hari Tukar Unit
        </span>
        <span className="hidden sm:inline">•</span>
        <span className="hidden sm:flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-blue-300" /> 100% IMEI Terdaftar Kemenperin & Bea Cukai
        </span>
        <span className="hidden md:inline">•</span>
        <span className="hidden md:flex items-center gap-1 text-amber-300">
          <Database className="w-3 h-3" /> Powered by Cloudflare D1 Database & Midtrans Snap
        </span>
      </div>

      {/* 2. Main Navigation Bar */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-lg tracking-tight text-foreground">
                TechSecond <span className="text-blue-600">ID</span>
              </span>
              <p className="text-[10px] text-muted-foreground -mt-1 font-medium hidden sm:block">
                Elektronik Bekas Bergaransi
              </p>
            </div>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Cari iPhone, MacBook, Sony, ThinkPad, PS5..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-muted/50 hover:bg-muted/70 focus:bg-background border border-input rounded-full text-xs transition-colors focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Order History */}
            <button
              onClick={() => setIsOrderHistoryOpen(true)}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-border hover:bg-muted text-foreground transition-colors hidden sm:flex items-center gap-1.5"
            >
              <Truck className="w-4 h-4 text-blue-600" />
              <span>Lacak Pesanan</span>
            </button>

            {/* Admin Switcher / Link */}
            {user?.role === 'admin' ? (
              <Link
                href="/admin"
                className="text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Panel Admin</span>
              </Link>
            ) : (
              <Link
                href="/admin"
                className="text-xs text-muted-foreground hover:text-foreground px-2.5 py-1.5 rounded-xl border border-border hover:bg-muted transition-colors hidden lg:flex items-center gap-1"
                title="Buka Panel Admin Pengelolaan"
              >
                <span>Portal Admin</span>
              </Link>
            )}

            {/* Cart Button */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition-colors"
              aria-label="Keranjang Belanja"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white rounded-full text-[10px] font-black flex items-center justify-center shadow-md animate-in zoom-in">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Dedicated Login Link (as requested: "untuk login buatkan di tampilan lain dan terkoneksi langsung dengan email goggle") */}
            {user ? (
              <div className="flex items-center gap-2 pl-1 border-l border-border">
                <Link
                  href="/login"
                  className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 rounded-xl hover:bg-muted border border-transparent hover:border-border transition-colors"
                  title="Ganti Akun Google"
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover border border-blue-500/50"
                  />
                  <div className="text-left hidden xl:block">
                    <p className="text-xs font-bold leading-tight truncate max-w-[100px] text-foreground">
                      {user.name.split(' ')[0]}
                    </p>
                    <p className="text-[10px] text-muted-foreground capitalize">{user.role}</p>
                  </div>
                </Link>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 text-xs font-bold bg-white text-slate-900 border border-slate-300 hover:bg-slate-100 px-3.5 py-2 rounded-xl transition-all shadow-xs"
              >
                <LogIn className="w-3.5 h-3.5 text-blue-600" />
                <span>Masuk Akun Google</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* 3. Hero Section */}
      <section className="relative bg-gradient-to-b from-blue-50/70 via-background to-background dark:from-blue-950/20 dark:via-background dark:to-background border-b border-border/60 py-10 sm:py-14 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold border border-blue-200 dark:border-blue-800">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Pasar Gadget Bekas #1 Terverifikasi di Indonesia</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-foreground tracking-tight leading-[1.15]">
              Elektronik Bekas Berkualitas.{' '}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Lolos 35 Titik Uji QC & Bergaransi.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Dapatkan iPhone, MacBook, Sony Alpha, ThinkPad, hingga PlayStation 5 second dengan
              transparansi kondisi baterai, IMEI aman permanen, pembayaran resmi via{' '}
              <strong className="text-foreground">Midtrans (QRIS/VA)</strong>, dan database serverless{' '}
              <strong className="text-foreground">Cloudflare D1</strong>.
            </p>

            {/* Highlights row */}
            <div className="pt-2 flex flex-wrap gap-4 text-xs font-semibold text-foreground">
              <div className="flex items-center gap-2 bg-card border border-border px-3.5 py-2 rounded-xl shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>35-Point QC Certified</span>
              </div>
              <div className="flex items-center gap-2 bg-card border border-border px-3.5 py-2 rounded-xl shadow-xs">
                <RotateCcw className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Garansi Toko 90 Hari</span>
              </div>
              <div className="flex items-center gap-2 bg-card border border-border px-3.5 py-2 rounded-xl shadow-xs">
                <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>IMEI Bea Cukai & Kemenperin</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Filter & Catalog Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold shrink-0 transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'bg-card hover:bg-muted text-muted-foreground hover:text-foreground border border-border'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Grade Filter Bar */}
        <div className="bg-card border border-border rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-muted-foreground uppercase tracking-wider text-[11px]">
              Filter Grade Kondisi:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {GRADES.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setSelectedGrade(g.id)}
                  className={`px-3 py-1 rounded-xl font-bold transition-all ${
                    selectedGrade === g.id
                      ? 'bg-foreground text-background shadow-xs'
                      : 'bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                  title={g.desc}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          <p className="text-muted-foreground text-[11px]">
            Menampilkan <strong className="text-foreground">{products.length}</strong> unit gadget siap kirim
          </p>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 py-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-card border border-border rounded-2xl p-4 h-80 animate-pulse flex flex-col justify-between"
              >
                <div className="w-full aspect-square bg-muted rounded-xl mb-4" />
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="bg-card border border-border rounded-3xl p-12 text-center space-y-3">
            <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto opacity-40" />
            <h3 className="font-bold text-foreground text-base">Tidak ada gadget bekas yang cocok</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Coba reset filter kategori atau grade untuk menemukan gadget bekas lainnya.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('Semua');
                setSelectedGrade('Semua');
                setSearchQuery('');
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
            >
              Reset Semua Filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onViewDetail={(p) => setSelectedProduct(p)}
              />
            ))}
          </div>
        )}
      </main>

      {/* 5. Payment Success Alert (Toast / Banner) */}
      {paymentSuccessOrder && (
        <div className="fixed bottom-6 left-6 z-50 max-w-md bg-emerald-600 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom duration-300">
          <CheckCircle2 className="w-6 h-6 text-white shrink-0" />
          <div className="flex-1 text-xs">
            <p className="font-bold text-sm">Pembayaran Midtrans Berhasil!</p>
            <p className="text-emerald-100">
              Pesanan No. <strong>{paymentSuccessOrder.orderNumber}</strong> sedang dipacking dan akan
              segera dikirim dengan {paymentSuccessOrder.courier}.
            </p>
          </div>
          <button
            onClick={() => setPaymentSuccessOrder(null)}
            className="text-white/80 hover:text-white text-xs font-bold"
          >
            Tutup
          </button>
        </div>
      )}

      {/* 6. Footer */}
      <footer className="bg-muted/40 border-t border-border mt-16 text-xs text-muted-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
                <Laptop className="w-4 h-4" />
              </div>
              <span className="font-black text-foreground text-sm">TechSecond ID</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Platform e-commerce jual beli elektronik bekas terverifikasi dengan pengujian teknisi 35
              titik QC dan perlindungan garansi tukar unit.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-foreground uppercase tracking-wider text-[11px] mb-3">
              Kategori Populer
            </h4>
            <ul className="space-y-2 text-[11px]">
              <li>iPhone Bekas Mulus iBox</li>
              <li>MacBook Air & Pro Apple Silicon</li>
              <li>Sony Mirrorless & Lensa</li>
              <li>Laptop Bisnis ThinkPad</li>
              <li>PlayStation 5 & Nintendo Switch</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-foreground uppercase tracking-wider text-[11px] mb-3">
              Infrastruktur & Keamanan
            </h4>
            <ul className="space-y-2 text-[11px]">
              <li>Database: <strong>Cloudflare D1 SQLite Serverless</strong></li>
              <li>Payment: <strong>Midtrans Snap Payment Gateway</strong></li>
              <li>Auth: <strong>Google OAuth 2.0 Integration</strong></li>
              <li>AI: <strong>TechGuru Secondhand Tech Consultant</strong></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-foreground uppercase tracking-wider text-[11px] mb-3">
              Akses Cepat Pengguna
            </h4>
            <div className="space-y-2 text-[11px]">
              <Link href="/login" className="block text-blue-600 hover:underline font-semibold">
                &rarr; Halaman Login Akun Google
              </Link>
              <Link href="/admin" className="block text-blue-600 hover:underline font-semibold">
                &rarr; Panel Admin Toko (Kelola Produk & Resi)
              </Link>
              <button
                onClick={() => setIsOrderHistoryOpen(true)}
                className="block text-blue-600 hover:underline font-semibold text-left"
              >
                &rarr; Cek Status & Lacak Nomor Resi
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px]">
          <p>© 2026 TechSecond ID. Hak Cipta Dilindungi.</p>
          <p className="flex items-center gap-2">
            <span>Pembayaran Aman Midtrans QRIS & VA</span>
            <span>•</span>
            <span>Cloudflare D1 Edge</span>
          </p>
        </div>
      </footer>

      {/* 7. Modal Components */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onBuyNow={(prod) => {
          setSelectedProduct(null);
          setIsCheckoutOpen(true);
        }}
      />

      <CartDrawer
        onCheckout={() => {
          setIsCheckoutOpen(true);
        }}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderCreated={handleOrderCreated}
      />

      <MidtransModal
        isOpen={isMidtransOpen}
        onClose={() => setIsMidtransOpen(false)}
        order={activeOrder}
        onPaymentSuccess={handlePaymentSuccess}
      />

      <OrderHistoryModal
        isOpen={isOrderHistoryOpen}
        onClose={() => setIsOrderHistoryOpen(false)}
        onPayPendingOrder={(order) => {
          setActiveOrder(order);
          setIsMidtransOpen(true);
        }}
      />

      {/* 8. AI Chatbot Assistant */}
      <AIChatbot onSelectProduct={(p) => setSelectedProduct(p)} />
    </div>
  );
}
