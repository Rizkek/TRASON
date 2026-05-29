'use client';

import React from 'react';
import Link from 'next/link';
import { FiArrowLeft, FiZap, FiActivity } from 'react-icons/fi';
import { 
  RiCompass3Line, 
  RiCpuLine, 
  RiStackLine, 
  RiShieldCheckLine, 
  RiWallet3Line, 
  RiHistoryLine, 
  RiBriefcaseLine
} from 'react-icons/ri';

export default function AboutOS() {
  return (
    <div className="min-h-screen bg-warm-black text-soft-cream font-sans selection:bg-warm-gold/30 selection:text-soft-cream relative overflow-x-hidden">
      {/* Background Ambient Glows */}
      <div className="fixed top-[-10%] right-[-5%] w-[600px] h-[600px] bg-warm-gold/5 blur-[140px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-deep-sage/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-xl border-b border-white/[0.03]">
        <div className="max-w-7xl mx-auto px-lg md:px-2xl h-20 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-sm group cursor-pointer">
            <FiArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform text-warm-gold" />
            <span className="text-sm font-bold uppercase tracking-widest text-warm-gold">Back</span>
          </Link>
          <div className="flex items-center gap-sm">
            <div className="w-8 h-8 bg-warm-gold rounded-full flex items-center justify-center text-warm-black">
              <RiCompass3Line size={18} />
            </div>
            <span className="text-xl font-serif font-bold tracking-tight">TRASON</span>
          </div>
          <div className="w-20" /> {/* Spacer */}
        </div>
      </nav>

      <main className="pt-40 pb-20 px-lg">
        <div className="max-w-4xl mx-auto space-y-3xl">
          
          {/* Header */}
          <section className="space-y-xl text-center">
            <div className="inline-flex items-center gap-sm px-md py-xs rounded-full bg-warm-gold/10 border border-warm-gold/20 text-[10px] uppercase tracking-[0.3em] text-warm-gold">
              <RiCpuLine size={12} />
              <span>Personal OS Concept</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-serif leading-tight">
              What is a <br />
              <span className="italic text-warm-gold">Personal Sanctuary?</span>
            </h1>
            <p className="text-xl text-gray-light font-light leading-relaxed max-w-2xl mx-auto">
              Most digital tools are fragmented silos. TRASON is a unified environment where your wealth, vitality, and professional architecture exist in one private, seamless system.
            </p>
          </section>

          {/* The Concept: Modular but Unified */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-2xl items-center">
            <div className="space-y-lg">
              <h2 className="text-3xl md:text-4xl font-serif">Architecture for Life</h2>
              <p className="text-gray-light leading-relaxed font-light">
                TRASON employs a <strong>Modular Mesh Architecture</strong>. Instead of a rigid, bloated dashboard, you interact with specialized modules that plug into a central chronological spine: The Life Log.
              </p>
              <div className="space-y-md pt-md">
                <div className="flex gap-md">
                  <div className="mt-1 text-warm-gold"><RiStackLine size={20} /></div>
                  <div>
                    <h4 className="font-bold">The Core Spine</h4>
                    <p className="text-sm text-gray-light/60">A unified Life Log that captures every signal from your integrated modules.</p>
                  </div>
                </div>
                <div className="flex gap-md">
                  <div className="mt-1 text-warm-gold"><FiZap size={20} /></div>
                  <div>
                    <h4 className="font-bold">The Modular Edge</h4>
                    <p className="text-sm text-gray-light/60">Deep-dive tools for Finance, Vitality, and Career that share a single design language.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative aspect-square bg-white/[0.02] border border-white/[0.05] rounded-[3rem] p-xl flex items-center justify-center">
               {/* Visual representation of sanctuary architecture */}
               <div className="relative w-full h-full border border-warm-gold/20 rounded-full animate-[spin_20s_linear_infinite]">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-gray-strong border border-warm-gold/50 rounded-xl flex items-center justify-center text-warm-gold"><RiWallet3Line size={20} /></div>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-12 h-12 bg-gray-strong border border-warm-gold/50 rounded-xl flex items-center justify-center text-warm-gold"><FiActivity size={20} /></div>
                  <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-gray-strong border border-warm-gold/50 rounded-xl flex items-center justify-center text-warm-gold"><RiHistoryLine size={20} /></div>
                  <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-gray-strong border border-warm-gold/50 rounded-xl flex items-center justify-center text-warm-gold"><RiBriefcaseLine size={20} /></div>
               </div>
               <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 bg-warm-gold rounded-full flex items-center justify-center text-warm-black shadow-[0_0_50px_rgba(244,201,93,0.3)]">
                    <RiCompass3Line size={40} />
                  </div>
               </div>
            </div>
          </section>

          {/* Why "Personal Sanctuary"? */}
          <section className="bg-white/[0.02] border border-white/[0.05] rounded-[2rem] p-xl md:p-3xl space-y-xl">
             <h2 className="text-3xl md:text-4xl font-serif text-center">Principles of the Sanctuary</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-xl">
                <div className="space-y-md">
                   <h4 className="text-warm-gold font-bold uppercase tracking-widest text-xs">01. Single Source of Truth</h4>
                   <p className="text-gray-light font-light">Your life isn't lived in silos, so your data shouldn't be either. TRASON provides a single, high-fidelity mirror of your daily reality.</p>
                </div>
                <div className="space-y-md">
                   <h4 className="text-warm-gold font-bold uppercase tracking-widest text-xs">02. Cross-Module Context</h4>
                   <p className="text-gray-light font-light">Understand how your financial flows affect your vitality, and how your career milestones align with your daily habits.</p>
                </div>
                <div className="space-y-md">
                   <h4 className="text-warm-gold font-bold uppercase tracking-widest text-xs">03. Absolute Privacy</h4>
                   <p className="text-gray-light font-light">Your records are architected with sovereign security. Row-Level Access ensures your sanctuary remains strictly yours.</p>
                </div>
                <div className="space-y-md">
                   <h4 className="text-warm-gold font-bold uppercase tracking-widest text-xs">04. Emergent Growth</h4>
                   <p className="text-gray-light font-light">As you evolve, the system evolves. New modules integrate without friction, preserving your historical continuity.</p>
                </div>
             </div>
          </section>

          {/* The Pillars Detail */}
          <section className="space-y-2xl">
            <h2 className="text-3xl md:text-5xl font-serif text-center">Modular Pillars</h2>
            <div className="space-y-lg">
               {[
                 { t: "Life Log (Core)", d: "The chronological spine of your existence. Every log, from a financial inflow to a session of vitality, is recorded here.", i: RiHistoryLine },
                 
                 { t: "Integrated Mesh", d: "Specific environments for Financial Flow, Vitality, and Career Architect that share the same design DNA.", i: RiStackLine }
               ].map((item, i) => (
                 <div key={i} className="flex flex-col md:flex-row gap-xl p-xl border-b border-white/5 items-center">
                    <div className="w-12 h-12 text-warm-gold shrink-0"><item.i size={48} /></div>
                    <div className="space-y-sm">
                       <h3 className="text-2xl font-serif">{item.t}</h3>
                       <p className="text-gray-light font-light">{item.d}</p>
                    </div>
                 </div>
               ))}
            </div>
          </section>

          {/* CTA */}
          <section className="text-center space-y-xl pt-2xl">
            <h2 className="text-4xl md:text-6xl font-serif italic">Begin your <br /> Architecture.</h2>
            <Link href="/signup">
               <button className="bg-warm-gold text-warm-black px-3xl py-xl rounded-full font-bold text-xl hover:bg-soft-cream transition-all shadow-2xl">
                  Commence Initialization
               </button>
            </Link>
          </section>

        </div>
      </main>

      {/* Footer */}
      <footer className="py-20 px-lg border-t border-white/[0.03] text-center">
        <p className="text-[10px] uppercase tracking-[0.3em] text-gray-light/20">
          TRASON — ARCHITECTED FOR THE SOVEREIGN INDIVIDUAL.
        </p>
      </footer>

    </div>
  );
}
