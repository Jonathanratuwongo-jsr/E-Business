'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, ShoppingBag, ShieldCheck, BatteryCharging, ChevronRight, MessageSquare } from 'lucide-react';
import { Product } from '@/lib/types';
import { useCart } from '@/lib/cart-context';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  products?: Product[];
  timestamp: string;
}

const QUICK_PROMPTS = [
  'Penjelasan Grade A+ vs A vs B',
  'Rekomendasi Laptop Kerja 8 Jutaan',
  'Berapa standar aman Battery Health?',
  'Apakah IMEI terdaftar aman anti-blokir?',
  'Cara bayar pakai QRIS Midtrans',
];

export function AIChatbot({ onSelectProduct }: { onSelectProduct?: (product: Product) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Halo! Saya **TechGuru AI**, asisten spesialis gadget bekas bersertifikasi di TechSecond ID. 📱💻\n\nAda yang bisa saya bantu untuk menemukan gadget impian Anda hari ini?`,
      timestamp: 'Baru saja',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { addToCart } = useCart();

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await res.json();
      if (data.success && data.message) {
        setMessages((prev) => [
          ...prev,
          {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: data.message.content,
            products: data.message.products,
            timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } else {
        throw new Error('Gagal memproses pesan');
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: 'Maaf, terjadi gangguan koneksi ke AI consultant. Silakan coba tanyakan kembali.',
          timestamp: 'Baru saja',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-3 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 group border border-white/20"
          aria-label="Buka AI Konsultan Gadget"
        >
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-bold leading-tight flex items-center gap-1">
              Konsultan AI <Sparkles className="w-3 h-3 text-amber-300 fill-amber-300" />
            </p>
            <p className="text-[10px] text-blue-100">Tanya Gadget Bekas</p>
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 z-50 w-full sm:w-96 max-w-[calc(100vw-2rem)] h-[560px] bg-background border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white p-3.5 px-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm">TechGuru AI</h3>
                  <span className="bg-emerald-500/30 text-emerald-100 text-[10px] px-1.5 py-0.2 rounded-full border border-emerald-300/30">
                    Online
                  </span>
                </div>
                <p className="text-[11px] text-blue-100">Spesialis Rekomendasi & QC Gadget</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages scroll area */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-muted/20 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3 shadow-xs ${
                    m.role === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-card border border-border text-foreground rounded-tl-none'
                  }`}
                >
                  <div className="whitespace-pre-line leading-relaxed">{m.content}</div>

                  {/* Render recommended products if any */}
                  {m.products && m.products.length > 0 && (
                    <div className="mt-2.5 pt-2.5 border-t border-border/60 space-y-2">
                      <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
                        Rekomendasi Produk Terkait:
                      </p>
                      {m.products.map((prod) => (
                        <div
                          key={prod.id}
                          className="bg-muted/50 rounded-xl p-2 border border-border flex items-center gap-2 hover:bg-muted transition-colors"
                        >
                          <img
                            src={prod.image}
                            alt={prod.name}
                            className="w-12 h-12 rounded-lg object-cover bg-white"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-[11px] truncate">{prod.name}</p>
                            <p className="text-blue-600 dark:text-blue-400 font-bold text-xs">
                              Rp {prod.price.toLocaleString('id-ID')}
                            </p>
                            <span className="inline-block text-[9px] bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 px-1.5 py-0.2 rounded font-medium">
                              {prod.grade}
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              addToCart(prod, 1);
                            }}
                            className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                            title="Tambah ke Keranjang"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-[9px] text-muted-foreground mt-1 px-1">{m.timestamp}</span>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-muted-foreground text-xs p-2 bg-card border border-border rounded-xl w-fit">
                <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse delay-150" />
                <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse delay-300" />
                <span>TechGuru sedang mengetik...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="px-3 py-1.5 bg-muted/40 border-t border-border overflow-x-auto whitespace-nowrap scrollbar-none flex gap-1.5">
            {QUICK_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(prompt)}
                className="text-[10px] bg-background hover:bg-muted text-foreground border border-border px-2.5 py-1 rounded-full shrink-0 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input field */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-2.5 bg-background border-t border-border flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Tanya rekomendasi gadget bekas..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-muted/50 border border-input rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
