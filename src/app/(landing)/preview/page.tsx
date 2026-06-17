'use client';

import React, { useState, useEffect } from 'react';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { FiActivity, FiDollarSign, FiBriefcase, FiBell, FiChevronRight } from 'react-icons/fi';
import Link from 'next/link';

// Helper component for animated numbers
function AnimatedNumber({ value, suffix = '' }: { value: number, suffix?: string }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) return;

    const totalDuration = 1500;
    const incrementTime = (totalDuration / end);
    
    const timer = setInterval(() => {
      start += 1;
      setCurrent(start);
      if (start === end) clearInterval(timer);
    }, incrementTime);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{current}{suffix}</span>;
}

export default function PreviewPage() {
  const [activeTab, setActiveTab] = useState<'finance' | 'habit' | 'career'>('finance');

  return (
    <div className="min-h-screen bg-warm-black text-soft-cream font-sans relative overflow-x-hidden">
      <LandingNavbar />
      
      <main className="pt-32 md:pt-48 pb-24 px-lg max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-md max-w-3xl mx-auto mb-16">
           <h1 className="text-5xl md:text-7xl font-serif">Interactive Showcase</h1>
           <p className="text-xl text-gray-light/60">Experience the calm and clarity of TRASON. This is a live simulation of the command center.</p>
        </div>

        {/* Dashboard Mockup Container */}
        <div className="w-full bg-gray-strong border border-white/5 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[600px]">
           {/* Sidebar Mock */}
           <div className="w-full md:w-64 bg-black/20 border-r border-white/5 p-md flex flex-col gap-sm">
              <div className="flex items-center gap-2 px-md py-lg mb-md border-b border-white/5">
                 <div className="w-8 h-8 bg-warm-gold rounded-lg" />
                 <div className="flex flex-col">
                   <span className="text-sm font-bold">John Doe</span>
                   <span className="text-xs text-gray-light/60">Pro Plan</span>
                 </div>
              </div>
              
              <button 
                onClick={() => setActiveTab('finance')}
                className={`flex items-center gap-3 px-md py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'finance' ? 'bg-warm-gold/10 text-warm-gold' : 'text-gray-light hover:bg-white/5'}`}
              >
                <FiDollarSign size={18} /> Finance
              </button>
              <button 
                onClick={() => setActiveTab('habit')}
                className={`flex items-center gap-3 px-md py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'habit' ? 'bg-warm-gold/10 text-warm-gold' : 'text-gray-light hover:bg-white/5'}`}
              >
                <FiActivity size={18} /> Vitality
              </button>
              <button 
                onClick={() => setActiveTab('career')}
                className={`flex items-center gap-3 px-md py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'career' ? 'bg-warm-gold/10 text-warm-gold' : 'text-gray-light hover:bg-white/5'}`}
              >
                <FiBriefcase size={18} /> Career
              </button>
           </div>

           {/* Main Content Mock */}
           <div className="flex-1 p-lg md:p-2xl bg-gradient-to-br from-transparent to-black/10">
              
              {/* Finance Tab */}
              {activeTab === 'finance' && (
                <div className="space-y-xl animate-fade-in">
                  <div className="flex justify-between items-end">
                     <div>
                       <h2 className="text-sm font-bold text-gray-light uppercase tracking-widest mb-1">Total Net Worth</h2>
                       <div className="text-5xl font-serif text-warm-gold">$<AnimatedNumber value={142} />,850</div>
                     </div>
                     <div className="text-emerald-400 text-sm font-bold bg-emerald-400/10 px-3 py-1 rounded-full">+12.4% this month</div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                     {/* Fake Chart */}
                     <div className="bg-black/20 border border-white/5 p-lg rounded-2xl h-64 flex flex-col justify-between">
                        <div className="text-sm text-gray-light font-bold">Cash Flow</div>
                        <div className="flex items-end gap-2 h-32 w-full">
                           {[40, 60, 45, 80, 55, 90, 75, 100].map((h, i) => (
                              <div key={i} className="flex-1 bg-warm-gold/40 hover:bg-warm-gold transition-all duration-500 rounded-t-sm" style={{ height: `${h}%` }} />
                           ))}
                        </div>
                     </div>
                     {/* Recent Transactions */}
                     <div className="bg-black/20 border border-white/5 p-lg rounded-2xl space-y-md">
                        <div className="text-sm text-gray-light font-bold">Recent Activity</div>
                        {['Grocery', 'Salary', 'Netflix'].map((t, i) => (
                           <div key={i} className="flex justify-between items-center py-2 border-b border-white/5">
                             <div className="flex items-center gap-3">
                               <div className="w-8 h-8 rounded-full bg-white/5" />
                               <span className="text-sm">{t}</span>
                             </div>
                             <span className={`text-sm ${i === 1 ? 'text-emerald-400' : 'text-white'}`}>{i === 1 ? '+' : '-'}${(Math.random() * 100).toFixed(0)}</span>
                           </div>
                        ))}
                     </div>
                  </div>
                </div>
              )}

              {/* Habit Tab */}
              {activeTab === 'habit' && (
                <div className="space-y-xl animate-fade-in">
                  <div className="flex justify-between items-end">
                     <div>
                       <h2 className="text-sm font-bold text-gray-light uppercase tracking-widest mb-1">Vitality Score</h2>
                       <div className="text-5xl font-serif text-violet-400"><AnimatedNumber value={85} />/100</div>
                     </div>
                  </div>
                  
                  <div className="bg-black/20 border border-white/5 p-lg rounded-2xl">
                     <div className="text-sm text-gray-light font-bold mb-md">30-Day Heatmap</div>
                     <div className="grid grid-cols-7 gap-2">
                        {Array.from({length: 28}).map((_, i) => (
                          <div key={i} className={`aspect-square rounded-md transition-colors duration-1000 ${Math.random() > 0.3 ? 'bg-violet-500/40' : 'bg-white/5'}`} />
                        ))}
                     </div>
                  </div>
                </div>
              )}

              {/* Career Tab */}
              {activeTab === 'career' && (
                <div className="space-y-xl animate-fade-in">
                  <div className="flex justify-between items-end">
                     <div>
                       <h2 className="text-sm font-bold text-gray-light uppercase tracking-widest mb-1">Active Applications</h2>
                       <div className="text-5xl font-serif text-blue-400"><AnimatedNumber value={12} /></div>
                     </div>
                  </div>

                  <div className="bg-black/20 border border-white/5 p-lg rounded-2xl">
                     <div className="text-sm text-gray-light font-bold mb-md">Pipeline</div>
                     <div className="space-y-sm">
                        {['Google (Interview)', 'Stripe (Applied)', 'Linear (Offer)'].map((app, i) => (
                           <div key={i} className="flex justify-between items-center p-md bg-white/5 rounded-xl">
                              <span className="text-sm font-medium">{app.split(' (')[0]}</span>
                              <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                                i === 0 ? 'bg-amber-500/10 text-amber-500' :
                                i === 1 ? 'bg-gray-500/10 text-gray-400' :
                                'bg-emerald-500/10 text-emerald-500'
                              }`}>{app.split('(')[1].replace(')', '')}</span>
                           </div>
                        ))}
                     </div>
                  </div>
                </div>
              )}

           </div>
        </div>
        
        <div className="text-center pt-12">
           <Link href="/signup">
             <button className="bg-warm-gold text-warm-black px-xl py-4 rounded-xl font-bold hover:scale-105 transition-transform">
               Start Building Your Dashboard
             </button>
           </Link>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
