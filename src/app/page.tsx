'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { Button, Loading } from '@/components';
import { 
  ArrowUpRight, 
  Sparkles, 
  Wallet, 
  History, 
  BellRing, 
  BrainCircuit,
  Compass
} from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-warm-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-md animate-pulse">
          <div className="w-12 h-12 rounded-full border-2 border-warm-gold/20 border-t-warm-gold animate-spin" />
          <p className="text-micro font-sans tracking-[0.3em] uppercase text-warm-gold/60">Preparing your space</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-warm-black text-soft-cream font-sans selection:bg-warm-gold/30 selection:text-soft-cream relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="fixed top-[-10%] right-[-5%] w-[500px] h-[500px] bg-deep-sage/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-warm-gold/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-md border-b border-white/[0.03]">
        <div className="max-w-7xl mx-auto px-lg md:px-2xl h-20 flex justify-between items-center">
          <div className="flex items-center gap-sm group">
            <div className="w-8 h-8 bg-warm-gold rounded-full flex items-center justify-center text-warm-black transform group-hover:rotate-12 transition-transform duration-500">
              <Compass size={18} />
            </div>
            <span className="text-xl font-serif font-medium tracking-tight">TRASON</span>
          </div>
          
          <div className="flex items-center gap-lg">
            <Link href="/login" className="text-sm font-medium hover:text-warm-gold transition-colors hidden md:block">
              Log in
            </Link>
            <Link href="/signup">
              <button className="bg-soft-cream text-warm-black px-xl py-sm rounded-full text-sm font-semibold hover:bg-warm-gold transition-all duration-300">
                Get Started
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative pt-32 pb-2xl md:pt-48 md:pb-4xl px-lg">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-2xl items-center">
            {/* Hero Text */}
            <div className="lg:col-span-7 space-y-xl animate-slide-up">
              <div className="inline-flex items-center gap-sm px-md py-xs rounded-full bg-white/[0.03] border border-white/[0.08] text-micro uppercase tracking-widest text-warm-gold">
                <Sparkles size={12} />
                <span>Your Digital Living Space</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif leading-[1.1] tracking-tight">
                Self-Improvement, <br />
                <span className="italic text-warm-gold">Redefined.</span>
              </h1>
              
              <p className="text-lg md:text-xl text-gray-very-light/70 max-w-xl leading-relaxed font-light">
                TRASON isn't just a tracker. It's a sanctuary for your growth—where numbers become narratives and habits become self-discovery.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-md pt-md">
                <Link href="/signup">
                  <button className="w-full sm:w-auto bg-warm-gold text-warm-black px-2xl py-md rounded-full font-bold flex items-center justify-center gap-sm group hover:scale-105 transition-transform shadow-xl shadow-warm-gold/20">
                    Start Your Journey
                    <ArrowUpRight size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </button>
                </Link>
                <Link href="#features">
                  <button className="w-full sm:w-auto bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] text-soft-cream px-2xl py-md rounded-full font-medium transition-all">
                    Explore Features
                  </button>
                </Link>
              </div>
            </div>

            {/* Hero Visual - Floating Cards */}
            <div className="lg:col-span-5 relative hidden lg:block h-[500px]">
              <div className="absolute top-0 right-0 w-64 h-80 bg-deep-sage/20 backdrop-blur-3xl rounded-lg border border-white/[0.1] rotate-6 transform animate-float shadow-2xl overflow-hidden p-xl">
                 <div className="w-8 h-8 bg-soft-cream/10 rounded-full mb-md" />
                 <div className="h-4 w-3/4 bg-soft-cream/10 rounded-full mb-sm" />
                 <div className="h-4 w-1/2 bg-soft-cream/10 rounded-full mb-xl" />
                 <div className="space-y-sm">
                   {[1,2,3].map(i => <div key={i} className="h-12 w-full bg-white/5 rounded-md" />)}
                 </div>
              </div>
              
              <div className="absolute bottom-10 left-0 w-72 h-48 bg-warm-gold/10 backdrop-blur-2xl rounded-lg border border-white/[0.1] -rotate-12 transform animate-float shadow-2xl p-xl [animation-delay:1.5s]">
                <div className="flex justify-between items-start mb-lg">
                  <Wallet size={24} className="text-warm-gold" />
                  <div className="text-right">
                    <p className="text-micro opacity-40 uppercase">Net Worth</p>
                    <p className="text-xl font-serif">$12,450.00</p>
                  </div>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full w-2/3 bg-warm-gold opacity-50" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section - Asymmetric Grid */}
      <section id="features" className="py-4xl px-lg relative">
        <div className="max-w-7xl mx-auto">
          <div className="mb-3xl max-w-2xl">
            <h2 className="text-4xl md:text-5xl mb-md">Holistic growth requires <br /> a <span className="italic text-deep-sage">unified perspective.</span></h2>
            <p className="text-gray-light font-light text-lg">Four pillars designed to help you understand where you are, and where you're going.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-xl">
            {[
              { 
                title: 'Finance Tracker', 
                desc: 'Beyond accounting. Understand the relationship between your spending and your happiness.',
                icon: Wallet,
                color: 'text-income',
                delay: '0s'
              },
              { 
                title: 'Daily Schedule', 
                desc: 'Plan your day, log what happened, and spot your strongest energy windows.',
                icon: History,
                color: 'text-energy',
                delay: '0.1s'
              },
              { 
                title: 'Mindful Reminders', 
                desc: 'Gentle nudges for the things that matter, without the anxiety of traditional alerts.',
                icon: BellRing,
                color: 'text-deep-sage',
                delay: '0.2s'
              },
              { 
                title: 'Narrative Insights', 
                desc: 'Our analyzer connects the dots between your activities and your financial health.',
                icon: BrainCircuit,
                color: 'text-warm-gold',
                delay: '0.3s'
              }
            ].map((f, i) => (
              <div 
                key={i} 
                className="group p-xl rounded-lg bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.15] transition-all duration-500 hover:-translate-y-2"
                style={{ transitionDelay: f.delay }}
              >
                <div className={`w-12 h-12 rounded-full bg-white/[0.03] flex items-center justify-center mb-xl ${f.color} group-hover:scale-110 transition-transform`}>
                  <f.icon size={24} />
                </div>
                <h3 className="text-xl mb-md font-serif">{f.title}</h3>
                <p className="text-sm text-gray-light leading-relaxed font-light">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-4xl px-lg bg-white/[0.01] border-y border-white/[0.03]">
        <div className="max-w-4xl mx-auto text-center space-y-xl">
          <h2 className="text-4xl md:text-5xl italic font-serif leading-tight">
            "Your life isn't a spreadsheet. <br /> It's a story."
          </h2>
          <p className="text-gray-light max-w-2xl mx-auto font-light leading-relaxed">
            TRASON was built on the belief that self-improvement shouldn't feel like a chore. We provide the tools to track, but more importantly, the space to reflect.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-2xl px-lg">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-xl border-t border-white/[0.03] pt-2xl">
          <div className="flex items-center gap-sm">
            <Compass size={20} className="text-warm-gold" />
            <span className="font-serif text-lg tracking-tight">TRASON</span>
          </div>
          <p className="text-micro uppercase tracking-[0.2em] text-gray-light opacity-50 text-center">
            © 2026 Crafted with intention. Privacy is a right, not a feature.
          </p>
          <div className="flex gap-lg">
             <Link href="#" className="text-micro uppercase tracking-widest hover:text-warm-gold transition-colors">Privacy</Link>
             <Link href="#" className="text-micro uppercase tracking-widest hover:text-warm-gold transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
