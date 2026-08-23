'use client';

import React, { useState } from 'react';
import {
  CurrencyCircleDollar,
  Briefcase,
  Heartbeat,
  CalendarBlank,
  CheckCircle,
  ArrowRight,
  TrendUp,
  TrendDown,
} from '@phosphor-icons/react';

type Tab = 'finance' | 'career' | 'vitality' | 'schedule';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'finance', label: 'Finance', icon: <CurrencyCircleDollar size={15} /> },
  { id: 'career', label: 'Career', icon: <Briefcase size={15} /> },
  { id: 'vitality', label: 'Vitality', icon: <Heartbeat size={15} /> },
  { id: 'schedule', label: 'Schedule', icon: <CalendarBlank size={15} /> },
];

export function InteractiveSystem() {
  const [activeTab, setActiveTab] = useState<Tab>('finance');

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Tab Navigation — editorial, not pill-heavy */}
      <div
        className="flex items-center border-b border-black/8 dark:border-white/8 mb-0"
        role="tablist"
        aria-label="TRASON modules"
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            id={`tab-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all border-b-2 -mb-px ${
              activeTab === tab.id
                ? 'border-warm-black dark:border-soft-cream text-warm-black dark:text-soft-cream'
                : 'border-transparent text-gray-medium dark:text-gray-light hover:text-warm-black dark:hover:text-soft-cream'
            }`}
          >
            <span aria-hidden="true">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Product Preview Area — browser chrome for context */}
      <div
        className="relative w-full bg-white dark:bg-[#0F1117] rounded-b-3xl border border-t-0 border-black/8 dark:border-white/8 shadow-xl overflow-hidden"
        role="tabpanel"
        id={`panel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
      >
        {/* Browser bar */}
        <div className="h-10 bg-gray-50 dark:bg-white/[0.03] border-b border-black/5 dark:border-white/5 flex items-center px-4 gap-3">
          <div className="flex gap-1.5" aria-hidden="true">
            <div className="w-2.5 h-2.5 rounded-full bg-black/10 dark:bg-white/10" />
            <div className="w-2.5 h-2.5 rounded-full bg-black/10 dark:bg-white/10" />
            <div className="w-2.5 h-2.5 rounded-full bg-black/10 dark:bg-white/10" />
          </div>
          <div className="mx-auto flex-1 max-w-[240px] bg-white dark:bg-white/5 border border-black/8 dark:border-white/8 rounded px-3 py-1 text-[11px] text-gray-medium dark:text-gray-light text-center hidden sm:block">
            trason.app/{activeTab}
          </div>
        </div>

        <div className="p-6 md:p-10">
          {activeTab === 'finance' && <FinanceUI />}
          {activeTab === 'career' && <CareerUI />}
          {activeTab === 'vitality' && <VitalityUI />}
          {activeTab === 'schedule' && <ScheduleUI />}
        </div>
      </div>
    </div>
  );
}

// ─── Module UIs ───────────────────────────────────────────────────────────────

function FinanceUI() {
  return (
    <div className="animate-fade-in max-w-3xl mx-auto space-y-6">
      <div className="space-y-1">
        <h3 className="text-xl font-brand text-warm-black dark:text-soft-cream">
          Know where your money goes.
        </h3>
        <p className="text-sm text-gray-medium dark:text-gray-light">
          Net worth, cash flow, and spending — in one clear view.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Net Worth" value="Rp 12.4M" delta={null} />
        <StatCard label="Income" value="Rp 5.2M" delta="positive" />
        <StatCard label="Spending" value="Rp 3.1M" delta="negative" />
      </div>

      <div className="border border-black/6 dark:border-white/6 rounded-2xl divide-y divide-black/5 dark:divide-white/5 overflow-hidden">
        <div className="px-5 py-3 bg-black/[0.02] dark:bg-white/[0.02]">
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-medium dark:text-gray-light">
            Recent Transactions
          </span>
        </div>
        {[
          { name: 'Gojek', cat: 'Transport', amount: '-Rp 24.000', neg: true },
          { name: 'Salary', cat: 'Income', amount: '+Rp 5.200.000', neg: false },
          { name: 'Alfamart', cat: 'Groceries', amount: '-Rp 85.000', neg: true },
        ].map((tx) => (
          <div key={tx.name} className="flex items-center justify-between px-6 py-4">
            <div>
              <div className="text-sm font-medium text-warm-black dark:text-soft-cream">{tx.name}</div>
              <div className="text-xs text-gray-medium dark:text-gray-light">{tx.cat}</div>
            </div>
            <div className={`text-sm font-mono font-medium ${tx.neg ? 'text-warm-black dark:text-soft-cream' : 'text-emerald-600 dark:text-emerald-400'}`}>
              {tx.amount}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CareerUI() {
  return (
    <div className="animate-fade-in max-w-3xl mx-auto space-y-6">
      <div className="space-y-1">
        <h3 className="text-xl font-brand text-warm-black dark:text-soft-cream">
          Know where your career is going.
        </h3>
        <p className="text-sm text-gray-medium dark:text-gray-light">
          Manage your job pipeline and track every application.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Applied */}
        <PipelineColumn
          label="Applied"
          count={2}
          color="text-gray-medium dark:text-gray-light"
          borderColor="border-black/8 dark:border-white/8"
          bgColor="bg-black/[0.02] dark:bg-white/[0.02]"
          items={[
            { role: 'Frontend Engineer', company: 'Stripe' },
            { role: 'Product Engineer', company: 'Vercel' },
          ]}
        />
        {/* Interviewing */}
        <PipelineColumn
          label="Interviewing"
          count={1}
          color="text-blue-600 dark:text-blue-400"
          borderColor="border-blue-200 dark:border-blue-900"
          bgColor="bg-blue-50 dark:bg-blue-950/50"
          items={[{ role: 'Fullstack Developer', company: 'Supabase', note: 'Tech round tomorrow' }]}
        />
        {/* Offers */}
        <div className="rounded-2xl border border-black/8 dark:border-white/8 bg-black/[0.02] dark:bg-white/[0.02] p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
              Offers
            </span>
            <span className="text-xs bg-white dark:bg-white/10 px-2 py-0.5 rounded-full border border-black/8 dark:border-white/8">0</span>
          </div>
          <div className="h-24 flex items-center justify-center border-2 border-dashed border-black/10 dark:border-white/10 rounded-xl text-xs text-gray-medium dark:text-gray-light">
            Keep going.
          </div>
        </div>
      </div>
    </div>
  );
}

function VitalityUI() {
  return (
    <div className="animate-fade-in max-w-3xl mx-auto space-y-6">
      <div className="space-y-1">
        <h3 className="text-xl font-brand text-warm-black dark:text-soft-cream">
          Keep the habits that move you forward.
        </h3>
        <p className="text-sm text-gray-medium dark:text-gray-light">
          Track sleep, workouts, and daily routines.
        </p>
      </div>

      <div className="border border-black/6 dark:border-white/6 rounded-2xl overflow-hidden">
        <div className="px-5 py-3 bg-black/[0.02] dark:bg-white/[0.02] border-b border-black/5 dark:border-white/5">
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-medium dark:text-gray-light">
            Today's Habits
          </span>
        </div>
        <div className="divide-y divide-black/5 dark:divide-white/5">
          {[
            { name: 'Sleep 8 hours', streak: '7 day streak', done: true },
            { name: 'Morning workout', streak: '3 day streak', done: true },
            { name: 'Read 20 pages', streak: '', done: false },
          ].map((h) => (
            <div key={h.name} className="flex items-center gap-4 px-5 py-4">
              <CheckCircle
                size={18}
                weight={h.done ? 'fill' : 'regular'}
                className={h.done ? 'text-emerald-500 shrink-0' : 'text-black/15 dark:text-white/15 shrink-0'}
              />
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-medium ${h.done ? 'text-warm-black dark:text-soft-cream' : 'text-gray-medium dark:text-gray-light'}`}>
                  {h.name}
                </div>
                <div className="w-full bg-black/5 dark:bg-white/5 h-1 rounded-full mt-2">
                  <div
                    className={`h-1 rounded-full transition-all ${h.done ? 'bg-emerald-500 w-full' : 'bg-transparent w-0'}`}
                  />
                </div>
              </div>
              {h.streak && (
                <span className="text-xs text-gray-medium dark:text-gray-light shrink-0">{h.streak}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ScheduleUI() {
  return (
    <div className="animate-fade-in max-w-3xl mx-auto space-y-6">
      <div className="space-y-1">
        <h3 className="text-xl font-brand text-warm-black dark:text-soft-cream">
          Organize what comes next.
        </h3>
        <p className="text-sm text-gray-medium dark:text-gray-light">
          One schedule — your meetings, habits, and tasks, together.
        </p>
      </div>

      <div className="space-y-2">
        <div className="text-[10px] uppercase font-bold tracking-widest text-gray-medium dark:text-gray-light px-1 mb-3">
          Morning
        </div>
        <ScheduleItem time="07:00" title="Morning Workout" tag="Vitality" done />
        <ScheduleItem time="10:00" title="Team Sync" tag="Meeting" />

        <div className="text-[10px] uppercase font-bold tracking-widest text-gray-medium dark:text-gray-light px-1 mt-5 mb-3">
          Afternoon
        </div>
        <ScheduleItem time="14:00" title="Supabase Tech Interview" tag="Career" highlight />
      </div>
    </div>
  );
}

// ─── Shared primitives ────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  delta,
}: {
  label: string;
  value: string;
  delta: 'positive' | 'negative' | null;
}) {
  return (
    <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/6 dark:border-white/6">
      <div className="text-[10px] font-bold uppercase tracking-widest text-gray-medium dark:text-gray-light mb-1.5">
        {label}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xl font-mono font-semibold text-warm-black dark:text-soft-cream">
          {value}
        </span>
        {delta === 'positive' && <TrendUp size={14} className="text-emerald-500" />}
        {delta === 'negative' && <TrendDown size={14} className="text-red-400" />}
      </div>
    </div>
  );
}

function PipelineColumn({
  label,
  count,
  color,
  borderColor,
  bgColor,
  items,
}: {
  label: string;
  count: number;
  color: string;
  borderColor: string;
  bgColor: string;
  items: { role: string; company: string; note?: string }[];
}) {
  return (
    <div className={`rounded-2xl border ${borderColor} ${bgColor} p-4`}>
      <div className={`flex items-center justify-between mb-3`}>
        <span className={`text-[10px] font-bold uppercase tracking-widest ${color}`}>{label}</span>
        <span className="text-xs bg-white dark:bg-white/10 px-2 py-0.5 rounded-full border border-black/8 dark:border-white/8">
          {count}
        </span>
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={`${item.role}-${item.company}`}
            className="bg-white dark:bg-white/5 p-3 rounded-xl border border-black/6 dark:border-white/6"
          >
            <div className="text-sm font-medium text-warm-black dark:text-soft-cream">{item.role}</div>
            <div className="text-xs text-gray-medium dark:text-gray-light mt-0.5">{item.company}</div>
            {item.note && (
              <div className="mt-2 text-[11px] bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 py-1 px-2 rounded-md inline-block">
                {item.note}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ScheduleItem({
  time,
  title,
  tag,
  done,
  highlight,
}: {
  time: string;
  title: string;
  tag: string;
  done?: boolean;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-4 px-4 py-4 rounded-xl border relative overflow-hidden ${
        highlight
          ? 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/50'
          : done
          ? 'border-black/6 dark:border-white/6 bg-black/[0.02] dark:bg-white/[0.02] opacity-50'
          : 'border-black/8 dark:border-white/8 bg-white dark:bg-white/[0.03]'
      }`}
    >
      {highlight && (
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-500" />
      )}
      <span className={`text-xs font-mono w-10 shrink-0 ${highlight ? 'text-blue-500' : 'text-gray-medium dark:text-gray-light'}`}>
        {time}
      </span>
      <div className="flex-1 min-w-0">
        <div className={`text-sm font-medium ${done ? 'line-through text-gray-medium dark:text-gray-light' : highlight ? 'text-blue-900 dark:text-blue-100' : 'text-warm-black dark:text-soft-cream'}`}>
          {title}
        </div>
        <div className={`text-xs mt-0.5 ${highlight ? 'text-blue-600 dark:text-blue-400' : 'text-gray-medium dark:text-gray-light'}`}>
          {tag}
        </div>
      </div>
    </div>
  );
}
