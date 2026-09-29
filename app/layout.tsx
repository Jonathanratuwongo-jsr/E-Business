import { Analytics } from '@vercel/analytics/next';
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { CartProvider } from '@/lib/cart-context';

export const metadata: Metadata = {
  title: 'TechSecond ID - Katalog Elektronik Bekas Berkualitas',
  description:
    'Platform e-commerce jual beli smartphone, laptop, kamera, tablet, dan audio bekas berkualitas tinggi dengan hasil uji kelayakan transparan.',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
};

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#ffffff',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased min-h-screen bg-white text-zinc-900">
        <AuthProvider>
          <CartProvider>{children}</CartProvider>
        </AuthProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  );
}
