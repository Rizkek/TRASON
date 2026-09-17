import React from 'react';
import {
  Bell,
  Briefcase,
  CalendarBlank,
  CurrencyCircleDollar,
  DotsThree,
  Heartbeat,
  SquaresFour,
  TrendUp,
} from '@phosphor-icons/react/dist/ssr';
import { UiBar, UiCard, UiLabel, UiMoney, UiTag } from './bits';

const NAV = [
  { label: 'Dashboard', icon: SquaresFour, active: true },
  { label: 'Finance', icon: CurrencyCircleDollar },
  { label: 'Schedule', icon: CalendarBlank },
  { label: 'Career', icon: Briefcase },
  { label: 'More', icon: DotsThree },
];

/**
 * The real responsive Dashboard at phone width: stacked cards, bottom
 * navigation with Dashboard + three enabled modules + More.
 */
export function MobileUI() {
  return (
    <div className="flex h-[560px] flex-col text-left">
      <div className="flex-1 space-y-3 overflow-hidden px-4 pb-4 pt-3">
        <div>
          <p className="text-[10px] text-ui-muted">Thursday, 18 September</p>
          <p className="text-[15px] font-semibold text-ui-fg">Good morning, Rizky.</p>
        </div>

        <UiCard className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-ui-accent/10 text-ui-accent">
                <TrendUp size={12} />
              </span>
              <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-ui-fg">Life Score</span>
            </div>
            <span className="font-mono text-sm font-semibold text-ui-fg">
              74<span className="text-[9px] font-normal text-ui-muted">/100</span>
            </span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
            {[
              ['Finance', 82],
              ['Productivity', 68],
              ['Health', 71],
              ['Career', 75],
            ].map(([label, value]) => (
              <div key={label as string} className="space-y-1">
                <div className="flex justify-between text-[10px]">
                  <span className="text-ui-muted">{label}</span>
                  <span className="font-mono text-ui-fg">{value}</span>
                </div>
                <UiBar value={value as number} tone={(value as number) >= 80 ? 'positive' : 'default'} />
              </div>
            ))}
          </div>
        </UiCard>

        <UiCard className="p-3">
          <UiLabel className="mb-2">Up next</UiLabel>
          <ul className="space-y-2">
            {[
              ['Pay electricity bill', '17:00', 'high'],
              ['Call Ibu', '19:30', 'medium'],
            ].map(([title, time, prio]) => (
              <li key={title} className="flex items-center gap-2.5">
                <Bell size={12} className="shrink-0 text-ui-muted" />
                <span className="flex-1 truncate text-[12px] text-ui-fg">{title}</span>
                <span className="font-mono text-[10px] text-ui-muted">{time}</span>
                <UiTag tone={prio === 'high' ? 'warning' : 'default'}>{prio}</UiTag>
              </li>
            ))}
          </ul>
        </UiCard>

        <div className="grid grid-cols-2 gap-3">
          <UiCard className="p-3">
            <UiLabel>Net balance</UiLabel>
            <p className="mt-1 text-[12px]">
              <UiMoney value="Rp 4.250.000" tone="accent" />
            </p>
            <p className="mt-0.5 text-[10px] text-ui-muted">62% of budget</p>
          </UiCard>
          <UiCard className="p-3">
            <div className="flex items-center gap-1.5">
              <Heartbeat size={11} className="text-rose-300" />
              <UiLabel>Vitality</UiLabel>
            </div>
            <p className="mt-1 text-[12px] text-ui-fg">3 sessions</p>
            <p className="mt-0.5 text-[10px] text-ui-muted">this week</p>
          </UiCard>
        </div>
      </div>

      <nav className="grid grid-cols-5 border-t border-ui-border/[0.08] bg-ui-surface/60 px-1 pb-4 pt-2">
        {NAV.map(({ label, icon: Icon, active }) => (
          <span
            key={label}
            className={`flex flex-col items-center gap-1 text-[9px] ${active ? 'text-ui-accent' : 'text-ui-muted'}`}
          >
            <Icon size={18} weight={active ? 'fill' : 'regular'} />
            {label}
          </span>
        ))}
      </nav>
    </div>
  );
}
