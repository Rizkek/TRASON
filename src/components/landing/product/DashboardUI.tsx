import React from 'react';
import { Bell, CurrencyCircleDollar, Heartbeat, TrendUp } from '@phosphor-icons/react/dist/ssr';
import { UiBar, UiCard, UiCheck, UiLabel, UiMoney, UiSidebar, UiTag } from './bits';

const DIMENSIONS = [
  { label: 'Finance', value: 82 },
  { label: 'Productivity', value: 68 },
  { label: 'Health', value: 71 },
  { label: 'Career', value: 75 },
];

const REMINDERS = [
  { title: 'Pay electricity bill', time: '17:00', priority: 'high' },
  { title: 'Call Ibu', time: '19:30', priority: 'medium' },
  { title: 'Submit weekly report', time: 'Tomorrow · 09:00', priority: 'medium' },
] as const;

const TASKS = [
  { title: 'Review monthly budget', done: true },
  { title: '30 min run', done: true },
  { title: 'Draft cover letter — Tokopedia', done: false },
  { title: 'Read 20 pages', done: false },
];

/**
 * Recreation of the real Dashboard: Life Score, Up next (reminders),
 * Current state (finance + vitality), today's tasks and one attention item.
 */
export function DashboardUI({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex min-h-[420px] text-left">
      {!compact && <UiSidebar active="Dashboard" />}

      <div className="flex-1 space-y-4 p-4 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Thursday, 18 September</p>
            <p className="mt-0.5 text-base font-semibold text-foreground sm:text-lg">Good morning, Rizky.</p>
          </div>
          <UiLabel className="pt-1">Today at a glance</UiLabel>
        </div>

        {/* Life Score */}
        <UiCard>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <TrendUp size={16} />
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium uppercase tracking-[0.14em] text-foreground">Life Score</span>
                <span className="font-mono text-base font-semibold text-foreground">
                  74<span className="text-xs font-normal text-muted-foreground">/100</span>
                </span>
                <UiTag tone="positive">Good</UiTag>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Recalculated from today&apos;s records</p>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
            {DIMENSIONS.map((d) => (
              <div key={d.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{d.label}</span>
                  <span className="font-mono text-foreground">{d.value}</span>
                </div>
                <UiBar value={d.value} tone={d.value >= 80 ? 'positive' : 'default'} />
              </div>
            ))}
          </div>
        </UiCard>

        <div className={`grid gap-4 ${compact ? '' : 'lg:grid-cols-5'}`}>
          {/* Up next */}
          <UiCard className={compact ? '' : 'lg:col-span-3'}>
            <div className="mb-3 flex items-center justify-between">
              <UiLabel>Up next</UiLabel>
              <span className="text-xs text-muted-foreground">View all</span>
            </div>
            <ul className="space-y-2.5">
              {REMINDERS.map((r) => (
                <li key={r.title} className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-foreground/[0.06] text-muted-foreground">
                    <Bell size={13} />
                  </span>
                  <span className="flex-1 truncate text-body-sm text-foreground">{r.title}</span>
                  <span className="font-mono text-xs text-muted-foreground">{r.time}</span>
                  <UiTag tone={r.priority === 'high' ? 'warning' : 'default'}>{r.priority}</UiTag>
                </li>
              ))}
            </ul>
          </UiCard>

          {/* Current state */}
          <UiCard className={compact ? '' : 'lg:col-span-2'}>
            <UiLabel className="mb-3">Current state</UiLabel>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <CurrencyCircleDollar size={14} />
                </span>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Net balance</p>
                  <p className="text-body-sm">
                    <UiMoney value="Rp 4.250.000" tone="accent" />
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">62% of budget</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-danger/10 text-danger">
                  <Heartbeat size={14} />
                </span>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Vitality</p>
                  <p className="text-body-sm text-foreground">3 sessions this week</p>
                </div>
                <UiTag tone="positive">On track</UiTag>
              </div>
            </div>
          </UiCard>
        </div>

        {!compact && (
          <div className="grid gap-4 lg:grid-cols-5">
            <UiCard className="lg:col-span-3">
              <div className="mb-3 flex items-center justify-between">
                <UiLabel>Tasks</UiLabel>
                <span className="text-xs text-muted-foreground">2 of 4 done</span>
              </div>
              <ul className="space-y-2.5">
                {TASKS.map((t) => (
                  <li key={t.title} className="flex items-center gap-3">
                    <UiCheck done={t.done} />
                    <span className={`text-body-sm ${t.done ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                      {t.title}
                    </span>
                  </li>
                ))}
              </ul>
            </UiCard>

            <UiCard accent className="lg:col-span-2">
              <UiLabel className="mb-2 text-primary">Needs attention</UiLabel>
              <p className="text-body-sm leading-relaxed text-foreground/90">
                You have 1 subscription due for payment.
              </p>
              <p className="mt-3 text-xs font-medium text-primary">Review</p>
            </UiCard>
          </div>
        )}
      </div>
    </div>
  );
}
