

import React from 'react';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { Map, Flag, Rocket, CheckCircle2, CircleDashed, Clock } from 'lucide-react';

export default function RoadmapPage() {
  return (
    <div className="min-h-screen bg-warm-black text-soft-cream font-sans relative overflow-x-hidden">
      {/* Dynamic Backgrounds */}
      <div className="fixed top-[-20%] left-[50%] -translate-x-1/2 w-[800px] h-[800px] bg-warm-gold/5 blur-[160px] rounded-full pointer-events-none" />

      <LandingNavbar />

      <main className="pt-32 md:pt-48 pb-24 px-lg max-w-7xl mx-auto space-y-24">
        {/* Presentation Header */}
        <div className="text-center space-y-6 max-w-3xl mx-auto relative z-10">
           <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-warm-gold/10 text-yellow-500 border border-warm-gold/20 text-sm font-bold mb-4">
             <Map size={16} /> Product Evolution
           </div>
           <h1 className="text-4xl md:text-6xl font-serif leading-tight">
             The <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-yellow-200">Roadmap.</span>
           </h1>
           <p className="text-lg text-gray-light font-light leading-relaxed">
             We build in public. See exactly what we're working on, what's coming next, and the features we've recently shipped.
           </p>
        </div>

        {/* Kanban Board Container */}
        <div className="relative z-10 mx-auto w-full max-w-[1200px]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Column 1: Recently Shipped */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-b border-white/10 pb-4">
                <CheckCircle2 size={20} className="text-warm-gold" />
                <h2 className="text-xl font-bold text-white">Recently Shipped</h2>
                <span className="ml-auto text-xs font-bold bg-white/10 px-2 py-1 rounded">Q2 2026</span>
              </div>
              <div className="space-y-4">
                {[
                  { title: 'Multi-Currency Support', desc: 'Real-time FX conversion for all connected bank accounts.' },
                  { title: 'Habit Heatmaps', desc: 'GitHub-style contribution graphs for daily routines.' },
                  { title: 'Smart Reminders Engine', desc: 'Context-aware notifications that respect focus hours.' },
                ].map((item, i) => (
                  <div key={i} className="bg-white/5 border border-white/5 rounded-2xl p-6 hover:border-warm-gold/30 transition-colors">
                    <h3 className="font-bold text-white mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-light">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 2: In Progress (Active) */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-b border-white/10 pb-4">
                <Rocket size={20} className="text-warm-gold animate-pulse" />
                <h2 className="text-xl font-bold text-white">In Progress</h2>
                <span className="ml-auto text-xs font-bold bg-warm-gold/20 text-warm-gold px-2 py-1 rounded">Active</span>
              </div>
              <div className="space-y-4">
                {[
                  { title: 'Crypto Wallet Integration', desc: 'Native support for tracking Web3 assets across EVM chains.' },
                  { title: 'Career CRM Upgrades', desc: 'Adding interview recording attachments and compensation negotiation playbooks.' },
                ].map((item, i) => (
                  <div key={i} className="bg-warm-gold/5 border border-warm-gold/20 rounded-2xl p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-warm-gold/10 blur-2xl rounded-full" />
                    <div className="relative z-10">
                      <h3 className="font-bold text-white mb-2 flex items-center gap-2">{item.title}</h3>
                      <p className="text-sm text-gray-light mb-4">{item.desc}</p>
                      <div className="w-full bg-black/50 rounded-full h-1.5 mb-1">
                        <div className="bg-warm-gold h-1.5 rounded-full" style={{ width: '65%' }} />
                      </div>
                      <p className="text-[10px] text-warm-gold/70 text-right">65% Complete</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 3: Up Next */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-b border-white/10 pb-4">
                <Clock size={20} className="text-warm-gold" />
                <h2 className="text-xl font-bold text-white">Up Next</h2>
                <span className="ml-auto text-xs font-bold bg-white/10 px-2 py-1 rounded">Q3 2026</span>
              </div>
              <div className="space-y-4">
                {[
                  { title: 'Mobile App (iOS/Android)', desc: 'Native applications with offline support and widgets.' },
                  { title: 'Automated Tax Forecasting', desc: 'Predict end-of-year tax liabilities based on current income trajectory.' },
                  { title: 'Public API', desc: 'Build your own integrations on top of the TRASON Nexus Engine.' },
                ].map((item, i) => (
                  <div key={i} className="bg-white/5 border border-white/5 rounded-2xl p-6 border-dashed opacity-70 hover:opacity-100 hover:border-warm-gold/30 transition-all cursor-default">
                    <h3 className="font-bold text-white mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-light">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </main>

      <LandingFooter />
    </div>
  );
}
