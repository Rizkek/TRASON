import React from 'react';
import { Check, Minus, ShieldCheck, Bell, Devices, Translate, ToggleLeft, Receipt } from '@phosphor-icons/react/dist/ssr';
import { Container, Section } from '../primitives/Section';
import { SectionHeading } from '../primitives/SectionHeading';

const PRINCIPLES = [
  { title: 'One system', body: 'Six modules, one account, one place to open.' },
  { title: 'One context', body: 'A workout, a payment and an interview sit in the same week.' },
  { title: 'One personal view', body: 'The Dashboard and Life Score read across all of it.' },
];

type Cell = { text: string; yes?: boolean };

// General characteristics of each approach, not claims about specific products.
const COMPARISON: { row: string; apps: Cell; sheets: Cell; trason: Cell }[] = [
  {
    row: 'Getting started',
    apps: { text: 'Set up each app on its own' },
    sheets: { text: 'Build the tables and formulas yourself' },
    trason: { text: 'Ready-made modules, nothing to build', yes: true },
  },
  {
    row: 'One view across money, training and work',
    apps: { text: 'Not without exporting' },
    sheets: { text: 'Only if you wire it yourself' },
    trason: { text: 'Dashboard and Life Score', yes: true },
  },
  {
    row: 'Reminders',
    apps: { text: 'Separate in every app' },
    sheets: { text: 'Needs another tool' },
    trason: { text: 'Push notifications, one place', yes: true },
  },
  {
    row: 'Adding a record',
    apps: { text: 'Forms in each app' },
    sheets: { text: 'Typing into cells' },
    trason: { text: 'Type a sentence or photograph a receipt', yes: true },
  },
];

const FACTS = [
  { icon: ShieldCheck, title: 'Your data stays yours', body: 'It is not sold and there are no ads. Every row belongs to your account.' },
  { icon: ToggleLeft, title: 'Modules you can turn off', body: 'Keep only what you use. Turn the rest off in Settings.' },
  { icon: Translate, title: 'English and Indonesian', body: 'The interface follows your language setting.' },
  { icon: Devices, title: 'Phone and desktop', body: 'Installs as a web app. The same account everywhere.' },
  { icon: Bell, title: 'Reminders that reach you', body: 'Push notifications at the times you choose before something is due.' },
  { icon: Receipt, title: 'Free to start', body: 'Receipt capture and typed-sentence input included.' },
];

function Verdict({ yes }: { yes?: boolean }) {
  return yes ? (
    <Check size={16} weight="bold" aria-label="Yes" className="shrink-0 text-success" />
  ) : (
    <Minus size={16} weight="bold" aria-label="No" className="shrink-0 text-muted-foreground" />
  );
}

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

        <ul className="mt-12 grid gap-4 sm:grid-cols-3">
          {PRINCIPLES.map((item) => (
            <li key={item.title} className="rounded-2xl border border-t-[3px] border-foreground/10 border-t-primary bg-surface p-6">
              <h3 className="text-xl text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
            </li>
          ))}
        </ul>

        <div className="mt-10 overflow-x-auto rounded-2xl border border-foreground/10">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <caption className="sr-only">How TRASON compares with separate apps and spreadsheets</caption>
            <thead>
              <tr className="border-b border-foreground/10 text-xs uppercase tracking-[0.12em]">
                <th scope="col" className="w-1/4 p-4 font-semibold text-muted-foreground">
                  <span className="sr-only">Feature</span>
                </th>
                <th scope="col" className="p-4 font-semibold text-muted-foreground">Separate apps</th>
                <th scope="col" className="p-4 font-semibold text-muted-foreground">Spreadsheets and notes</th>
                <th scope="col" className="bg-primary p-4 font-semibold text-on-primary">TRASON</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((r) => (
                <tr key={r.row} className="border-b border-foreground/10 last:border-b-0">
                  <th scope="row" className="p-4 font-medium text-foreground">{r.row}</th>
                  <td className="p-4 text-muted-foreground">
                    <span className="flex items-start gap-2"><Verdict />{r.apps.text}</span>
                  </td>
                  <td className="p-4 text-muted-foreground">
                    <span className="flex items-start gap-2"><Verdict />{r.sheets.text}</span>
                  </td>
                  <td className="bg-primary/10 p-4 font-medium text-foreground">
                    <span className="flex items-start gap-2"><Verdict yes={r.trason.yes} />{r.trason.text}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-12 border-t border-foreground/10 pt-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Straight facts</p>
          <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FACTS.map(({ icon: Icon, title, body }) => (
              <li key={title} className="flex gap-4 rounded-xl border border-foreground/10 bg-surface p-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <Icon size={18} aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </Section>
  );
}
