'use client';

import React from 'react';
import { Bank, Wallet, Briefcase, Heartbeat, PersonSimpleRun, Note, Calendar, ChartLineUp } from '@phosphor-icons/react';
import { Heading, Paragraph } from '@/components/ui/typography';

const INTEGRATIONS = [
  { name: 'BCA', icon: Bank },
  { name: 'GoPay', icon: Wallet },
  { name: 'OVO', icon: Wallet },
  { name: 'Mandiri', icon: Bank },
  { name: 'LinkedIn', icon: Briefcase },
  { name: 'Apple Health', icon: Heartbeat },
  { name: 'Strava', icon: PersonSimpleRun },
  { name: 'Notion', icon: Note },
  { name: 'Google Calendar', icon: Calendar },
  { name: 'Bibit', icon: ChartLineUp },
];

export function LogoTicker() {
  return (
    <section className="py-20 overflow-hidden relative border-y border-black/5 dark:border-white/5 bg-black/[0.01] dark:bg-white/[0.01]">
      <div className="max-w-7xl mx-auto px-6 mb-12 text-center">
        <Heading as="h3" size="h3" variant="default" className="max-w-2xl mx-auto">
          Track all your favorite tools across finance, career, and vitality.
        </Heading>
        <Paragraph size="lg" variant="default" className="mt-4">
          Replace the chaos of scattered apps. Your data stays private. No risky API connections required.
        </Paragraph>
      </div>

      <div className="relative w-full flex overflow-x-hidden">
        {/* Fade gradients on edges */}
        <div className="absolute top-0 left-0 bottom-0 w-32 bg-gradient-to-r from-soft-cream dark:from-warm-black to-transparent z-10 pointer-events-none" />
        <div className="absolute top-0 right-0 bottom-0 w-32 bg-gradient-to-l from-soft-cream dark:from-warm-black to-transparent z-10 pointer-events-none" />

        {/* Marquee Track */}
        <div className="flex w-fit animate-marquee hover:[animation-play-state:paused]">
          {/* Double the list to ensure seamless infinite scroll */}
          {[...INTEGRATIONS, ...INTEGRATIONS].map((item, index) => (
            <div 
              key={index}
              className="flex items-center gap-3 px-8 py-4 mx-4 bg-white dark:bg-[#111827] border border-black/5 dark:border-white/5 rounded-2xl whitespace-nowrap shadow-sm group hover:border-primary/50 transition-colors cursor-default"
            >
              <item.icon size={28} weight="duotone" className="text-gray-light group-hover:text-primary transition-colors" />
              <span className="font-semibold text-warm-black dark:text-soft-cream text-lg">{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
