'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useAuthStore } from '@/store/authStore';
import { useTranslation } from '@/libs/i18n/useTranslation';

import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { 
  ArrowUpRight, Command, ShieldCheck, 
  CurrencyCircleDollar, Briefcase, Heartbeat, Target, CalendarBlank, Lock
} from '@phosphor-icons/react';

// Lazy load the heavy interactive preview component
const InteractivePreview = dynamic(
  () => import('@/components/landing/InteractivePreview').then((mod) => mod.InteractivePreview),
  { ssr: false, loading: () => <div className="h-[600px] w-full rounded-[2rem] bg-black/20 animate-pulse border border-white/5" /> }
);

const SPLASH_STORAGE_KEY = 'trason_home_splash_seen';

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
            className="text-2xl md:text-4xl font-display tracking-tight text-gradient animate-fade-in italic"
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

      {/* ── 1. HERO (WHAT) ────────────────────────────────────────────────── */}
      <header className="relative pt-40 pb-20 md:pt-56 md:pb-32 px-lg">
        <div className="max-w-4xl mx-auto text-center space-y-xl relative z-10">
          <div className="inline-flex items-center gap-2 px-md py-xs rounded-full border border-warm-gold/20 bg-warm-gold/5 text-warm-gold text-xs font-bold uppercase tracking-widest mb-md animate-fade-in">
            <Command size={14} /> Personal OS
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-[6.5rem] font-display font-extrabold leading-[1.1] md:leading-[1.05] tracking-tight text-gradient">
            Your life,
            <br className="hidden md:block" />
            in one system.
          </h1>

          <p className="text-lg md:text-2xl text-gray-light max-w-2xl mx-auto leading-relaxed font-sans font-normal animate-slide-up [animation-delay:0.2s]">
            TRASON brings your finances, career, habits, goals, and schedule into a single, beautifully designed workspace.
          </p>

          <div className="flex flex-col sm:flex-row gap-md justify-center pt-xl animate-slide-up [animation-delay:0.3s]">
            <Link href="/signup">
              <button
                className="w-full sm:w-auto bg-soft-cream text-warm-black px-3xl py-4 rounded-xl font-bold flex items-center justify-center gap-sm group hover:bg-warm-gold transition-all shadow-[0_0_30px_rgba(244,201,93,0.15)] text-lg"
              >
                Get Started
                <ArrowUpRight
                  size={22}
                  className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
                />
              </button>
            </Link>
            <a href="#preview">
              <button
                className="w-full sm:w-auto bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.1] dark:border-white/[0.1] hover:bg-black/[0.08] dark:hover:bg-white/[0.08] text-soft-cream px-3xl py-4 rounded-xl font-medium transition-all backdrop-blur-sm text-lg flex items-center justify-center gap-sm"
              >
                Explore TRASON
              </button>
            </a>
          </div>
        </div>
      </header>

      {/* ── 2. THE PROBLEM (WHY) ──────────────────────────────────────────── */}
      <section className="py-16 md:py-32 px-md md:px-lg relative z-10 border-t border-white/[0.02]">
        <div className="max-w-4xl mx-auto text-center space-y-lg">
          <h2 className="text-3xl md:text-5xl font-display tracking-tight text-soft-cream">
            Your life is <span className="text-warm-gold italic">fragmented</span>.
          </h2>
          <div className="text-gray-light/70 text-lg md:text-xl font-light leading-relaxed max-w-2xl mx-auto space-y-4">
            <p>Finance in one app.</p>
            <p>Tasks in another.</p>
            <p>Career in a spreadsheet.</p>
            <p>Habits scattered everywhere.</p>
          </div>
          <p className="text-xl md:text-2xl font-display text-white mt-8">
            TRASON brings them all together.
          </p>
        </div>
      </section>

      {/* ── 3. THE METHODOLOGY (HOW) ──────────────────────────────────────── */}
      <section className="py-16 md:py-32 px-md md:px-lg relative z-10 bg-black/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20 space-y-sm">
            <h2 className="text-3xl md:text-5xl font-display tracking-tight text-gradient">
              How TRASON works
            </h2>
            <p className="text-gray-light/60">A unified flow for everything you do.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { title: 'Capture', desc: 'Log transactions, tasks, goals, and job applications in seconds.' },
              { title: 'Organize', desc: 'TRASON automatically groups your activities based on context.' },
              { title: 'Track', desc: 'Visualize your progress over time with beautiful, automated charts.' },
              { title: 'Understand', desc: 'Get intelligent insights based on your actual data and habits.' }
            ].map((step, i) => (
              <div key={step.title} className="relative group">
                <div className="text-6xl font-display font-black text-white/5 absolute -top-8 -left-4 z-0 group-hover:text-warm-gold/10 transition-colors">
                  0{i + 1}
                </div>
                <div className="relative z-10 pt-4">
                  <h3 className="text-xl font-bold text-soft-cream mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-light/70">{step.desc}</p>
                </div>
                {i < 3 && (
                  <div className="hidden md:block absolute top-12 -right-6 text-white/10 group-hover:text-warm-gold/30 transition-colors">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. CORE MODULES (DIMENSIONS) ──────────────────────────────────── */}
      <section className="py-16 md:py-32 px-md md:px-lg relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-20 space-y-sm">
            <h2 className="text-3xl md:text-5xl font-display tracking-tight">
              One system. <br className="md:hidden" /><span className="text-gradient">Multiple dimensions.</span>
            </h2>
            <p className="text-gray-light/70 text-lg max-w-xl mx-auto">
              Everything you need to run your life, natively integrated.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12">
            {[
              { icon: CurrencyCircleDollar, title: 'FINANCE', desc: 'Understand exactly where your money goes. Track net worth and cash flow.' },
              { icon: Briefcase, title: 'CAREER', desc: 'Manage your professional pipeline, track applications, and measure your growth.' },
              { icon: Heartbeat, title: 'VITALITY', desc: 'Keep your daily habits moving. Log workouts, track sleep, build routines.' },
              { icon: Target, title: 'GOALS', desc: 'Turn vague intentions into measurable, trackable progress.' },
              { icon: CalendarBlank, title: 'SCHEDULE', desc: 'Know exactly what is coming next in your day without feeling overwhelmed.' }
            ].map((mod) => {
              const Icon = mod.icon;
              return (
                <div key={mod.title} className="grid grid-cols-[48px_1fr] gap-6 group items-start">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-warm-gold/10 group-hover:border-warm-gold/30 transition-all group-hover:scale-110 duration-300">
                    <Icon size={24} className="text-gray-light group-hover:text-warm-gold transition-colors" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-soft-cream group-hover:text-warm-gold transition-colors">{mod.title}</h3>
                    <p className="text-gray-light/80 leading-relaxed text-sm md:text-base">{mod.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 5. INTERACTIVE SHOWCASE (EVIDENCE) ────────────────────────────── */}
      <section id="preview" className="py-16 md:py-32 px-md md:px-lg relative z-10 bg-black/20 border-y border-white/[0.02]">
        <div className="max-w-6xl mx-auto space-y-xl">
          <div className="text-center space-y-sm">
            <h2 className="text-3xl md:text-5xl font-display tracking-tight text-soft-cream">
              See TRASON in action.
            </h2>
            <p className="text-gray-light/60">Click around. Experience the flow.</p>
          </div>
          
          <InteractivePreview />
          
        </div>
      </section>

      {/* ── 6. TRUST & PRIVACY ────────────────────────────────────────────── */}
      <section className="py-24 px-md md:px-lg relative z-10">
        <div className="max-w-3xl mx-auto text-center space-y-8 bg-white/5 border border-white/10 rounded-3xl p-12 backdrop-blur-sm">
          <ShieldCheck size={48} className="mx-auto text-emerald-400 opacity-80" />
          <h2 className="text-2xl md:text-4xl font-display tracking-tight">
            Privacy by design.
          </h2>
          <p className="text-gray-light/80 text-lg leading-relaxed max-w-xl mx-auto">
            Your life is personal. Your data should be too. TRASON is built so that you own your data. We don't sell it, we don't scan it for ads.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-xs font-bold uppercase tracking-widest text-gray-light/50">
            <span className="flex items-center gap-2"><Lock size={16} className="text-warm-gold" /> Secure</span>
          </div>
        </div>
      </section>

      {/* ── 7. FINAL CTA ──────────────────────────────────────────────────── */}
      <section className="py-24 md:py-40 px-md md:px-lg text-center space-y-lg md:space-y-xl relative z-10">
        <h2 className="text-4xl md:text-7xl font-display tracking-tight italic leading-[1.2] md:leading-[1] text-gradient">
          Your life doesn't need <br className="hidden md:block" /> another app.
        </h2>
        <p className="text-2xl md:text-3xl font-display text-white">
          It needs a system.
        </p>
        <div className="max-w-sm mx-auto pt-lg">
          <Link href="/signup">
            <button
              className="w-full bg-soft-cream text-warm-black px-3xl py-5 rounded-2xl font-bold text-xl shadow-[0_0_40px_rgba(244,201,93,0.15)] hover:shadow-[0_0_60px_rgba(244,201,93,0.25)] hover:scale-105 active:scale-95 transition-all group overflow-hidden relative"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Start using TRASON{' '}
                <ArrowUpRight size={24} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </span>
            </button>
          </Link>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
