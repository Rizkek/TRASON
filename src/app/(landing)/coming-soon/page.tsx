

import React from 'react';
import Link from 'next/link';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { Construction, ArrowLeft } from 'lucide-react';

export default function ComingSoonPage() {
  return (
    <div className="min-h-screen bg-warm-black text-soft-cream font-sans relative overflow-x-hidden flex flex-col">
      <LandingNavbar />
      
      <main className="flex-1 flex flex-col items-center justify-center pt-32 pb-24 px-lg text-center relative z-10">
        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(255,255,255,0.05)] border border-white/10">
          <Construction className="text-warm-gold w-12 h-12" />
        </div>
        
        <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 tracking-tight">
          Coming Soon
        </h1>
        
        <p className="text-xl text-gray-light max-w-2xl mx-auto mb-10 leading-relaxed">
          Currently under development. We are working hard to bring this feature to life. Expected to launch soon.
        </p>
        
        <Link 
          href="/"
          className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-8 py-4 rounded-xl font-bold transition-all duration-300 border border-white/10 hover:border-white/20"
        >
          <ArrowLeft size={20} />
          Back to Home
        </Link>
      </main>

      <LandingFooter />
    </div>
  );
}
