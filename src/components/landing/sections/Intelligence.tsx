import React from 'react';
import { Container, Section } from '../primitives/Section';
import { SectionHeading } from '../primitives/SectionHeading';
import { InsightsUI, SmartInputUI } from '../product/IntelligenceUI';

const FLOW = ['Data', 'Context', 'Insight', 'Action'];

export function Intelligence() {
  return (
    <Section labelledBy="intelligence-heading" tone="tinted">
      <Container>
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <SectionHeading
              id="intelligence-heading"
              title="Structure from a sentence. A summary when you ask."
              lede="TRASON doesn't push advice at you. It turns what you type into records, and writes a plain-language summary of your week when you request one."
            />

            <ol className="mt-10 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {FLOW.map((step, i) => (
                <li key={step} className="flex items-center gap-2">
                  <span className={i === 3 ? 'text-foreground' : ''}>{step}</span>
                  {i < FLOW.length - 1 && (
                    <span aria-hidden="true" className="h-px w-5 bg-foreground/25" />
                  )}
                </li>
              ))}
            </ol>

            <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
              Summaries are generated only when you press the button, from the records you have logged. Nothing is
              inferred from data you didn&apos;t enter.
            </p>
          </div>

          <div className="grid gap-4 lg:col-span-7">
            <figure
              role="img"
              aria-label="Smart Input turning the sentence 'Spent 45k on lunch at Warteg Bu Sri' into an expense of Rp 45.000 in Food & Drink, today, ready to edit before saving."
              className="overflow-hidden rounded-2xl border border-foreground/15 bg-surface text-foreground"
            >
              <SmartInputUI />
            </figure>
            <figure
              role="img"
              aria-label="Insights page with a generated summary of the week's expenses, workouts and job applications."
              className="overflow-hidden rounded-2xl border border-foreground/15 bg-surface text-foreground"
            >
              <InsightsUI />
            </figure>
          </div>
        </div>
      </Container>
    </Section>
  );
}
