import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono, DM_Serif_Display, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/providers/AuthProvider';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { SmartInput } from '@/components/SmartInput';
import { PwaInstallPrompt } from '@/components/PwaInstallPrompt';
import { ThemeSync } from '@/components/layout/ThemeSync';
import NextTopLoader from 'nextjs-toploader';
import { SpeedInsights } from '@vercel/speed-insights/next';

const BASE_URL = 'https://www.trason.web.id';

const fontSans = Geist({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const fontMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

const fontBrand = DM_Serif_Display({
  weight: '400',
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-brand',
  display: 'swap',
});

const fontDisplay = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const SITE_DESCRIPTION =
  'TRASON is a personal operating system. Money, career, workouts, schedule and reminders live in one connected place, so you always know where things stand.';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'TRASON — Your life, in one clear system',
    template: '%s | TRASON',
  },
  description: SITE_DESCRIPTION,
  keywords: [
    'personal operating system',
    'personal finance tracker',
    'job application tracker',
    'workout log',
    'weekly schedule',
    'reminders',
    'life dashboard',
    'TRASON',
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
    title: 'TRASON — Your life, in one clear system',
    description: SITE_DESCRIPTION,
    url: BASE_URL,
    siteName: 'TRASON',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'TRASON dashboard showing Life Score, reminders, finance and vitality at a glance',
        type: 'image/png',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TRASON — Your life, in one clear system',
    description: SITE_DESCRIPTION,
    images: ['/og-image.png'],
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
  themeColor: '#FAF9F6',
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
      description: SITE_DESCRIPTION,
      inLanguage: ['en', 'id'],
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
      description: SITE_DESCRIPTION,
      applicationCategory: 'ProductivityApplication',
      operatingSystem: 'Web, iOS (PWA), Android (PWA)',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        description: 'Free to start.',
      },
      featureList: [
        'Income, expenses, subscriptions, budgets and receipt capture',
        'Investment positions for stocks, crypto and gold',
        'Job application pipeline with resume match',
        'Workout sessions and personal records',
        'Weekly schedule and daily tasks',
        'Reminders delivered as push notifications',
        'Life Score and on-demand insights summary',
        'Installable web app (PWA)',
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
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${fontSans.variable} ${fontMono.variable} ${fontBrand.variable} ${fontDisplay.variable}`}
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <link rel="icon" href="/favicon.png" type="image/png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const prefs = localStorage.getItem('user-preferences');
                if (prefs) {
                  const parsed = JSON.parse(prefs);
                  if (parsed.state && parsed.state.language) {
                    document.documentElement.lang = parsed.state.language;
                  }
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body
        className="font-sans"
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
            <ThemeSync />
            {children}
            <SmartInput />
            <PwaInstallPrompt />
            <SpeedInsights />
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
