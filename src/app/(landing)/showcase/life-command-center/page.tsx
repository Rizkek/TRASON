'use client';

import React from 'react';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { Network, Server, Share2, Layers, Cpu, Zap, ArrowRight, Activity, Briefcase, PieChart, Shield } from 'lucide-react';
import Link from 'next/link';

export default function LifeCommandCenterPage() {
  return (
    <div className="min-h-screen bg-warm-black text-soft-cream font-sans relative overflow-x-hidden">
      {/* Dynamic Backgrounds */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-warm-gold/5 blur-[200px] rounded-full pointer-events-none" />

      <LandingNavbar />

      <main className="pt-32 md:pt-48 pb-24 px-lg max-w-7xl mx-auto space-y-24">
        {/* Presentation Header */}
        <div className="text-center space-y-6 max-w-3xl mx-auto relative z-10">
           <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-warm-gold/10 text-yellow-500 border border-warm-gold/20 text-sm font-bold mb-4">
             <Network size={16} /> Data Architecture
           </div>
           <h1 className="text-4xl md:text-6xl font-serif leading-tight">
             The <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-yellow-200">Command Center.</span>
           </h1>
           <p className="text-lg text-gray-light font-light leading-relaxed">
             See how your financial data, career progress, and physical vitality interlock to form a complete, holistic picture of your life's trajectory.
           </p>
        </div>

        {/* Bento Box Architecture Showcase */}
        <div className="relative z-10 mx-auto w-full max-w-[1000px]">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[250px]">
            
            {/* Central Hub (Takes 2x2 on desktop ideally, or just center focus) */}
            <div className="md:col-span-2 md:row-span-2 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 md:p-12 shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-warm-gold/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
              
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <h2 className="text-3xl font-serif text-white tracking-tight mb-2">The Nexus Engine</h2>
                  <p className="text-gray-400 max-w-md">Our proprietary system ingests streams from all sub-modules, correlating your habits with your financial success and career velocity.</p>
                </div>

                <div className="flex items-center justify-center py-8">
                  <div className="relative">
                    {/* Glowing Core */}
                    <div className="w-32 h-32 rounded-full bg-warm-gold/20 blur-xl absolute inset-0 animate-pulse" />
                    <div className="w-32 h-32 rounded-full bg-black border border-warm-gold/50 flex items-center justify-center relative z-10 shadow-[0_0_50px_rgba(99,102,241,0.2)]">
                      <Cpu size={48} className="text-yellow-500" />
                    </div>

                    {/* Orbiting Elements (simulated with CSS for the mockup) */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-white/5 rounded-full" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-white/5 rounded-full border-dashed" />
                  </div>
                </div>
              </div>
            </div>

            {/* Finance Module */}
            <div className="bg-black/60 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-warm-gold/10 blur-2xl group-hover:bg-warm-gold/20 transition-colors" />
              <div className="relative z-10 h-full flex flex-col">
                <div className="w-10 h-10 rounded-xl bg-warm-gold/10 text-yellow-500 flex items-center justify-center mb-4 shrink-0">
                  <PieChart size={20} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Capital Input</h3>
                <p className="text-sm text-gray-500 flex-1">Aggregates spending patterns and investment growth rates.</p>
                <div className="mt-4 flex items-center gap-2 text-xs text-yellow-500/80 font-bold bg-warm-gold/10 self-start px-3 py-1.5 rounded-lg">
                  <Zap size={14} /> Live Sync
                </div>
              </div>
            </div>

            {/* Career Module */}
            <div className="bg-black/60 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-warm-gold/10 blur-2xl group-hover:bg-warm-gold/20 transition-colors" />
              <div className="relative z-10 h-full flex flex-col">
                <div className="w-10 h-10 rounded-xl bg-warm-gold/10 text-yellow-500 flex items-center justify-center mb-4 shrink-0">
                  <Briefcase size={20} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Career Input</h3>
                <p className="text-sm text-gray-500 flex-1">Tracks pipeline velocity, interview conversion, and skill gaps.</p>
                <div className="mt-4 flex items-center gap-2 text-xs text-yellow-500/80 font-bold bg-warm-gold/10 self-start px-3 py-1.5 rounded-lg">
                  <Zap size={14} /> Live Sync
                </div>
              </div>
            </div>

            {/* Vitality Module */}
            <div className="bg-black/60 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-warm-gold/10 blur-2xl group-hover:bg-warm-gold/20 transition-colors" />
              <div className="relative z-10 h-full flex flex-col">
                <div className="w-10 h-10 rounded-xl bg-warm-gold/10 text-yellow-500 flex items-center justify-center mb-4 shrink-0">
                  <Activity size={20} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Vitality Input</h3>
                <p className="text-sm text-gray-500 flex-1">Monitors sleep duration, workout consistency, and habit adherence.</p>
                <div className="mt-4 flex items-center gap-2 text-xs text-yellow-500/80 font-bold bg-warm-gold/10 self-start px-3 py-1.5 rounded-lg">
                  <Zap size={14} /> Live Sync
                </div>
              </div>
            </div>

            {/* Security/Privacy */}
            <div className="md:col-span-2 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center gap-8 group">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-500/5 to-transparent opacity-50" />
              <div className="w-20 h-20 shrink-0 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 relative z-10">
                <Shield size={32} />
              </div>
              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-white mb-2">Bank-Grade Encryption</h3>
                <p className="text-gray-400 text-sm">Because the Nexus Engine connects everything, we protect your data with AES-256 encryption. Your life's data is yours alone.</p>
              </div>
            </div>

          </div>
        </div>

        {/* CTA */}
        <div className="py-24 text-center space-y-8 relative z-10">
          <Link href="/signup">
            <button className="bg-white text-black px-8 py-4 rounded-xl font-bold flex items-center gap-2 mx-auto hover:bg-gray-200 transition-colors shadow-[0_0_40px_rgba(255,255,255,0.2)]">
              Build Your Command Center <ArrowRight size={18} />
            </button>
          </Link>
        </div>

      </main>

      <LandingFooter />
    </div>
  );
}
