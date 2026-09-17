import React from 'react';
import { Sparkle, TextAa } from '@phosphor-icons/react/dist/ssr';
import { UiCard, UiLabel, UiMoney, UiTag } from './bits';

/**
 * Two real moments where TRASON turns input into structure:
 * 1. Smart Input — a typed sentence becomes a transaction or reminder.
 * 2. Insights — an on-demand written summary of what you have logged.
 */
export function SmartInputUI() {
  return (
    <div className="space-y-3 p-4 text-left sm:p-5">
      <UiLabel>Smart Input</UiLabel>
      <div className="flex items-center gap-3 rounded-xl border border-ui-border/10 bg-ui-surface/60 px-4 py-3">
        <TextAa size={16} className="shrink-0 text-ui-muted" />
        <p className="flex-1 truncate text-[13px] text-ui-fg">Spent 45k on lunch at Warteg Bu Sri</p>
        <span className="rounded-md bg-ui-fg px-2.5 py-1 text-[11px] font-medium text-ui-bg">Capture</span>
      </div>
      <UiCard className="p-3">
        <div className="flex flex-wrap items-center gap-2 text-[12px]">
          <UiTag tone="accent">Expense</UiTag>
          <UiMoney value="Rp 45.000" />
          <span className="text-ui-muted">·</span>
          <span className="text-ui-fg">Food &amp; Drink</span>
          <span className="text-ui-muted">·</span>
          <span className="text-ui-fg">Today</span>
          <span className="ml-auto text-[11px] text-ui-muted">Edit before saving</span>
        </div>
      </UiCard>
    </div>
  );
}

export function InsightsUI() {
  return (
    <div className="space-y-3 p-4 text-left sm:p-5">
      <div className="flex items-center justify-between">
        <UiLabel>Insights</UiLabel>
        <span className="flex items-center gap-1.5 rounded-md border border-ui-border/10 px-2.5 py-1 text-[11px] text-ui-fg">
          <Sparkle size={11} className="text-ui-accent" />
          Generate insights
        </span>
      </div>
      <UiCard>
        <div className="flex items-center justify-between">
          <p className="text-[13px] font-medium text-ui-fg">Summary</p>
          <span className="text-[11px] text-ui-muted">Thu, 18 Sep</span>
        </div>
        <p className="mt-2 text-[13px] leading-relaxed text-ui-fg/85">
          Expenses this week sit about 18% above your four-week average, mostly Transport. Vitality is steady at three
          sessions, the same as last week. Two applications moved to Interview; the Tokopedia round is on Friday.
        </p>
        <p className="mt-3 text-[11px] text-ui-muted">Written from your Finance, Vitality and Career records.</p>
      </UiCard>
    </div>
  );
}
