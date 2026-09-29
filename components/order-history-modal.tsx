'use client';

import React, { useState, useEffect } from 'react';
import { Order } from '@/lib/types';
import { X, ShoppingBag, Truck, RefreshCw } from 'lucide-react';

interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPayPendingOrder: (order: Order) => void;
}

export function OrderHistoryModal({ isOpen, onClose, onPayPendingOrder }: OrderHistoryModalProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.success) {
        setOrders(data.data);
      }
    } catch {
      // Ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchOrders();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-xl border border-zinc-200 overflow-hidden max-h-[90vh] flex flex-col font-sans">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
          <div>
            <h2 className="text-base font-serif font-bold text-zinc-900">Riwayat Pesanan & Lacak Resi</h2>
            <p className="text-[11px] text-zinc-500">Status pesanan dan pelacakan pengiriman kurir</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchOrders}
              className="p-1.5 rounded hover:bg-zinc-100 text-zinc-600 transition-colors"
              title="Perbarui Data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Orders List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 text-xs">
          {orders.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">
              <ShoppingBag className="w-10 h-10 mx-auto mb-2 text-zinc-300 stroke-1" />
              <p className="font-semibold text-zinc-800">Belum Ada Transaksi</p>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Pesanan yang telah Anda lakukan akan tercatat di sini.
              </p>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="bg-white border border-zinc-200 rounded-lg p-4 space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 pb-2.5">
                  <div>
                    <span className="font-mono font-bold text-zinc-900">{order.orderNumber}</span>
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

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                      order.status === 'Sudah Dibayar' || order.status === 'Selesai'
                        ? 'bg-zinc-900 text-white border-zinc-900'
                        : 'bg-zinc-100 text-zinc-800 border-zinc-300'
                    }`}
                  >
                    {order.status}
                  </span>
                </div>

                {/* Items */}
                <div className="space-y-1.5">
                  {order.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between items-center text-[11px]">
                      <span className="text-zinc-700">
                        {it.quantity}x {it.productName} ({it.grade})
                      </span>
                      <span className="font-mono text-zinc-900 font-medium">
                        Rp {(it.price * it.quantity).toLocaleString('id-ID')}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Tracking info if shipped */}
                {order.trackingNumber && (
                  <div className="p-2.5 bg-zinc-50 rounded border border-zinc-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-zinc-700" />
                      <div>
                        <p className="text-[10px] text-zinc-500 uppercase font-semibold">
                          Resi {order.courier}
                        </p>
                        <p className="font-mono font-bold text-zinc-900">{order.trackingNumber}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-zinc-100 text-xs">
                  <div>
                    <span className="text-zinc-500">Total Pembayaran: </span>
                    <span className="font-mono font-bold text-zinc-900">
                      Rp {order.total.toLocaleString('id-ID')}
                    </span>
                  </div>

                  {order.status === 'Menunggu Pembayaran' && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onPayPendingOrder(order);
                      }}
                      className="px-3 py-1 bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs rounded transition-colors"
                    >
                      Bayar Sekarang
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
