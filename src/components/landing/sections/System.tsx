import React from 'react';
import {
  Bell,
  Briefcase,
  CalendarBlank,
  ChartLineUp,
  CurrencyCircleDollar,
  Heartbeat,
} from '@phosphor-icons/react/dist/ssr';
import { Container, Section } from '../primitives/Section';
import { SectionHeading } from '../primitives/SectionHeading';
import { WindowFrame } from '../primitives/ProductFrame';
import { DashboardUI } from '../product/DashboardUI';

const MODULES = [
  { name: 'Finance', icon: CurrencyCircleDollar, desc: 'Income, expenses, subscriptions, budgets and receipts.' },
  { name: 'Investments', icon: ChartLineUp, desc: 'Stock, crypto and gold positions, priced daily.' },
  { name: 'Career', icon: Briefcase, desc: 'Applications from Applied to Offer, plus resume match.' },
  { name: 'Vitality', icon: Heartbeat, desc: 'Workout sessions, weekly consistency, personal records.' },
  { name: 'Schedule', icon: CalendarBlank, desc: 'A weekly log of activities and today’s tasks.' },
  { name: 'Reminders', icon: Bell, desc: 'Time-based, delivered as push notifications.' },
];

export function System() {
  return (
    <Section id="system" labelledBy="system-heading" tone="tinted">
      <Container>
        <SectionHeading
          id="system-heading"
          align="center"
          title="Six parts of one life, on one Dashboard."
          lede="Each module keeps its own page. All of them feed the same Dashboard and one Life Score. Turn off what you don't need in Settings."
        />

        <ul className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-6" aria-label="TRASON modules">
          {MODULES.map(({ name, icon: Icon, desc }) => (
            <li key={name} className="flex flex-col gap-3 rounded-xl border border-foreground/10 bg-surface p-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-on-primary">
                <Icon size={18} weight="regular" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">{name}</p>
                <p className="mt-1 text-body-sm leading-snug text-muted-foreground">{desc}</p>
              </div>
            </li>
          ))}
        </ul>

        <div aria-hidden="true" className="mx-auto flex w-full max-w-4xl flex-col items-center">
          <div className="h-10 w-px bg-foreground/25" />
          <div className="flex items-center gap-2 rounded-full bg-primary px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-on-primary">
            TRASON
          </div>
          <div className="h-10 w-px bg-foreground/25" />
        </div>

        <div className="mx-auto max-w-4xl">
          <WindowFrame
            path="trason.web.id/dashboard"
            label="The Dashboard combining Life Score, reminders, finance and vitality into one view."
          >
            <DashboardUI compact />
          </WindowFrame>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            One personal overview. Not one giant interface.
          </p>
        </div>
      </Container>
    </Section>
  );
}
