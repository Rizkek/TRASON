import React from 'react';
import type { Metadata } from 'next';
import { Check, X } from '@phosphor-icons/react/dist/ssr';
import { PageShell } from '@/components/landing/page/PageShell';
import { PageHeader } from '@/components/landing/page/PageHeader';
import { CtaLink } from '@/components/landing/primitives/CtaLink';

export const metadata: Metadata = {
  title: 'Pricing – Free Forever, Pro When You Need It',
  description:
    'TRASON is free to start. Get full access to Financial Tracking, Habit Heatmaps, and Career Pipeline at no cost. Upgrade to Pro for AI Insights and Investment Sync.',
  alternates: { canonical: '/pricing' },
  openGraph: {
    title: 'TRASON Pricing – Free Forever, Pro When You Need It',
    description:
      'Start for free with full core access. Upgrade to Pro for advanced AI Insights, Investment Sync, and unlimited Career Pipeline.',
    url: 'https://www.trason.web.id/pricing',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'TRASON Pricing' }],
  },
};

interface Feature {
  text: string;
  included: boolean;
  strong?: boolean;
}

const BASIC: Feature[] = [
  { text: 'Basic Financial Tracking', included: true },
  { text: 'Habit Heatmaps', included: true },
  { text: 'Career Pipeline (Up to 10)', included: true },
  { text: 'Advanced AI Insights', included: false },
  { text: 'Investment Sync', included: false },
];

const PRO: Feature[] = [
  { text: 'Everything in Basic', included: true, strong: true },
  { text: 'Unlimited Career Pipeline', included: true },
  { text: 'Advanced AI Insights & Correlations', included: true },
  { text: 'Investment & Crypto Sync', included: true },
  { text: 'Priority Support', included: true },
];

function FeatureList({ items }: { items: Feature[] }) {
  return (
    <ul className="mb-10 flex-1 space-y-4">
      {items.map((f) => (
        <li key={f.text} className={`flex items-center gap-3 ${f.included ? 'text-foreground' : 'text-muted-foreground'}`}>
          {f.included ? (
            <Check size={18} weight="bold" aria-label="Included" className="shrink-0 text-success" />
          ) : (
            <X size={18} weight="bold" aria-label="Not included" className="shrink-0 text-muted-foreground" />
          )}
          <span className={f.strong ? 'font-semibold' : ''}>{f.text}</span>
        </li>
      ))}
    </ul>
  );
}

export default function PricingPage() {
  return (
    <PageShell width="wide">
      <PageHeader
        align="center"
        eyebrow="Pricing"
        title="Simple, transparent pricing"
        lede="Start for free, upgrade when you need more power. No hidden fees."
      />

      <div className="mx-auto mt-14 grid max-w-4xl gap-6 md:grid-cols-2">
        <section aria-labelledby="plan-basic" className="flex flex-col rounded-3xl border border-foreground/15 bg-surface p-8">
          <h2 id="plan-basic" className="font-sans text-xl font-semibold text-foreground">Basic</h2>
          <p className="mb-6 mt-2 text-sm text-muted-foreground">Perfect for getting started and organizing your life.</p>
          <p className="mb-8 font-sans text-5xl font-bold text-foreground">
            $0<span className="text-lg font-normal text-muted-foreground">/mo</span>
          </p>
          <FeatureList items={BASIC} />
          <CtaLink href="/signup" variant="secondary" size="lg" className="w-full">
            Get started for free
          </CtaLink>
        </section>

        <section aria-labelledby="plan-pro" className="relative flex flex-col rounded-3xl border-2 border-primary bg-surface p-8">
          <span className="absolute right-6 top-0 -translate-y-1/2 rounded-full bg-primary px-4 py-1 text-xs font-semibold uppercase tracking-wider text-on-primary">
            Recommended
          </span>
          <h2 id="plan-pro" className="font-sans text-xl font-semibold text-primary">Pro</h2>
          <p className="mb-6 mt-2 text-sm text-muted-foreground">For power users who want deep analytics and automation.</p>
          <p className="mb-8 font-sans text-5xl font-bold text-foreground">
            $9<span className="text-lg font-normal text-muted-foreground">/mo</span>
          </p>
          <FeatureList items={PRO} />
          <CtaLink href="/signup" size="lg" className="w-full">
            Upgrade to Pro
          </CtaLink>
        </section>
      </div>
    </PageShell>
  );
}
