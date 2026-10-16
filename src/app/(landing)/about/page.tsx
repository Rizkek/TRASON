import React from 'react';
import type { Metadata } from 'next';
import { ArrowRight, Check } from '@phosphor-icons/react/dist/ssr';
import { PageShell } from '@/components/landing/page/PageShell';
import { PageHeader } from '@/components/landing/page/PageHeader';
import { Prose } from '@/components/landing/page/Prose';
import { FaqItem } from '@/components/landing/FaqItem';
import { Mark } from '@/components/landing/primitives/SectionHeading';

export const metadata: Metadata = {
  title: 'About TRASON – Philosophy & FAQ',
  description:
    'Learn why TRASON was built, the philosophy behind the Personal OS concept, and get answers to the most common questions about privacy, pricing, and compatibility.',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'About TRASON – Philosophy & FAQ',
    description:
      'Learn why TRASON was built and the philosophy behind a unified Personal Operating System for finances, habits, and career.',
    url: 'https://www.trason.web.id/about',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'About TRASON' }],
  },
};

const FAQS = [
  {
    q: 'Is my data safe and private?',
    a: 'Yes. TRASON is built with privacy as the core foundation. Your personal data belongs to you. We do not sell your data, run ads, or use tracking algorithms.',
  },
  {
    q: 'Is TRASON free to use?',
    a: 'The core operating system is free. We plan to introduce premium features for power users in the future, but the essential modules will always remain accessible.',
  },
  {
    q: 'Can I use TRASON on my phone?',
    a: 'TRASON is currently built as a responsive web application that works well on mobile browsers. A dedicated native mobile app is on our roadmap.',
  },
  {
    q: 'How is this different from Notion or Excel?',
    a: 'Notion and Excel are blank canvases. You have to build the systems yourself, which often break. TRASON provides opinionated, pre-built workflows specifically designed for personal finance, habits, and career tracking, completely interconnected out of the box.',
  },
];

const LIVE = ['Financial tracking and analytics', 'Habit and vitality heatmaps', 'Career pipeline management', 'Basic signal reminders'];
const NEXT = ['Plain-language insights', 'Investment portfolio sync', 'Native iOS and Android app', 'Offline mode'];

export default function AboutPage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: { '@type': 'Answer', text: faq.a },
    })),
  };

  return (
    <PageShell width="article">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <div className="space-y-24">
        <section aria-labelledby="philosophy-heading" className="space-y-10">
          <PageHeader
            eyebrow="About"
            title={
              <span id="philosophy-heading">
                The philosophy of <Mark>TRASON</Mark>
              </span>
            }
          />

          <div className="rounded-xl border border-primary/50 bg-primary/10 p-6">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-primary [font-family:var(--font-sans)]">
              Summary
            </h2>
            <p className="mt-2 text-base leading-relaxed text-foreground">
              TRASON is a <strong>Personal Operating System</strong> designed to end app fatigue. It unifies financial
              tracking, habit building, and career pipeline management into a single dashboard, and gives you a Life
              Score to measure your daily momentum.
            </p>
          </div>

          <Prose className="prose-lg">
            <blockquote>&ldquo;Your life is an interconnected system, but your tools are fragmented.&rdquo;</blockquote>
            <p>
              Every day, ambitious people jump between five different applications. A banking app or spreadsheet for
              finances, a habit tracker for health, a calendar for the schedule, and a Notion board for career
              applications.
            </p>
            <p>
              This fragmentation causes <strong>app fatigue</strong>. More importantly, it hides the correlation between
              your actions. A bad financial week usually lines up with skipped workouts and high stress, but none of
              your isolated tools can show you that connection.
            </p>
            <p>
              <strong>TRASON is a Personal Operating System.</strong> It is not another blank canvas where you build
              databases from scratch. It is an opinionated command center that connects your Capital (Finance),
              Vitality (Health and Habits), and Ambition (Career) into a single <strong>Life Score</strong>.
            </p>
            <p>
              Centralizing your data, reducing friction, and giving you an objective score of your daily momentum is how
              you reach your goals with clarity.
            </p>
          </Prose>
        </section>

        <section aria-labelledby="status-heading" className="space-y-8">
          <h2 id="status-heading" className="text-heading-lg text-foreground">
            Current status and roadmap
          </h2>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-foreground/15 bg-surface p-6">
              <h3 className="font-sans text-base font-semibold text-success">Live now</h3>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                {LIVE.map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <Check size={16} weight="bold" aria-hidden="true" className="shrink-0 text-success" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-dashed border-foreground/25 p-6">
              <h3 className="font-sans text-base font-semibold text-primary">In development</h3>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                {NEXT.map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <ArrowRight size={16} weight="bold" aria-hidden="true" className="shrink-0 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section aria-labelledby="faq-heading" className="space-y-8">
          <div className="space-y-2">
            <h2 id="faq-heading" className="text-heading-lg text-foreground">
              Frequently asked questions
            </h2>
            <p className="text-base text-muted-foreground">Everything you need to know about the platform.</p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq) => (
              <FaqItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </section>
      </div>
    </PageShell>
  );
}
