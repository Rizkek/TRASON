import React from 'react';
import { ChartLineUp, TextAa } from '@phosphor-icons/react/dist/ssr';
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
      <div className="flex items-center gap-3 rounded-xl border border-foreground/10 bg-surface/60 px-4 py-3">
        <TextAa size={16} className="shrink-0 text-muted-foreground" />
        <p className="flex-1 truncate text-body-sm text-foreground">Spent 45k on lunch at Warteg Bu Sri</p>
        <span className="rounded-md bg-foreground px-2.5 py-1 text-xs font-medium text-background">Capture</span>
      </div>
      <UiCard className="p-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <UiTag tone="accent">Expense</UiTag>
          <UiMoney value="Rp 45.000" />
          <span className="text-muted-foreground">·</span>
          <span className="text-foreground">Food &amp; Drink</span>
          <span className="text-muted-foreground">·</span>
          <span className="text-foreground">Today</span>
          <span className="ml-auto text-xs text-muted-foreground">Edit before saving</span>
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
        <span className="flex items-center gap-1.5 rounded-md border border-foreground/10 px-2.5 py-1 text-xs text-foreground">
          <ChartLineUp size={11} className="text-primary" />
          Generate insights
        </span>
      </div>
      <UiCard>
        <div className="flex items-center justify-between">
          <p className="text-body-sm font-medium text-foreground">Summary</p>
          <span className="text-xs text-muted-foreground">Thu, 18 Sep</span>
        </div>
        <p className="mt-2 text-body-sm leading-relaxed text-foreground/85">
          Expenses this week sit about 18% above your four-week average, mostly Transport. Training is steady at three
          sessions, the same as last week. Two applications moved to Interview; the Tokopedia round is on Friday.
        </p>
        <p className="mt-3 text-xs text-muted-foreground">Written from your Finance, Sport and Career records.</p>
      </UiCard>
    </div>
  );
}
