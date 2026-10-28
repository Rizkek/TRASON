import React from 'react';
import type { Metadata } from 'next';
import { Check } from '@phosphor-icons/react/dist/ssr';
import { PageShell } from '@/components/landing/page/PageShell';
import { PageHeader } from '@/components/landing/page/PageHeader';
import { CtaLink } from '@/components/landing/primitives/CtaLink';

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'TRASON is free. Every module, with no limit on records.',
  alternates: { canonical: '/pricing' },
  openGraph: {
    title: 'TRASON Pricing',
    description: 'TRASON is free. Every module, with no limit on records.',
    url: 'https://www.trason.web.id/pricing',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'TRASON' }],
  },
};

// There is no paid plan and no payment system; list only what every account gets today.
const INCLUDED = [
  'Finance: transactions, budgets, subscriptions and instalments',
  'Receipt scanning and driver payout import',
  'Investments with synced prices',
  'Schedule, daily checklist and reminders on every device',
  'Sport sessions, plans and streaks',
  'Career applications, interview notes and resume matcher',
  'Weekly summary on request, and a daily Life Score',
  'English, Indonesian, Japanese and Spanish',
];

export default function PricingPage() {
  return (
    <PageShell width="wide">
      <PageHeader title="Pricing" lede="TRASON is free. Every module, with no limit on records." />

      <section aria-labelledby="plan-free" className="mt-14 max-w-2xl rounded-3xl border border-foreground/15 bg-surface p-6 sm:p-8">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h2 id="plan-free" className="text-heading-lg text-foreground">
            Free
          </h2>
          <p className="font-mono text-4xl font-semibold text-foreground">
            $0<span className="text-base font-normal text-muted-foreground"> / month</span>
          </p>
        </div>

        <ul className="mt-8 space-y-3">
          {INCLUDED.map((item) => (
            <li key={item} className="flex items-start gap-3 text-foreground">
              <Check size={18} weight="bold" aria-hidden="true" className="mt-0.5 shrink-0 text-success" />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <CtaLink href="/signup" size="lg" className="mt-10 w-full">
          Create a free account
        </CtaLink>
      </section>
    </PageShell>
  );
}
