'use client';

import React from 'react';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { FiCheck, FiArrowRight } from 'react-icons/fi';
import Link from 'next/link';

function FeatureSection({ 
  title, 
  description, 
  features, 
  reverse = false, 
  color 
}: { 
  title: string, 
  description: string, 
  features: string[], 
  reverse?: boolean,
  color: string 
}) {
  return (
    <div className={`flex flex-col ${reverse ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-xl md:gap-4xl py-2xl border-b border-white/[0.02]`}>
      <div className="flex-1 space-y-lg">
        <h3 className="text-3xl md:text-5xl font-serif">{title}</h3>
        <p className="text-gray-light text-lg">{description}</p>
        <ul className="space-y-sm pt-md">
          {features.map((feature, i) => (
            <li key={i} className="flex items-center gap-md text-gray-light">
               <div className={`w-6 h-6 rounded-full flex items-center justify-center`} style={{ backgroundColor: `${color}20`, color: color }}>
                 <FiCheck size={12} />
               </div>
               {feature}
            </li>
          ))}
        </ul>
      </div>
      <div className="flex-1 w-full relative group">
         {/* Fake Screenshot / Visual Representation */}
         <div className="absolute inset-0 blur-[60px] opacity-20 rounded-3xl group-hover:opacity-40 transition-opacity" style={{ backgroundColor: color }} />
         <div className="relative aspect-square md:aspect-[4/3] bg-gray-strong/80 backdrop-blur-xl border border-white/5 rounded-3xl p-lg shadow-2xl flex flex-col gap-md">
            {/* Visual Header */}
            <div className="h-8 flex items-center justify-between border-b border-white/5 pb-sm">
               <div className="h-3 w-24 bg-white/10 rounded" />
               <div className="h-6 w-16 rounded-full" style={{ backgroundColor: `${color}20` }} />
            </div>
            {/* Visual Body (Abstracted) */}
            <div className="flex-1 flex flex-col gap-md justify-center">
               <div className="h-24 w-full rounded-xl flex items-end gap-1 p-2 border border-white/5 bg-black/20">
                 {[40, 70, 30, 90, 50, 80, 60].map((h, i) => (
                   <div key={i} className="flex-1 rounded-sm transition-all duration-500 hover:h-full" style={{ height: `${h}%`, backgroundColor: color }} />
                 ))}
               </div>
               <div className="grid grid-cols-2 gap-md">
                 <div className="h-16 rounded-xl bg-black/20 border border-white/5 p-sm flex items-center justify-between">
                    <div className="h-8 w-8 rounded-full bg-white/5" />
                    <div className="h-3 w-12 bg-white/10 rounded" />
                 </div>
                 <div className="h-16 rounded-xl bg-black/20 border border-white/5 p-sm flex items-center justify-between">
                    <div className="h-8 w-8 rounded-full bg-white/5" />
                    <div className="h-3 w-12 bg-white/10 rounded" />
                 </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-warm-black text-soft-cream font-sans selection:bg-warm-gold/30 selection:text-soft-cream relative overflow-x-hidden">
      <LandingNavbar />
      
      <main className="pt-32 md:pt-48 pb-24 px-lg max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-md max-w-3xl mx-auto mb-24 md:mb-40">
           <h1 className="text-5xl md:text-7xl font-serif">The Architecture of Control.</h1>
           <p className="text-xl text-gray-light/60">Everything you need to run your life, without the bloat of enterprise tools.</p>
        </div>

        <FeatureSection 
           title="Financial Flow"
           description="Track every transaction, understand your burn rate, and visualize your capital trajectory across multiple accounts."
           features={[
             "Multi-currency support",
             "Automated categorization",
             "Burn rate & runway forecasting",
             "Investment tracking"
           ]}
           color="#10B981" // emerald
        />

        <FeatureSection 
           title="Vitality & Habits"
           description="Build consistency with a humanized tracker that understands life happens. Don't break the chain, but if you do, recover gracefully."
           features={[
             "Heatmap visualizations",
             "Flexible routines",
             "Health correlations",
             "No guilt-tripping notifications"
           ]}
           reverse
           color="#8B5CF6" // violet
        />

        <FeatureSection 
           title="Career Architect"
           description="Stop losing track of your applications. Manage your professional growth like a true CRM."
           features={[
             "Application kanban board",
             "Interview preparation notes",
             "Skill progression tracking",
             "Compensation history"
           ]}
           color="#3B82F6" // blue
        />

        <FeatureSection 
           title="Signal Reminders"
           description="A smart reminder system that only alerts you when it actually matters. Separate the noise from the signal."
           features={[
             "Context-aware nudges",
             "Recurring obligations",
             "Snooze with intelligence",
             "Integration with life score"
           ]}
           reverse
           color="#F59E0B" // amber
        />
        
        {/* Call to action at bottom of features */}
        <div className="py-24 text-center space-y-lg">
           <h2 className="text-3xl md:text-4xl font-serif">Ready to experience the clarity?</h2>
           <Link href="/preview" className="inline-flex items-center gap-2 text-warm-gold hover:text-soft-cream transition-colors font-bold text-lg">
             Explore the interactive preview <FiArrowRight />
           </Link>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
