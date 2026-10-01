import React from 'react';
import { Check } from '@phosphor-icons/react/dist/ssr';

/* Small building blocks shared by every product recreation. They mirror the
   real app's visual language (dark surfaces, mono numbers, tiny uppercase
   labels) so the landing shows the product people will actually use. */

export function UiLabel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`text-[10px] font-semibold uppercase tracking-[0.14em] text-ui-muted ${className}`}>
      {children}
    </p>
  );
}

export function UiCard({
  children,
  className = '',
  accent = false,
}: {
  children: React.ReactNode;
  className?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        accent
          ? 'border-ui-accent/25 bg-ui-accent/[0.08]'
          : 'border-ui-border/[0.07] bg-ui-surface/50'
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function UiMoney({ value, tone = 'default' }: { value: string; tone?: 'default' | 'positive' | 'negative' | 'accent' }) {
  const color =
    tone === 'positive'
      ? 'text-emerald-400'
      : tone === 'negative'
      ? 'text-ui-fg'
      : tone === 'accent'
      ? 'text-ui-accent'
      : 'text-ui-fg';
  return <span className={`font-mono tabular-nums ${color}`}>{value}</span>;
}

export function UiCheck({ done }: { done: boolean }) {
  return (
    <span
      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[5px] border ${
        done ? 'border-emerald-400 bg-emerald-400 text-ui-bg' : 'border-ui-border/20'
      }`}
    >
      {done && <Check size={10} weight="bold" />}
    </span>
  );
}

export function UiBar({ value, tone = 'default' }: { value: number; tone?: 'default' | 'accent' | 'positive' | 'warning' }) {
  const fill =
    tone === 'accent'
      ? 'bg-ui-accent'
      : tone === 'positive'
      ? 'bg-emerald-400'
      : tone === 'warning'
      ? 'bg-amber-400'
      : 'bg-ui-fg/70';
  return (
    <div className="h-1 w-full overflow-hidden rounded-full bg-ui-border/[0.08]">
      <div className={`h-full rounded-full ${fill}`} style={{ width: `${value}%` }} />
    </div>
  );
}

export function UiTag({
  children,
  tone = 'default',
}: {
  children: React.ReactNode;
  tone?: 'default' | 'accent' | 'positive' | 'info' | 'warning';
}) {
  const cls =
    tone === 'accent'
      ? 'border-ui-accent/30 bg-ui-accent/10 text-ui-accent'
      : tone === 'positive'
      ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300'
      : tone === 'info'
      ? 'border-sky-400/30 bg-sky-400/10 text-sky-300'
      : tone === 'warning'
      ? 'border-amber-400/30 bg-amber-400/10 text-amber-300'
      : 'border-ui-border/10 bg-ui-border/[0.06] text-ui-muted';
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${cls}`}>
      {children}
    </span>
  );
}

const NAV = ['Dashboard', 'Finance', 'Investments', 'Schedule', 'Vitality', 'Career', 'Reminders', 'Insights'];

export function UiSidebar({ active }: { active: string }) {
  return (
    <aside className="hidden w-44 shrink-0 flex-col gap-5 border-r border-ui-border/[0.06] bg-ui-surface/30 p-4 md:flex">
      <div className="flex items-center gap-2 px-1">
        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-ui-accent text-[10px] font-bold text-ui-bg">
          T
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ui-fg/70">TRASON</span>
      </div>
      <nav className="flex flex-col gap-0.5">
        {NAV.map((item) => (
          <span
            key={item}
            className={`rounded-lg px-3 py-1.5 text-[13px] ${
              item === active ? 'bg-ui-border/[0.08] font-medium text-ui-fg' : 'text-ui-muted'
            }`}
          >
            {item}
          </span>
        ))}
      </nav>
      <span className="mt-auto rounded-lg px-3 py-1.5 text-[13px] text-ui-muted">Settings</span>
    </aside>
  );
}

export function UiPageHeader({ title, meta }: { title: string; meta: string }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <p className="text-[11px] text-ui-muted">{meta}</p>
        <p className="mt-0.5 text-base font-semibold text-ui-fg">{title}</p>
      </div>
    </div>
  );
}

export const WEEK = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
