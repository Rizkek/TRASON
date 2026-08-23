'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useAuthStore } from '@/store/authStore';
import { ArrowUpRight } from '@phosphor-icons/react';

import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { LivingHeroDashboard } from '@/components/landing/LivingHeroDashboard';
import { IntelligenceShowcase } from '@/components/landing/IntelligenceShowcase';

// Lazy load the heavy interactive module — it mounts after hero
const InteractiveSystem = dynamic(
  () => import('@/components/landing/InteractiveSystem').then((mod) => mod.InteractiveSystem),
  {
    ssr: false,
    loading: () => (
      <div
        className="h-[560px] w-full rounded-2xl bg-black/4 dark:bg-white/4 border border-black/6 dark:border-white/6 animate-pulse"
        aria-busy="true"
        aria-label="Loading product preview"
      />
    ),
  }
);

export default function Home() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isAuthenticated) return null;

  return (
    <div className="min-h-screen overflow-x-hidden selection:bg-warm-black/10 dark:selection:bg-soft-cream/10">
      <LandingNavbar />

      <main id="main-content" aria-label="TRASON landing page">

        {/* ── 01 HERO ──────────────────────────────────────────────────────── */}
        <header
          className="relative pt-32 pb-16 md:pt-48 md:pb-24 px-6 md:px-12"
          aria-labelledby="hero-heading"
        >
          {/* Hero background — restrained, no glowing orbs */}
          <div
            className="absolute inset-0 bg-[url('/hero-bg.jpg')] bg-cover bg-center bg-no-repeat opacity-[0.12] dark:opacity-[0.06] pointer-events-none"
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 bg-gradient-to-b from-soft-cream/60 via-soft-cream/80 to-soft-cream dark:from-warm-black/60 dark:via-warm-black/80 dark:to-warm-black pointer-events-none"
            aria-hidden="true"
          />

          <div className="max-w-6xl mx-auto text-center relative z-10">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-gray-medium dark:text-gray-light mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
              Personal Operating System
            </div>

            {/* Headline — editorial, no shimmer */}
            <h1
              id="hero-heading"
              className="font-brand text-5xl md:text-6xl lg:text-7xl text-warm-black dark:text-soft-cream leading-[1.05] tracking-tight"
            >
              Your life,<br className="hidden sm:block" /> in one clear system.
            </h1>

            {/* Subheadline — one sentence only */}
            <p className="mt-6 text-base md:text-lg text-gray-medium dark:text-gray-light max-w-md mx-auto">
              Finance. Career. Vitality. Goals. All connected, in one place.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
              <Link href="/signup">
                <button
                  id="hero-cta-primary"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-warm-black dark:bg-soft-cream text-soft-cream dark:text-warm-black h-14 px-8 rounded-xl font-semibold text-sm hover:opacity-80 transition-opacity"
                  aria-label="Create your free TRASON account"
                >
                  Get Started
                  <ArrowUpRight size={16} aria-hidden="true" />
                </button>
              </Link>
              <Link href="#system">
                <button
                  id="hero-cta-secondary"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-black/15 dark:border-white/15 text-warm-black dark:text-soft-cream h-14 px-8 rounded-xl font-semibold text-sm hover:bg-black/4 dark:hover:bg-white/4 transition-colors"
                >
                  Explore TRASON
                </button>
              </Link>
            </div>

            {/* Hero product illustration */}
            <LivingHeroDashboard />
          </div>
        </header>

        {/* ── 02 THE PROBLEM ───────────────────────────────────────────────── */}
        <section
          className="py-24 md:py-32 px-6 md:px-12"
          aria-labelledby="problem-heading"
        >
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-14">
              <h2
                id="problem-heading"
                className="font-brand text-4xl md:text-5xl text-warm-black dark:text-soft-cream leading-tight"
              >
                Your life is{' '}
                <em className="not-italic text-gray-medium dark:text-gray-light">fragmented.</em>
              </h2>
            </div>

            {/* Fragmentation visual — two column contrast */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-0 items-stretch">
              {/* Before */}
              <div className="md:border-r border-black/8 dark:border-white/8 md:pr-12 space-y-3 pb-8 md:pb-0">
                <div className="text-[10px] font-bold uppercase tracking-widest text-gray-medium dark:text-gray-light mb-5">
                  Before
                </div>
                {[
                  'Finance — one app',
                  'Tasks — another app',
                  'Career — a spreadsheet',
                  'Habits — scattered notes',
                  'Goals — forgotten',
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 text-sm text-gray-medium dark:text-gray-light"
                  >
                    <div className="w-px h-4 bg-black/15 dark:bg-white/15 shrink-0" aria-hidden="true" />
                    {item}
                  </div>
                ))}
              </div>

              {/* After */}
              <div className="md:pl-12 space-y-3">
                <div className="text-[10px] font-bold uppercase tracking-widest text-warm-black dark:text-soft-cream mb-5">
                  TRASON
                </div>
                {[
                  { label: 'Finance', desc: 'Net worth, transactions, savings' },
                  { label: 'Career', desc: 'Pipeline, applications, milestones' },
                  { label: 'Vitality', desc: 'Sleep, workouts, daily habits' },
                  { label: 'Schedule', desc: 'Deadlines, events, routines' },
                  { label: 'Goals', desc: 'Milestones and long-term context' },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-3 text-sm"
                  >
                    <div className="w-1 h-1 rounded-full bg-warm-black dark:bg-soft-cream shrink-0" aria-hidden="true" />
                    <span className="font-medium text-warm-black dark:text-soft-cream">{item.label}</span>
                    <span className="text-gray-medium dark:text-gray-light">— {item.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Resolution */}
            <div className="text-center mt-14">
              <p className="text-base text-gray-medium dark:text-gray-light">
                TRASON brings them all together.
              </p>
            </div>
          </div>
        </section>

        {/* ── 03 THE SYSTEM ────────────────────────────────────────────────── */}
        <section
          id="system"
          className="py-24 md:py-32 px-6 md:px-12 bg-black/[0.02] dark:bg-white/[0.02] border-y border-black/5 dark:border-white/5"
          aria-labelledby="system-heading"
        >
          <div className="max-w-6xl mx-auto space-y-10">
            <div className="text-center space-y-3">
              <h2
                id="system-heading"
                className="font-brand text-4xl md:text-5xl text-warm-black dark:text-soft-cream"
              >
                Explore the system.
              </h2>
              <p className="text-base text-gray-medium dark:text-gray-light max-w-md mx-auto">
                Each module is part of one coherent system. Not isolated apps — one OS.
              </p>
            </div>

            <InteractiveSystem />
          </div>
        </section>

        {/* ── 04 INTELLIGENCE ──────────────────────────────────────────────── */}
        <section
          className="py-24 md:py-32 px-6 md:px-12"
          aria-labelledby="intelligence-heading"
        >
          {/* Invisible heading for landmark accessibility */}
          <h2 id="intelligence-heading" className="sr-only">Intelligence and cross-module context</h2>
          <IntelligenceShowcase />
        </section>

        {/* ── 05 FINAL CTA ─────────────────────────────────────────────────── */}
        <section
          className="relative py-24 md:py-36 px-6 md:px-12 bg-warm-black dark:bg-soft-cream overflow-hidden"
          aria-labelledby="cta-heading"
        >
          {/* Subtle background texture — restrained */}
          <div
            className="absolute inset-0 bg-[url('/hero-bg.jpg')] bg-cover bg-center opacity-[0.08] pointer-events-none"
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 bg-gradient-to-b from-warm-black/80 to-warm-black dark:from-soft-cream/80 dark:to-soft-cream pointer-events-none"
            aria-hidden="true"
          />

          <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
            <h2
              id="cta-heading"
              className="font-brand text-5xl md:text-6xl lg:text-7xl text-soft-cream dark:text-warm-black leading-[1.05] tracking-tight"
            >
              Everything important.<br />In one place.
            </h2>
            <p className="text-base md:text-lg text-soft-cream/60 dark:text-warm-black/60 max-w-md mx-auto">
              Build a clearer picture of your money, time, work, and wellbeing.
            </p>

            <div className="pt-4">
              <Link href="/signup">
                <button
                  id="cta-final"
                  className="inline-flex items-center gap-2 bg-soft-cream dark:bg-warm-black text-warm-black dark:text-soft-cream h-14 px-10 rounded-xl font-semibold text-base hover:opacity-80 transition-opacity"
                  aria-label="Get started with TRASON for free"
                >
                  Get Started
                  <ArrowUpRight size={18} aria-hidden="true" />
                </button>
              </Link>
              <p className="text-xs text-soft-cream/40 dark:text-warm-black/40 mt-4">
                Free to use. No credit card required.
              </p>
            </div>
          </div>
        </section>

      </main>

      <LandingFooter />
    </div>
  );
}
