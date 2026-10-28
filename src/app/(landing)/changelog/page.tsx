import React from 'react';
import type { Metadata } from 'next';
import { PageShell } from '@/components/landing/page/PageShell';
import { PageHeader } from '@/components/landing/page/PageHeader';

export const metadata: Metadata = {
  title: 'Changelog',
  description: 'What changed in TRASON, month by month.',
  alternates: { canonical: '/changelog' },
};

// Written for people using the app: what they can now do or will notice, not how it was built.
const CHANGES = [
  {
    month: 'October 2026',
    items: [
      'Reset a forgotten password from the sign-in page.',
      'Email confirmation links now work on any device, not only the one you signed up on.',
      'Sign-in and sign-up pages show clearer messages and list the password requirements as you type.',
      'Light and dark theme follow your device until you pick one in Settings.',
      'Reminders arrive once on every device where you turned them on, instead of only the last one.',
      'A reminder can no longer be set for a time that has already passed.',
      'Import a driver payout statement into Finance, and give reminders a priority.',
      'Career rates no longer count applications you withdrew.',
    ],
  },
  {
    month: 'September 2026',
    items: [
      'Scan a receipt into a draft transaction and correct it before saving.',
      'Track instalment plans alongside regular transactions.',
      'A new landing page that shows the real product.',
    ],
  },
  {
    month: 'August 2026',
    items: [
      'Insights: ask for a plain-language summary of your week.',
      'Timeline is now Schedule, with public holidays marked on the calendar.',
      'After signing in you return to the page you were on.',
      'Completed reminders are kept in a History tab.',
      'Light mode across the whole app.',
      'Every screen is translated into English, Indonesian, Japanese and Spanish.',
    ],
  },
];

export default function ChangelogPage() {
  return (
    <PageShell>
      <PageHeader title="Changelog" lede="What changed in TRASON, newest first." />

      <ol className="mt-14 space-y-12">
        {CHANGES.map((release) => (
          <li key={release.month} className="grid gap-4 md:grid-cols-[10rem_1fr] md:gap-10">
            <h2 className="text-base font-semibold text-foreground">{release.month}</h2>
            <ul className="space-y-2.5 border-l-2 border-primary pl-5 md:pl-6">
              {release.items.map((item) => (
                <li key={item} className="text-sm leading-relaxed text-muted-foreground">
                  {item}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </PageShell>
  );
}
