import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.trason.web.id';
  const now = new Date();

  return [
    // ── Core ────────────────────────────────────────────────────────────────
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    // ── About / Product ─────────────────────────────────────────────────────
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about-os`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/vision`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/roadmap`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    // ── Features ─────────────────────────────────────────────────────────────
    {
      url: `${baseUrl}/features/financial-control`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/features/vitality-habits`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/features/career-architect`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/features/signal-reminders`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    // ── Pricing ──────────────────────────────────────────────────────────────
    {
      url: `${baseUrl}/pricing`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    // ── Showcase ─────────────────────────────────────────────────────────────
    {
      url: `${baseUrl}/showcase/live-dashboard`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/showcase/life-command-center`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    // ── Auth ─────────────────────────────────────────────────────────────────
    {
      url: `${baseUrl}/login`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/signup`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.6,
    },
    // ── Support / Contact ────────────────────────────────────────────────────
    {
      url: `${baseUrl}/contact`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/changelog`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    // ── Legal ────────────────────────────────────────────────────────────────
    {
      url: `${baseUrl}/privacy`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/cookies`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.2,
    },
  ];
}
