'use client';

import React from 'react';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { LandingFooter } from '@/components/landing/LandingFooter';

const CHANGES = [
  {
    version: 'v1.1.0',
    date: 'June 17, 2026',
    title: 'The Professional Update',
    items: [
      'Refactored UI to remove casual emojis for a more professional, polished look.',
      'Completely redesigned the Landing Footer with comprehensive SaaS links.',
      'Introduced a highly realistic Interactive Preview on the landing page.',
      'Added Contact, Pricing, Changelog, and Legal pages.'
    ]
  },
  {
    version: 'v1.0.0',
    date: 'June 10, 2026',
    title: 'Initial MVP Release',
    items: [
      'Launched the TRASON Core Operating System.',
      'Financial Tracking: Income, Expenses, and Saving Rate.',
      'Vitality Tracking: Habit 30-day heatmaps.',
      'Career Pipeline: Job application tracking with stages.'
    ]
  },
  {
    version: 'Beta',
    date: 'May 2026',
    title: 'Closed Beta',
    items: [
      'Invited first 100 power users to test the platform.',
      'Iterated on the Life Score algorithm.'
    ]
  }
];

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-warm-black text-soft-cream font-sans relative overflow-x-hidden">
      <LandingNavbar />
      
      <main className="pt-32 md:pt-48 pb-24 px-lg max-w-3xl mx-auto space-y-16">
        <div className="space-y-md mb-16">
           <h1 className="text-5xl md:text-7xl font-serif">Changelog</h1>
           <p className="text-xl text-gray-light/60">New updates and improvements to TRASON.</p>
        </div>

        <div className="space-y-16">
          {CHANGES.map((release, i) => (
            <div key={i} className="relative pl-8 md:pl-0">
              {/* Timeline Line for Mobile */}
              <div className="md:hidden absolute left-0 top-2 bottom-0 w-px bg-white/10" />
              <div className="md:hidden absolute left-[-4px] top-2 w-2 h-2 rounded-full bg-warm-gold" />
              
              <div className="flex flex-col md:flex-row gap-4 md:gap-12">
                <div className="md:w-48 shrink-0">
                  <p className="text-sm font-bold text-gray-light">{release.date}</p>
                  <p className="text-xs text-gray-light/60 mt-1">{release.version}</p>
                </div>
                
                <div className="flex-1 space-y-4">
                  <h2 className="text-2xl font-bold text-white">{release.title}</h2>
                  <ul className="space-y-3">
                    {release.items.map((item, j) => (
                      <li key={j} className="flex gap-3 text-gray-light text-sm">
                        <span className="text-white/20 mt-1">•</span>
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
