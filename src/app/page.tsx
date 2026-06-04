'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { FiArrowUpRight, FiZap, FiActivity, FiLock, FiCommand } from 'react-icons/fi';
import {
  RiCompass3Line,
  RiWallet3Line,
  RiHistoryLine,
  RiNotification3Line,
  RiShieldCheckLine,
  RiBriefcaseLine,
  RiStackLine
} from 'react-icons/ri';

const SPLASH_STORAGE_KEY = 'trason_home_splash_seen';

export default function Home() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);

  const [showSplash, setShowSplash] = useState(true);
  const [motionStep, setMotionStep] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
 
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

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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

      {/* Professional Navbar */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'py-sm backdrop-blur-xl bg-warm-black/80 border-b border-white/[0.05] shadow-2xl' : 'py-md bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-lg md:px-2xl flex justify-between items-center">
          <Link href="/" className="flex items-center gap-sm group cursor-pointer">
            <div className="w-10 h-10 bg-warm-gold rounded-xl flex items-center justify-center text-warm-black transform transition-transform duration-500 shadow-[0_0_20px_rgba(244,201,93,0.3)]">
              <RiCompass3Line size={24} />
            </div>
            <span className="text-2xl font-serif font-bold tracking-tight">TRASON</span>
          </Link>

          <div className="hidden md:flex items-center gap-2xl bg-white/[0.03] px-xl py-sm rounded-full border border-white/[0.05]">
             <Link href="#features" className="text-sm font-medium text-gray-light hover:text-warm-gold transition-colors">Features</Link>
             <Link href="#architecture" className="text-sm font-medium text-gray-light hover:text-warm-gold transition-colors">Architecture</Link>
             <Link href="#security" className="text-sm font-medium text-gray-light hover:text-warm-gold transition-colors">Security</Link>
          </div>

          <div className="flex items-center gap-lg">
            <Link href="/login" className="text-sm font-bold text-gray-light hover:text-warm-gold transition-colors hidden md:block">
              Log in
            </Link>
            <Link href="/signup">
              <button className="relative overflow-hidden bg-warm-gold text-warm-black px-xl py-2.5 rounded-xl text-sm font-bold shadow-[0_0_20px_rgba(244,201,93,0.2)] hover:shadow-[0_0_30px_rgba(244,201,93,0.4)] hover:scale-105 transition-all duration-300 group">
                <span className="relative z-10 flex items-center gap-2">
                  Get Started <FiArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <header className="relative pt-40 pb-24 md:pt-56 md:pb-40 px-lg">
        <div className="max-w-7xl mx-auto text-center space-y-xl relative z-10">
          <div className="inline-flex items-center gap-2 px-md py-xs rounded-full border border-warm-gold/20 bg-warm-gold/5 text-warm-gold text-xs font-bold uppercase tracking-widest mb-md animate-fade-in">
            <FiCommand size={14} /> Meet The Personal OS
          </div>

          <h1 className="text-5xl md:text-8xl lg:text-[7rem] font-serif leading-[1] tracking-tighter animate-slide-up [animation-delay:0.1s]">
            Your Life's <br className="hidden md:block" />
            <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-warm-gold via-soft-cream to-warm-gold">Command Center.</span>
          </h1>

          <p className="text-lg md:text-2xl text-gray-light/80 max-w-3xl mx-auto leading-relaxed font-light animate-slide-up [animation-delay:0.2s]">
            Consolidate your existence. Track your financial flow, daily vitality, and career architecture in one beautifully private sanctuary.
          </p>

          <div className="flex flex-col sm:flex-row gap-md justify-center pt-xl animate-slide-up [animation-delay:0.3s]">
            <Link href="/signup">
              <button className="w-full sm:w-auto bg-soft-cream text-warm-black px-3xl py-4 rounded-xl font-bold flex items-center justify-center gap-sm group hover:bg-warm-gold transition-all shadow-[0_0_30px_rgba(244,201,93,0.15)] text-lg">
                Initialize Sanctuary
                <FiArrowUpRight size={22} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
            </Link>
            <Link href="#architecture">
              <button className="w-full sm:w-auto bg-white/[0.03] border border-white/[0.1] hover:bg-white/[0.08] text-soft-cream px-3xl py-4 rounded-xl font-medium transition-all backdrop-blur-sm text-lg flex items-center justify-center gap-sm">
                Explore Architecture
              </button>
            </Link>
          </div>
        </div>

        {/* Abstract Floating Mockup */}
        <div className="mt-24 max-w-6xl mx-auto relative h-[400px] md:h-[600px] animate-fade-in [animation-delay:0.5s] perspective-1000">
           <div className="absolute inset-0 bg-gradient-to-b from-transparent via-warm-black/50 to-warm-black z-20 pointer-events-none" />
           
           {/* Center Big Card (Finance) */}
           <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[90%] md:w-[700px] h-[350px] md:h-[450px] bg-gray-strong/80 backdrop-blur-xl rounded-3xl border border-white/10 shadow-[0_30px_60px_-20px_rgba(244,201,93,0.15)] overflow-hidden transform hover:-translate-y-2 transition-transform duration-700">
              <div className="h-12 border-b border-white/5 flex items-center px-lg gap-sm bg-white/[0.02]">
                <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-expense/50" /><div className="w-3 h-3 rounded-full bg-warm-gold/50" /><div className="w-3 h-3 rounded-full bg-income/50" /></div>
                <div className="mx-auto text-[10px] uppercase tracking-widest text-gray-light/40 font-bold">Finance Module</div>
              </div>
              <div className="p-xl md:p-3xl space-y-xl">
                 <div className="space-y-sm">
                    <p className="text-gray-light font-medium">Total Balance</p>
                    <h2 className="text-5xl font-serif">$142,850.00</h2>
                 </div>
                 <div className="w-full h-32 md:h-48 border-b border-warm-gold/20 flex items-end justify-between px-md pb-md relative">
                    {/* Mock Graph */}
                    <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-warm-gold/10 to-transparent opacity-50" />
                    {[40, 60, 45, 80, 55, 90, 75, 100].map((h, i) => (
                      <div key={i} className="w-[8%] bg-warm-gold/40 rounded-t-sm" style={{ height: `${h}%` }} />
                    ))}
                 </div>
              </div>
           </div>

           {/* Side Card Left (Habits/Vitality) */}
           <div className="hidden md:block absolute top-40 left-[5%] w-[300px] h-[300px] bg-gray-strong/90 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden transform -rotate-6 hover:rotate-0 transition-all duration-700 z-10">
              <div className="p-xl space-y-lg">
                 <div className="w-12 h-12 rounded-xl bg-deep-sage/20 flex items-center justify-center text-deep-sage">
                    <FiActivity size={24} />
                 </div>
                 <h3 className="text-xl font-serif">Vitality Heatmap</h3>
                 <div className="grid grid-cols-7 gap-xs opacity-80">
                    {Array.from({length: 28}).map((_, i) => (
                      <div key={i} className={`w-full aspect-square rounded-sm ${Math.random() > 0.3 ? 'bg-deep-sage/40' : 'bg-white/5'}`} />
                    ))}
                 </div>
              </div>
           </div>

           {/* Side Card Right (Reminders) */}
           <div className="hidden md:block absolute top-20 right-[5%] w-[320px] h-[360px] bg-gray-strong/90 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden transform rotate-3 hover:rotate-0 transition-all duration-700 z-30">
              <div className="p-xl space-y-lg">
                 <div className="w-12 h-12 rounded-xl bg-warm-gold/20 flex items-center justify-center text-warm-gold">
                    <RiNotification3Line size={24} />
                 </div>
                 <h3 className="text-xl font-serif">Incoming Signals</h3>
                 <div className="space-y-md">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="p-md rounded-xl bg-white/5 border border-white/5 flex gap-md items-center">
                         <div className="w-4 h-4 rounded-full border-2 border-warm-gold" />
                         <div className="space-y-1">
                           <div className="w-24 h-2 bg-white/40 rounded" />
                           <div className="w-16 h-1.5 bg-white/20 rounded" />
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      </header>

      {/* BENTO GRID SECTION */}
      <section id="architecture" className="py-24 md:py-40 px-lg bg-white/[0.01]">
         <div className="max-w-7xl mx-auto">
            <div className="text-center mb-2xl space-y-md">
               <h2 className="text-4xl md:text-6xl font-serif">The Architecture of Sovereignty</h2>
               <p className="text-xl text-gray-light/60 max-w-2xl mx-auto font-light">Four integrated modules working seamlessly to give you absolute clarity over your life's trajectory.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-lg auto-rows-[300px] md:auto-rows-[350px]">
               {/* Bento 1: Finance (Wide) */}
               <div className="md:col-span-2 relative group overflow-hidden rounded-[2rem] bg-gradient-to-br from-white/[0.04] to-transparent border border-white/[0.05] hover:border-warm-gold/30 transition-all duration-500 p-xl flex flex-col justify-between">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-warm-gold/5 rounded-full blur-[100px] group-hover:bg-warm-gold/10 transition-colors" />
                  <div className="relative z-10 space-y-md max-w-md">
                     <div className="w-12 h-12 rounded-xl bg-warm-gold/10 flex items-center justify-center text-warm-gold">
                        <RiWallet3Line size={24} />
                     </div>
                     <h3 className="text-3xl font-serif">Financial Flow</h3>
                     <p className="text-gray-light font-light leading-relaxed">Audit your resources, track asset movement, and ensure your capital architecture aligns with your core mission.</p>
                  </div>
                  {/* Subtle UI Hint */}
                  <div className="relative z-10 w-full h-24 mt-auto border-t border-white/10 pt-md flex items-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                     <div className="h-full w-1/4 bg-white/5 rounded-t-lg" />
                     <div className="h-[60%] w-1/4 bg-warm-gold/20 rounded-t-lg" />
                     <div className="h-[80%] w-1/4 bg-income/20 rounded-t-lg" />
                     <div className="h-[40%] w-1/4 bg-expense/20 rounded-t-lg" />
                  </div>
               </div>

               {/* Bento 2: Vitality (Square) */}
               <div className="relative group overflow-hidden rounded-[2rem] bg-gradient-to-bl from-white/[0.04] to-transparent border border-white/[0.05] hover:border-deep-sage/30 transition-all duration-500 p-xl flex flex-col justify-between">
                  <div className="relative z-10 space-y-md">
                     <div className="w-12 h-12 rounded-xl bg-deep-sage/10 flex items-center justify-center text-deep-sage">
                        <FiActivity size={24} />
                     </div>
                     <h3 className="text-3xl font-serif">Vitality</h3>
                     <p className="text-gray-light font-light text-sm">Humanized tracking for workouts and health rhythms.</p>
                  </div>
                  <div className="grid grid-cols-5 gap-2 mt-auto opacity-50 group-hover:opacity-100 transition-opacity">
                     {Array.from({length: 15}).map((_, i) => (
                       <div key={i} className="w-full aspect-square rounded-md bg-deep-sage/20" />
                     ))}
                  </div>
               </div>

               {/* Bento 3: Timeline (Square) */}
               <div className="relative group overflow-hidden rounded-[2rem] bg-gradient-to-tr from-white/[0.04] to-transparent border border-white/[0.05] hover:border-soft-cream/30 transition-all duration-500 p-xl flex flex-col justify-between">
                  <div className="relative z-10 space-y-md">
                     <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-soft-cream">
                        <RiHistoryLine size={24} />
                     </div>
                     <h3 className="text-3xl font-serif">Timeline</h3>
                     <p className="text-gray-light font-light text-sm">A persistent chronological spine for your existence. Log what matters.</p>
                  </div>
                  <div className="space-y-4 mt-auto opacity-50 group-hover:opacity-100 transition-opacity">
                     <div className="flex gap-4 items-center">
                        <div className="w-2 h-2 rounded-full bg-soft-cream" />
                        <div className="h-2 w-32 bg-white/10 rounded" />
                     </div>
                     <div className="flex gap-4 items-center pl-1 border-l border-white/10">
                        <div className="w-2 h-2 rounded-full bg-transparent" />
                        <div className="h-2 w-24 bg-white/5 rounded" />
                     </div>
                  </div>
               </div>

               {/* Bento 4: Career (Wide) */}
               <div className="md:col-span-2 relative group overflow-hidden rounded-[2rem] bg-gradient-to-tl from-white/[0.04] to-transparent border border-white/[0.05] hover:border-warm-gold/30 transition-all duration-500 p-xl flex flex-col sm:flex-row gap-xl items-center justify-between">
                  <div className="relative z-10 space-y-md max-w-sm">
                     <div className="w-12 h-12 rounded-xl bg-warm-gold/10 flex items-center justify-center text-warm-gold">
                        <RiBriefcaseLine size={24} />
                     </div>
                     <h3 className="text-3xl font-serif">Career Architect</h3>
                     <p className="text-gray-light font-light leading-relaxed">Design your professional trajectory. Organize applications and growth milestones within your personal system.</p>
                  </div>
                  <div className="w-full sm:w-1/2 h-full bg-white/5 rounded-xl border border-white/5 p-lg flex flex-col gap-sm opacity-50 group-hover:opacity-100 transition-opacity justify-center">
                     <div className="p-md rounded-lg bg-warm-gold/10 border border-warm-gold/20 flex justify-between items-center">
                        <div className="h-2 w-20 bg-warm-gold/50 rounded" />
                        <div className="text-xs font-bold text-warm-gold">INTERVIEW</div>
                     </div>
                     <div className="p-md rounded-lg bg-white/5 border border-white/5 flex justify-between items-center">
                        <div className="h-2 w-24 bg-white/20 rounded" />
                        <div className="text-xs font-bold text-gray-light">APPLIED</div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* SECURITY / TRUST SECTION */}
      <section id="security" className="py-24 md:py-40 px-lg relative overflow-hidden">
         <div className="absolute inset-0 bg-gradient-to-b from-transparent via-warm-gold/[0.02] to-transparent pointer-events-none" />
         <div className="max-w-4xl mx-auto">
            <div className="p-2xl md:p-4xl rounded-[3rem] bg-gray-strong border border-white/[0.05] shadow-[0_0_100px_rgba(0,0,0,0.5)] text-center space-y-xl relative overflow-hidden">
               {/* Badge Background Glow */}
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-warm-gold/10 blur-[80px] rounded-full" />
               
               <div className="relative z-10 w-24 h-24 bg-warm-black rounded-2xl flex items-center justify-center mx-auto text-warm-gold border border-warm-gold/20 shadow-[0_0_30px_rgba(244,201,93,0.2)]">
                  <FiLock size={40} />
               </div>
               
               <div className="relative z-10 space-y-md">
                 <h2 className="text-4xl md:text-5xl font-serif">Absolute Sovereignty.</h2>
                 <p className="text-gray-light text-lg font-light leading-relaxed max-w-2xl mx-auto">
                   Your personal records belong in a private workspace, not a harvest for algorithms. TRASON ensures your sanctuary is strictly yours with end-to-end authentication.
                 </p>
               </div>

               <div className="relative z-10 flex flex-wrap justify-center gap-md pt-md">
                  {["Zero Tracking", "Private Cloud", "User-Owned Architecture"].map(f => (
                    <div key={f} className="text-xs uppercase tracking-widest font-bold text-warm-gold py-sm px-lg border border-warm-gold/20 bg-warm-gold/5 rounded-full flex items-center gap-2">
                       <RiShieldCheckLine size={16} /> {f}
                    </div>
                  ))}
               </div>
            </div>
         </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-24 md:py-40 px-lg text-center space-y-xl bg-warm-black border-t border-white/[0.02]">
         <h2 className="text-5xl md:text-7xl font-serif italic tracking-tight">
           Build the sanctuary <br className="hidden md:block" /> your life deserves.
         </h2>
         <div className="max-w-sm mx-auto space-y-lg pt-lg">
            <Link href="/signup">
               <button className="w-full bg-soft-cream text-warm-black px-3xl py-5 rounded-2xl font-bold text-xl shadow-[0_0_40px_rgba(244,201,93,0.15)] hover:shadow-[0_0_60px_rgba(244,201,93,0.25)] hover:scale-105 active:scale-95 transition-all group overflow-hidden relative">
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Commence Initialization <FiArrowUpRight size={24} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </span>
               </button>
            </Link>
            <p className="text-xs text-gray-light/40 uppercase tracking-[0.2em] font-medium">No credit card required. Pure focus.</p>
         </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 px-lg border-t border-white/[0.05] bg-black/20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-xl">
           <div className="flex items-center gap-sm">
             <RiCompass3Line size={24} className="text-warm-gold" />
             <span className="font-serif text-xl font-bold tracking-tight">TRASON</span>
           </div>
           
           <div className="flex gap-lg flex-wrap justify-center">
              <Link href="/about-os" className="text-sm font-medium text-gray-light hover:text-warm-gold transition-colors">Architecture</Link>
              <Link href="/privacy" className="text-sm font-medium text-gray-light hover:text-warm-gold transition-colors">Privacy</Link>
              <Link href="/terms" className="text-sm font-medium text-gray-light hover:text-warm-gold transition-colors">Terms</Link>
           </div>
           
           <p className="text-[10px] uppercase tracking-[0.2em] text-gray-light/40 text-center md:text-right">
              © 2026 TRASON OS
           </p>
        </div>
      </footer>
    </div>
  );
}
