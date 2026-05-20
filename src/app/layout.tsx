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
  title: 'TRASON - Self-Improvement Platform',
  description: 'Personal finance tracker, daily schedule, reminders, and AI insights',
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
      <body className={`${sans.variable} ${serif.variable} ${sans.className}`} suppressHydrationWarning>
        <ErrorBoundary>
          <NextTopLoader 
            color="#4E4FEB"
            initialPosition={0.08}
            crawlSpeed={200}
            height={3}
            crawl={true}
            showSpinner={false}
            easing="ease"
            speed={200}
            shadow="0 0 10px #4E4FEB,0 0 5px #4E4FEB"
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
