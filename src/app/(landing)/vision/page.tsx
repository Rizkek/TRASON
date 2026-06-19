

import React from 'react';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { LandingFooter } from '@/components/landing/LandingFooter';

export default function VisionPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-soft-cream font-sans relative overflow-x-hidden selection:bg-warm-gold/30 selection:text-white">
      {/* Subtle Grain Overlay (simulated with CSS) */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("https://upload.wikimedia.org/wikipedia/commons/7/76/1k_Dissolve_Noise_Texture.png")' }} />

      <LandingNavbar />

      {/* Editorial Content */}
      <main className="pt-48 md:pt-64 pb-32 px-6 md:px-12 max-w-4xl mx-auto">
        
        <article className="space-y-32">
          
          {/* Manifesto Header */}
          <header className="space-y-12">
            <h1 className="text-5xl md:text-8xl font-serif leading-[1.1] tracking-tight text-white">
              App fatigue <br />
              <span className="text-gray-500 italic">is killing our focus.</span>
            </h1>
            <p className="text-xl md:text-3xl text-gray-400 font-light leading-relaxed max-w-2xl">
              We live in the most technologically advanced era in human history, yet we've never been more scattered.
            </p>
          </header>

          {/* Core Problem */}
          <section className="space-y-8">
            <h2 className="text-sm font-bold tracking-[0.2em] text-warm-gold uppercase border-l-2 border-warm-gold pl-4">The Problem</h2>
            <div className="prose prose-invert prose-lg md:prose-xl max-w-none text-gray-300 font-light leading-relaxed space-y-6">
              <p>
                You use one app to track your budget. Another to track your investments. A Kanban board for your career applications. A spreadsheet for your habits. A smartwatch for your sleep. And a task manager for your chores.
              </p>
              <p>
                Your life's data is fragmented across a dozen different ecosystems that refuse to talk to each other. The mental overhead of simply maintaining these systems has become a full-time job. We spend more time managing our tools than actually living our lives.
              </p>
            </div>
          </section>

          {/* The Vision */}
          <section className="space-y-8">
            <h2 className="text-sm font-bold tracking-[0.2em] text-warm-gold uppercase border-l-2 border-warm-gold pl-4">The Vision</h2>
            <div className="prose prose-invert prose-lg md:prose-xl max-w-none text-gray-300 font-light leading-relaxed space-y-6">
              <p>
                We believe your personal data should live in one place. It should compound. It should correlate. 
              </p>
              <p>
                <strong className="text-white font-serif text-2xl">TRASON is not another app. It's a personal operating system.</strong>
              </p>
              <p>
                Imagine a system that knows you spent $200 on an online course, automatically tags it to your Career Pipeline, and reminds you to study during your deep work block, all while ensuring it doesn't disrupt your sleep schedule. 
              </p>
              <p>
                When your financial capital, professional capital, and physical vitality are tracked in a unified environment, magic happens. You stop reacting to notifications and start orchestrating your life.
              </p>
            </div>
          </section>

          {/* Closing Statement */}
          <section className="pt-16 border-t border-white/10">
            <blockquote className="text-3xl md:text-5xl font-serif text-white leading-tight">
              "We are building TRASON for the ambitious. For those who want to design their lives with the same rigor a CEO designs a company."
            </blockquote>
            <div className="mt-12 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-warm-gold to-yellow-600 flex items-center justify-center">
                <span className="text-black font-serif font-bold text-xl">T</span>
              </div>
              <div>
                <p className="text-white font-bold">The TRASON Team</p>
                <p className="text-sm text-gray-500">Founded 2026</p>
              </div>
            </div>
          </section>

        </article>

      </main>

      <LandingFooter />
    </div>
  );
}
