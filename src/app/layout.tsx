import type { Metadata, Viewport } from 'next';
import { Instrument_Sans, Cormorant_Garamond } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/providers/AuthProvider';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { SmartInput } from '@/components/SmartInput';
import NextTopLoader from 'nextjs-toploader';

const sans = Instrument_Sans({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const serif = Cormorant_Garamond({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-serif',
  display: 'swap'
});

export const metadata: Metadata = {
  metadataBase: new URL('https://trason.vercel.app'),
  title: {
    default: 'TRASON - Your Personal OS for Intentional Growth',
    template: '%s | TRASON',
  },
  description: 'A calm Personal OS for finance, routines, sport, reminders, career signals, and plain-language insights.',
  keywords: [
    'Personal OS', 'habit tracker', 'financial planner', 
    'career growth', 'reminders', 'productivity', 'TRASON'
  ],
  authors: [{ name: 'TRASON' }],
  creator: 'TRASON',
  publisher: 'TRASON',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'TRASON - Your Personal OS',
    description: 'A calm Personal OS for finance, routines, sport, reminders, and career signals.',
    url: 'https://trason.vercel.app',
    siteName: 'TRASON',
    images: [
      {
        url: '/icon-192x192.png',
        width: 192,
        height: 192,
        alt: 'TRASON Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'TRASON - Your Personal OS',
    description: 'A calm Personal OS for finance, routines, sport, reminders, and career signals.',
    images: ['/icon-192x192.png'],
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'TRASON',
  },
  icons: {
    icon: '/favicon.svg',
    apple: '/icon-192x192.png',
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
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className={`${sans.variable} ${serif.variable} ${sans.className}`} suppressHydrationWarning>
        <ErrorBoundary>
          <NextTopLoader 
            color="#F4C95D"
            initialPosition={0.08}
            crawlSpeed={200}
            height={3}
            crawl={true}
            showSpinner={false}
            easing="ease"
            speed={200}
            shadow="0 0 10px #F4C95D,0 0 5px #F4C95D"
          />
          <AuthProvider>
            {children}
            <SmartInput />
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
