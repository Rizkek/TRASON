import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/about',
          '/about-os',
          '/vision',
          '/roadmap',
          '/pricing',
          '/contact',
          '/changelog',
          '/features/',
          '/showcase/',
          '/login',
          '/signup',
          '/privacy',
          '/terms',
          '/cookies',
        ],
        disallow: [
          '/dashboard',
          '/finance',
          '/investments',
          '/timeline',
          '/reminders',
          '/insights',
          '/settings',
          '/sport',
          '/career',
          '/onboarding',
          '/api/',
        ],
      },
    ],
    sitemap: 'https://www.trason.web.id/sitemap.xml',
  };
}
