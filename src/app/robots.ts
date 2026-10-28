import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Signed-in areas, one-time auth links and the API have nothing to index.
        disallow: [
          '/dashboard',
          '/finance',
          '/investments',
          '/schedule',
          '/timeline',
          '/reminders',
          '/insights',
          '/settings',
          '/sport',
          '/career',
          '/onboarding',
          '/auth/',
          '/forgot-password',
          '/reset-password',
          '/api/',
        ],
      },
    ],
    sitemap: 'https://www.trason.web.id/sitemap.xml',
  };
}
