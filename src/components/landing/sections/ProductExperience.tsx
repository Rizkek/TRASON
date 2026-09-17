'use client';

import React, { useId, useRef, useState } from 'react';
import { Container, Section } from '../primitives/Section';
import { SectionHeading } from '../primitives/SectionHeading';
import { WindowFrame } from '../primitives/ProductFrame';
import { DashboardUI } from '../product/DashboardUI';
import { CareerUI, FinanceUI, ScheduleUI, VitalityUI } from '../product/ModuleUIs';

type TabId = 'dashboard' | 'finance' | 'career' | 'vitality' | 'schedule';

interface Tab {
  id: TabId;
  label: string;
  path: string;
  what: string;
  how: string;
  why: string;
  frameLabel: string;
  render: () => React.ReactNode;
}

const TABS: Tab[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: 'trason.web.id/dashboard',
    what: 'One screen for the day.',
    how: 'Open TRASON and you see your Life Score, the reminders due next, where your money and training stand, and today\u2019s tasks.',
    why: 'You check one place instead of five.',
    frameLabel: 'Dashboard page with Life Score, up-next reminders, current state and tasks.',
    render: () => <DashboardUI />,
  },
  {
    id: 'finance',
    label: 'Finance',
    path: 'trason.web.id/finance',
    what: 'Know where the money went.',
    how: 'Add transactions by hand, from a typed sentence, or by photographing a receipt. Track subscriptions, installments and a monthly budget.',
    why: 'The end of the month stops being a surprise.',
    frameLabel: 'Finance page with income, expenses, net balance, a transaction list, budget and upcoming bills.',
    render: () => <FinanceUI />,
  },
  {
    id: 'career',
    label: 'Career',
    path: 'trason.web.id/career',
    what: 'A pipeline, not a spreadsheet.',
    how: 'Log each application and move it from Applied to Reviewing, Interview and Offer. Check how well your CV matches a job description before you apply.',
    why: 'You see the whole search, not one tab of it.',
    frameLabel: 'Career page with a four-stage application pipeline and a resume match score.',
    render: () => <CareerUI />,
  },
  {
    id: 'vitality',
    label: 'Vitality',
    path: 'trason.web.id/sport',
    what: 'Consistency you can see.',
    how: 'Log sessions with type, duration and intensity. Watch the week fill in, keep personal records, and let it count toward your Life Score.',
    why: 'Showing up gets noticed.',
    frameLabel: 'Vitality page with weekly session totals, a consistency tracker, recent workouts and personal records.',
    render: () => <VitalityUI />,
  },
  {
    id: 'schedule',
    label: 'Schedule',
    path: 'trason.web.id/schedule',
    what: 'The week, as it actually happened.',
    how: 'Log activities with time, category and mood in the weekly log. Keep today\u2019s tasks in a simple checklist beside it.',
    why: 'Plans and reality live on the same page.',
    frameLabel: 'Schedule page with a weekly log of activities and a daily task checklist.',
    render: () => <ScheduleUI />,
  },
];

/**
 * Product preview: static recreations of real pages, switchable by tab.
 * Nothing here is live data; it is a faithful still of each module.
 */
export function ProductExperience() {
  const [active, setActive] = useState<TabId>('dashboard');
  const baseId = useId();
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const current = TABS.find((t) => t.id === active) ?? TABS[0];

  const focusTab = (index: number) => {
    const next = (index + TABS.length) % TABS.length;
    tabRefs.current[next]?.focus();
    setActive(TABS[next].id);
  };

  const onKeyDown = (event: React.KeyboardEvent, index: number) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      focusTab(index + 1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      focusTab(index - 1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      focusTab(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      focusTab(TABS.length - 1);
    }
  };

  return (
    <Section id="product" labelledBy="product-heading">
      <Container>
        <SectionHeading
          id="product-heading"
          eyebrow="Product preview"
          title="See it, page by page."
          lede="Each module is a page you will actually use. Pick one."
        />

        <div
          role="tablist"
          aria-label="TRASON pages"
          className="-mx-5 mt-10 flex gap-1 overflow-x-auto border-b border-lp-border/10 px-5 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {TABS.map((tab, index) => {
            const selected = tab.id === active;
            return (
              <button
                key={tab.id}
                ref={(el) => {
                  tabRefs.current[index] = el;
                }}
                type="button"
                role="tab"
                id={`${baseId}-tab-${tab.id}`}
                aria-selected={selected}
                aria-controls={`${baseId}-panel-${tab.id}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActive(tab.id)}
                onKeyDown={(e) => onKeyDown(e, index)}
                className={`-mb-px shrink-0 border-b-2 px-4 py-3 text-sm transition-colors ${
                  selected
                    ? 'border-lp-foreground font-medium text-lp-foreground'
                    : 'border-transparent text-lp-muted hover:text-lp-foreground'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div
          key={current.id}
          role="tabpanel"
          id={`${baseId}-panel-${current.id}`}
          aria-labelledby={`${baseId}-tab-${current.id}`}
          className="lp-panel mt-10"
        >
          <div className="grid gap-6 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-4">
              <h3 className="text-2xl leading-tight text-lp-foreground sm:text-[1.75rem]">{current.what}</h3>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:col-span-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-lp-muted">How</p>
                <p className="mt-2 text-[15px] leading-relaxed text-lp-foreground/90">{current.how}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-lp-muted">Why it matters</p>
                <p className="mt-2 text-[15px] leading-relaxed text-lp-foreground/90">{current.why}</p>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <WindowFrame path={current.path} label={current.frameLabel}>
              {current.render()}
            </WindowFrame>
          </div>
        </div>
      </Container>
    </Section>
  );
}
