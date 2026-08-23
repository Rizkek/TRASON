'use client';

import React from 'react';
import {
  CurrencyCircleDollar,
  Briefcase,
  Heartbeat,
  CalendarBlank,
  CheckCircle,
  ArrowRight,
} from '@phosphor-icons/react';

/** 
 * A static product-scene representation of the TRASON dashboard.
 * Static (no intervals) for performance. Styled dark-on-light for
 * visual contrast against the white hero background.
 */
export function LivingHeroDashboard() {
  return (
    <div className="w-full max-w-4xl mx-auto mt-14 md:mt-20 relative" aria-hidden="true">
      {/* Subtle drop shadow — no glowing orbs */}
      <div className="absolute -inset-1 rounded-[2rem] bg-black/5 dark:bg-black/20 blur-xl pointer-events-none" />

      {/* App Window */}
      <div className="relative w-full bg-[#111827] text-white rounded-[1.75rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col md:flex-row">

        {/* Sidebar */}
        <aside className="shrink-0 w-full md:w-52 bg-black/30 border-b md:border-b-0 md:border-r border-white/5 p-4 md:p-5 flex flex-col gap-5">
          {/* Brand mark */}
          <div className="flex items-center gap-2 px-1 pt-1">
            <div className="w-5 h-5 rounded-md bg-[#F4C95D] flex items-center justify-center text-black font-bold text-[10px]">
              T
            </div>
            <span className="font-sans font-bold tracking-widest text-[11px] text-white/60 uppercase">
              TRASON
            </span>
          </div>

          {/* Nav items */}
          <nav className="space-y-0.5 hidden md:block">
            <div className="text-[9px] uppercase font-bold tracking-widest text-white/25 px-2 mb-2">
              Modules
            </div>
            {[
              { label: 'Overview', active: true },
              { label: 'Finance', active: false },
              { label: 'Career', active: false },
              { label: 'Vitality', active: false },
              { label: 'Goals', active: false },
            ].map((item) => (
              <div
                key={item.label}
                className={`px-3 py-2 rounded-lg text-sm ${
                  item.active
                    ? 'bg-white/10 text-white font-medium'
                    : 'text-white/40 font-normal'
                }`}
              >
                {item.label}
              </div>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <div className="flex-1 p-5 md:p-8 space-y-6 bg-gradient-to-br from-[#111827] to-[#0B0F14]">
          {/* Header row */}
          <div>
            <div className="text-white/50 text-xs font-medium mb-0.5">Wednesday, August 2026</div>
            <h3 className="text-lg font-semibold text-white">Good evening, Alex.</h3>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MetricBox
              icon={<CurrencyCircleDollar size={16} weight="duotone" />}
              label="Finance"
              value="Rp 12.4M"
              color="text-[#F4C95D]"
            />
            <MetricBox
              icon={<Briefcase size={16} weight="duotone" />}
              label="Career"
              value="3 active"
              color="text-blue-400"
            />
            <MetricBox
              icon={<Heartbeat size={16} weight="duotone" />}
              label="Vitality"
              value="6 / 7 days"
              color="text-rose-400"
            />
            <MetricBox
              icon={<CalendarBlank size={16} weight="duotone" />}
              label="Schedule"
              value="2 upcoming"
              color="text-emerald-400"
            />
          </div>

          {/* Lower Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tasks */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/5">
              <div className="text-[10px] uppercase font-bold tracking-widest text-white/30 mb-3">
                What's Next
              </div>
              <div className="space-y-2.5">
                {[
                  { text: 'Submit assignment', done: true },
                  { text: 'Morning workout', done: false },
                  { text: 'Review monthly budget', done: false },
                ].map((t) => (
                  <div key={t.text} className="flex items-center gap-2.5">
                    <CheckCircle
                      size={15}
                      weight={t.done ? 'fill' : 'regular'}
                      className={t.done ? 'text-emerald-400' : 'text-white/20'}
                    />
                    <span
                      className={`text-sm ${
                        t.done ? 'line-through text-white/30' : 'text-white/75'
                      }`}
                    >
                      {t.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Insight */}
            <div className="bg-[#F4C95D]/10 rounded-xl p-4 border border-[#F4C95D]/20 relative overflow-hidden">
              <div className="text-[10px] uppercase font-bold tracking-widest text-[#F4C95D] mb-2 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F4C95D]" />
                Insight
              </div>
              <p className="text-sm text-white/80 leading-relaxed mt-2">
                Transport spending is up{' '}
                <strong className="text-[#F4C95D]">18%</strong> this month.
              </p>
              <button className="mt-3 text-xs text-[#F4C95D] font-medium flex items-center gap-1 opacity-80 hover:opacity-100 transition-opacity">
                Review spending <ArrowRight size={12} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricBox({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="bg-white/5 border border-white/5 p-3.5 rounded-xl flex flex-col justify-between h-24">
      <div className={`${color}`}>{icon}</div>
      <div>
        <div className="text-[9px] font-bold uppercase tracking-widest text-white/30">
          {label}
        </div>
        <div className="text-sm font-mono text-white mt-0.5">{value}</div>
      </div>
    </div>
  );
}
