import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle, Circle } from '@phosphor-icons/react/dist/ssr';
import { PageShell } from '@/components/landing/page/PageShell';
import { PageHeader } from '@/components/landing/page/PageHeader';

export const metadata: Metadata = {
  title: 'Roadmap',
  description: 'What you can use in TRASON today, and what is planned next.',
  alternates: { canonical: '/roadmap' },
  openGraph: {
    title: 'TRASON Roadmap',
    description: 'What you can use in TRASON today, and what is planned next.',
    url: 'https://www.trason.web.id/roadmap',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'TRASON' }],
  },
};

interface Item {
  title: string;
  desc: string;
}

// "Available" must match shipped features; "Planned" carries no dates until work has started.
const AVAILABLE: Item[] = [
  { title: 'Finance', desc: 'Income and expenses, categories, budgets, subscriptions, instalments, and transactions in several currencies.' },
  { title: 'Receipt and payout capture', desc: 'Scan a receipt or import a driver payout into a draft you review and correct before saving.' },
  { title: 'Smart Input', desc: 'Type a sentence like “lunch 45k” or “gym tomorrow 7am” and it becomes a transaction or a task.' },
  { title: 'Investments', desc: 'Positions in stocks and crypto, with prices synced from CoinGecko and Alpha Vantage.' },
  { title: 'Schedule', desc: 'A weekly activity log and a daily checklist, with public holidays on the calendar.' },
  { title: 'Reminders', desc: 'Push notifications on every device you enable, plus an optional email digest.' },
  { title: 'Sport', desc: 'Workout sessions, training plans, an exercise library, and a weekly streak.' },
  { title: 'Career', desc: 'Applications by stage, interview notes, follow-up reminders, and a resume matcher.' },
  { title: 'Insights and Life Score', desc: 'A plain-language summary of your week when you ask for one, and a daily score from fixed rules.' },
  { title: 'Install on your phone', desc: 'Add TRASON to your home screen; it opens full-screen. Available in English, Indonesian, Japanese and Spanish.' },
];

const PLANNED: Item[] = [
  { title: 'Investment goals', desc: 'Set a target for a portfolio and see how close your positions are to it.' },
  { title: 'Investment journal', desc: 'Record why you bought or sold, next to the trade itself.' },
  { title: 'Export your data', desc: 'Download all of your records in one file.' },
];

function ItemList({ items, done }: { items: Item[]; done: boolean }) {
  const Icon = done ? CheckCircle : Circle;
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <li
          key={item.title}
          className={`flex gap-3 rounded-xl border p-5 ${done ? 'border-foreground/15 bg-surface' : 'border-dashed border-foreground/25'}`}
        >
          <Icon size={20} weight={done ? 'fill' : 'regular'} aria-hidden="true" className={`mt-0.5 shrink-0 ${done ? 'text-success' : 'text-muted-foreground'}`} />
          <div>
            <h3 className="text-base font-semibold text-foreground">{item.title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function RoadmapPage() {
  return (
    <PageShell width="wide">
      <PageHeader
        title="Roadmap"
        lede="What you can use today, and what is planned next. Planned items get a date once work on them has started."
      />

      <div className="mt-14 space-y-14">
        <section aria-labelledby="available-heading" className="space-y-5">
          <h2 id="available-heading" className="text-heading-lg text-foreground">
            Available now
          </h2>
          <ItemList items={AVAILABLE} done />
        </section>

        <section aria-labelledby="planned-heading" className="space-y-5">
          <h2 id="planned-heading" className="text-heading-lg text-foreground">
            Planned
          </h2>
          <ItemList items={PLANNED} done={false} />
        </section>

        <p className="text-sm text-muted-foreground">
          Something missing?{' '}
          <Link href="/contact" className="font-medium text-primary underline underline-offset-4">
            Tell us what you need
          </Link>
          . Recent changes are listed in the{' '}
          <Link href="/changelog" className="font-medium text-primary underline underline-offset-4">
            changelog
          </Link>
          .
        </p>
      </div>
    </PageShell>
  );
}
