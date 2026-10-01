import React from 'react';
import { Container, Section } from '../primitives/Section';
import { SectionHeading } from '../primitives/SectionHeading';

const STEPS = [
  {
    n: '01',
    title: 'Log',
    body: 'A transaction, a session, an activity, an application. Type it, tap it, or photograph the receipt.',
  },
  {
    n: '02',
    title: 'See',
    body: 'Every record lands on its module page and on the Dashboard, and moves your Life Score.',
  },
  {
    n: '03',
    title: 'Act',
    body: 'Reminders arrive as push notifications. Today\u2019s tasks stay on the Dashboard until you tick them off.',
  },
  {
    n: '04',
    title: 'Review',
    body: 'When you want the week in words, ask Insights for a summary of what you logged.',
  },
];

export function HowItWorks() {
  return (
    <Section id="how-it-works" labelledBy="how-heading" tone="tinted">
      <Container>
        <SectionHeading
          id="how-heading"
          eyebrow="How it works"
          title="Log it once. See it everywhere it matters."
        />

        <ol className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {STEPS.map((step) => (
            <li key={step.n} className="flex flex-col gap-4 border-t border-lp-border/15 pt-5">
              <span className="font-mono text-xs text-lp-muted">{step.n}</span>
              <div>
                <h3 className="text-2xl text-lp-foreground">{step.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-lp-muted">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </Section>
  );
}
