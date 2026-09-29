'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, ShoppingBag, BatteryCharging, MessageSquare } from 'lucide-react';
import { Product } from '@/lib/types';
import { useCart } from '@/lib/cart-context';
import { useAuth } from '@/lib/auth-context';

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
  'Cara bayar Virtual Account Midtrans',
];

export function AIChatbot({ onSelectProduct }: { onSelectProduct?: (product: Product) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Halo! Saya **TechGuru AI**, asisten spesialis gadget bekas bersertifikasi di TechSecond ID.\n\nSilakan tanyakan spesifikasi produk, rekomendasi sesuai anggaran, atau panduan kondisi Grade.`,
      timestamp: 'Baru saja',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { addToCart } = useCart();
  const { user } = useAuth();

  const isAdmin = user?.role === 'admin';

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
        throw new Error('Gagal memproses');
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: 'Maaf, terjadi kendala saat memproses jawaban. Silakan coba kembali.',
          timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-zinc-900 hover:bg-zinc-800 text-white p-3.5 rounded-full shadow-lg transition-transform hover:scale-105 flex items-center gap-2 font-sans border border-zinc-700"
          aria-label="Buka AI Konsultan Gadget"
        >
          <Bot className="w-5 h-5" />
          <span className="text-xs font-semibold pr-1 hidden sm:inline">AI Konsultan</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-4 sm:right-6 z-50 w-[94vw] sm:w-96 bg-white border border-zinc-200 rounded-xl shadow-2xl flex flex-col overflow-hidden max-h-[82vh] h-[550px] font-sans">
          {/* Header */}
          <div className="bg-zinc-900 text-white p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700">
                <Bot className="w-4 h-4 text-zinc-200" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-xs">TechGuru AI</h3>
                <p className="text-[10px] text-zinc-400">Konsultan Elektronik Bekas</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-zinc-400 hover:text-white p-1 rounded hover:bg-zinc-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-zinc-50/50 text-xs text-zinc-800">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg p-3 ${
                    m.role === 'user'
                      ? 'bg-zinc-900 text-white'
                      : 'bg-white border border-zinc-200 text-zinc-800 shadow-2xs'
                  }`}
                >
                  <p className="whitespace-pre-line leading-relaxed">{m.content}</p>

                  {/* Recommended products card if any */}
                  {m.products && m.products.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-zinc-100 space-y-2">
                      <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                        Rekomendasi Produk:
                      </p>
                      {m.products.map((prod) => (
                        <div
                          key={prod.id}
                          className="flex items-center gap-2 p-2 bg-zinc-50 border border-zinc-200 rounded cursor-pointer hover:border-zinc-400 transition-colors"
                          onClick={() => onSelectProduct?.(prod)}
                        >
                          <img
                            src={prod.image}
                            alt=""
                            className="w-10 h-10 object-contain rounded bg-white p-0.5 border border-zinc-200"
                          />
                          <div className="flex-1 min-w-0">
                            <span className="text-[9px] font-mono text-zinc-500 font-semibold">{prod.grade}</span>
                            <p className="text-xs font-medium truncate text-zinc-900">{prod.name}</p>
                            <p className="font-mono text-xs font-bold text-zinc-900">
                              Rp {prod.price.toLocaleString('id-ID')}
                            </p>
                          </div>
                          {!isAdmin && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                addToCart(prod, 1);
                              }}
                              className="p-1.5 bg-zinc-900 text-white rounded hover:bg-zinc-800 transition-colors"
                              title="Tambah ke Keranjang"
                            >
                              <ShoppingBag className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-[9px] text-zinc-400 mt-1 px-1">{m.timestamp}</span>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-1.5 p-3 bg-white border border-zinc-200 rounded-lg max-w-[70%]">
                <div className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce [animation-delay:0.4s]" />
                <span className="text-[11px] text-zinc-500 ml-1">Menganalisis...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick prompt suggestions */}
          <div className="px-3 py-1.5 bg-white border-t border-zinc-100 flex gap-1.5 overflow-x-auto">
            {QUICK_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(prompt)}
                disabled={isLoading}
                className="whitespace-nowrap px-2.5 py-1 text-[10px] bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded border border-zinc-200 transition-colors"
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
            className="p-3 bg-white border-t border-zinc-200 flex gap-2"
          >
            <input
              type="text"
              placeholder="Tanya harga, spesifikasi, atau kondisi..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 px-3 py-2 text-xs border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-900 bg-white"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 text-white rounded-lg transition-colors flex items-center justify-center"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
