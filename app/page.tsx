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
import { LoginGatewayModal } from '@/components/login-gateway-modal';
import { AIChatbot } from '@/components/ai-chatbot';
import { CustomerCRMModal } from '@/components/customer-crm-modal';
import {
  Laptop,
  Smartphone,
  Camera,
  Tablet,
  Headphones,
  Gamepad2,
  Search,
  ShoppingBag,
  Truck,
  SlidersHorizontal,
  LogIn,
  LogOut,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Clock,
  Award,
  Gift,
  ShieldCheck,
} from 'lucide-react';
import { INITIAL_PRODUCTS } from '@/lib/db/initial-data';

const CATEGORIES = [
  { id: 'Semua', name: 'Semua Produk' },
  { id: 'Smartphone', name: 'Smartphone' },
  { id: 'Laptop', name: 'Laptop & Komputer' },
  { id: 'Kamera', name: 'Kamera & Lensa' },
  { id: 'Tablet', name: 'Tablet' },
  { id: 'Audio', name: 'Audio' },
  { id: 'Gaming', name: 'Konsol Gaming' },
];

const GRADES = [
  { id: 'Semua', label: 'Semua Kondisi' },
  { id: 'Grade A+', label: 'Grade A+ (Mulus 99%)' },
  { id: 'Grade A', label: 'Grade A (Mulus 95%)' },
  { id: 'Grade B', label: 'Grade B (Lecet Wajar)' },
];

export default function HomePage() {
  const { user, logout, isLoading: isAuthLoading } = useAuth();
  const { totalItems, setIsOpen: setCartOpen, addToCart } = useCart();

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
  const [isCustomerCRMOpen, setIsCustomerCRMOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'Semua') params.set('category', selectedCategory);
      if (selectedGrade !== 'Semua') params.set('grade', selectedGrade);
      if (searchQuery.trim()) params.set('q', searchQuery.trim());

      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      if (data.success && data.data) {
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
      }
    } catch {
      // Ignore
    } finally {
      setIsMidtransOpen(false);
      alert('Pembayaran Midtrans Berhasil Diverifikasi! Pesanan Anda segera disiapkan.');
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <div className="min-h-screen bg-white text-zinc-900 flex flex-col font-sans">
      {/* Main Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xs border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo - Classic typography */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div>
              <span className="font-serif font-bold text-xl tracking-tight text-zinc-900">
                TechSecond
              </span>
              <span className="text-[10px] tracking-widest uppercase font-mono text-zinc-500 block -mt-1">
                Elektronik Bekas
              </span>
            </div>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Cari tipe iPhone, MacBook, kamera, atau laptop..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-zinc-50 border border-zinc-300 rounded-md focus:bg-white focus:outline-none focus:border-zinc-900 transition-colors"
              />
            </div>
          </div>

          {/* Right Header Navigation */}
          <div className="flex items-center gap-2.5 text-xs">
            {/* Customer CRM Profile & Loyalty Points Button */}
            {user && !isAdmin && (
              <button
                type="button"
                onClick={() => setIsCustomerCRMOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-purple-200 bg-purple-50/70 hover:bg-purple-100/70 text-purple-900 font-semibold transition-colors shadow-xs"
                title="Buka Kartu Member & Poin Loyalitas"
              >
                <Award className="w-3.5 h-3.5 text-purple-600" />
                <span>Poin & Member CRM</span>
              </button>
            )}

            {/* Lacak Pesanan */}
            {user && !isAdmin && (
              <button
                type="button"
                onClick={() => setIsOrderHistoryOpen(true)}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-zinc-200 hover:border-zinc-300 text-zinc-700 transition-colors"
              >
                <Truck className="w-3.5 h-3.5 text-zinc-600" />
                <span>Lacak Pesanan</span>
              </button>
            )}

            {/* Admin Link with CRM badge */}
            {isAdmin && (
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-900 text-white font-medium hover:bg-zinc-800 transition-colors shadow-xs"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Panel Admin & CRM</span>
              </Link>
            )}

            {/* Cart Button: Only functional for non-admins */}
            {!isAdmin ? (
              <button
                type="button"
                onClick={() => setCartOpen(true)}
                className="relative p-2 rounded-md border border-zinc-200 hover:border-zinc-300 text-zinc-700 transition-colors"
                aria-label="Keranjang Belanja"
                title="Keranjang Belanja"
              >
                <ShoppingBag className="w-4 h-4" />
                {totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-zinc-900 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>
            ) : (
              <span
                className="text-[10px] text-zinc-500 border border-zinc-200 px-2 py-1 rounded bg-zinc-50"
                title="Admin mengelola katalog produk & modul CRM"
              >
                Mode Admin
              </span>
            )}

            {/* Google User Profile or Login Link */}
            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-zinc-200">
                <Link
                  href="/login"
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                  title="Kelola Akun Google"
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover border border-zinc-300"
                  />
                  <div className="text-left hidden lg:block">
                    <p className="text-xs font-semibold text-zinc-900 leading-tight truncate max-w-[120px]">
                      {user.name}
                    </p>
                    <p className="text-[10px] text-zinc-500 font-mono truncate max-w-[120px]">
                      {user.role === 'admin' ? 'Admin Toko & CRM' : user.email}
                    </p>
                  </div>
                </Link>
                <button
                  type="button"
                  onClick={() => logout()}
                  className="p-1.5 text-zinc-400 hover:text-zinc-700 transition-colors"
                  title="Keluar"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 text-white font-medium transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Masuk Akun Google</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Header Section - Classic, Clean, White */}
      <section className="border-b border-zinc-200 bg-zinc-50/40 py-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto text-center space-y-3">
          <p className="text-[11px] uppercase tracking-widest text-zinc-500 font-mono">
            Katalog Elektronik Terverifikasi
          </p>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-zinc-900 max-w-2xl mx-auto">
            Jual Beli Perangkat Elektronik Bekas Berkualitas
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 max-w-xl mx-auto leading-relaxed">
            Menyediakan smartphone, laptop, kamera, dan audio bekas yang telah melalui pengujian teknis menyeluruh dengan laporan kondisi transparan dan garansi toko terpercaya.
          </p>

          {/* CRM Retention Highlight Strip */}
          <div className="pt-2 max-w-3xl mx-auto">
            <div className="bg-white border border-zinc-200 rounded-xl p-3 sm:p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs text-left">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-zinc-900">Program Loyalitas & Retensi Member</p>
                  <p className="text-[11px] text-zinc-500">
                    Kumpulkan 1 Poin setiap Rp 10.000 belanja • Nikmati potongan langsung saat checkout & promo khusus segmen Anda.
                  </p>
                </div>
              </div>

              {user && !isAdmin ? (
                <button
                  type="button"
                  onClick={() => setIsCustomerCRMOpen(true)}
                  className="px-3 py-1.5 bg-zinc-900 text-white text-[11px] font-semibold rounded-md hover:bg-zinc-800 transition-colors shrink-0"
                >
                  Buka Kartu Member →
                </button>
              ) : (
                <span className="text-[10px] text-zinc-400 font-mono hidden sm:block">
                  TechSecond ID Rewards
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content: Categories & Products */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-6">
        {/* Category Pills & Grade Filter */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`whitespace-nowrap px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-zinc-900 text-white'
                    : 'bg-white text-zinc-600 hover:text-zinc-900 border border-zinc-200 hover:border-zinc-300'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Condition Grade Filter */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="text-xs text-zinc-500 font-medium">Kondisi:</span>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="text-xs border border-zinc-300 rounded-md px-2.5 py-1.5 bg-white text-zinc-800 focus:outline-none focus:border-zinc-900"
            >
              {GRADES.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Product Catalog Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs text-zinc-500">
              Menampilkan <span className="font-semibold text-zinc-900">{products.length}</span> unit perangkat elektronik bekas
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-20 text-zinc-500">
              <p className="text-sm">Memuat katalog produk...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 text-zinc-500 space-y-2">
              <p className="text-base font-serif font-semibold text-zinc-800">Unit Tidak Ditemukan</p>
              <p className="text-xs">Coba ubah kata kunci pencarian atau filter kategori Anda.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onViewDetail={(p) => setSelectedProduct(p)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-zinc-50/70 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-serif font-bold text-base text-zinc-900">TechSecond ID</h3>
            <p className="text-zinc-600 mt-2 text-xs leading-relaxed">
              Platform e-commerce barang elektronik bekas terpercaya di Indonesia dengan standar uji teknisi bersertifikasi dan sistem retensi pelanggan modern.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-zinc-900 uppercase tracking-wider text-[11px] mb-3">
              Program Member & CRM
            </h4>
            <ul className="space-y-1.5 text-zinc-600 text-xs">
              <li>• Segmentasi Pelanggan Baru, Loyal, &amp; Winback</li>
              <li>• Poin Loyalitas (1 Poin = Rp 100 Diskon)</li>
              <li>• Promo Eksklusif Tertarget per Segmen</li>
              <li>• Garansi Penggantian Unit 90 Hari Toko</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-zinc-900 uppercase tracking-wider text-[11px] mb-3">
              Kontak Layanan
            </h4>
            <div className="space-y-2 text-zinc-600 text-xs">
              <p className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                <span>Jakarta Selatan, DKI Jakarta 12190</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-zinc-400" />
                <span>+62 812-3456-7890 (WhatsApp CS)</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-zinc-400" />
                <span>crm@techsecond.id</span>
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 border-t border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-zinc-500">
          <p>© 2026 TechSecond ID. Seluruh hak cipta dilindungi undang-undang.</p>
          <p>Layanan E-Commerce Barang Elektronik Bekas Terverifikasi</p>
        </div>
      </footer>

      {/* Gatekeeper Login Modal: Forces login first when entering website */}
      <LoginGatewayModal isOpen={!isAuthLoading && user === null} />

      {/* Modals */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onBuyNow={(prod) => {
          addToCart(prod, 1);
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

      {/* Customer CRM & Loyalty Modal */}
      <CustomerCRMModal
        isOpen={isCustomerCRMOpen}
        onClose={() => setIsCustomerCRMOpen(false)}
        onOpenOrderTrack={() => setIsOrderHistoryOpen(true)}
      />

      {/* AI Chatbot Consultant */}
      <AIChatbot onSelectProduct={(p) => setSelectedProduct(p)} />
    </div>
  );
}
