'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { FiArrowUpRight, FiZap, FiActivity } from 'react-icons/fi';
import {
  RiCompass3Line,
  RiWallet3Line,
  RiHistoryLine,
  RiNotification3Line,
  RiShieldCheckLine,
  RiBriefcaseLine,
  RiCheckboxCircleLine,
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
      <div className="fixed top-[-10%] right-[-5%] w-[600px] h-[600px] bg-warm-gold/5 blur-[140px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-deep-sage/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-xl border-b border-white/[0.03]">
        <div className="max-w-7xl mx-auto px-lg md:px-2xl h-20 flex justify-between items-center">
          <div className="flex items-center gap-sm group cursor-pointer">
            <div className="w-9 h-9 bg-warm-gold rounded-full flex items-center justify-center text-warm-black transform group-hover:rotate-[360deg] transition-transform duration-1000 shadow-lg shadow-warm-gold/20">
              <RiCompass3Line size={20} />
            </div>
            <span className="text-2xl font-serif font-bold tracking-tight">TRASON</span>
          </div>

          <div className="flex items-center gap-lg">
            <Link href="/login" className="text-sm font-medium hover:text-warm-gold transition-colors hidden md:block uppercase tracking-widest">
              Log in
            </Link>
            <Link href="/signup">
              <button className="bg-warm-gold text-warm-black px-xl py-sm rounded-full text-sm font-bold hover:bg-soft-cream hover:scale-105 transition-all duration-300 shadow-lg shadow-warm-gold/10">
                GET STARTED
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO: The Manifesto */}
      <header className="relative pt-36 pb-20 md:pt-52 md:pb-40 px-lg">
        <div className="max-w-7xl mx-auto text-center space-y-xl relative z-10">

          <h1 className="text-6xl md:text-8xl lg:text-9xl font-serif leading-[0.9] tracking-tighter animate-slide-up">
            Beyond Tracking. <br />
            <span className="italic text-warm-gold">Towards Clarity.</span>
          </h1>

          <p className="text-lg md:text-2xl text-gray-light/60 max-w-3xl mx-auto leading-relaxed font-light animate-slide-up [animation-delay:0.2s]">
            TRASON is a unified Personal OS designed to consolidate your life. Bring your financial flow, vitality, and career architecture into one private, high-signal sanctuary.
          </p>

          <div className="flex flex-col sm:flex-row gap-md justify-center pt-xl animate-slide-up [animation-delay:0.4s]">
            <Link href="/signup">
              <button className="w-full sm:w-auto bg-soft-cream text-warm-black px-3xl py-md rounded-full font-bold flex items-center justify-center gap-sm group hover:bg-warm-gold transition-all shadow-2xl">
                Initialize Your Sanctuary
                <FiArrowUpRight size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
            </Link>
            <Link href="#why">
              <button className="w-full sm:w-auto bg-white/[0.03] border border-white/[0.1] hover:bg-white/[0.08] text-soft-cream px-3xl py-md rounded-full font-medium transition-all backdrop-blur-sm">
                Explore Architecture
              </button>
            </Link>
          </div>
        </div>

        {/* Hero Visual: Actual Product Mockup Preview */}
        <div className="mt-20 max-w-6xl mx-auto relative animate-fade-in [animation-delay:0.6s]">
          <div className="bg-gray-strong rounded-2xl border border-white/[0.1] shadow-[0_0_100px_-20px_rgba(244,201,93,0.15)] overflow-hidden relative">
             {/* Mockup Top Bar */}
             <div className="flex items-center gap-sm px-xl py-md border-b border-white/5 bg-white/[0.02]">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/20" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/20" />
                </div>
                <div className="mx-auto text-[10px] uppercase tracking-[0.3em] text-white/20 font-bold">Personal OS Environment</div>
             </div>

             {/* Mockup Content - Matching actual src/app/dashboard/page.tsx layout */}
             <div className="p-md md:p-xl space-y-xl bg-gradient-to-b from-transparent to-warm-black/50">
                {/* Hero Greeting Mockup */}
                <div className="space-y-sm">
                   <div className="h-10 w-64 bg-gradient-to-r from-warm-gold/20 to-transparent rounded-lg" />
                   <div className="h-3 w-40 bg-white/5 rounded" />
                </div>

                {/* Main Grid Mockup */}
                <div className="grid grid-cols-12 gap-lg">
                   {/* Left Content (2/3) */}
                   <div className="col-span-12 lg:col-span-8 space-y-lg">
                      {/* Financial Summary Mockup */}
                      <div className="h-32 w-full bg-white/[0.03] rounded-xl border border-white/5 p-lg flex flex-col justify-between">
                         <div className="h-3 w-24 bg-warm-gold/20 rounded" />
                         <div className="flex gap-lg items-end">
                            <div className="h-10 w-32 bg-white/10 rounded" />
                            <div className="h-6 w-16 bg-green-500/10 rounded" />
                         </div>
                      </div>

                      <div className="grid grid-cols-2 gap-lg">
                         {/* Activities List Mockup */}
                         <div className="h-64 bg-white/[0.03] rounded-xl border border-white/5 p-md space-y-md">
                            <div className="h-3 w-20 bg-white/10 rounded" />
                            {[1,2,3].map(i => (
                               <div key={i} className="flex gap-md">
                                  <div className="w-8 h-8 bg-white/5 rounded-full" />
                                  <div className="flex-1 space-y-2">
                                     <div className="h-2 w-full bg-white/5 rounded" />
                                     <div className="h-2 w-1/2 bg-white/5 rounded" />
                                  </div>
                               </div>
                            ))}
                         </div>
                         {/* Transactions List Mockup */}
                         <div className="h-64 bg-white/[0.03] rounded-xl border border-white/5 p-md space-y-md">
                            <div className="h-3 w-20 bg-white/10 rounded" />
                            {[1,2,3].map(i => (
                               <div key={i} className="flex gap-md justify-between">
                                  <div className="flex gap-md">
                                     <div className="w-8 h-8 bg-white/5 rounded" />
                                     <div className="h-2 w-16 bg-white/5 mt-3" />
                                  </div>
                                  <div className="h-2 w-12 bg-white/5 mt-3" />
                               </div>
                            ))}
                         </div>
                      </div>
                   </div>

                   {/* Sidebar (1/3) */}
                   <div className="col-span-12 lg:col-span-4 space-y-lg">
                      {/* Reminders Sidebar Mockup */}
                      <div className="h-40 bg-white/[0.03] rounded-xl border border-white/5 p-md space-y-md">
                         <div className="h-3 w-20 bg-white/10 rounded" />
                         <div className="space-y-sm">
                            <div className="h-10 w-full bg-warm-gold/5 border border-warm-gold/10 rounded-lg" />
                            <div className="h-10 w-full bg-white/5 rounded-lg" />
                         </div>
                      </div>
                      {/* Insight Card Mockup */}
                      <div className="h-48 bg-gradient-to-br from-warm-gold/10 to-transparent rounded-xl border border-warm-gold/10 p-md flex flex-col justify-center items-center text-center space-y-md">
                     
                         <p className="text-xs italic text-warm-gold/60 max-w-[150px]">"Consistency is starting to compound. Your daily vitality signals are rising."</p>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </header>

      {/* SECTION 1: The Problem */}
      <section id="why" className="py-20 md:py-40 px-lg bg-warm-black relative">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-2xl items-center">
           <div className="space-y-lg order-2 lg:order-1">
              <h2 className="text-4xl md:text-6xl font-serif leading-tight">
                Fragmented Data. <br />
                <span className="italic text-gray-light">Fragmented Focus.</span>
              </h2>
              <div className="space-y-md">
                 {[
                   { t: "The Context Switch", d: "Money in one app, health in another, career plans elsewhere. Every switch drains your cognitive energy." },
                   { t: "Invisible Patterns", d: "Your spending, workouts, and work life are connected. When they live in silos, you miss the bigger picture." },
                   { t: "Signal vs. Noise", d: "Generic dashboards overwhelm you with data. You need a sanctuary that distills noise into actionable signals." }
                 ].map((item, i) => (
                   <div key={i} className="flex gap-md group">
                      <div className="mt-1 w-6 h-6 rounded-full border border-white/10 flex items-center justify-center text-warm-gold">
                         <span className="text-xs font-bold">{i+1}</span>
                      </div>
                      <div className="space-y-xs">
                         <h4 className="font-bold text-lg">{item.t}</h4>
                         <p className="text-gray-light/60 font-light">{item.d}</p>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
           <div className="relative order-1 lg:order-2 h-[400px] flex items-center justify-center">
              <div className="grid grid-cols-2 gap-md opacity-20">
                 <div className="p-xl bg-white/5 rounded-2xl border border-white/10"><RiWallet3Line size={40} /></div>
                 <div className="p-xl bg-white/5 rounded-2xl border border-white/10"><FiActivity size={40} /></div>
                 <div className="p-xl bg-white/5 rounded-2xl border border-white/10"><RiBriefcaseLine size={40} /></div>
                 <div className="p-xl bg-white/5 rounded-2xl border border-white/10"><RiNotification3Line size={40} /></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="px-lg py-md bg-warm-black border border-warm-gold/30 rounded-xl shadow-2xl text-warm-gold font-serif text-2xl italic">
                    The Fragmented Life
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* SECTION: How it Works */}
      <section className="py-20 md:py-40 px-lg bg-white/[0.01]">
         <div className="max-w-7xl mx-auto">
            <div className="text-center mb-2xl">
               <h2 className="text-4xl md:text-5xl font-serif">A System for Sovereign Living</h2>
               <p className="text-gray-light/60 mt-md">Capture the day, integrate the modules, and let your sanctuary reveal the path forward. <Link href="/about-os" className="text-warm-gold hover:underline">Explore the architecture.</Link></p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-xl">
               {[
                 { i: FiZap, t: "Capture Reality", d: "Log activities, financial flows, and career milestones as they happen, effortlessly." },
                 { i: RiStackLine, t: "Unify the Signals", d: "See your wealth, health, and professional growth in one cohesive, private workspace." },
                 { i: RiBriefcaseLine, t: "Distill the Path", d: "Human-readable insights help you identify momentum and recalibrate your trajectory." }
               ].map((step, i) => (
                 <div key={i} className="text-center space-y-lg p-xl bg-white/[0.02] rounded-3xl border border-white/[0.05]">
                    <div className="w-16 h-16 bg-warm-gold/10 rounded-2xl flex items-center justify-center text-warm-gold mx-auto">
                       <step.i size={32} />
                    </div>
                    <h3 className="text-2xl font-serif">{step.t}</h3>
                    <p className="text-gray-light/60 font-light">{step.d}</p>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* SECTION: The 4 Pillars */}
      <section className="py-20 md:py-40 px-lg">
         <div className="max-w-7xl mx-auto space-y-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-xl">
               {/* Pillar: Wealth */}
               <div className="group p-xl rounded-3xl bg-white/[0.02] border border-white/[0.05] hover:border-warm-gold/30 transition-all duration-500 space-y-lg">
                  <div className="w-14 h-14 rounded-2xl bg-warm-gold/10 flex items-center justify-center text-warm-gold">
                     <RiWallet3Line size={28} />
                  </div>
                  <div className="space-y-sm">
                     <h3 className="text-3xl font-serif">Financial Flow</h3>
                     <p className="text-gray-light/60 font-light leading-relaxed">
                        Audit your resources, track asset movement, and ensure your capital architecture aligns with your core mission.
                     </p>
                  </div>
                  <div className="flex items-center gap-sm text-warm-gold text-xs font-bold uppercase tracking-widest pt-md">
                     <RiCheckboxCircleLine size={14} />
                     <span>Inflow, Outflow, and Portfolio Signals</span>
                  </div>
               </div>

               {/* Pillar: Vitality */}
               <div className="group p-xl rounded-3xl bg-white/[0.02] border border-white/[0.05] hover:border-warm-gold/30 transition-all duration-500 space-y-lg">
                  <div className="w-14 h-14 rounded-2xl bg-warm-gold/10 flex items-center justify-center text-warm-gold">
                     <FiActivity size={28} />
                  </div>
                  <div className="space-y-sm">
                     <h3 className="text-3xl font-serif">Humanized Vitality</h3>
                     <p className="text-gray-light/60 font-light leading-relaxed">
                        Track sessions and personal bests through a human lens. Build a rhythm that supports your long-term growth.
                     </p>
                  </div>
                  <div className="flex items-center gap-sm text-warm-gold text-xs font-bold uppercase tracking-widest pt-md">
                     <RiCheckboxCircleLine size={14} />
                     <span>Session History and Performance Rhythms</span>
                  </div>
               </div>

               {/* Pillar: Mindfulness */}
               <div className="group p-xl rounded-3xl bg-white/[0.02] border border-white/[0.05] hover:border-warm-gold/30 transition-all duration-500 space-y-lg">
                  <div className="w-14 h-14 rounded-2xl bg-warm-gold/10 flex items-center justify-center text-warm-gold">
                     <RiHistoryLine size={28} />
                  </div>
                  <div className="space-y-sm">
                     <h3 className="text-3xl font-serif">Life Log & Timeline</h3>
                     <p className="text-gray-light/60 font-light leading-relaxed">
                        A persistent chronological spine for your existence. Log what matters, ignore what doesn't.
                     </p>
                  </div>
                  <div className="flex items-center gap-sm text-warm-gold text-xs font-bold uppercase tracking-widest pt-md">
                     <RiCheckboxCircleLine size={14} />
                     <span>Integrated Activity and Memory Capture</span>
                  </div>
               </div>

               {/* Pillar: Ambition */}
               <div className="group p-xl rounded-3xl bg-white/[0.02] border border-white/[0.05] hover:border-warm-gold/30 transition-all duration-500 space-y-lg">
                  <div className="w-14 h-14 rounded-2xl bg-warm-gold/10 flex items-center justify-center text-warm-gold">
                     <RiBriefcaseLine size={28} />
                  </div>
                  <div className="space-y-sm">
                     <div className="flex justify-between items-start">
                        <h3 className="text-3xl font-serif">Career Architect</h3>
                     </div>
                     <p className="text-gray-light/60 font-light leading-relaxed">
                        Design your professional trajectory. Organize applications and growth milestones within your personal system.
                     </p>
                  </div>
                  <div className="flex items-center gap-sm text-warm-gold text-xs font-bold uppercase tracking-widest pt-md">
                     <RiCheckboxCircleLine size={14} />
                     <span>Trajectory Mapping and Milestone Audit</span>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* SECTION: Trust & Privacy */}
      <section className="py-20 md:py-40 px-lg bg-warm-black border-y border-white/[0.03]">
         <div className="max-w-4xl mx-auto text-center space-y-xl">
            <div className="w-20 h-20 bg-white/[0.03] rounded-3xl flex items-center justify-center mx-auto text-warm-gold border border-white/[0.05]">
               <RiShieldCheckLine size={40} />
            </div>
            <h2 className="text-4xl md:text-5xl font-serif">Sovereignty Over Your Data.</h2>
            <p className="text-gray-light/60 text-lg font-light leading-relaxed">
              Your personal records belong in a private workspace, not a harvest for algorithms. TRASON ensures your sanctuary is strictly yours with end-to-end authentication and private cloud architecture.
            </p>
            <div className="flex flex-wrap justify-center gap-md pt-md">
               {["Zero Third-Party Tracking", "Encrypted Identity Records", "User-Owned Architecture"].map(f => (
                 <div key={f} className="text-[10px] uppercase tracking-widest font-bold text-warm-gold py-sm px-lg border border-warm-gold/20 rounded-full">
                    {f}
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* CTA: Final Word */}
      <section className="py-20 md:py-40 px-lg text-center space-y-xl">
         <h2 className="text-5xl md:text-7xl font-serif italic tracking-tight">Build the sanctuary <br /> your life deserves.</h2>
         <div className="max-w-xs mx-auto space-y-lg">
            <Link href="/signup">
               <button className="w-full bg-warm-gold text-warm-black px-3xl py-xl rounded-full font-bold text-xl hover:bg-soft-cream transition-all shadow-2xl hover:scale-105 active:scale-95">
                  Commence Initialization
               </button>
            </Link>
            <p className="text-micro text-gray-light/40 uppercase tracking-widest">No credit card required. Pure focus.</p>
         </div>
      </section>


      {/* Footer */}
      <footer className="py-20 px-lg border-t border-white/[0.03] bg-white/[0.01]">
        <div className="max-w-7xl mx-auto">
           <div className="flex flex-col md:flex-row justify-between items-center gap-xl pb-20">
              <div className="flex items-center gap-sm">
                <RiCompass3Line size={24} className="text-warm-gold" />
                <span className="font-serif text-2xl font-bold tracking-tight">TRASON</span>
              </div>
              <div className="flex gap-2xl flex-wrap justify-center">
                 <Link href="/about-os" className="text-sm font-medium text-gray-light/60 hover:text-warm-gold transition-colors">About Sanctuary</Link>
                 <Link href="/privacy" className="text-sm font-medium text-gray-light/60 hover:text-warm-gold transition-colors">Privacy</Link>
                 <Link href="/terms" className="text-sm font-medium text-gray-light/60 hover:text-warm-gold transition-colors">Terms</Link>
                 <Link href="/support" className="text-sm font-medium text-gray-light/60 hover:text-warm-gold transition-colors">Support</Link>
              </div>
           </div>
           <p className="text-[10px] uppercase tracking-[0.3em] text-gray-light/20 text-center">
              © 2026 TRASON - CRAFTED WITH INTENTION FOR HUMAN GROWTH.
           </p>
        </div>
      </footer>
    </div>
  );
}
