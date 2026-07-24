'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useTranslation } from '@/libs/i18n/useTranslation';

import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { ChartPieSlice as PieChart, Heartbeat, CheckSquare, Table, TrendUp as TrendingUp, Target, ArrowUpRight, Command, ShieldCheck, GithubLogo, Lightning as Zap, CurrencyCircleDollar, Briefcase, Bell, CaretDown as ChevronDown, CaretUp as ChevronUp, Lock } from '@phosphor-icons/react';

const SPLASH_STORAGE_KEY = 'trason_home_splash_seen';

// ─── Inline FAQ (accordion) ───────────────────────────────────────────────────
const FAQS = [
  {
    q: 'Is my data safe and private?',
    a: 'Yes. TRASON is built with privacy as the core foundation. Your personal data belongs to you — we do not sell your data, run ads, or use tracking algorithms. Everything is stored securely and only accessible by you.',
  },
  {
    q: 'Is TRASON free to use?',
    a: 'The core Personal OS is free forever. We plan to introduce optional Pro features for power users in the future, but all essential modules — finance, habits, career, and reminders — will always remain free.',
  },
  {
    q: 'How is TRASON different from Notion or a spreadsheet?',
    a: 'Notion and Excel are blank canvases. You spend hours building systems that eventually break. TRASON provides pre-built, opinionated workflows designed specifically for personal finance, habits, and career tracking — all interconnected out of the box. No setup required.',
  },
  {
    q: 'Can I use TRASON on my phone?',
    a: 'Yes! TRASON is a fully responsive Progressive Web App (PWA). You can install it on your home screen and use it like a native app on iOS and Android, even without an internet connection.',
  },
  {
    q: 'Is TRASON suitable for students and fresh graduates?',
    a: 'Absolutely. TRASON was designed with students, fresh graduates, and young professionals in mind. Whether you are managing your first salary, tracking job applications, or building your first financial habits — TRASON meets you where you are.',
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-white/5 rounded-xl bg-black/20 overflow-hidden">
      <button
        className="w-full text-left px-6 py-5 flex justify-between items-center font-bold text-gray-light hover:text-white transition-colors gap-4"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span>{q}</span>
        {open ? (
          <ChevronUp size={20} className="text-warm-gold shrink-0" />
        ) : (
          <ChevronDown size={20} className="text-gray-light shrink-0" />
        )}
      </button>
      {open && (
        <div className="px-6 pb-5 text-gray-light/80 leading-relaxed text-sm">
          {a}
        </div>
      )}
    </div>
  );
}

// ─── Feature cards data ───────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: CurrencyCircleDollar,
    label: 'Financial Control',
    headline: 'Know exactly where every rupiah goes.',
    body: 'Track income, expenses, and net worth across all accounts. See your burn rate, runway, and saving rate in one dashboard.',
    href: '/features/financial-control',
    color: 'text-yellow-400',
    border: 'group-hover:border-yellow-400/40',
    bg: 'group-hover:bg-yellow-400/5',
  },
  {
    icon: Heartbeat,
    label: 'Vitality & Habits',
    headline: 'Build routines that actually stick.',
    body: 'GitHub-style heatmaps for your habits. Flexible schedules, streak tracking, and guilt-free recovery when life happens.',
    href: '/features/vitality-habits',
    color: 'text-rose-400',
    border: 'group-hover:border-rose-400/40',
    bg: 'group-hover:bg-rose-400/5',
  },
  {
    icon: Briefcase,
    label: 'Career Architect',
    headline: 'Manage your professional growth like a CEO.',
    body: 'Track job applications, interviews, offers, and skills in a unified career pipeline. Never miss a follow-up again.',
    href: '/features/career-architect',
    color: 'text-blue-400',
    border: 'group-hover:border-blue-400/40',
    bg: 'group-hover:bg-blue-400/5',
  },
  {
    icon: Bell,
    label: 'Signal Reminders',
    headline: 'Only the reminders that actually matter.',
    body: 'Context-aware notifications that respect your focus hours. Separate signals from noise so you stay in flow.',
    href: '/features/signal-reminders',
    color: 'text-emerald-400',
    border: 'group-hover:border-emerald-400/40',
    bg: 'group-hover:bg-emerald-400/5',
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Home() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);

  const [showSplash, setShowSplash] = useState(true);
  const [motionStep, setMotionStep] = useState(0);
  const [mounted, setMounted] = useState(false);

  const { t } = useTranslation();

  const motionTexts = React.useMemo(
    () => [
      t('dashboard.splash.line1'),
      t('dashboard.splash.line2'),
      t('dashboard.splash.line3'),
      t('dashboard.splash.line4'),
    ],
    [t]
  );

  useEffect(() => {
    setMounted(true);
    if (typeof window === 'undefined') return;
    const hasSeenSplash = window.localStorage.getItem(SPLASH_STORAGE_KEY);
    if (hasSeenSplash) {
      setShowSplash(false);
    }
  }, []);

  useEffect(() => {
    if (!showSplash) return;
    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < motionTexts.length - 1) {
        currentStep += 1;
        setMotionStep(currentStep);
      } else {
        clearInterval(interval);
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(SPLASH_STORAGE_KEY, 'true');
        }
        setShowSplash(false);
      }
    }, 800);
    return () => clearInterval(interval);
  }, [motionTexts.length, showSplash]);

  useEffect(() => {
    if (isAuthenticated && !isLoading && !showSplash) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, showSplash, router]);

  // ── Splash ───────────────────────────────────────────────────────────────
  if (showSplash) {
    return (
      <div className="fixed inset-0 z-[100] bg-warm-black flex flex-col items-center justify-center font-sans overflow-hidden">
        <div className="hidden md:block absolute top-1/4 left-1/4 w-64 h-64 border border-warm-gold/10 rounded-full animate-[spin_10s_linear_infinite]" />
        <div className="hidden md:block absolute bottom-1/4 right-1/4 w-96 h-96 border border-warm-gold/5 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
        <div className="text-center space-y-md z-10 px-lg max-w-2xl">
          <h2
            key={motionStep}
            className="text-2xl md:text-4xl font-serif text-warm-gold animate-fade-in italic"
          >
            {mounted ? motionTexts[motionStep] : motionTexts[0]}
          </h2>
        </div>
      </div>
    );
  }

  if (isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-warm-black text-soft-cream font-sans selection:bg-warm-gold/30 selection:text-soft-cream relative overflow-x-hidden">
      {/* Ambient background */}
      <div
        className="fixed top-[-20%] right-[-10%] w-[800px] h-[800px] bg-warm-gold/5 blur-3xl md:blur-[160px] rounded-full pointer-events-none"
        style={{ transform: 'translateZ(0)', contain: 'strict' }}
      />
      <div
        className="fixed bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-deep-sage/5 blur-3xl md:blur-[140px] rounded-full pointer-events-none"
        style={{ transform: 'translateZ(0)', contain: 'strict' }}
      />

      <LandingNavbar />

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <header className="relative pt-40 pb-20 md:pt-56 md:pb-32 px-lg">
        <div className="max-w-4xl mx-auto text-center space-y-xl relative z-10">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-md py-xs rounded-full border border-warm-gold/20 bg-warm-gold/5 text-warm-gold text-xs font-bold uppercase tracking-widest mb-md animate-fade-in">
            <Command size={14} /> The Personal Operating System
          </div>

          {/* H1 — clearer value proposition */}
          <h1 className="text-5xl md:text-7xl lg:text-[6rem] font-serif leading-[1.1] md:leading-[1] tracking-tighter">
            Your Finances, Habits{' '}
            <br className="hidden md:block" />
            <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-warm-gold via-soft-cream to-warm-gold bg-[length:200%_auto] animate-shimmer">
              & Career. One Place.
            </span>
          </h1>

          {/* Sub-headline — concrete, not poetic */}
          <p className="text-lg md:text-2xl text-gray-light/80 max-w-2xl mx-auto leading-relaxed font-light animate-slide-up [animation-delay:0.2s]">
            Stop switching between 5 apps. TRASON unifies your money, routines,
            reminders, and career growth into one calm dashboard — for free.
          </p>

          {/* CTA group */}
          <div className="flex flex-col sm:flex-row gap-md justify-center pt-xl animate-slide-up [animation-delay:0.3s]">
            <Link href="/signup">
              <button
                id="hero-cta-primary"
                className="w-full sm:w-auto bg-soft-cream text-warm-black px-3xl py-4 rounded-xl font-bold flex items-center justify-center gap-sm group hover:bg-warm-gold transition-all shadow-[0_0_30px_rgba(244,201,93,0.15)] text-lg"
              >
                Start for Free
                <ArrowUpRight
                  size={22}
                  className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
                />
              </button>
            </Link>
            <Link href="/preview">
              <button
                id="hero-cta-secondary"
                className="w-full sm:w-auto bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.1] dark:border-white/[0.1] hover:bg-black/[0.08] text-soft-cream px-3xl py-4 rounded-xl font-medium transition-all backdrop-blur-sm text-lg flex items-center justify-center gap-sm"
              >
                See Live Demo
              </button>
            </Link>
          </div>

          {/* Risk reducer micro-copy */}
          <p className="text-xs text-gray-light/40 uppercase tracking-[0.18em] font-medium animate-slide-up [animation-delay:0.4s]">
            No credit card required &nbsp;·&nbsp; Free forever &nbsp;·&nbsp; No setup needed
          </p>
        </div>
      </header>

      {/* ── TRUST BAR ────────────────────────────────────────────────────── */}
      <section aria-label="Trust signals" className="py-8 px-lg border-y border-white/[0.04] bg-black/10 relative z-10">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-gray-light/50 text-xs font-bold uppercase tracking-widest">
          <span className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-emerald-400" />
            Privacy First
          </span>
          <span className="flex items-center gap-2">
            <Lock size={14} className="text-blue-400" />
            Your Data, Your Control
          </span>
          <span className="flex items-center gap-2">
            <Zap size={14} className="text-warm-gold" />
            Free Core, Always
          </span>
          <a
            href="https://github.com/Rizkek/TRASON"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-warm-gold transition-colors"
            aria-label="View TRASON on GitHub"
          >
            <GithubLogo size={14} />
            Open Source
          </a>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            PWA — Works Offline
          </span>
        </div>
      </section>

      {/* ── PROBLEM ───────────────────────────────────────────────────────── */}
      <section className="py-16 md:py-32 px-md md:px-lg relative z-10">
        <div className="max-w-5xl mx-auto text-center space-y-2xl">
          <div className="space-y-sm">
            <h2 className="text-3xl md:text-5xl font-serif text-gray-light">
              Right now, your life is scattered.
            </h2>
            <p className="text-gray-light/60 text-lg max-w-2xl mx-auto">
              You budget in a spreadsheet, track habits in a separate app, log workouts elsewhere, 
              and hope everything stays in sync. It never does.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-lg md:gap-2xl opacity-80 transition-all duration-700">
            {[
              { name: 'Finance Tracker', icon: PieChart, colorClass: 'group-hover:text-amber-400 group-hover:border-amber-400/50 group-hover:bg-amber-400/10' },
              { name: 'Habit App', icon: Heartbeat, colorClass: 'group-hover:text-rose-400 group-hover:border-rose-400/50 group-hover:bg-rose-400/10' },
              { name: 'To-Do List', icon: CheckSquare, colorClass: 'group-hover:text-blue-400 group-hover:border-blue-400/50 group-hover:bg-blue-400/10' },
              { name: 'Spreadsheets', icon: Table, colorClass: 'group-hover:text-emerald-400 group-hover:border-emerald-400/50 group-hover:bg-emerald-400/10' },
            ].map((app, i) => {
              const Icon = app.icon;
              return (
                <div key={i} className="flex flex-col items-center gap-sm group cursor-default">
                  <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-center shadow-xl transform -rotate-3 group-hover:rotate-0 transition-all duration-300 text-white/20 ${app.colorClass}`}>
                    <Icon size={32} strokeWidth={1.5} />
                  </div>
                  <span className="text-xs text-gray-light/40 font-bold uppercase tracking-wider group-hover:text-gray-light/80 transition-colors">{app.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── SOLUTION + DASHBOARD PREVIEW ─────────────────────────────────── */}
      <section className="py-16 md:py-32 px-md md:px-lg relative z-10 bg-gradient-to-b from-transparent via-warm-gold/[0.02] to-transparent border-y border-white/[0.02]">
        <div className="max-w-5xl mx-auto text-center space-y-xl">
          <h2 className="text-4xl md:text-6xl font-serif text-warm-gold">
            TRASON brings everything{' '}
            <br />
            into focus.
          </h2>
          <p className="text-xl text-gray-light/80 font-light max-w-2xl mx-auto">
            One login. One dashboard. All the clarity you need to make better decisions about
            your money, energy, and career — every single day.
          </p>
        </div>

        {/* Dashboard mockup */}
        <div className="mt-2xl max-w-6xl mx-auto relative group perspective-1000">
          <div className="absolute inset-0 bg-warm-gold/10 blur-2xl md:blur-[100px] rounded-[3rem] group-hover:bg-warm-gold/20 transition-all duration-700" />
          <div className="relative w-full bg-gray-strong/90 backdrop-blur-xl md:backdrop-blur-3xl rounded-[2rem] border border-white/10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.9)] overflow-hidden transform rotate-x-12 group-hover:rotate-x-0 transition-transform duration-1000">
            {/* Top bar */}
            <div className="h-12 border-b border-white/5 flex items-center px-lg gap-sm bg-black/40">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/50" />
              </div>
              <div className="mx-auto text-[10px] uppercase tracking-widest text-gray-light/40 font-bold flex items-center gap-2">
                <Command size={12} /> TRASON COMMAND CENTER
              </div>
            </div>
            {/* Dashboard content */}
            <div className="p-xl grid grid-cols-1 md:grid-cols-3 gap-xl">
              <div className="col-span-2 space-y-xl">
                <div className="space-y-sm">
                  <h3 className="text-3xl font-serif text-white flex gap-2 items-baseline">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-warm-gold to-soft-cream">Good Evening</span>, User
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-gray-light/60">
                    <span>Friday, October 24</span>
                    <div className="w-1 h-1 rounded-full bg-gray-light/40" />
                    <span>18:30 PM</span>
                  </div>
                </div>

                {/* Chart mockup */}
                <div className="h-48 rounded-2xl bg-black/30 border border-white/5 p-lg flex flex-col justify-between relative overflow-hidden">
                  <div className="flex justify-between items-start z-10 relative">
                    <div>
                      <p className="text-xs text-gray-light/60 font-bold uppercase tracking-widest">Financial Flow</p>
                      <h4 className="text-2xl font-serif text-white mt-1">$4,250.00</h4>
                    </div>
                    <div className="flex gap-2">
                      <span className="px-2 py-1 rounded bg-green-500/10 text-green-400 text-xs flex items-center gap-1">
                        <TrendingUp size={12} /> +12%
                      </span>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-24 flex items-end px-lg gap-2 opacity-80">
                    {[40, 60, 45, 80, 55, 90, 75, 100, 65, 85, 50, 70].map((h, i) => (
                      <div key={i} className="flex-1 bg-gradient-to-t from-warm-gold/40 to-warm-gold/80 rounded-t-sm transition-all duration-1000 hover:opacity-100" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Right sidebar mockup */}
              <div className="space-y-xl">
                <div className="aspect-video md:aspect-square rounded-2xl bg-gradient-to-br from-black/40 to-black/80 border border-white/5 flex flex-col items-center justify-center gap-md relative overflow-hidden">
                  <div className="absolute inset-0 bg-warm-gold/5" />
                  <Target className="text-warm-gold/30 absolute top-4 right-4" size={24} />
                  <div className="text-xs text-gray-light/60 font-bold uppercase tracking-widest relative z-10">Life Score</div>
                  <div className="text-7xl font-serif text-warm-gold drop-shadow-[0_0_15px_rgba(244,201,93,0.3)] relative z-10">86</div>
                </div>

                <div className="rounded-2xl bg-gradient-to-br from-gray-strong to-black border border-white/5 p-lg space-y-md relative overflow-hidden">
                  <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-amber-500/10 blur-xl md:blur-3xl rounded-full" />
                  <div className="flex items-center gap-3 relative z-10">
                    <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                      <Heartbeat size={16} />
                    </div>
                    <h4 className="font-serif italic text-md text-white">Daily Insight</h4>
                  </div>
                  <p className="text-sm text-gray-light/80 italic leading-relaxed relative z-10">
                    &ldquo;Your financial outflow is stable, but vitality logs are missing. Log a quick session to balance your day.&rdquo;
                  </p>
                  <div className="flex gap-2 relative z-10 pt-2">
                    <span className="px-2 py-1 bg-yellow-500/10 text-yellow-500 text-[10px] uppercase font-bold rounded">Moderate Confidence</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURE CARDS ─────────────────────────────────────────────────── */}
      <section className="py-16 md:py-32 px-md md:px-lg relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 space-y-sm">
            <h2 className="text-3xl md:text-5xl font-serif">
              Everything you need. Nothing you don&apos;t.
            </h2>
            <p className="text-gray-light/60 text-lg max-w-xl mx-auto">
              Four core modules, fully integrated, all free to start.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <Link key={f.label} href={f.href} className="group">
                  <article className={`h-full bg-black/20 border border-white/5 rounded-2xl p-8 transition-all duration-300 cursor-pointer ${f.border} ${f.bg}`}>
                    <div className={`w-11 h-11 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center mb-5 ${f.color} transition-colors`}>
                      <Icon size={22} />
                    </div>
                    <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${f.color}`}>{f.label}</p>
                    <h3 className="text-xl font-serif text-white mb-3 group-hover:text-soft-cream transition-colors">
                      {f.headline}
                    </h3>
                    <p className="text-sm text-gray-light/70 leading-relaxed">{f.body}</p>
                    <span className={`mt-5 inline-flex items-center gap-1 text-xs font-bold ${f.color} opacity-0 group-hover:opacity-100 transition-opacity`}>
                      Explore <ArrowUpRight size={12} />
                    </span>
                  </article>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF / FOUNDER NOTE ───────────────────────────────────── */}
      <section className="py-16 md:py-24 px-md md:px-lg relative z-10 bg-gradient-to-b from-transparent via-black/20 to-transparent">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <blockquote className="text-2xl md:text-3xl font-serif italic text-gray-light/90 leading-relaxed">
            &ldquo;I built TRASON because I was tired of maintaining 6 different apps just to understand my own life.
            I wanted one calm place where everything made sense.&rdquo;
          </blockquote>
          <div className="flex items-center justify-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-warm-gold to-yellow-600 flex items-center justify-center shrink-0">
              <span className="text-black font-serif font-bold text-xl">T</span>
            </div>
            <div className="text-left">
              <p className="font-bold text-soft-cream">The TRASON Team</p>
              <p className="text-sm text-gray-light/50">Built in Klaten, Indonesia &nbsp;·&nbsp; 2026</p>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <span className="px-4 py-2 rounded-full border border-emerald-400/20 bg-emerald-400/5 text-emerald-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live & Actively Developed
            </span>
            <span className="px-4 py-2 rounded-full border border-warm-gold/20 bg-warm-gold/5 text-warm-gold text-xs font-bold uppercase tracking-wider">
              Open Beta — Join Free
            </span>
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <section className="py-16 md:py-32 px-md md:px-lg relative z-10">
        <div className="max-w-3xl mx-auto space-y-xl">
          <div className="text-center space-y-sm">
            <h2 className="text-3xl md:text-5xl font-serif">Common Questions</h2>
            <p className="text-gray-light/60">Everything you need to know before you start.</p>
          </div>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <FaqItem key={i} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────────────────── */}
      <section className="py-24 md:py-40 px-md md:px-lg text-center space-y-lg md:space-y-xl relative z-10">
        <h2 className="text-4xl md:text-7xl font-serif italic tracking-tight leading-[1.2] md:leading-[1]">
          Take back control <br className="hidden md:block" /> of your life.
        </h2>
        <div className="max-w-sm mx-auto space-y-lg pt-lg">
          <Link href="/signup">
            <button
              id="footer-cta"
              className="w-full bg-soft-cream text-warm-black px-3xl py-5 rounded-2xl font-bold text-xl shadow-[0_0_40px_rgba(244,201,93,0.15)] hover:shadow-[0_0_60px_rgba(244,201,93,0.25)] hover:scale-105 active:scale-95 transition-all group overflow-hidden relative"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Build My Dashboard Free{' '}
                <ArrowUpRight size={24} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </span>
            </button>
          </Link>
          <p className="text-xs text-gray-light/40 uppercase tracking-[0.2em] font-medium">
            No credit card &nbsp;·&nbsp; No setup &nbsp;·&nbsp; Free forever
          </p>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
