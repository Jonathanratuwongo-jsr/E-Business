'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Product, ConditionGrade } from '@/lib/types';
import { INITIAL_PRODUCTS } from '@/lib/db/initial-data';
import {
  Package,
  Plus,
  Trash2,
  Edit3,
  Search,
  ArrowLeft,
  RefreshCw,
  SlidersHorizontal,
  LogOut,
  AlertCircle,
  Eye,
} from 'lucide-react';

export function AdminDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');

  // Modal State for New/Edit Product
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  const [formProd, setFormProd] = useState({
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

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.success && data.data) {
        setProducts(data.data);
      }
    } catch {
      // Fallback to initial
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openAddModal = () => {
    setEditingProductId(null);
    setFormProd({
      name: '',
      brand: 'Apple',
      category: 'Smartphone',
      grade: 'Grade A+',
      originalPrice: 14000000,
      price: 8000000,
      stock: 1,
      image: 'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=800&auto=format&fit=crop&q=80',
      description: 'Unit elektronik bekas mulus terawat, fungsi 100% normal hasil uji teknisi.',
      batteryHealth: 92,
      imeiStatus: 'Terdaftar Kemenperin',
      accessories: 'Fullset Box + Adaptor Charger',
      warrantyDays: 60,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProductId(p.id);
    setFormProd({
      name: p.name,
      brand: p.brand,
      category: p.category,
      grade: p.grade,
      originalPrice: p.originalPrice,
      price: p.price,
      stock: p.stock,
      image: p.image,
      description: p.description,
      batteryHealth: p.qc.batteryHealth || 90,
      imeiStatus: p.qc.imeiStatus,
      accessories: p.qc.accessories,
      warrantyDays: p.qc.warrantyDays,
    });
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formProd.name.trim()) return;

    try {
      if (editingProductId) {
        // Edit existing product
        const updatedList = products.map((item) => {
          if (item.id === editingProductId) {
            return {
              ...item,
              name: formProd.name,
              brand: formProd.brand,
              category: formProd.category,
              grade: formProd.grade,
              originalPrice: Number(formProd.originalPrice),
              price: Number(formProd.price),
              stock: Number(formProd.stock),
              image: formProd.image,
              description: formProd.description,
              qc: {
                ...item.qc,
                batteryHealth: Number(formProd.batteryHealth),
                imeiStatus: formProd.imeiStatus,
                accessories: formProd.accessories,
                warrantyDays: Number(formProd.warrantyDays),
              },
            };
          }
          return item;
        });
        setProducts(updatedList);
      } else {
        // Create new product
        const payload: Omit<Product, 'id' | 'createdAt'> = {
          name: formProd.name,
          slug: formProd.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          brand: formProd.brand,
          category: formProd.category,
          grade: formProd.grade,
          originalPrice: Number(formProd.originalPrice),
          price: Number(formProd.price),
          stock: Number(formProd.stock),
          image: formProd.image,
          gallery: [formProd.image],
          description: formProd.description,
          qc: {
            batteryHealth: Number(formProd.batteryHealth),
            imeiStatus: formProd.imeiStatus,
            screenCondition: 'Mulus 100% No Scratch',
            bodyCondition: 'Mulus Seperti Baru 99%',
            cameraFunction: '100% Normal & Jernih',
            speakersMicrophone: '100% Normal Bersuara Jernih',
            faceIdFingerprint: '100% Normal Aktif',
            accessories: formProd.accessories,
            warrantyDays: Number(formProd.warrantyDays),
          },
          specs: {
            Kondisi: formProd.grade,
            Garansi: `${formProd.warrantyDays} Hari Toko`,
          },
        };

        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success && data.data) {
          setProducts([data.data, ...products]);
        }
      }
      setIsModalOpen(false);
    } catch {
      alert('Gagal menyimpan produk.');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus produk ini dari katalog?')) return;
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
      setProducts(products.filter((p) => p.id !== id));
    } catch {
      alert('Gagal menghapus produk.');
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchCat = selectedCategory === 'Semua' || p.category === selectedCategory;
    const matchSearch =
      !searchQuery.trim() ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans flex flex-col">
      {/* Top Navbar */}
      <header className="border-b border-zinc-200 bg-zinc-50/60 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-1.5 rounded border border-zinc-300 hover:bg-zinc-100 text-zinc-700 transition-colors"
              title="Kembali ke Beranda Toko"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-base font-serif font-bold text-zinc-900 flex items-center gap-2">
                <span>Panel Admin: Manajemen Katalog Produk</span>
              </h1>
              <p className="text-[11px] text-zinc-500">
                TechSecond ID — Hak Akses Khusus Pengelolaan Katalog & Inventaris
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block text-xs">
              <p className="font-semibold text-zinc-900">{user?.name || 'Admin Toko'}</p>
              <p className="text-[10px] text-zinc-500 font-mono">{user?.email || 'admin@techsecond.id'}</p>
            </div>
            <button
              onClick={() => {
                logout();
                router.push('/login');
              }}
              className="p-2 border border-zinc-300 rounded text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
              title="Keluar dari Akun Admin"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-6">
        {/* Notice of Role Limitation */}
        <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-lg flex items-start gap-3 text-xs text-zinc-700">
          <AlertCircle className="w-4 h-4 text-zinc-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-semibold text-zinc-900">Ketentuan Peran Admin Katalog:</p>
            <p className="text-[11px] text-zinc-600">
              Sesuai otorisasi sistem, akun Admin berwenang menambah, menyunting, dan menghapus unit pada katalog produk elektronik bekas. Fitur transaksi pembelian dan penambahan ke keranjang dinonaktifkan untuk akun Admin.
            </p>
          </div>
        </div>

        {/* Toolbar: Search, Filter, & Add Product Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Cari produk di katalog..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-zinc-300 rounded-md focus:outline-none focus:border-zinc-900 bg-white"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs border border-zinc-300 rounded-md px-2.5 py-1.5 bg-white text-zinc-800 focus:outline-none focus:border-zinc-900"
            >
              <option value="Semua">Semua Kategori</option>
              <option value="Smartphone">Smartphone</option>
              <option value="Laptop">Laptop</option>
              <option value="Kamera">Kamera</option>
              <option value="Tablet">Tablet</option>
              <option value="Audio">Audio</option>
              <option value="Gaming">Gaming</option>
            </select>

            <button
              onClick={fetchProducts}
              className="p-1.5 border border-zinc-300 rounded-md hover:bg-zinc-100 text-zinc-600"
              title="Perbarui Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <button
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-md text-xs font-semibold transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Produk Baru</span>
          </button>
        </div>

        {/* Products Table */}
        <div className="border border-zinc-200 rounded-lg overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Produk</th>
                  <th className="py-3 px-3">Kategori</th>
                  <th className="py-3 px-3">Grade</th>
                  <th className="py-3 px-3">Harga Bekas</th>
                  <th className="py-3 px-3">Stok</th>
                  <th className="py-3 px-3">Hasil QC</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 text-zinc-800">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-zinc-500">
                      Tidak ada produk ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-zinc-50/70 transition-colors">
                      <td className="py-3 px-4 flex items-center gap-3">
                        <img
                          src={p.image}
                          alt=""
                          className="w-10 h-10 object-contain rounded bg-zinc-50 border border-zinc-200 p-0.5 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-zinc-900 truncate max-w-xs">{p.name}</p>
                          <p className="text-[10px] text-zinc-500">{p.brand}</p>
                        </div>
                      </td>
                      <td className="py-3 px-3">{p.category}</td>
                      <td className="py-3 px-3">
                        <span className="font-mono font-medium text-[10px] px-1.5 py-0.5 rounded border border-zinc-300 bg-zinc-50">
                          {p.grade}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono font-semibold text-zinc-900">
                        Rp {p.price.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-3 font-mono">
                        {p.stock > 0 ? (
                          <span className="text-zinc-800">{p.stock} Unit</span>
                        ) : (
                          <span className="text-red-600 font-semibold">Habis</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-[11px] text-zinc-600">
                        {p.qc.batteryHealth && <span>BH {p.qc.batteryHealth}% • </span>}
                        <span>{p.qc.imeiStatus}</span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 rounded hover:bg-zinc-100 text-zinc-700 transition-colors"
                          title="Edit Produk"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-1.5 rounded hover:bg-zinc-100 text-zinc-500 hover:text-red-600 transition-colors"
                          title="Hapus Produk"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-900/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white border border-zinc-200 rounded-xl p-5 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <h3 className="font-serif font-bold text-base text-zinc-900 border-b border-zinc-100 pb-2">
              {editingProductId ? 'Edit Data Produk Katalog' : 'Tambah Produk Baru ke Katalog'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-700 mb-1">Nama Produk *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Apple iPhone 14 Pro 128GB Deep Purple"
                    value={formProd.name}
                    onChange={(e) => setFormProd({ ...formProd, name: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-md bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-zinc-700 mb-1">Brand *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Apple, Sony, Dell, Lenovo"
                    value={formProd.brand}
                    onChange={(e) => setFormProd({ ...formProd, brand: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-md bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-700 mb-1">Kategori</label>
                  <select
                    value={formProd.category}
                    onChange={(e) => setFormProd({ ...formProd, category: e.target.value as any })}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-md bg-white"
                  >
                    <option value="Smartphone">Smartphone</option>
                    <option value="Laptop">Laptop</option>
                    <option value="Kamera">Kamera</option>
                    <option value="Tablet">Tablet</option>
                    <option value="Audio">Audio</option>
                    <option value="Gaming">Gaming</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-700 mb-1">Grade Kondisi</label>
                  <select
                    value={formProd.grade}
                    onChange={(e) => setFormProd({ ...formProd, grade: e.target.value as any })}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-md bg-white"
                  >
                    <option value="Grade A+">Grade A+ (Mulus 99%)</option>
                    <option value="Grade A">Grade A (Mulus 95%)</option>
                    <option value="Grade B">Grade B (Lecet Halus)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-700 mb-1">Jumlah Stok</label>
                  <input
                    type="number"
                    min={1}
                    value={formProd.stock}
                    onChange={(e) => setFormProd({ ...formProd, stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-md bg-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-700 mb-1">Harga Baru Awal (Rp)</label>
                  <input
                    type="number"
                    value={formProd.originalPrice}
                    onChange={(e) => setFormProd({ ...formProd, originalPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-md bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-zinc-700 mb-1">Harga Jual Bekas (Rp) *</label>
                  <input
                    type="number"
                    required
                    value={formProd.price}
                    onChange={(e) => setFormProd({ ...formProd, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-md bg-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-700 mb-1">URL Foto Produk</label>
                <input
                  type="url"
                  value={formProd.image}
                  onChange={(e) => setFormProd({ ...formProd, image: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-md bg-white font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-700 mb-1">Deskripsi Kondisi Unit</label>
                <textarea
                  rows={2}
                  value={formProd.description}
                  onChange={(e) => setFormProd({ ...formProd, description: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-md bg-white"
                />
              </div>

              {/* QC parameters */}
              <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg space-y-3">
                <p className="font-semibold text-zinc-800 text-[11px]">Parameter Uji QC & Garansi:</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] text-zinc-600 mb-1">Battery Health (%)</label>
                    <input
                      type="number"
                      min={70}
                      max={100}
                      value={formProd.batteryHealth}
                      onChange={(e) => setFormProd({ ...formProd, batteryHealth: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 border border-zinc-300 rounded bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-600 mb-1">Status IMEI</label>
                    <select
                      value={formProd.imeiStatus}
                      onChange={(e) => setFormProd({ ...formProd, imeiStatus: e.target.value as any })}
                      className="w-full px-2 py-1.5 border border-zinc-300 rounded bg-white"
                    >
                      <option value="Terdaftar Kemenperin">Terdaftar Kemenperin</option>
                      <option value="Resmi Bea Cukai">Resmi Bea Cukai</option>
                      <option value="WiFi Only">WiFi Only</option>
                      <option value="N/A">N/A</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-600 mb-1">Garansi Toko (Hari)</label>
                    <input
                      type="number"
                      value={formProd.warrantyDays}
                      onChange={(e) => setFormProd({ ...formProd, warrantyDays: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 border border-zinc-300 rounded bg-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-zinc-600 mb-1">Kelengkapan Aksesoris</label>
                  <input
                    type="text"
                    value={formProd.accessories}
                    onChange={(e) => setFormProd({ ...formProd, accessories: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-zinc-300 rounded bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-zinc-300 rounded-md text-zinc-700 hover:bg-zinc-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold rounded-md"
                >
                  Simpan ke Katalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer info */}
      <footer className="border-t border-zinc-200 py-4 text-center text-xs text-zinc-500">
        TechSecond ID — Panel Pengelolaan Katalog Toko Elektronik Bekas
      </footer>
    </div>
  );
}
