import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/about-os', '/login', '/signup', '/privacy', '/terms'],
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
        '/api/',
      ],
    },
    sitemap: 'https://trason.vercel.app/sitemap.xml',
  };
}
