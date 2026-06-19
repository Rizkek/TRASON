

import React from 'react';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { Check, X } from 'lucide-react';
import Link from 'next/link';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-warm-black text-soft-cream font-sans relative overflow-x-hidden">
      <LandingNavbar />
      
      <main className="pt-32 md:pt-48 pb-24 px-lg max-w-7xl mx-auto space-y-16">
        <div className="text-center space-y-md max-w-3xl mx-auto">
           <h1 className="text-5xl md:text-7xl font-serif">Simple, transparent pricing</h1>
           <p className="text-xl text-gray-light/60">Start for free, upgrade when you need more power. No hidden fees.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Tier */}
          <div className="bg-black/20 border border-white/5 rounded-3xl p-8 flex flex-col">
            <h2 className="text-2xl font-bold font-serif mb-2">Basic</h2>
            <p className="text-gray-light text-sm mb-6">Perfect for getting started and organizing your life.</p>
            <div className="text-5xl font-bold text-white mb-8">
              $0<span className="text-lg text-gray-light font-normal">/mo</span>
            </div>
            
            <ul className="space-y-4 mb-12 flex-1">
              <li className="flex items-center gap-3 text-gray-light">
                <Check size={18} className="text-emerald-400" />
                <span>Basic Financial Tracking</span>
              </li>
              <li className="flex items-center gap-3 text-gray-light">
                <Check size={18} className="text-emerald-400" />
                <span>Habit Heatmaps</span>
              </li>
              <li className="flex items-center gap-3 text-gray-light">
                <Check size={18} className="text-emerald-400" />
                <span>Career Pipeline (Up to 10)</span>
              </li>
              <li className="flex items-center gap-3 text-gray-light/40">
                <X size={18} />
                <span>Advanced AI Insights</span>
              </li>
              <li className="flex items-center gap-3 text-gray-light/40">
                <X size={18} />
                <span>Investment Sync</span>
              </li>
            </ul>

            <Link href="/signup">
              <button className="w-full bg-white/5 border border-white/10 text-white font-bold py-4 rounded-xl hover:bg-white/10 transition-colors">
                Get Started for Free
              </button>
            </Link>
          </div>

          {/* Pro Tier */}
          <div className="bg-gradient-to-br from-warm-gold/20 to-black/20 border border-warm-gold/30 rounded-3xl p-8 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-warm-gold text-warm-black text-xs font-bold px-4 py-1 rounded-bl-xl">
              RECOMMENDED
            </div>
            <h2 className="text-2xl font-bold font-serif mb-2 text-warm-gold">Pro</h2>
            <p className="text-gray-light text-sm mb-6">For power users who want deep analytics and automation.</p>
            <div className="text-5xl font-bold text-white mb-8">
              $9<span className="text-lg text-gray-light font-normal">/mo</span>
            </div>
            
            <ul className="space-y-4 mb-12 flex-1">
              <li className="flex items-center gap-3 text-gray-light">
                <Check size={18} className="text-warm-gold" />
                <span className="font-bold text-white">Everything in Basic</span>
              </li>
              <li className="flex items-center gap-3 text-gray-light">
                <Check size={18} className="text-warm-gold" />
                <span>Unlimited Career Pipeline</span>
              </li>
              <li className="flex items-center gap-3 text-gray-light">
                <Check size={18} className="text-warm-gold" />
                <span>Advanced AI Insights & Correlations</span>
              </li>
              <li className="flex items-center gap-3 text-gray-light">
                <Check size={18} className="text-warm-gold" />
                <span>Investment & Crypto Sync</span>
              </li>
              <li className="flex items-center gap-3 text-gray-light">
                <Check size={18} className="text-warm-gold" />
                <span>Priority Support</span>
              </li>
            </ul>

            <Link href="/signup">
              <button className="w-full bg-warm-gold text-warm-black font-bold py-4 rounded-xl hover:scale-[1.02] transition-transform shadow-lg shadow-warm-gold/20">
                Upgrade to Pro
              </button>
            </Link>
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
