'use client';

import React from 'react';
import { Product } from '@/lib/types';
import { ShieldCheck, BatteryCharging, ShoppingBag, Eye, Sparkles } from 'lucide-react';
import { useCart } from '@/lib/cart-context';

interface ProductCardProps {
  product: Product;
  onViewDetail: (product: Product) => void;
}

export function ProductCard({ product, onViewDetail }: ProductCardProps) {
  const { addToCart } = useCart();

  const discountPercent = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100
  );

  return (
    <div className="group relative bg-card border border-border/80 hover:border-blue-500/50 rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col">
      {/* Badges on top */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start">
        <span
          className={`px-2.5 py-1 rounded-full text-[11px] font-black tracking-wide shadow-sm uppercase ${
            product.grade === 'Grade A+'
              ? 'bg-emerald-600 text-white'
              : product.grade === 'Grade A'
              ? 'bg-blue-600 text-white'
              : 'bg-amber-600 text-white'
          }`}
        >
          {product.grade}
        </span>
        {product.badge && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-900/90 text-indigo-100 backdrop-blur-md border border-indigo-400/20 flex items-center gap-1 shadow-sm">
            <Sparkles className="w-2.5 h-2.5 text-amber-300 fill-amber-300" />
            {product.badge}
          </span>
        )}
      </div>

      <div className="absolute top-3 right-3 z-10">
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white shadow-sm">
          Hemat {discountPercent}%
        </span>
      </div>

      {/* Image container */}
      <div
        onClick={() => onViewDetail(product)}
        className="relative w-full aspect-square bg-muted/40 cursor-pointer overflow-hidden flex items-center justify-center p-4"
      >
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover rounded-xl transition-transform duration-500 group-hover:scale-105"
        />

        {/* Quick view overlay */}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetail(product);
            }}
            className="p-2.5 bg-white text-slate-900 rounded-full shadow-lg hover:bg-slate-100 transition-transform hover:scale-110"
            title="Lihat Detail & QC"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Info content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
            <span className="font-semibold text-blue-600 dark:text-blue-400">{product.brand}</span>
            <span>{product.category}</span>
          </div>

          <h3
            onClick={() => onViewDetail(product)}
            className="font-bold text-sm text-foreground line-clamp-2 hover:text-blue-600 transition-colors cursor-pointer leading-snug"
          >
            {product.name}
          </h3>

          {/* Transparent QC Highlights */}
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {product.qc.batteryHealth && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800/50">
                <BatteryCharging className="w-3 h-3 text-emerald-600" />
                BH {product.qc.batteryHealth}%
              </span>
            )}

            {product.qc.imeiStatus !== 'N/A' && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800/50">
                <ShieldCheck className="w-3 h-3 text-blue-600" />
                IMEI Aman
              </span>
            )}

            <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
              Garansi {product.qc.warrantyDays} Hari
            </span>
          </div>
        </div>

        {/* Pricing and Action */}
        <div className="mt-4 pt-3 border-t border-border flex items-end justify-between">
          <div>
            <p className="text-[11px] text-muted-foreground line-through">
              Rp {product.originalPrice.toLocaleString('id-ID')}
            </p>
            <p className="text-base font-extrabold text-foreground">
              Rp {product.price.toLocaleString('id-ID')}
            </p>
          </div>

          <button
            type="button"
            onClick={() => addToCart(product, 1)}
            disabled={product.stock <= 0}
            className="p-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl shadow-sm transition-all disabled:opacity-40"
            title="Tambah ke Keranjang"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
