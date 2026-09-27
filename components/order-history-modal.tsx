'use client';

import React, { useState, useEffect } from 'react';
import { Order } from '@/lib/types';
import { X, ShoppingBag, Truck, CheckCircle2, Clock, ExternalLink, RefreshCw } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-background rounded-3xl shadow-2xl border border-border overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-blue-600" />
            <div>
              <h2 className="text-base font-bold text-foreground">Riwayat Pesanan & Lacak Resi</h2>
              <p className="text-xs text-muted-foreground">Status transaksi via Midtrans Payment Gateway</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchOrders}
              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Orders list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {orders.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-xs">
              <ShoppingBag className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="font-semibold text-foreground">Belum ada transaksi</p>
              <p>Pesanan yang Anda buat akan muncul di sini beserta nomor resi pengiriman.</p>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="bg-card border border-border rounded-2xl p-4 space-y-3 text-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2.5">
                  <div>
                    <span className="font-mono font-bold text-blue-600">{order.orderNumber}</span>
                    <p className="text-[10px] text-muted-foreground">
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
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      order.status === 'Selesai'
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                        : order.status === 'Dikirim'
                        ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                        : order.status === 'Diproses' || order.status === 'Sudah Dibayar'
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {order.status}
                  </span>
                </div>

                {/* Items */}
                <div className="space-y-2">
                  {order.items.map((it) => (
                    <div key={it.productId} className="flex items-center gap-3">
                      <img
                        src={it.productImage}
                        alt={it.productName}
                        className="w-12 h-12 rounded-xl object-cover bg-muted shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground truncate">{it.productName}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {it.quantity}x • Rp {it.price.toLocaleString('id-ID')} ({it.grade})
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Courier & Tracking */}
                <div className="bg-muted/40 p-2.5 rounded-xl border border-border/60 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-[10px] text-muted-foreground">Kurir Pengiriman:</p>
                    <p className="font-medium text-foreground">{order.courier}</p>
                  </div>

                  {order.trackingNumber ? (
                    <div className="text-right">
                      <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 justify-end">
                        <Truck className="w-3.5 h-3.5" /> No. Resi Ekspedisi:
                      </p>
                      <p className="font-mono font-bold text-foreground">{order.trackingNumber}</p>
                    </div>
                  ) : (
                    <span className="text-[11px] text-amber-600 dark:text-amber-400 italic">
                      Resi sedang diproses penjual
                    </span>
                  )}
                </div>

                {/* Footer status & Actions */}
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <span className="text-muted-foreground text-[11px]">Total Tagihan:</span>
                    <p className="font-extrabold text-foreground text-sm">
                      Rp {order.total.toLocaleString('id-ID')}
                    </p>
                  </div>

                  {order.status === 'Menunggu Pembayaran' && (
                    <button
                      onClick={() => {
                        onClose();
                        onPayPendingOrder(order);
                      }}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-sm"
                    >
                      Buka Pembayaran Midtrans
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
