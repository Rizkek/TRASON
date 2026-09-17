import React from 'react';
import { ArrowRight } from '@phosphor-icons/react/dist/ssr';
import { Container, Section } from '../primitives/Section';
import { SectionHeading } from '../primitives/SectionHeading';
import { MediaFrame } from '../primitives/MediaFrame';
import { landingMedia } from '../media';

const SCATTERED = [
  { tool: 'Bank app', holds: 'what you spent' },
  { tool: 'Spreadsheet', holds: 'where you applied' },
  { tool: 'Fitness app', holds: 'when you trained' },
  { tool: 'Calendar', holds: 'what the week looked like' },
  { tool: 'Notes', holds: 'what you meant to do' },
  { tool: 'Alarms', holds: 'what is due' },
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
              eyebrow="The problem"
              title={
                <>
                  It isn&apos;t too many apps.
                  <br />
                  It&apos;s losing the thread between them.
                </>
              }
              lede="Each tool is fine on its own. None of them knows about the others, so the context of your week lives in your head."
            />

            <ul className="mt-10 grid gap-x-8 gap-y-3 sm:grid-cols-2" aria-label="Where the week usually lives">
              {SCATTERED.map((item) => (
                <li key={item.tool} className="flex items-baseline gap-3 text-sm">
                  <span aria-hidden="true" className="h-px w-4 shrink-0 translate-y-[-3px] bg-lp-border/25" />
                  <span className="font-medium text-lp-foreground">{item.tool}</span>
                  <span className="text-lp-muted">{item.holds}</span>
                </li>
              ))}
            </ul>

            <div className="mt-10 flex items-center gap-4 border-t border-lp-border/10 pt-6">
              <ArrowRight size={18} weight="bold" className="shrink-0 text-lp-foreground" aria-hidden="true" />
              <p className="text-base text-lp-foreground sm:text-lg">
                <span className="font-medium">TRASON</span>
                <span className="text-lp-muted"> keeps one record of the same week.</span>
              </p>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
