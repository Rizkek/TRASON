import React from 'react';
import type { Metadata } from 'next';
import { PageShell } from '@/components/landing/page/PageShell';
import { PageHeader } from '@/components/landing/page/PageHeader';

export const metadata: Metadata = {
  title: 'Changelog',
  description: 'New updates and improvements to TRASON.',
  alternates: { canonical: '/changelog' },
};

const CHANGES = [
  {
    version: 'v1.1.0',
    date: 'June 17, 2026',
    title: 'The Professional Update',
    items: [
      'Refactored UI to remove casual emojis for a more professional, polished look.',
      'Completely redesigned the Landing Footer with comprehensive SaaS links.',
      'Introduced a highly realistic Interactive Preview on the landing page.',
      'Added Contact, Pricing, Changelog, and Legal pages.',
    ],
  },
  {
    version: 'v1.0.0',
    date: 'June 10, 2026',
    title: 'Initial MVP Release',
    items: [
      'Launched the TRASON Core Operating System.',
      'Financial Tracking: Income, Expenses, and Saving Rate.',
      'Vitality Tracking: Habit 30-day heatmaps.',
      'Career Pipeline: Job application tracking with stages.',
    ],
  },
  {
    version: 'Beta',
    date: 'May 2026',
    title: 'Closed Beta',
    items: ['Invited first 100 power users to test the platform.', 'Iterated on the Life Score algorithm.'],
  },
];

export default function ChangelogPage() {
  return (
    <PageShell>
      <PageHeader eyebrow="Changelog" title="What changed" lede="New updates and improvements to TRASON." />

      <ol className="mt-16 space-y-14">
        {CHANGES.map((release) => (
          <li key={release.version} className="grid gap-4 md:grid-cols-[12rem_1fr] md:gap-10">
            <div>
              <p className="text-sm font-semibold text-foreground">{release.date}</p>
              <p className="mt-1 inline-block rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-on-primary">
                {release.version}
              </p>
            </div>

            <div className="space-y-4 border-l-2 border-primary pl-5 md:pl-6">
              <h2 className="text-heading-lg text-foreground">{release.title}</h2>
              <ul className="space-y-2.5">
                {release.items.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                    <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ol>
    </PageShell>
  );
}
