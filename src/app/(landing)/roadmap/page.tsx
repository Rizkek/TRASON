import React from 'react';
import type { Metadata } from 'next';
import { CheckCircle, Rocket, Clock } from '@phosphor-icons/react/dist/ssr';
import { PageShell } from '@/components/landing/page/PageShell';
import { PageHeader } from '@/components/landing/page/PageHeader';
import { Mark } from '@/components/landing/primitives/SectionHeading';

export const metadata: Metadata = {
  title: 'Roadmap – What We Are Building Next',
  description:
    'See what the TRASON team has recently shipped, what is actively in development, and what features are planned for Q3 2026. We build in public.',
  alternates: { canonical: '/roadmap' },
  openGraph: {
    title: 'TRASON Roadmap – What We Are Building Next',
    description:
      'Crypto Wallet Integration, Career CRM Upgrades, Mobile App, and more. See the full TRASON product evolution.',
    url: 'https://www.trason.web.id/roadmap',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'TRASON Roadmap' }],
  },
};

interface Item {
  title: string;
  desc: string;
  progress?: number;
}

const SHIPPED: Item[] = [
  { title: 'Multi-Currency Support', desc: 'Real-time FX conversion for all connected bank accounts.' },
  { title: 'Habit Heatmaps', desc: 'GitHub-style contribution graphs for daily routines.' },
  { title: 'Smart Reminders Engine', desc: 'Context-aware notifications that respect focus hours.' },
];

const IN_PROGRESS: Item[] = [
  { title: 'Crypto Wallet Integration', desc: 'Native support for tracking Web3 assets across EVM chains.', progress: 65 },
  { title: 'Career CRM Upgrades', desc: 'Adding interview recording attachments and compensation negotiation playbooks.', progress: 65 },
];

const UP_NEXT: Item[] = [
  { title: 'Mobile App (iOS/Android)', desc: 'Native applications with offline support and widgets.' },
  { title: 'Automated Tax Forecasting', desc: 'Predict end-of-year tax liabilities based on current income trajectory.' },
  { title: 'Public API', desc: 'Build your own integrations on top of the TRASON Nexus Engine.' },
];

interface ColumnProps {
  icon: React.ElementType;
  title: string;
  badge: string;
  items: Item[];
  variant?: 'solid' | 'active' | 'planned';
}

function Column({ icon: Icon, title, badge, items, variant = 'solid' }: ColumnProps) {
  const card =
    variant === 'active'
      ? 'border-primary/50 bg-primary/10'
      : variant === 'planned'
      ? 'border-dashed border-foreground/25 bg-transparent'
      : 'border-foreground/15 bg-surface';

  return (
    <section aria-label={title} className="space-y-5">
      <div className="flex items-center gap-2 border-b border-foreground/15 pb-4">
        <Icon size={20} aria-hidden="true" className="text-primary" />
        <h2 className="font-sans text-lg font-semibold text-foreground">{title}</h2>
        <span className="ml-auto rounded bg-foreground/10 px-2 py-1 text-xs font-semibold text-foreground">{badge}</span>
      </div>
      <ul className="space-y-4">
        {items.map((item) => (
          <li key={item.title} className={`rounded-2xl border p-5 ${card}`}>
            <h3 className="font-sans text-base font-semibold text-foreground">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
            {item.progress !== undefined && (
              <div className="mt-4">
                <div
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={item.progress}
                  aria-label={`${item.title} progress`}
                  className="h-1.5 w-full overflow-hidden rounded-full bg-foreground/15"
                >
                  <div className="h-full rounded-full bg-primary" style={{ width: `${item.progress}%` }} />
                </div>
                <p className="mt-1 text-right text-xs text-muted-foreground">{item.progress}% complete</p>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function RoadmapPage() {
  return (
    <PageShell width="wide">
      <PageHeader
        align="center"
        eyebrow="Product evolution"
        title={
          <>
            The <Mark>roadmap.</Mark>
          </>
        }
        lede="We build in public. See what we are working on, what comes next, and what we have recently shipped."
      />

      <div className="mt-16 grid gap-8 md:grid-cols-3">
        <Column icon={CheckCircle} title="Recently shipped" badge="Q2 2026" items={SHIPPED} />
        <Column icon={Rocket} title="In progress" badge="Active" items={IN_PROGRESS} variant="active" />
        <Column icon={Clock} title="Up next" badge="Q3 2026" items={UP_NEXT} variant="planned" />
      </div>
    </PageShell>
  );
}
