import type { Metadata, Viewport } from 'next';
import { Instrument_Sans, Cormorant_Garamond } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/providers/AuthProvider';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { SmartInput } from '@/components/SmartInput';
import { PwaInstallPrompt } from '@/components/PwaInstallPrompt';
import NextTopLoader from 'nextjs-toploader';

const sans = Instrument_Sans({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const serif = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-serif',
  display: 'swap',
});

const BASE_URL = 'https://www.trason.web.id';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'TRASON',
    template: '%s | TRASON',
  },
  description:
    'Stop switching apps. TRASON unifies your finance, daily habits, and career tracking into one calm dashboard. Start for free.',
  keywords: [
    'Personal OS',
    'habit tracker',
    'financial planner',
    'career growth',
    'personal dashboard',
    'life management app',
    'productivity',
    'TRASON',
    'personal operating system',
  ],
  authors: [{ name: 'TRASON', url: BASE_URL }],
  creator: 'TRASON',
  publisher: 'TRASON',
  alternates: {
    canonical: '/',
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'TRASON | Personal OS',
    description:
      'Stop switching apps. TRASON unifies your finance, daily habits, and career tracking into one calm dashboard.',
    url: BASE_URL,
    siteName: 'TRASON',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'TRASON – Personal Operating System dashboard preview',
        type: 'image/png',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TRASON | Personal OS',
    description:
      'Stop switching apps. TRASON unifies your finance, daily habits, and career tracking into one calm dashboard.',
    images: ['/og-image.png'],
    site: '@trasonapp',
    creator: '@trasonapp',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'TRASON',
  },
  icons: {
    icon: [
      { url: '/favicon.png', type: 'image/png' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/icon-192x192.png',
    other: [
      { rel: 'mask-icon', url: '/favicon.svg', color: '#F4C95D' },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: '#0F0F0F',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

// ── Structured Data (JSON-LD) ────────────────────────────────────────────────
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${BASE_URL}/#website`,
      url: BASE_URL,
      name: 'TRASON',
      description:
        'Personal Operating System for finances, habits, reminders, and career growth.',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${BASE_URL}/search?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'Organization',
      '@id': `${BASE_URL}/#organization`,
      name: 'TRASON',
      url: BASE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/icon-512x512.png`,
        width: 512,
        height: 512,
      },
      sameAs: ['https://github.com/Rizkek/TRASON'],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        email: 'hello@trason.app',
        areaServed: 'ID',
        availableLanguage: ['Indonesian', 'English'],
      },
    },
    {
      '@type': 'SoftwareApplication',
      '@id': `${BASE_URL}/#app`,
      name: 'TRASON',
      url: BASE_URL,
      description:
        'TRASON is a free Personal Operating System that unifies your finances, daily habits, career pipeline, and smart reminders into one calm dashboard.',
      applicationCategory: 'ProductivityApplication',
      operatingSystem: 'Web, iOS (PWA), Android (PWA)',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        description: 'Free core features, forever.',
      },
      featureList: [
        'Financial tracking and net worth dashboard',
        'Habit heatmaps and streak tracking',
        'Career pipeline and job application tracking',
        'Smart context-aware reminders',
        'AI-powered life insights',
        'Offline support via PWA',
      ],
      screenshot: `${BASE_URL}/og-image.png`,
      author: {
        '@id': `${BASE_URL}/#organization`,
      },
    },
  ],
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
        <link rel="icon" href="/favicon.png" type="image/png" />
      </head>
      <body
        className={`${sans.variable} ${serif.variable} ${sans.className}`}
        suppressHydrationWarning
      >
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
            <PwaInstallPrompt />
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
