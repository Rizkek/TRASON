import React from 'react';
import { ArrowDown } from '@phosphor-icons/react/dist/ssr';
import { Container, Section } from '../primitives/Section';
import { SectionHeading } from '../primitives/SectionHeading';
import { MediaFrame } from '../primitives/MediaFrame';
import { landingMedia } from '../media';

// Each row is one tool holding one slice of the same week. The sample values match the ones in
// the Dashboard preview, so the story and the product show the same week.
const FRAGMENTS = [
  { tool: 'Bank app', holds: 'what you spent', sample: 'Lunch, Warteg Bu Sri', value: '-Rp 45.000' },
  { tool: 'Spreadsheet', holds: 'where you applied', sample: 'Tokopedia', value: 'Interview' },
  { tool: 'Fitness app', holds: 'when you trained', sample: 'Morning run', value: '5.2 km' },
  { tool: 'Calendar', holds: 'what the week looked like', sample: 'Thursday', value: '09:00' },
  { tool: 'Notes', holds: 'what you meant to do', sample: 'Call Ibu', value: 'Tonight' },
  { tool: 'Alarms', holds: 'what is due', sample: 'Electricity bill', value: '17:00' },
];

export function Problem() {
  return (
    <Section labelledBy="problem-heading">
      <Container>
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-16">
          <div className="order-2 lg:order-1 lg:col-span-5">
            <MediaFrame
              image={landingMedia.problem.image}
              aspect="4 / 5"
              sizes="(min-width: 1024px) 420px, (min-width: 640px) 80vw, 100vw"
              className="max-h-[560px] lg:max-h-none"
            />
          </div>

          <div className="order-1 lg:order-2 lg:col-span-7">
            <SectionHeading
              id="problem-heading"
              title={
                <>
                  It isn&apos;t too many apps.
                  <br />
                  It&apos;s losing the thread between them.
                </>
              }
              lede="Each tool is fine on its own. None of them knows about the others, so the context of your week lives in your head."
            />

            <ul className="mt-10 grid gap-3 sm:grid-cols-2" aria-label="Where the week usually lives">
              {FRAGMENTS.map((item) => (
                <li key={item.tool} className="rounded-xl border border-foreground/10 bg-surface p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{item.tool}</p>
                  <div className="mt-2 flex items-baseline justify-between gap-3">
                    <span className="truncate text-sm font-medium text-foreground">{item.sample}</span>
                    <span className="shrink-0 font-mono text-sm tabular-nums text-foreground">{item.value}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">Holds {item.holds}</p>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex items-center gap-4 rounded-xl border border-primary/50 bg-primary/10 p-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary">
                <ArrowDown size={16} weight="bold" aria-hidden="true" />
              </span>
              <p className="text-base text-foreground sm:text-lg">
                <span className="font-semibold">TRASON</span> keeps one record of the same week.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
