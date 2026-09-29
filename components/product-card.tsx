'use client';

import React from 'react';
import { Product } from '@/lib/types';
import { BatteryCharging, Eye, ShoppingBag } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { useAuth } from '@/lib/auth-context';

interface ProductCardProps {
  product: Product;
  onViewDetail: (product: Product) => void;
}

export function ProductCard({ product, onViewDetail }: ProductCardProps) {
  const { addToCart } = useCart();
  const { user } = useAuth();

  const isAdmin = user?.role === 'admin';

  return (
    <div className="group bg-white border border-zinc-200 hover:border-zinc-400 rounded-lg overflow-hidden transition-all duration-200 flex flex-col font-sans">
      {/* Top badges */}
      <div className="relative w-full aspect-square bg-zinc-50 border-b border-zinc-100 flex items-center justify-center p-3 cursor-pointer overflow-hidden" onClick={() => onViewDetail(product)}>
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1 items-start">
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold tracking-wide border border-zinc-300 bg-white text-zinc-800 shadow-2xs">
            {product.grade}
          </span>
          {product.badge && (
            <span className="px-2 py-0.5 rounded text-[10px] font-sans font-medium bg-zinc-900 text-white">
              {product.badge}
            </span>
          )}
        </div>

        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
        />

        {/* Quick view button */}
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="px-3 py-1.5 bg-white text-zinc-900 text-xs font-medium rounded shadow-sm border border-zinc-200 flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5" />
            <span>Lihat Detail</span>
          </span>
        </div>
      </div>

      {/* Product Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between text-[11px] text-zinc-500 mb-1">
            <span className="font-semibold text-zinc-800 uppercase tracking-wider">{product.brand}</span>
            <span>{product.category}</span>
          </div>

          <h3
            onClick={() => onViewDetail(product)}
            className="font-serif font-bold text-sm text-zinc-900 line-clamp-2 hover:underline cursor-pointer leading-snug"
          >
            {product.name}
          </h3>

          {/* Condition specs */}
          <div className="mt-2 flex flex-wrap gap-1 text-[10px] text-zinc-600 font-mono">
            {product.qc.batteryHealth && (
              <span className="inline-flex items-center gap-1 bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200">
                <BatteryCharging className="w-3 h-3 text-zinc-700" />
                BH {product.qc.batteryHealth}%
              </span>
            )}
            <span className="bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200">
              Garansi {product.qc.warrantyDays} Hari
            </span>
          </div>
        </div>

        {/* Price & Action */}
        <div className="pt-2 border-t border-zinc-100 flex items-end justify-between">
          <div>
            <p className="text-[10px] text-zinc-400 line-through font-mono">
              Rp {product.originalPrice.toLocaleString('id-ID')}
            </p>
            <p className="text-sm font-bold font-mono text-zinc-900">
              Rp {product.price.toLocaleString('id-ID')}
            </p>
          </div>

          {/* As requested: Admin can only manage/view, cannot buy or add to cart */}
          {isAdmin ? (
            <button
              type="button"
              onClick={() => onViewDetail(product)}
              className="text-[11px] px-2.5 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-medium rounded border border-zinc-300 transition-colors"
              title="Mode Admin: Hanya Lihat & Kelola"
            >
              Lihat Unit
            </button>
          ) : (
            <button
              type="button"
              onClick={() => addToCart(product, 1)}
              disabled={product.stock <= 0}
              className="p-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded transition-colors disabled:opacity-40"
              title="Tambah ke Keranjang"
              aria-label="Tambah ke Keranjang"
            >
              <ShoppingBag className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
