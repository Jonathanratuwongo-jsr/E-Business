'use client';

import React, { useState } from 'react';
import { Product } from '@/lib/types';
import { useCart } from '@/lib/cart-context';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { X, BatteryCharging, Shield, Check, ShoppingBag, SlidersHorizontal } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onBuyNow: (product: Product) => void;
}

export function ProductDetailModal({ product, onClose, onBuyNow }: ProductDetailModalProps) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!product) return null;

  const isAdmin = user?.role === 'admin';
  const allImages = [product.image, ...(product.gallery || [])];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-3xl bg-white rounded-xl shadow-xl border border-zinc-200 overflow-hidden max-h-[92vh] flex flex-col font-sans">
        {/* Modal Header */}
        <div className="p-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs px-2 py-0.5 rounded border border-zinc-300 bg-white font-semibold text-zinc-800">
              {product.grade}
            </span>
            <span className="text-xs font-serif font-bold text-zinc-900 truncate max-w-sm">
              {product.name}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-zinc-800">
          {/* Left Column: Photos */}
          <div className="space-y-3">
            <div className="w-full aspect-square bg-zinc-50 rounded-lg border border-zinc-200 overflow-hidden flex items-center justify-center p-4">
              <img
                src={allImages[activeImageIndex] || product.image}
                alt={product.name}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Thumbnail Gallery */}
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-14 h-14 rounded border p-1 bg-zinc-50 transition-colors shrink-0 ${
                      activeImageIndex === idx ? 'border-zinc-900' : 'border-zinc-200 hover:border-zinc-300'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}

            {/* Price Box */}
            <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg">
              <div className="flex items-baseline justify-between">
                <div>
                  <p className="text-[10px] text-zinc-400 line-through font-mono">
                    Harga Baru: Rp {product.originalPrice.toLocaleString('id-ID')}
                  </p>
                  <p className="text-lg font-bold font-mono text-zinc-900">
                    Rp {product.price.toLocaleString('id-ID')}
                  </p>
                </div>
                <span className="text-[10px] font-mono text-zinc-600 bg-white px-2 py-0.5 rounded border border-zinc-200">
                  Stok: {product.stock} Unit
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Specs & Quality Control (35 Titik Uji) */}
          <div className="space-y-4">
            <div>
              <h4 className="text-[11px] font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                Deskripsi Unit
              </h4>
              <p className="text-zinc-600 leading-relaxed text-xs">{product.description}</p>
            </div>

            {/* QC Report */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-semibold text-zinc-700 uppercase tracking-wider">
                Hasil Uji Kelayakan Unit (QC)
              </h4>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                {product.qc.batteryHealth && (
                  <div className="bg-zinc-50 p-2 rounded border border-zinc-200">
                    <span className="text-zinc-500 text-[10px]">Kapasitas Baterai</span>
                    <p className="font-mono font-bold text-zinc-900 mt-0.5 flex items-center gap-1">
                      <BatteryCharging className="w-3.5 h-3.5 text-zinc-700" />
                      {product.qc.batteryHealth}%
                    </p>
                  </div>
                )}
                {product.qc.cycleCount && (
                  <div className="bg-zinc-50 p-2 rounded border border-zinc-200">
                    <span className="text-zinc-500 text-[10px]">Siklus Baterai</span>
                    <p className="font-mono font-bold text-zinc-900 mt-0.5">{product.qc.cycleCount} Kali</p>
                  </div>
                )}
                <div className="bg-zinc-50 p-2 rounded border border-zinc-200">
                  <span className="text-zinc-500 text-[10px]">Status IMEI</span>
                  <p className="font-medium text-zinc-900 mt-0.5">{product.qc.imeiStatus}</p>
                </div>
                <div className="bg-zinc-50 p-2 rounded border border-zinc-200">
                  <span className="text-zinc-500 text-[10px]">Kondisi Layar</span>
                  <p className="font-medium text-zinc-900 mt-0.5">{product.qc.screenCondition}</p>
                </div>
                <div className="bg-zinc-50 p-2 rounded border border-zinc-200">
                  <span className="text-zinc-500 text-[10px]">Kondisi Fisik / Bodi</span>
                  <p className="font-medium text-zinc-900 mt-0.5">{product.qc.bodyCondition}</p>
                </div>
                <div className="bg-zinc-50 p-2 rounded border border-zinc-200">
                  <span className="text-zinc-500 text-[10px]">Garansi Toko</span>
                  <p className="font-medium text-zinc-900 mt-0.5">{product.qc.warrantyDays} Hari</p>
                </div>
              </div>
              <div className="bg-zinc-50 p-2.5 rounded border border-zinc-200 text-[11px]">
                <span className="text-zinc-500 text-[10px]">Kelengkapan Unit:</span>
                <p className="font-medium text-zinc-900 mt-0.5">{product.qc.accessories}</p>
              </div>
            </div>

            {/* Specifications */}
            {product.specs && (
              <div className="space-y-1.5">
                <h4 className="text-[11px] font-semibold text-zinc-700 uppercase tracking-wider">
                  Spesifikasi Teknis
                </h4>
                <div className="border border-zinc-200 rounded divide-y divide-zinc-200 text-[11px]">
                  {Object.entries(product.specs).map(([k, v]) => (
                    <div key={k} className="flex justify-between p-2 bg-white">
                      <span className="text-zinc-500">{k}</span>
                      <span className="font-medium text-zinc-900">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions: Admin vs Customer */}
            <div className="pt-2">
              {isAdmin ? (
                <div className="p-3 bg-zinc-50 border border-zinc-300 rounded-lg text-center space-y-2">
                  <p className="text-xs font-semibold text-zinc-800">
                    Mode Admin Katalog Aktif
                  </p>
                  <p className="text-[11px] text-zinc-500">
                    Akun Admin hanya berwenang melihat dan mengelola katalog produk. Pembelian dinonaktifkan.
                  </p>
                  <Link
                    href="/admin"
                    onClick={onClose}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded text-xs font-medium transition-colors"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Buka Panel Kelola Produk</span>
                  </Link>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      addToCart(product, 1);
                      onClose();
                    }}
                    className="flex-1 py-2.5 px-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-medium rounded-lg text-xs border border-zinc-300 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Tambah Keranjang</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onBuyNow(product);
                      onClose();
                    }}
                    className="flex-1 py-2.5 px-4 bg-zinc-900 hover:bg-zinc-800 text-white font-medium rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>Beli Sekarang</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
