'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { FiArrowUpRight, FiCommand } from 'react-icons/fi';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { PieChart, Activity, CheckSquare, Table, TrendingUp, Target, CreditCard, ChevronRight } from 'lucide-react';

const SPLASH_STORAGE_KEY = 'trason_home_splash_seen';

export default function Home() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);

  const [showSplash, setShowSplash] = useState(true);
  const [motionStep, setMotionStep] = useState(0);
  const [mounted, setMounted] = useState(false);
 
  const { t } = useTranslation();

  const motionTexts = React.useMemo(() => [
    t('dashboard.splash.line1'),
    t('dashboard.splash.line2'),
    t('dashboard.splash.line3'),
    t('dashboard.splash.line4')
  ], [t]);
 
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

  if (showSplash) {
    return (
      <div className="fixed inset-0 z-[100] bg-warm-black flex flex-col items-center justify-center font-sans overflow-hidden">
        <div className="hidden md:block absolute top-1/4 left-1/4 w-64 h-64 border border-warm-gold/10 rounded-full animate-[spin_10s_linear_infinite]" />
        <div className="hidden md:block absolute bottom-1/4 right-1/4 w-96 h-96 border border-warm-gold/5 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
        <div className="text-center space-y-md z-10 px-lg max-w-2xl">
          <h2 key={motionStep} className="text-2xl md:text-4xl font-serif text-warm-gold animate-fade-in italic">
            {mounted ? motionTexts[motionStep] : motionTexts[0]}
          </h2>
        </div>
      </div>
    );
  }

  if (isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-warm-black text-soft-cream font-sans selection:bg-warm-gold/30 selection:text-soft-cream relative overflow-x-hidden">
      {/* Dynamic Background Elements */}
      <div className="fixed top-[-20%] right-[-10%] w-[800px] h-[800px] bg-warm-gold/5 md:blur-[160px] rounded-full pointer-events-none" style={{ transform: 'translateZ(0)', contain: 'strict' }} />
      <div className="fixed bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-deep-sage/5 md:blur-[140px] rounded-full pointer-events-none" style={{ transform: 'translateZ(0)', contain: 'strict' }} />

      <LandingNavbar />

      {/* HERO SECTION */}
      <header className="relative pt-40 pb-20 md:pt-56 md:pb-32 px-lg">
        <div className="max-w-4xl mx-auto text-center space-y-xl relative z-10">
          <div className="inline-flex items-center gap-2 px-md py-xs rounded-full border border-warm-gold/20 bg-warm-gold/5 text-warm-gold text-xs font-bold uppercase tracking-widest mb-md animate-fade-in">
            <FiCommand size={14} /> The Personal Operating System
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-[6rem] font-serif leading-[1.1] md:leading-[1] tracking-tighter">
            Your Life's <br className="hidden md:block" />
            <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-warm-gold via-soft-cream to-warm-gold">Command Center.</span>
          </h1>

          <p className="text-lg md:text-2xl text-gray-light/80 max-w-2xl mx-auto leading-relaxed font-light animate-slide-up [animation-delay:0.2s]">
            Track your money, habits, reminders, and career all in one privately-owned sanctuary.
          </p>

          <div className="flex flex-col sm:flex-row gap-md justify-center pt-xl animate-slide-up [animation-delay:0.3s]">
            <Link href="/signup">
              <button className="w-full sm:w-auto bg-soft-cream text-warm-black px-3xl py-4 rounded-xl font-bold flex items-center justify-center gap-sm group hover:bg-warm-gold transition-all shadow-[0_0_30px_rgba(244,201,93,0.15)] text-lg">
                Initialize Sanctuary
                <FiArrowUpRight size={22} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
            </Link>
            <Link href="/preview">
              <button className="w-full sm:w-auto bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.1] dark:border-white/[0.1] hover:bg-black/[0.08] dark:bg-white/[0.08] text-soft-cream px-3xl py-4 rounded-xl font-medium transition-all backdrop-blur-sm text-lg flex items-center justify-center gap-sm">
                Live Preview
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* THE PROBLEM SECTION */}
      <section className="py-16 md:py-32 px-md md:px-lg relative z-10">
        <div className="max-w-5xl mx-auto text-center space-y-2xl">
          <div className="space-y-sm">
            <h2 className="text-3xl md:text-5xl font-serif text-gray-light">Right now, your life is scattered.</h2>
            <p className="text-gray-light/60 text-lg">You are managing yourself across disconnected apps.</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-lg md:gap-2xl opacity-80 transition-all duration-700">
             {/* Realistic App Icons representing chaos */}
             {[
               { name: 'Finance Tracker', icon: PieChart, colorClass: 'group-hover:text-amber-400 group-hover:border-amber-400/50 group-hover:bg-amber-400/10' },
               { name: 'Habit App', icon: Activity, colorClass: 'group-hover:text-rose-400 group-hover:border-rose-400/50 group-hover:bg-rose-400/10' },
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

      {/* THE SOLUTION SECTION */}
      <section className="py-16 md:py-32 px-md md:px-lg relative z-10 bg-gradient-to-b from-transparent via-warm-gold/[0.02] to-transparent border-y border-white/[0.02]">
        <div className="max-w-5xl mx-auto text-center space-y-xl">
           <h2 className="text-4xl md:text-6xl font-serif text-warm-gold">TRASON brings everything <br/>into focus.</h2>
           <p className="text-xl text-gray-light/80 font-light max-w-2xl mx-auto">
             No more switching contexts. Your capital, your vitality, and your professional growth integrated into one single interface.
           </p>
        </div>

        {/* REALISTIC PREVIEW HERO IMAGE/MOCKUP */}
        <div className="mt-2xl max-w-6xl mx-auto relative group perspective-1000">
           <div className="absolute inset-0 bg-warm-gold/10 blur-[100px] rounded-[3rem] group-hover:bg-warm-gold/20 transition-all duration-700" />
           <div className="relative w-full bg-gray-strong/90 backdrop-blur-3xl rounded-[2rem] border border-white/10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.9)] overflow-hidden transform rotate-x-12 group-hover:rotate-x-0 transition-transform duration-1000">
              {/* Fake Dashboard Top Bar */}
              <div className="h-12 border-b border-white/5 flex items-center px-lg gap-sm bg-black/40">
                <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500/50" /><div className="w-3 h-3 rounded-full bg-yellow-500/50" /><div className="w-3 h-3 rounded-full bg-green-500/50" /></div>
                <div className="mx-auto text-[10px] uppercase tracking-widest text-gray-light/40 font-bold flex items-center gap-2">
                  <FiCommand size={12} /> TRASON COMMAND CENTER
                </div>
              </div>
              {/* Fake Dashboard Content */}
              <div className="p-xl grid grid-cols-1 md:grid-cols-3 gap-xl">
                 <div className="col-span-2 space-y-xl">
                    {/* Header Mockup */}
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

                    {/* Chart Mockup */}
                    <div className="h-48 rounded-2xl bg-black/30 border border-white/5 p-lg flex flex-col justify-between relative overflow-hidden">
                       <div className="flex justify-between items-start z-10 relative">
                         <div>
                           <p className="text-xs text-gray-light/60 font-bold uppercase tracking-widest">Financial Flow</p>
                           <h4 className="text-2xl font-serif text-white mt-1">$4,250.00</h4>
                         </div>
                         <div className="flex gap-2">
                           <span className="px-2 py-1 rounded bg-green-500/10 text-green-400 text-xs flex items-center gap-1"><TrendingUp size={12} /> +12%</span>
                         </div>
                       </div>
                       <div className="absolute bottom-0 left-0 right-0 h-24 flex items-end px-lg gap-2 opacity-80">
                          {[40, 60, 45, 80, 55, 90, 75, 100, 65, 85, 50, 70].map((h, i) => (
                             <div key={i} className="flex-1 bg-gradient-to-t from-warm-gold/40 to-warm-gold/80 rounded-t-sm transition-all duration-1000 hover:opacity-100" style={{ height: `${h}%` }} />
                          ))}
                       </div>
                    </div>
                 </div>

                 {/* Right Sidebar Mockup */}
                 <div className="space-y-xl">
                    {/* Life Score */}
                    <div className="aspect-video md:aspect-square rounded-2xl bg-gradient-to-br from-black/40 to-black/80 border border-white/5 flex flex-col items-center justify-center gap-md relative overflow-hidden">
                       <div className="absolute inset-0 bg-warm-gold/5" />
                       <Target className="text-warm-gold/30 absolute top-4 right-4" size={24} />
                       <div className="text-xs text-gray-light/60 font-bold uppercase tracking-widest relative z-10">Life Score</div>
                       <div className="text-7xl font-serif text-warm-gold drop-shadow-[0_0_15px_rgba(244,201,93,0.3)] relative z-10">86</div>
                    </div>
                    
                    {/* Daily Insight */}
                    <div className="rounded-2xl bg-gradient-to-br from-gray-strong to-black border border-white/5 p-lg space-y-md relative overflow-hidden">
                       <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-amber-500/10 blur-3xl rounded-full" />
                       <div className="flex items-center gap-3 relative z-10">
                         <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                           <Activity size={16} />
                         </div>
                         <h4 className="font-serif italic text-md text-white">Daily Insight</h4>
                       </div>
                       <p className="text-sm text-gray-light/80 italic leading-relaxed relative z-10">
                         "Your financial outflow is stable, but vitality logs are missing. Log a quick session to balance your day."
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

      {/* FINAL CTA SECTION */}
      <section className="py-24 md:py-40 px-md md:px-lg text-center space-y-lg md:space-y-xl relative z-10">
         <h2 className="text-4xl md:text-7xl font-serif italic tracking-tight leading-[1.2] md:leading-[1]">
           Take back control <br className="hidden md:block" /> of your data.
         </h2>
         <div className="max-w-sm mx-auto space-y-lg pt-lg">
            <Link href="/signup">
               <button className="w-full bg-soft-cream text-warm-black px-3xl py-5 rounded-2xl font-bold text-xl shadow-[0_0_40px_rgba(244,201,93,0.15)] hover:shadow-[0_0_60px_rgba(244,201,93,0.25)] hover:scale-105 active:scale-95 transition-all group overflow-hidden relative">
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Initialize Free <FiArrowUpRight size={24} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </span>
               </button>
            </Link>
            <p className="text-xs text-gray-light/40 uppercase tracking-[0.2em] font-medium">No credit card required. Pure focus.</p>
         </div>
      </section>

      <LandingFooter />
    </div>
  );
}
