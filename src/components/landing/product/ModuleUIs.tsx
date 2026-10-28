import React from 'react';
import { Camera, Timer, Trophy } from '@phosphor-icons/react/dist/ssr';
import { UiBar, UiCard, UiCheck, UiLabel, UiMoney, UiPageHeader, UiSidebar, UiTag, WEEK } from './bits';

/* ─── Finance ─────────────────────────────────────────────────────────────── */

const TRANSACTIONS = [
  { name: 'Indomaret', cat: 'Groceries', date: '17 Sep', amount: '−Rp 128.500', income: false },
  { name: 'Gojek', cat: 'Transport', date: '17 Sep', amount: '−Rp 24.000', income: false },
  { name: 'Salary — PT Nusantara', cat: 'Income', date: '15 Sep', amount: '+Rp 9.500.000', income: true },
  { name: 'Netflix', cat: 'Subscription', date: '14 Sep', amount: '−Rp 186.000', income: false },
];

export function FinanceUI() {
  return (
    <div className="flex min-h-[420px] text-left">
      <UiSidebar active="Finance" />
      <div className="flex-1 space-y-4 p-4 sm:p-6">
        <UiPageHeader title="Finance" meta="September 2026" />

        <div className="grid grid-cols-3 gap-3">
          <UiCard>
            <UiLabel>Income</UiLabel>
            <p className="mt-1.5 text-sm sm:text-base">
              <UiMoney value="Rp 9.500.000" tone="positive" />
            </p>
          </UiCard>
          <UiCard>
            <UiLabel>Expenses</UiLabel>
            <p className="mt-1.5 text-sm sm:text-base">
              <UiMoney value="Rp 5.250.000" />
            </p>
          </UiCard>
          <UiCard>
            <UiLabel>Net balance</UiLabel>
            <p className="mt-1.5 text-sm sm:text-base">
              <UiMoney value="Rp 4.250.000" tone="accent" />
            </p>
          </UiCard>
        </div>

        <div className="grid gap-4 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <div className="mb-2 flex gap-4 border-b border-foreground/[0.06] text-xs">
              {['Transactions', 'Installments', 'Subscriptions'].map((tab, i) => (
                <span
                  key={tab}
                  className={`-mb-px border-b-2 pb-2 ${
                    i === 0 ? 'border-primary font-medium text-foreground' : 'border-transparent text-muted-foreground'
                  }`}
                >
                  {tab}
                </span>
              ))}
            </div>
            <ul className="divide-y divide-foreground/[0.06]">
              {TRANSACTIONS.map((t) => (
                <li key={t.name} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-body-sm text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.cat} · {t.date}
                    </p>
                  </div>
                  <span className="text-body-sm">
                    <UiMoney value={t.amount} tone={t.income ? 'positive' : 'default'} />
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3 lg:col-span-2">
            <UiCard>
              <div className="flex items-center justify-between">
                <UiLabel>Monthly budget</UiLabel>
                <span className="font-mono text-xs text-muted-foreground">62%</span>
              </div>
              <p className="mt-1.5 text-body-sm">
                <UiMoney value="Rp 3.720.000" /> <span className="text-muted-foreground">of Rp 6.000.000</span>
              </p>
              <div className="mt-2.5">
                <UiBar value={62} tone="accent" />
              </div>
            </UiCard>
            <UiCard>
              <UiLabel className="mb-2">Upcoming bills</UiLabel>
              <ul className="space-y-1.5 text-xs">
                <li className="flex justify-between">
                  <span className="text-foreground">Spotify · 20 Sep</span>
                  <UiMoney value="Rp 54.990" />
                </li>
                <li className="flex justify-between">
                  <span className="text-foreground">Kost · 1 Oct</span>
                  <UiMoney value="Rp 1.500.000" />
                </li>
              </ul>
            </UiCard>
            <UiCard accent>
              <div className="flex items-center gap-2.5">
                <Camera size={14} className="text-primary" />
                <p className="text-xs text-foreground/90">
                  Receipt scanned · <span className="text-primary">3 items to review</span>
                </p>
              </div>
            </UiCard>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Career ──────────────────────────────────────────────────────────────── */

const PIPELINE = [
  {
    stage: 'Applied',
    count: 8,
    items: [
      { role: 'Product Designer', company: 'Traveloka' },
      { role: 'UX Researcher', company: 'Gojek' },
    ],
  },
  {
    stage: 'Reviewing',
    count: 3,
    items: [{ role: 'Product Designer', company: 'Bukalapak' }],
  },
  {
    stage: 'Interview',
    count: 2,
    items: [{ role: 'Senior Designer', company: 'Tokopedia', note: 'Round 2 · Fri 10:00' }],
  },
  { stage: 'Offer', count: 1, items: [{ role: 'Design Lead', company: 'Kredivo' }] },
];

export function CareerUI() {
  return (
    <div className="flex min-h-[420px] text-left">
      <UiSidebar active="Career" />
      <div className="flex-1 space-y-4 p-4 sm:p-6">
        <UiPageHeader title="Career" meta="14 applications · Interview rate 25%" />

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {PIPELINE.map((col, i) => (
            <div key={col.stage} className="min-w-0 space-y-2">
              <div className="flex items-center justify-between px-1">
                <UiLabel className={i === 3 ? 'text-success' : i === 2 ? 'text-info' : ''}>{col.stage}</UiLabel>
                <span className="font-mono text-xs text-muted-foreground">{col.count}</span>
              </div>
              {col.items.map((item) => (
                <UiCard key={item.role + item.company} className="p-3">
                  <p className="truncate text-body-sm text-foreground">{item.role}</p>
                  <p className="truncate text-xs text-muted-foreground">{item.company}</p>
                  {'note' in item && item.note && (
                    <div className="mt-2">
                      <UiTag tone="info">{item.note}</UiTag>
                    </div>
                  )}
                </UiCard>
              ))}
            </div>
          ))}
        </div>

        <UiCard>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <UiLabel>Resume match</UiLabel>
              <p className="mt-1 text-body-sm text-foreground">Senior Designer — Tokopedia</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-2xl font-semibold text-foreground">
                78<span className="text-xs text-muted-foreground">/100</span>
              </span>
              <UiTag tone="positive">High match</UiTag>
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Your CV aligns well with the requirements. Missing: design systems, Figma variables.
          </p>
        </UiCard>
      </div>
    </div>
  );
}

/* ─── Vitality ────────────────────────────────────────────────────────────── */

const SESSIONS = [
  { type: 'Run', duration: '35 min', intensity: 'Moderate', day: 'Thu' },
  { type: 'Strength', duration: '50 min', intensity: 'High', day: 'Wed' },
  { type: 'Cycling', duration: '45 min', intensity: 'Moderate', day: 'Mon' },
];

export function VitalityUI() {
  const active = [true, false, true, true, false, false, false];
  return (
    <div className="flex min-h-[420px] text-left">
      <UiSidebar active="Sport" />
      <div className="flex-1 space-y-4 p-4 sm:p-6">
        <UiPageHeader title="Sport" meta="This week" />

        <div className="grid grid-cols-3 gap-3">
          <UiCard>
            <UiLabel>Total sessions</UiLabel>
            <p className="mt-1.5 font-mono text-base text-foreground">3</p>
          </UiCard>
          <UiCard>
            <UiLabel>Total time</UiLabel>
            <p className="mt-1.5 font-mono text-base text-foreground">2h 10m</p>
          </UiCard>
          <UiCard>
            <UiLabel>Avg session</UiLabel>
            <p className="mt-1.5 font-mono text-base text-foreground">43 min</p>
          </UiCard>
        </div>

        <UiCard>
          <div className="flex items-center justify-between">
            <UiLabel>Consistency</UiLabel>
            <UiTag tone="positive">On track</UiTag>
          </div>
          <div className="mt-3 flex justify-between">
            {WEEK.map((d, i) => (
              <div key={`${d}-${i}`} className="flex flex-col items-center gap-1.5">
                <span
                  className={`h-8 w-8 rounded-full border ${
                    active[i] ? 'border-success bg-success/20' : 'border-foreground/10'
                  }`}
                />
                <span className="text-xs text-muted-foreground">{d}</span>
              </div>
            ))}
          </div>
        </UiCard>

        <div className="grid gap-4 lg:grid-cols-5">
          <UiCard className="lg:col-span-3">
            <UiLabel className="mb-2">Recent workouts</UiLabel>
            <ul className="divide-y divide-foreground/[0.06]">
              {SESSIONS.map((s) => (
                <li key={s.type} className="flex items-center gap-3 py-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-foreground/[0.06] text-muted-foreground">
                    <Timer size={13} />
                  </span>
                  <span className="flex-1 text-body-sm text-foreground">{s.type}</span>
                  <span className="font-mono text-xs text-muted-foreground">{s.duration}</span>
                  <UiTag tone={s.intensity === 'High' ? 'warning' : 'default'}>{s.intensity}</UiTag>
                </li>
              ))}
            </ul>
          </UiCard>
          <UiCard className="lg:col-span-2">
            <div className="flex items-center gap-2">
              <Trophy size={13} className="text-primary" />
              <UiLabel>Personal records</UiLabel>
            </div>
            <ul className="mt-2.5 space-y-2 text-xs">
              <li className="flex justify-between">
                <span className="text-foreground">Deadlift</span>
                <span className="font-mono text-primary">100 kg</span>
              </li>
              <li className="flex justify-between">
                <span className="text-foreground">5K run</span>
                <span className="font-mono text-primary">26:40</span>
              </li>
            </ul>
          </UiCard>
        </div>
      </div>
    </div>
  );
}

/* ─── Schedule ────────────────────────────────────────────────────────────── */

const DAYS = [
  { d: 'Mon', n: 14 },
  { d: 'Tue', n: 15 },
  { d: 'Wed', n: 16 },
  { d: 'Thu', n: 18, today: true },
  { d: 'Fri', n: 19 },
  { d: 'Sat', n: 20 },
  { d: 'Sun', n: 21 },
];

const ACTIVITIES = [
  { time: '06:30', title: 'Morning run', cat: 'Sport', dur: '35m', mood: 'Energized' },
  { time: '09:00', title: 'Deep work — portfolio case study', cat: 'Work', dur: '2h', mood: 'Focused' },
  { time: '12:30', title: 'Lunch with Dimas', cat: 'Social', dur: '1h', mood: 'Good' },
  { time: '19:00', title: 'Indonesian class', cat: 'Learning', dur: '1h', mood: '' },
];

const CHECKLIST = [
  { title: 'Review monthly budget', done: true },
  { title: 'Draft cover letter — Tokopedia', done: false },
  { title: 'Read 20 pages', done: false },
];

export function ScheduleUI() {
  return (
    <div className="flex min-h-[420px] text-left">
      <UiSidebar active="Schedule" />
      <div className="flex-1 space-y-4 p-4 sm:p-6">
        <UiPageHeader title="Schedule" meta="Week 38 · 14–21 September" />

        <div className="grid gap-4 lg:grid-cols-5">
          <div className="space-y-3 lg:col-span-3">
            <div className="flex items-center justify-between">
              <UiLabel>Weekly log</UiLabel>
              <span className="text-xs text-muted-foreground">Add activity</span>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {DAYS.map((day) => (
                <div
                  key={day.d}
                  className={`flex flex-col items-center rounded-lg py-1.5 ${
                    day.today ? 'bg-primary text-background' : 'text-muted-foreground'
                  }`}
                >
                  <span className="text-xs">{day.d}</span>
                  <span className={`font-mono text-body-sm ${day.today ? 'font-semibold' : 'text-foreground'}`}>{day.n}</span>
                </div>
              ))}
            </div>
            <ul className="space-y-2">
              {ACTIVITIES.map((a) => (
                <li key={a.title} className="flex items-center gap-3 rounded-lg border border-foreground/[0.06] bg-surface/40 px-3 py-2">
                  <span className="w-10 font-mono text-xs text-muted-foreground">{a.time}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-body-sm text-foreground">{a.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {a.cat} · {a.dur}
                    </p>
                  </div>
                  {a.mood && <UiTag>{a.mood}</UiTag>}
                </li>
              ))}
            </ul>
          </div>

          <UiCard className="lg:col-span-2">
            <div className="mb-3 flex items-center justify-between">
              <UiLabel>Tasks</UiLabel>
              <span className="text-xs text-muted-foreground">Today</span>
            </div>
            <ul className="space-y-2.5">
              {CHECKLIST.map((t) => (
                <li key={t.title} className="flex items-center gap-3">
                  <UiCheck done={t.done} />
                  <span className={`text-body-sm ${t.done ? 'text-muted-foreground line-through' : 'text-foreground'}`}>{t.title}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-muted-foreground">Completed tasks count toward Productivity in your Life Score.</p>
          </UiCard>
        </div>
      </div>
    </div>
  );
}
