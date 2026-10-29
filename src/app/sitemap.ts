import { MetadataRoute } from 'next';

const BASE_URL = 'https://www.trason.web.id';

// Public pages only; keep in step with the folders under app/(landing) and app/(auth).
const PAGES: { path: string; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']; priority: number }[] = [
  { path: '', changeFrequency: 'weekly', priority: 1.0 },
  { path: '/about', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/vision', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/pricing', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/roadmap', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/changelog', changeFrequency: 'weekly', priority: 0.6 },
  { path: '/contact', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/signup', changeFrequency: 'yearly', priority: 0.6 },
  { path: '/login', changeFrequency: 'yearly', priority: 0.4 },
  { path: '/privacy', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/cookies', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/terms', changeFrequency: 'yearly', priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return PAGES.map(({ path, changeFrequency, priority }) => ({
    url: `${BASE_URL}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));
}
