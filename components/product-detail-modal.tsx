'use client';

import React, { useState } from 'react';
import { Product } from '@/lib/types';
import { useCart } from '@/lib/cart-context';
import {
  X,
  ShieldCheck,
  BatteryCharging,
  CheckCircle2,
  Package,
  Cpu,
  Truck,
  RotateCcw,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onBuyNow: (product: Product) => void;
}

export function ProductDetailModal({ product, onClose, onBuyNow }: ProductDetailModalProps) {
  const { addToCart } = useCart();
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!product) return null;

  const images = product.gallery && product.gallery.length > 0 ? product.gallery : [product.image];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-background rounded-3xl shadow-2xl border border-border overflow-hidden max-h-[92vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-background/80 hover:bg-muted text-foreground backdrop-blur border border-border transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Body */}
        <div className="overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Image Gallery */}
          <div className="space-y-3">
            <div className="relative aspect-square bg-muted/40 rounded-2xl overflow-hidden border border-border flex items-center justify-center">
              <img
                src={images[activeImageIndex] || product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 flex flex-col gap-1">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-black uppercase text-white shadow-md ${
                    product.grade === 'Grade A+'
                      ? 'bg-emerald-600'
                      : product.grade === 'Grade A'
                      ? 'bg-blue-600'
                      : 'bg-amber-600'
                  }`}
                >
                  {product.grade}
                </span>
              </div>
            </div>

            {/* Thumbnail list */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-16 h-16 rounded-xl border-2 overflow-hidden shrink-0 transition-all ${
                      activeImageIndex === idx ? 'border-blue-600 ring-2 ring-blue-500/30' : 'border-border'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Guarantee highlight banners */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-blue-50 dark:bg-blue-950/40 p-3 rounded-xl border border-blue-200 dark:border-blue-800/50 flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-blue-600 shrink-0" />
                <div>
                  <p className="font-bold text-blue-900 dark:text-blue-200">Garansi {product.qc.warrantyDays} Hari</p>
                  <p className="text-[10px] text-blue-700 dark:text-blue-300">Tukar Unit Jika Cacat</p>
                </div>
              </div>

              <div className="bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800/50 flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <p className="font-bold text-emerald-900 dark:text-emerald-200">Asuransi Full 100%</p>
                  <p className="text-[10px] text-emerald-700 dark:text-emerald-300">Pengiriman Aman</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Specs & 35-Point QC */}
          <div className="space-y-5">
            <div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <span className="font-bold text-blue-600 uppercase">{product.brand}</span>
                <span>•</span>
                <span>{product.category}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-foreground leading-tight">
                {product.name}
              </h2>

              <div className="mt-3 flex items-baseline gap-3">
                <span className="text-2xl sm:text-3xl font-extrabold text-foreground">
                  Rp {product.price.toLocaleString('id-ID')}
                </span>
                <span className="text-sm text-muted-foreground line-through">
                  Rp {product.originalPrice.toLocaleString('id-ID')}
                </span>
                <span className="text-xs font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-full">
                  Hemat Rp {(product.originalPrice - product.price).toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              {product.description}
            </p>

            {/* 35-Point QC Inspection Sheet */}
            <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-border pb-2.5">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span className="font-bold text-xs uppercase tracking-wider text-foreground">
                    Hasil Uji 35-Titik QC Teknisi
                  </span>
                </div>
                <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                  PASS (Lolos Uji)
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {product.qc.batteryHealth && (
                  <div className="bg-muted/40 p-2.5 rounded-xl border border-border/60">
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <BatteryCharging className="w-3 h-3 text-emerald-600" /> Kesehatan Baterai (BH)
                    </p>
                    <p className="font-bold text-foreground mt-0.5">{product.qc.batteryHealth}% (Original)</p>
                  </div>
                )}

                {product.qc.cycleCount && (
                  <div className="bg-muted/40 p-2.5 rounded-xl border border-border/60">
                    <p className="text-[10px] text-muted-foreground">Cycle Count</p>
                    <p className="font-bold text-foreground mt-0.5">{product.qc.cycleCount}x putaran</p>
                  </div>
                )}

                {product.qc.shutterCount && (
                  <div className="bg-muted/40 p-2.5 rounded-xl border border-border/60">
                    <p className="text-[10px] text-muted-foreground">Shutter Count</p>
                    <p className="font-bold text-foreground mt-0.5">{product.qc.shutterCount.toLocaleString()} Jepret</p>
                  </div>
                )}

                <div className="bg-muted/40 p-2.5 rounded-xl border border-border/60">
                  <p className="text-[10px] text-muted-foreground">Status IMEI</p>
                  <p className="font-bold text-foreground mt-0.5">{product.qc.imeiStatus}</p>
                </div>

                <div className="bg-muted/40 p-2.5 rounded-xl border border-border/60">
                  <p className="text-[10px] text-muted-foreground">Kondisi Layar</p>
                  <p className="font-semibold text-foreground mt-0.5">{product.qc.screenCondition}</p>
                </div>

                <div className="bg-muted/40 p-2.5 rounded-xl border border-border/60">
                  <p className="text-[10px] text-muted-foreground">Kondisi Fisik / Bodi</p>
                  <p className="font-semibold text-foreground mt-0.5">{product.qc.bodyCondition}</p>
                </div>
              </div>

              <div className="bg-muted/30 p-2.5 rounded-xl border border-border/60 text-xs">
                <p className="text-[10px] text-muted-foreground">Kelengkapan Paket:</p>
                <p className="font-medium text-foreground mt-0.5">{product.qc.accessories}</p>
              </div>
            </div>

            {/* Technical Specifications */}
            {product.specs && Object.keys(product.specs).length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Spesifikasi Teknis
                </h4>
                <div className="divide-y divide-border text-xs border border-border rounded-xl overflow-hidden">
                  {Object.entries(product.specs).map(([key, val]) => (
                    <div key={key} className="flex justify-between p-2.5 bg-card hover:bg-muted/30">
                      <span className="text-muted-foreground">{key}</span>
                      <span className="font-medium text-foreground text-right">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  addToCart(product, 1);
                  onClose();
                }}
                className="flex-1 py-3 px-4 bg-muted hover:bg-muted/80 text-foreground rounded-2xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 border border-border"
              >
                <ShoppingBag className="w-4 h-4" /> Tambah Keranjang
              </button>

              <button
                type="button"
                onClick={() => {
                  onBuyNow(product);
                  onClose();
                }}
                className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs sm:text-sm shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
              >
                Beli Sekarang (Midtrans)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
