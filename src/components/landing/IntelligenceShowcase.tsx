'use client';

import React from 'react';
import {
  ArrowRight,
  CurrencyCircleDollar,
  Briefcase,
  Heartbeat,
  GitMerge,
} from '@phosphor-icons/react';

export function IntelligenceShowcase() {
  return (
    <div className="w-full max-w-5xl mx-auto space-y-20 md:space-y-32">

      {/* — Connected context — */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
        <div className="space-y-5">
          <div className="text-[11px] font-bold uppercase tracking-widest text-gray-medium dark:text-gray-light">
            Cross-Module
          </div>
          <h2 className="font-brand text-4xl md:text-5xl text-warm-black dark:text-soft-cream leading-tight">
            When everything<br />talks to everything.
          </h2>
          <p className="text-base text-gray-medium dark:text-gray-light leading-relaxed max-w-sm">
            A new job offer updates your financial forecast. A drop in sleep patterns suggests lighter tasks for the day.
            TRASON connects context across your life.
          </p>
        </div>

        {/* Connection visual */}
        <div className="relative">
          <div className="bg-white dark:bg-white/[0.03] border border-black/8 dark:border-white/8 rounded-2xl overflow-hidden">
            {/* Career event */}
            <div className="flex items-center gap-4 p-5 border-b border-black/5 dark:border-white/5">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Briefcase size={18} />
              </div>
              <div>
                <div className="text-[10px] text-gray-medium dark:text-gray-light font-medium uppercase tracking-wider">
                  Career
                </div>
                <div className="text-sm font-semibold text-warm-black dark:text-soft-cream">
                  Offer accepted — Senior Developer
                </div>
              </div>
            </div>

            {/* Connector */}
            <div className="flex items-center justify-center py-4 bg-black/[0.01] dark:bg-white/[0.01]">
              <div className="flex items-center gap-2 text-gray-medium dark:text-gray-light text-xs">
                <GitMerge size={13} aria-hidden="true" />
                <span>automatically updates</span>
              </div>
            </div>

            {/* Finance impact */}
            <div className="flex items-center gap-4 p-5 border-t border-black/5 dark:border-white/5">
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <CurrencyCircleDollar size={18} />
              </div>
              <div>
                <div className="text-[10px] text-gray-medium dark:text-gray-light font-medium uppercase tracking-wider">
                  Finance
                </div>
                <div className="text-sm font-semibold text-warm-black dark:text-soft-cream">
                  Annual projection updated +Rp 288jt
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* — Evidence-based insight — */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
        {/* Insight cards */}
        <div className="space-y-4 order-2 md:order-1">
          <InsightCard
            icon={<CurrencyCircleDollar size={16} />}
            title="Inactive subscriptions"
            body="3 subscriptions totaling Rp 630.000/month have had no activity. Canceling them moves your savings goal 6 weeks earlier."
            action="Review subscriptions"
          />
          <InsightCard
            icon={<Heartbeat size={16} />}
            title="Energy and output"
            body="On days you complete a morning workout, you complete 40% more career pipeline tasks by end of day."
            action="View habit data"
          />
        </div>

        {/* Copy */}
        <div className="space-y-5 order-1 md:order-2">
          <div className="text-[11px] font-bold uppercase tracking-widest text-gray-medium dark:text-gray-light">
            Contextual Insight
          </div>
          <h2 className="font-brand text-4xl md:text-5xl text-warm-black dark:text-soft-cream leading-tight">
            Notice what<br />matters.
          </h2>
          <p className="text-base text-gray-medium dark:text-gray-light leading-relaxed max-w-sm">
            Not generic advice. Observations drawn from your actual data — spending, habits, career events —
            surfaced at the right moment.
          </p>
        </div>
      </div>

    </div>
  );
}

function InsightCard({
  icon,
  title,
  body,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  action: string;
}) {
  return (
    <div className="bg-white dark:bg-white/[0.03] border border-black/8 dark:border-white/8 rounded-2xl p-5 space-y-2.5">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-center text-gray-medium dark:text-gray-light shrink-0">
          {icon}
        </div>
        <span className="text-sm font-semibold text-warm-black dark:text-soft-cream">{title}</span>
      </div>
      <p className="text-sm text-gray-medium dark:text-gray-light leading-relaxed">{body}</p>
      <button className="flex items-center gap-1.5 text-xs font-medium text-warm-black dark:text-soft-cream opacity-60 hover:opacity-100 transition-opacity">
        {action}
        <ArrowRight size={12} aria-hidden="true" />
      </button>
    </div>
  );
}
