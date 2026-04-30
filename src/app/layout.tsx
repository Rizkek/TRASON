import type { Metadata, Viewport } from 'next';
import { Inter, Crimson_Text } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/providers/AuthProvider';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const crimson = Crimson_Text({ 
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-crimson',
  display: 'swap'
});

export const metadata: Metadata = {
  title: 'TRASON - Self-Improvement Platform',
  description: 'Personal finance tracker, daily timeline, reminders, and AI insights',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
  },
  icons: {
    icon: '/favicon.svg',
    apple: '/icon-192x192.svg',
  },
};

export const viewport: Viewport = {
  themeColor: '#0F0F0F',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192x192.svg" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className={`${inter.variable} ${crimson.variable} ${inter.className}`} suppressHydrationWarning>
        <ErrorBoundary>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
