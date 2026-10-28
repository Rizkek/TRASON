import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { PageShell } from '@/components/landing/page/PageShell';
import { PageHeader } from '@/components/landing/page/PageHeader';
import { Prose } from '@/components/landing/page/Prose';
import { FaqItem } from '@/components/landing/FaqItem';
import { CtaLink } from '@/components/landing/primitives/CtaLink';

export const metadata: Metadata = {
  title: 'About TRASON',
  description:
    'What TRASON is, who it is for, and how it treats your data. One place for your money, investments, schedule, reminders, training and career.',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'About TRASON',
    description: 'One place for your money, investments, schedule, reminders, training and career.',
    url: 'https://www.trason.web.id/about',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'TRASON' }],
  },
};

const DATA_PROMISES = [
  {
    title: 'Your records are yours',
    body: 'Every record is tied to your account, and the database rejects requests for anyone else’s. We do not sell your data or show ads.',
  },
  {
    title: 'AI only when you ask',
    body: 'Smart Input, receipt scanning and the weekly summary use AI to write a draft. You check the draft before anything is saved.',
  },
  {
    title: 'Scores you can follow',
    body: 'Life Score, streaks and financial health come from fixed rules over your own records, so the same week always gives the same result.',
  },
];

const FAQS = [
  {
    q: 'Is TRASON free?',
    a: 'Yes. Every module is free to use, with no limit on records.',
  },
  {
    q: 'Do I need to install anything?',
    a: 'No. TRASON runs in your browser. On a phone you can add it to your home screen, and it then opens full-screen like any other app.',
  },
  {
    q: 'How is this different from a spreadsheet or a notes app?',
    a: 'A spreadsheet or a notes app starts empty, and you build and maintain the structure yourself. TRASON comes with that structure for money, training, schedule, reminders and career, and the modules read from each other, so one record shows up wherever it matters.',
  },
  {
    q: 'Can I turn off the modules I don’t use?',
    a: 'Yes. In Settings you can switch each module on or off, and modules you turn off disappear from the navigation.',
  },
];

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

      <div className="space-y-20">
        <PageHeader
          title="About TRASON"
          lede="One place for the parts of your life you already keep track of: money, investments, schedule, reminders, training and career."
        />

        <section aria-labelledby="what-heading" className="space-y-6">
          <h2 id="what-heading" className="text-heading-lg text-foreground">
            What it is
          </h2>
          <Prose className="prose-lg">
            <p>
              Most people keep their week in four or five places: a banking app or a spreadsheet for money, a calendar,
              a habit tracker, a list of job applications. Each one works on its own, but none of them can tell you that
              a week of overspending was also the week you stopped training.
            </p>
            <p>
              TRASON keeps those records together. You type a sentence such as &ldquo;lunch 45k&rdquo; or &ldquo;gym
              tomorrow 7am&rdquo; and it becomes a transaction or a task. The dashboard then shows what needs attention
              today across every module you use.
            </p>
          </Prose>
        </section>

        <section aria-labelledby="who-heading" className="space-y-6">
          <h2 id="who-heading" className="text-heading-lg text-foreground">
            Who it is for
          </h2>
          <Prose className="prose-lg">
            <p>
              People who already track several areas of their life and are tired of switching between apps to do it.
              You don&apos;t need every module: start with the one you use most and turn on the others when you need
              them.
            </p>
          </Prose>
        </section>

        <section aria-labelledby="data-heading" className="space-y-6">
          <h2 id="data-heading" className="text-heading-lg text-foreground">
            How we treat your data
          </h2>
          <ul className="grid gap-4 sm:grid-cols-3">
            {DATA_PROMISES.map((item) => (
              <li key={item.title} className="rounded-xl border border-foreground/15 bg-surface p-5">
                <h3 className="text-base font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
              </li>
            ))}
          </ul>
          <p className="text-sm text-muted-foreground">
            The full details are in the{' '}
            <Link href="/privacy" className="font-medium text-primary underline underline-offset-4">
              Privacy Policy
            </Link>
            .
          </p>
        </section>

        <section aria-labelledby="next-heading" className="space-y-4">
          <h2 id="next-heading" className="text-heading-lg text-foreground">
            What changes next
          </h2>
          <p className="text-base leading-relaxed text-muted-foreground">
            See what is planned on the{' '}
            <Link href="/roadmap" className="font-medium text-primary underline underline-offset-4">
              roadmap
            </Link>
            , and what changed recently in the{' '}
            <Link href="/changelog" className="font-medium text-primary underline underline-offset-4">
              changelog
            </Link>
            .
          </p>
        </section>

        <section aria-labelledby="faq-heading" className="space-y-6">
          <h2 id="faq-heading" className="text-heading-lg text-foreground">
            Common questions
          </h2>
          <div className="space-y-3">
            {FAQS.map((faq) => (
              <FaqItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            More answers, and how to reach us, are on the{' '}
            <Link href="/contact" className="font-medium text-primary underline underline-offset-4">
              Contact and help
            </Link>{' '}
            page.
          </p>
        </section>

        <div className="flex flex-col gap-3 sm:flex-row">
          <CtaLink href="/signup" size="lg">
            Create a free account
          </CtaLink>
          <CtaLink href="/#product" variant="secondary" size="lg">
            See the product
          </CtaLink>
        </div>
      </div>
    </PageShell>
  );
}
