

import React from 'react';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { Target, BellRing, BrainCircuit, BellOff, VolumeX, Shield, ArrowRight, Zap } from 'lucide-react';
import Link from 'next/link';

export default function SignalRemindersPage() {
  return (
    <div className="min-h-screen bg-warm-black text-soft-cream font-sans relative overflow-x-hidden">
      {/* Background Gradients */}
      <div className="fixed top-[-20%] left-[50%] -translate-x-1/2 w-[800px] h-[800px] bg-warm-gold/5 md:blur-[160px] rounded-full pointer-events-none" style={{ transform: 'translateZ(0)', contain: 'strict' }} />
      <div className="fixed bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-yellow-500/5 md:blur-[140px] rounded-full pointer-events-none" style={{ transform: 'translateZ(0)', contain: 'strict' }} />

      <LandingNavbar />

      <main className="pt-32 md:pt-48 pb-24 px-lg max-w-7xl mx-auto space-y-32">
        {/* Hero Section */}
        <div className="text-center space-y-md max-w-4xl mx-auto relative z-10">
           <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-warm-gold/10 text-yellow-500 border border-warm-gold/20 text-sm font-bold mb-6">
             <Target size={16} /> Signal Reminders
           </div>
           <h1 className="text-5xl md:text-7xl font-serif leading-tight">
             Separate the <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-yellow-200">Signal</span> from the Noise.
           </h1>
           <p className="text-xl text-gray-light/80 max-w-2xl mx-auto font-light leading-relaxed">
             A smart reminder system that respects your attention. Get alerted only when it truly matters, with context-aware nudges that adapt to your schedule.
           </p>
           <div className="pt-8 flex items-center justify-center gap-4">
             <Link href="/signup">
               <button className="bg-warm-gold text-warm-black px-8 py-4 rounded-xl font-bold hover:bg-yellow-500 transition-colors shadow-[0_0_30px_rgba(245,158,11,0.3)]">
                 Control Your Attention
               </button>
             </Link>
           </div>
        </div>

        {/* Complex UI Mockup Section */}
        <div className="relative z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-warm-gold/20 to-transparent md:blur-3xl opacity-30 rounded-[3rem]" style={{ transform: 'translateZ(0)' }} />
          <div className="relative bg-black/60 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-6 md:p-12 shadow-2xl overflow-hidden flex flex-col items-center">
             
             {/* Mock Header */}
             <div className="text-center mb-16">
               <h2 className="text-3xl font-serif text-white tracking-tight mb-4">Intelligent Notification Engine</h2>
               <div className="inline-flex items-center gap-2 bg-warm-gold/10 border border-warm-gold/20 text-yellow-500 px-4 py-1.5 rounded-full text-xs font-bold">
                 <Shield size={14} /> 24 Notifications Blocked Today
               </div>
             </div>

             {/* Phone Notification Mockup */}
             <div className="w-full max-w-sm mx-auto space-y-4">
               
               {/* Important Notification (Signal) */}
               <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-5 shadow-2xl transform scale-105 relative z-20">
                 <div className="flex justify-between items-center mb-3">
                   <div className="flex items-center gap-2">
                     <div className="w-6 h-6 rounded-md bg-warm-gold flex items-center justify-center text-black">
                       <Zap size={14} />
                     </div>
                     <span className="text-xs font-bold text-white/50 uppercase tracking-widest">Trason Signal</span>
                   </div>
                   <span className="text-xs text-white/50">Just now</span>
                 </div>
                 <h4 className="font-bold text-white mb-1">Final Interview in 30 mins</h4>
                 <p className="text-sm text-gray-200">System Design with Stripe. Review your architecture notes now.</p>
                 <div className="mt-4 flex gap-2">
                   <button className="flex-1 bg-warm-gold text-black rounded-xl py-2 text-xs font-bold">Open Notes</button>
                   <button className="flex-1 bg-white/10 text-white rounded-xl py-2 text-xs font-bold">Snooze 10m</button>
                 </div>
               </div>

               {/* Blocked/Batched Notification (Noise) */}
               <div className="bg-white/5 backdrop-blur-xl border border-white/5 rounded-3xl p-5 shadow-lg opacity-60">
                 <div className="flex justify-between items-center mb-3">
                   <div className="flex items-center gap-2">
                     <div className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center text-gray-400">
                       <BellOff size={14} />
                     </div>
                     <span className="text-xs font-bold text-white/30 uppercase tracking-widest">Batched (Low Priority)</span>
                   </div>
                   <span className="text-xs text-white/30">2 hours ago</span>
                 </div>
                 <h4 className="font-bold text-gray-400 mb-1">Habit Reminder</h4>
                 <p className="text-sm text-gray-500">Don't forget your evening reading.</p>
                 <div className="mt-3">
                   <span className="text-[10px] text-warm-gold/50 bg-warm-gold/10 px-2 py-1 rounded">Delivered silently during Focus Mode</span>
                 </div>
               </div>

             </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 py-16">
          <div className="space-y-6">
            <div className="w-12 h-12 bg-warm-gold/10 text-yellow-500 flex items-center justify-center rounded-2xl">
              <BrainCircuit size={24} />
            </div>
            <h3 className="text-3xl font-serif text-white">Context-Aware Nudges</h3>
            <p className="text-gray-light leading-relaxed">
              TRASON knows if you're in deep work. Low-priority habits and reminders are batched and delivered silently, while only critical signals bypass your focus barriers.
            </p>
          </div>
          <div className="space-y-6">
            <div className="w-12 h-12 bg-yellow-500/10 text-yellow-400 flex items-center justify-center rounded-2xl">
              <BellRing size={24} />
            </div>
            <h3 className="text-3xl font-serif text-white">Recurring Obligations</h3>
            <p className="text-gray-light leading-relaxed">
              Set up complex recurring rules for bill payments, subscription renewals, or monthly reviews. Never miss a deadline, but don't let it clutter your daily view.
            </p>
          </div>
          <div className="space-y-6">
            <div className="w-12 h-12 bg-warm-gold/10 text-yellow-500 flex items-center justify-center rounded-2xl">
              <VolumeX size={24} />
            </div>
            <h3 className="text-3xl font-serif text-white">Intelligent Snooze</h3>
            <p className="text-gray-light leading-relaxed">
              Don't just snooze for "10 minutes". TRASON lets you defer tasks logically: "Remind me when I get home", "Next weekend", or "When I open my laptop".
            </p>
          </div>
          <div className="space-y-6">
            <div className="w-12 h-12 bg-red-500/10 text-red-400 flex items-center justify-center rounded-2xl">
              <Target size={24} />
            </div>
            <h3 className="text-3xl font-serif text-white">Life Score Integration</h3>
            <p className="text-gray-light leading-relaxed">
              Reminders adapt based on your Life Score. If your vitality is low, TRASON automatically reduces the volume of ambitious habit nudges to help you recover.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="py-24 text-center space-y-8 bg-white/5 border border-white/5 rounded-[3rem] relative overflow-hidden">
          <div className="absolute inset-0 bg-warm-gold/10 md:blur-[100px]" style={{ transform: 'translateZ(0)' }} />
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-serif text-white mb-6">Reclaim your focus.</h2>
            <p className="text-gray-light max-w-xl mx-auto mb-10">
              Stop letting notifications dictate your life. Start telling them when to arrive.
            </p>
            <Link href="/signup">
              <button className="bg-white text-black px-8 py-4 rounded-xl font-bold flex items-center gap-2 mx-auto hover:bg-gray-200 transition-colors">
                Setup Smart Reminders <ArrowRight size={18} />
              </button>
            </Link>
          </div>
        </div>

      </main>

      <LandingFooter />
    </div>
  );
}
