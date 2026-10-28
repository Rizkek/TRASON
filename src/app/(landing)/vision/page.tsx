import React from 'react';
import type { Metadata } from 'next';
import { PageShell } from '@/components/landing/page/PageShell';
import { PageHeader } from '@/components/landing/page/PageHeader';
import { Prose } from '@/components/landing/page/Prose';
import { Mark } from '@/components/landing/primitives/SectionHeading';
import { Logo } from '@/components';

export const metadata: Metadata = {
  title: 'Our Vision – Why We Built TRASON',
  description:
    'App fatigue is killing our focus. TRASON was built to give ambitious individuals a single, private environment where financial capital, professional growth, and physical vitality converge.',
  alternates: { canonical: '/vision' },
  openGraph: {
    title: 'TRASON Vision – Why We Built a Personal Operating System',
    description:
      'We built TRASON because your life is an interconnected system, but your tools are fragmented. One place for capital, vitality, and ambition.',
    url: 'https://www.trason.web.id/vision',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'TRASON Vision' }],
  },
};

function Chapter({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section aria-label={label} className="space-y-6">
      <h2 className="border-l-4 border-primary pl-4 font-sans text-sm font-semibold uppercase tracking-[0.2em] text-foreground">
        {label}
      </h2>
      <Prose className="prose-lg md:prose-xl">{children}</Prose>
    </section>
  );
}

export default function VisionPage() {
  return (
    <PageShell width="article">
      <article className="space-y-24">
        <PageHeader
          title={
            <>
              App fatigue
              <br />
              is <Mark>killing our focus.</Mark>
            </>
          }
          lede="We live in the most technologically advanced era in human history, yet we have never been more scattered."
        />

        <Chapter label="The problem">
          <p>
            You use one app to track your budget. Another to track your investments. A Kanban board for your career
            applications. A spreadsheet for your habits. A smartwatch for your sleep. And a task manager for your chores.
          </p>
          <p>
            Your life&apos;s data is fragmented across a dozen ecosystems that refuse to talk to each other. The mental
            overhead of maintaining these systems has become a full-time job. We spend more time managing our tools than
            living our lives.
          </p>
        </Chapter>

        <Chapter label="The vision">
          <p>We believe your personal data should live in one place. It should compound. It should correlate.</p>
          <p className="!text-foreground !font-semibold">TRASON is not another app. It is a personal operating system.</p>
          <p>
            When the fee for an online course, the study sessions it needs and the job applications it is meant to help
            all sit in one place, you can see whether the spending is paying off.
          </p>
          <p>
            When your money, your career and your training are recorded together, you can see how one affects the
            others instead of guessing.
          </p>
        </Chapter>

        <section aria-label="Closing statement" className="border-t border-foreground/15 pt-16">
          <blockquote className="font-brand text-3xl leading-tight text-foreground md:text-5xl">
            &ldquo;We are building TRASON for people who want to see their week clearly, in one place, without keeping
            five apps in sync to do it.&rdquo;
          </blockquote>
          <div className="mt-10 flex items-center gap-4">
            <Logo size={48} variant="gold" />
            <div>
              <p className="font-semibold text-foreground">The TRASON Team</p>
              <p className="text-sm text-muted-foreground">Founded 2026</p>
            </div>
          </div>
        </section>
      </article>
    </PageShell>
  );
}
