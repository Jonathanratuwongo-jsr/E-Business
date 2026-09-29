'use client';

import React from 'react';
import { useCart } from '@/lib/cart-context';
import { useAuth } from '@/lib/auth-context';
import { X, Trash2, ShoppingBag, Plus, Minus, ArrowRight } from 'lucide-react';

interface CartDrawerProps {
  onCheckout: () => void;
}

export function CartDrawer({ onCheckout }: CartDrawerProps) {
  const { items, isOpen, setIsOpen, updateQuantity, removeFromCart, subtotal, totalItems } = useCart();
  const { user } = useAuth();

  if (!isOpen) return null;

  const isAdmin = user?.role === 'admin';

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-zinc-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl border-l border-zinc-200 flex flex-col font-sans text-zinc-900">
        {/* Drawer Header */}
        <div className="p-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-zinc-800" />
            <h3 className="font-serif font-bold text-sm text-zinc-900">
              Keranjang Belanja ({totalItems})
            </h3>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-500">
              <ShoppingBag className="w-12 h-12 stroke-1 text-zinc-300 mb-2" />
              <p className="text-xs font-medium text-zinc-700">Keranjang belanja Anda masih kosong</p>
              <p className="text-[11px] text-zinc-400 mt-1">
                Pilih produk elektronik bekas berkualitas di katalog kami
              </p>
            </div>
          ) : (
            items.map(({ product, quantity }) => (
              <div
                key={product.id}
                className="flex gap-3 p-3 bg-white rounded-lg border border-zinc-200 items-center justify-between"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-14 h-14 object-contain rounded bg-zinc-50 border border-zinc-100 p-1"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-mono font-medium text-zinc-500">
                    {product.grade}
                  </span>
                  <p className="text-xs font-medium text-zinc-900 truncate">{product.name}</p>
                  <p className="text-xs font-bold font-mono text-zinc-900 mt-0.5">
                    Rp {product.price.toLocaleString('id-ID')}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center border border-zinc-200 rounded">
                    <button
                      type="button"
                      onClick={() => updateQuantity(product.id, quantity - 1)}
                      className="p-1 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-2 text-xs font-mono font-semibold">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(product.id, quantity + 1)}
                      disabled={quantity >= product.stock}
                      className="p-1 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 transition-colors disabled:opacity-30"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFromCart(product.id)}
                    className="p-1 text-zinc-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer */}
        {items.length > 0 && (
          <div className="p-4 border-t border-zinc-200 bg-zinc-50 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-500">Subtotal Belanja</span>
              <span className="text-base font-bold font-mono text-zinc-900">
                Rp {subtotal.toLocaleString('id-ID')}
              </span>
            </div>

            {isAdmin ? (
              <div className="p-2.5 bg-zinc-100 border border-zinc-300 rounded text-center text-xs text-zinc-600">
                Mode Admin: Pembelian dinonaktifkan.
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onCheckout();
                }}
                className="w-full py-2.5 px-4 bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <span>Lanjut ke Formulir Pengiriman</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
