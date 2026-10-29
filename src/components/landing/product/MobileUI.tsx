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
          <p className="text-xs text-muted-foreground">Thursday, 18 September</p>
          <p className="text-base font-semibold text-foreground">Good morning, Rizky.</p>
        </div>

        <UiCard className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary">
                <TrendUp size={12} />
              </span>
              <span className="text-xs font-medium uppercase tracking-[0.14em] text-foreground">Life Score</span>
            </div>
            <span className="font-mono text-sm font-semibold text-foreground">
              74<span className="text-xs font-normal text-muted-foreground">/100</span>
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
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-mono text-foreground">{value}</span>
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
                <Bell size={12} className="shrink-0 text-muted-foreground" />
                <span className="flex-1 truncate text-xs text-foreground">{title}</span>
                <span className="font-mono text-xs text-muted-foreground">{time}</span>
                <UiTag tone={prio === 'high' ? 'warning' : 'default'}>{prio}</UiTag>
              </li>
            ))}
          </ul>
        </UiCard>

        <div className="grid grid-cols-2 gap-3">
          <UiCard className="p-3">
            <UiLabel>Net balance</UiLabel>
            <p className="mt-1 text-xs">
              <UiMoney value="Rp 4.250.000" tone="accent" />
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">62% of budget</p>
          </UiCard>
          <UiCard className="p-3">
            <div className="flex items-center gap-1.5">
              <Heartbeat size={11} className="text-danger" />
              <UiLabel>Sport</UiLabel>
            </div>
            <p className="mt-1 text-xs text-foreground">3 sessions</p>
            <p className="mt-0.5 text-xs text-muted-foreground">this week</p>
          </UiCard>
        </div>
      </div>

      <nav className="grid grid-cols-5 border-t border-foreground/[0.08] bg-surface/60 px-1 pb-4 pt-2">
        {NAV.map(({ label, icon: Icon, active }) => (
          <span
            key={label}
            className={`flex flex-col items-center gap-1 text-xs ${active ? 'text-primary' : 'text-muted-foreground'}`}
          >
            <Icon size={18} weight={active ? 'fill' : 'regular'} />
            {label}
          </span>
        ))}
      </nav>
    </div>
  );
}
