import React from 'react';
import { Check } from '@phosphor-icons/react/dist/ssr';

/* Small building blocks shared by every product recreation. They mirror the
   real app's visual language (dark surfaces, mono numbers, tiny uppercase
   labels) so the landing shows the product people will actually use. */

export function UiLabel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground ${className}`}>
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
          ? 'border-primary/25 bg-primary/[0.08]'
          : 'border-foreground/[0.07] bg-surface/50'
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function UiMoney({ value, tone = 'default' }: { value: string; tone?: 'default' | 'positive' | 'negative' | 'accent' }) {
  const color =
    tone === 'positive'
      ? 'text-success'
      : tone === 'negative'
      ? 'text-foreground'
      : tone === 'accent'
      ? 'text-primary'
      : 'text-foreground';
  return <span className={`font-mono tabular-nums ${color}`}>{value}</span>;
}

export function UiCheck({ done }: { done: boolean }) {
  return (
    <span
      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[5px] border ${
        done ? 'border-success bg-success text-background' : 'border-foreground/20'
      }`}
    >
      {done && <Check size={10} weight="bold" />}
    </span>
  );
}

export function UiBar({ value, tone = 'default' }: { value: number; tone?: 'default' | 'accent' | 'positive' | 'warning' }) {
  const fill =
    tone === 'accent'
      ? 'bg-primary'
      : tone === 'positive'
      ? 'bg-success'
      : tone === 'warning'
      ? 'bg-warning'
      : 'bg-foreground/70';
  return (
    <div className="h-1 w-full overflow-hidden rounded-full bg-foreground/[0.08]">
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
      ? 'border-primary/30 bg-primary/10 text-primary'
      : tone === 'positive'
      ? 'border-success/30 bg-success/10 text-success'
      : tone === 'info'
      ? 'border-info/30 bg-info/10 text-info'
      : tone === 'warning'
      ? 'border-warning/30 bg-warning/10 text-warning'
      : 'border-foreground/10 bg-foreground/[0.06] text-muted-foreground';
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${cls}`}>
      {children}
    </span>
  );
}

const NAV = ['Dashboard', 'Finance', 'Investments', 'Schedule', 'Vitality', 'Career', 'Reminders', 'Insights'];

export function UiSidebar({ active }: { active: string }) {
  return (
    <aside className="hidden w-44 shrink-0 flex-col gap-5 border-r border-foreground/[0.06] bg-surface/30 p-4 md:flex">
      <div className="flex items-center gap-2 px-1">
        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-primary text-xs font-bold text-background">
          T
        </span>
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/70">TRASON</span>
      </div>
      <nav className="flex flex-col gap-0.5">
        {NAV.map((item) => (
          <span
            key={item}
            className={`rounded-lg px-3 py-1.5 text-body-sm ${
              item === active ? 'bg-foreground/[0.08] font-medium text-foreground' : 'text-muted-foreground'
            }`}
          >
            {item}
          </span>
        ))}
      </nav>
      <span className="mt-auto rounded-lg px-3 py-1.5 text-body-sm text-muted-foreground">Settings</span>
    </aside>
  );
}

export function UiPageHeader({ title, meta }: { title: string; meta: string }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <p className="text-xs text-muted-foreground">{meta}</p>
        <p className="mt-0.5 text-base font-semibold text-foreground">{title}</p>
      </div>
    </div>
  );
}

export const WEEK = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
