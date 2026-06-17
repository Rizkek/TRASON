'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { FiArrowUpRight, FiCommand } from 'react-icons/fi';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { LandingFooter } from '@/components/landing/LandingFooter';

const SPLASH_STORAGE_KEY = 'trason_home_splash_seen';

export default function Home() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);

  const [showSplash, setShowSplash] = useState(true);
  const [motionStep, setMotionStep] = useState(0);
  const [mounted, setMounted] = useState(false);
 
  const { t } = useTranslation();

  const motionTexts = [
    t('dashboard.splash.line1'),
    t('dashboard.splash.line2'),
    t('dashboard.splash.line3'),
    t('dashboard.splash.line4')
  ];
 
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
    }, 1000);
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
        <div className="absolute top-1/4 left-1/4 w-64 h-64 border border-warm-gold/10 rounded-full animate-[spin_10s_linear_infinite]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 border border-warm-gold/5 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
        <div className="text-center space-y-md z-10 px-lg max-w-2xl">
          <h2 key={motionStep} className="text-2xl md:text-4xl font-serif text-warm-gold animate-fade-in italic">
            {mounted ? motionTexts[motionStep] : ' '}
          </h2>
        </div>
      </div>
    );
  }

  if (isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-warm-black text-soft-cream font-sans selection:bg-warm-gold/30 selection:text-soft-cream relative overflow-x-hidden">
      {/* Dynamic Background Elements */}
      <div className="fixed top-[-20%] right-[-10%] w-[800px] h-[800px] bg-warm-gold/5 blur-[160px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-deep-sage/5 blur-[140px] rounded-full pointer-events-none" />

      <LandingNavbar />

      {/* HERO SECTION */}
      <header className="relative pt-40 pb-20 md:pt-56 md:pb-32 px-lg">
        <div className="max-w-4xl mx-auto text-center space-y-xl relative z-10">
          <div className="inline-flex items-center gap-2 px-md py-xs rounded-full border border-warm-gold/20 bg-warm-gold/5 text-warm-gold text-xs font-bold uppercase tracking-widest mb-md animate-fade-in">
            <FiCommand size={14} /> The Personal Operating System
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-[6rem] font-serif leading-[1.1] md:leading-[1] tracking-tighter animate-slide-up [animation-delay:0.1s]">
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
          
          <div className="flex flex-wrap justify-center gap-lg md:gap-2xl opacity-60 grayscale hover:grayscale-0 transition-all duration-700">
             {/* Mock App Icons representing chaos */}
             {['Finance Tracker', 'Habit App', 'To-Do List', 'Spreadsheets'].map((app, i) => (
               <div key={i} className="flex flex-col items-center gap-sm">
                 <div className="w-16 h-16 rounded-2xl bg-black/20 border border-white/5 flex items-center justify-center shadow-lg transform -rotate-3 hover:rotate-0 transition-transform">
                    <div className="w-8 h-8 rounded-full bg-white/10" />
                 </div>
                 <span className="text-xs text-gray-light/50 font-bold uppercase tracking-wider">{app}</span>
               </div>
             ))}
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

        {/* MINI PREVIEW HERO IMAGE/MOCKUP */}
        <div className="mt-2xl max-w-6xl mx-auto relative group perspective-1000">
           <div className="absolute inset-0 bg-warm-gold/10 blur-[100px] rounded-[3rem] group-hover:bg-warm-gold/20 transition-all duration-700" />
           <div className="relative w-full aspect-video bg-gray-strong/80 backdrop-blur-2xl rounded-[2rem] border border-white/10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] overflow-hidden transform rotate-x-12 group-hover:rotate-x-0 transition-transform duration-1000">
              {/* Fake Dashboard Top Bar */}
              <div className="h-12 border-b border-white/5 flex items-center px-lg gap-sm bg-black/20">
                <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-expense/50" /><div className="w-3 h-3 rounded-full bg-warm-gold/50" /><div className="w-3 h-3 rounded-full bg-income/50" /></div>
                <div className="mx-auto text-[10px] uppercase tracking-widest text-gray-light/40 font-bold">TRASON OS - Command Center</div>
              </div>
              {/* Fake Dashboard Content */}
              <div className="p-xl grid grid-cols-1 md:grid-cols-3 gap-xl h-full">
                 <div className="col-span-2 space-y-lg">
                    <div className="h-32 rounded-xl bg-black/20 border border-white/5 flex items-end p-md gap-2">
                       {[40, 60, 45, 80, 55, 90, 75, 100].map((h, i) => (
                          <div key={i} className="flex-1 bg-warm-gold/40 rounded-t-sm transition-all duration-1000 hover:bg-warm-gold" style={{ height: `${h}%` }} />
                       ))}
                    </div>
                    <div className="h-48 rounded-xl bg-black/20 border border-white/5 p-lg space-y-md">
                       <div className="h-6 w-32 bg-white/10 rounded" />
                       <div className="space-y-sm">
                         <div className="h-4 w-full bg-white/5 rounded" />
                         <div className="h-4 w-5/6 bg-white/5 rounded" />
                         <div className="h-4 w-4/6 bg-white/5 rounded" />
                       </div>
                    </div>
                 </div>
                 <div className="space-y-lg">
                    <div className="aspect-square rounded-xl bg-black/20 border border-white/5 flex flex-col items-center justify-center gap-md">
                       <div className="text-sm text-gray-light/60 font-bold uppercase tracking-widest">Life Score</div>
                       <div className="text-6xl font-serif text-warm-gold">86</div>
                    </div>
                    <div className="h-32 rounded-xl bg-black/20 border border-white/5 p-md space-y-sm">
                       <div className="flex justify-between items-center"><div className="h-3 w-16 bg-white/10 rounded" /><div className="h-3 w-8 bg-warm-gold/50 rounded" /></div>
                       <div className="flex justify-between items-center"><div className="h-3 w-20 bg-white/10 rounded" /><div className="h-3 w-8 bg-warm-gold/50 rounded" /></div>
                       <div className="flex justify-between items-center"><div className="h-3 w-12 bg-white/10 rounded" /><div className="h-3 w-8 bg-warm-gold/50 rounded" /></div>
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
