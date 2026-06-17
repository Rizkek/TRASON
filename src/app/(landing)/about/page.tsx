'use client';

import React, { useState } from 'react';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

const FAQS = [
  {
    q: "Is my data safe and private?",
    a: "Yes. TRASON is built with privacy as the core foundation. Your personal data belongs to you. We do not sell your data, run ads, or use tracking algorithms."
  },
  {
    q: "Is TRASON free to use?",
    a: "The core operating system is free. We plan to introduce premium features for power users in the future, but the essential modules will always remain accessible."
  },
  {
    q: "Can I use TRASON on my phone?",
    a: "TRASON is currently built as a responsive web application that works well on mobile browsers. A dedicated native mobile app is on our roadmap."
  },
  {
    q: "How is this different from Notion or Excel?",
    a: "Notion and Excel are blank canvases. You have to build the systems yourself, which often break. TRASON provides opinionated, pre-built workflows specifically designed for personal finance, habits, and career tracking, completely interconnected out of the box."
  }
];

function FaqItem({ q, a }: { q: string, a: string }) {
  const [open, setOpen] = useState(false);
  
  return (
    <div className="border border-white/5 rounded-xl bg-black/20 overflow-hidden">
      <button 
        className="w-full text-left px-lg py-md flex justify-between items-center font-bold text-gray-light hover:text-white transition-colors"
        onClick={() => setOpen(!open)}
      >
        {q}
        {open ? <FiChevronUp /> : <FiChevronDown />}
      </button>
      {open && (
        <div className="px-lg pb-md text-gray-light/80 leading-relaxed text-sm">
          {a}
        </div>
      )}
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-warm-black text-soft-cream font-sans relative overflow-x-hidden">
      <LandingNavbar />
      
      <main className="pt-32 md:pt-48 pb-24 px-lg max-w-4xl mx-auto space-y-32">
        
        {/* The Philosophy */}
        <section className="space-y-lg">
           <h1 className="text-5xl md:text-7xl font-serif mb-xl">The Philosophy of TRASON</h1>
           <div className="prose prose-invert prose-lg max-w-none text-gray-light/90 space-y-6">
             <p className="text-2xl font-serif text-warm-gold italic">
               "Your life is an interconnected system, but your tools are fragmented."
             </p>
             <p>
               Every day, ambitious individuals waste time jumping between five different applications. 
               You use a banking app or spreadsheet for finances, a dedicated habit tracker for health, a calendar for your schedule, 
               and a Notion board for tracking career applications.
             </p>
             <p>
               This fragmentation causes <strong>App Fatigue</strong>. More importantly, it hides the correlation between your actions. 
               When you have a bad week financially, it usually correlates with poor habits, skipped workouts, and high stress—but none of your isolated tools can show you that connection.
             </p>
             <p>
               <strong>TRASON is a Personal Operating System.</strong> It is not just another blank canvas where you have to build complex databases from scratch. 
               We provide a highly opinionated, beautifully designed command center that connects your Capital (Finance), Vitality (Health & Habits), and Ambition (Career) into a single unified <strong>Life Score</strong>.
             </p>
             <p>
               We believe that by centralizing your data, reducing friction, and giving you an objective score of your daily momentum, you can achieve your goals with unprecedented clarity.
             </p>
           </div>
        </section>

        {/* Current Status / Roadmap */}
        <section className="space-y-xl">
           <h2 className="text-3xl md:text-4xl font-serif">Current Status & Roadmap</h2>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-xl">
              <div className="bg-black/20 border border-white/5 p-lg rounded-2xl space-y-md">
                 <h3 className="font-bold text-emerald-400 flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                   Live Now (MVP)
                 </h3>
                 <ul className="space-y-2 text-gray-light text-sm">
                   <li>✓ Financial Tracking & Analytics</li>
                   <li>✓ Habit & Vitality Heatmaps</li>
                   <li>✓ Career Pipeline Management</li>
                   <li>✓ Basic Signal Reminders</li>
                 </ul>
              </div>

              <div className="bg-black/20 border border-white/5 p-lg rounded-2xl space-y-md">
                 <h3 className="font-bold text-warm-gold flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full border-2 border-warm-gold" />
                   In Development
                 </h3>
                 <ul className="space-y-2 text-gray-light/60 text-sm">
                   <li>→ AI Plain-language Insights</li>
                   <li>→ Investment Portfolio Sync</li>
                   <li>→ Native iOS / Android App</li>
                   <li>→ Offline Mode</li>
                 </ul>
              </div>
           </div>
        </section>

        {/* Removed Tech Stack */}

        {/* FAQ */}
        <section className="space-y-xl">
           <div className="space-y-sm">
             <h2 className="text-3xl md:text-4xl font-serif">Frequently Asked Questions</h2>
             <p className="text-gray-light">Everything you need to know about the platform.</p>
           </div>
           
           <div className="space-y-sm">
             {FAQS.map((faq, i) => (
               <FaqItem key={i} q={faq.q} a={faq.a} />
             ))}
           </div>
        </section>

      </main>

      <LandingFooter />
    </div>
  );
}
