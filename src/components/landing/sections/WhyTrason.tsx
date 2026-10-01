import React from 'react';
import { Check } from '@phosphor-icons/react/dist/ssr';
import { Container, Section } from '../primitives/Section';
import { SectionHeading } from '../primitives/SectionHeading';

const USUAL = ['Bank app', 'Budget spreadsheet', 'Job tracker', 'Fitness app', 'Calendar', 'Reminder app'];

const TRASON = [
  { title: 'One system', body: 'Six modules, one account, one place to open.' },
  { title: 'One context', body: 'A workout, a payment and an interview sit in the same week.' },
  { title: 'One personal view', body: 'The Dashboard and Life Score read across all of it.' },
];

const FACTS = [
  'Free to start',
  'Modules you can turn off in Settings',
  'English and Indonesian',
  'Installs on phone and desktop as a web app',
  'Reminders as push notifications',
  'Receipt capture and typed-sentence input',
];

export function WhyTrason() {
  return (
    <Section labelledBy="why-heading">
      <Container>
        <SectionHeading
          id="why-heading"
          eyebrow="Why TRASON"
          title="Less switching. More context."
          lede="Not more features than six apps. The same parts of life, in one place that keeps the whole picture."
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-12">
          <div className="rounded-2xl border border-dashed border-lp-border/20 p-6 lg:col-span-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-lp-muted">The usual setup</p>
            <ul className="mt-5 flex flex-wrap gap-2">
              {USUAL.map((tool) => (
                <li
                  key={tool}
                  className="rounded-full border border-lp-border/10 bg-lp-surface px-3 py-1.5 text-sm text-lp-muted"
                >
                  {tool}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm leading-relaxed text-lp-muted">
              Six logins. Six notification streams. Nothing that knows how the pieces relate.
            </p>
          </div>

          <div className="rounded-2xl bg-ui-bg p-6 text-ui-fg lg:col-span-7 sm:p-8">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-ui-muted">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-ui-accent" />
              TRASON
            </p>
            <ul className="mt-6 grid gap-6 sm:grid-cols-3">
              {TRASON.map((item) => (
                <li key={item.title}>
                  <h3 className="text-xl text-ui-fg">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ui-muted">{item.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-lp-border/10 pt-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-lp-muted">Straight facts</p>
          <ul className="mt-5 grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
            {FACTS.map((fact) => (
              <li key={fact} className="flex items-center gap-3 text-sm text-lp-foreground">
                <Check size={14} weight="bold" className="shrink-0 text-lp-success" aria-hidden="true" />
                {fact}
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </Section>
  );
}
