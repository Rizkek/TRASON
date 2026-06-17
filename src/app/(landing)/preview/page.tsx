'use client';

import React, { useState, useEffect } from 'react';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { FiActivity, FiDollarSign, FiBriefcase } from 'react-icons/fi';
import { CircleDollarSign, TrendingUp, AlertTriangle, Briefcase, Plus, Calendar, Clock } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'finance' | 'career'>('dashboard');

  return (
    <div className="min-h-screen bg-warm-black text-soft-cream font-sans relative overflow-x-hidden">
      <LandingNavbar />
      
      <main className="pt-32 md:pt-48 pb-24 px-lg max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-md max-w-3xl mx-auto mb-16">
           <h1 className="text-5xl md:text-7xl font-serif">Interactive Preview</h1>
           <p className="text-xl text-gray-light/60">Take a look inside TRASON. This is a realistic representation of what you'll see after logging in.</p>
        </div>

        {/* Dashboard Mockup Container */}
        <div className="w-full bg-black border border-white/5 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[700px]">
           {/* Sidebar Mock */}
           <div className="w-full md:w-64 bg-black/40 border-r border-white/5 p-md flex flex-col gap-sm">
              <div className="flex items-center gap-3 px-md py-lg mb-md border-b border-white/5">
                 <div className="w-10 h-10 bg-gradient-to-br from-warm-gold to-yellow-600 rounded-full flex items-center justify-center text-black font-bold">
                   JD
                 </div>
                 <div className="flex flex-col">
                   <span className="text-sm font-bold text-soft-cream">John Doe</span>
                   <span className="text-[10px] text-warm-gold uppercase tracking-widest">Premium</span>
                 </div>
              </div>
              
              <button 
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-3 px-md py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-white/10 text-white' : 'text-gray-light hover:bg-white/5'}`}
              >
                <FiActivity size={18} /> Command Center
              </button>
              <button 
                onClick={() => setActiveTab('finance')}
                className={`flex items-center gap-3 px-md py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'finance' ? 'bg-white/10 text-white' : 'text-gray-light hover:bg-white/5'}`}
              >
                <FiDollarSign size={18} /> Finance
              </button>
              <button 
                onClick={() => setActiveTab('career')}
                className={`flex items-center gap-3 px-md py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'career' ? 'bg-white/10 text-white' : 'text-gray-light hover:bg-white/5'}`}
              >
                <FiBriefcase size={18} /> Career
              </button>
           </div>

           {/* Main Content Mock */}
           <div className="flex-1 p-lg md:p-2xl bg-black/20 overflow-y-auto">
              
              {/* Dashboard Tab */}
              {activeTab === 'dashboard' && (
                <div className="space-y-lg animate-fade-in">
                  <div className="flex justify-between items-center mb-8">
                     <div>
                       <h2 className="text-2xl font-serif text-white">Good Morning, John.</h2>
                       <p className="text-sm text-gray-light">Your life score is up 3 points since yesterday.</p>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
                     {/* Life Score Card Mock */}
                     <div className="lg:col-span-2 bg-white/[0.02] border border-white/5 rounded-2xl p-xl flex flex-col sm:flex-row items-center sm:items-start gap-xl">
                        <div className="relative shrink-0 flex flex-col items-center justify-center w-32 h-32 rounded-full border-4 border-warm-gold/20">
                           <svg className="absolute inset-0 w-full h-full -rotate-90">
                             <circle cx="60" cy="60" r="58" stroke="currentColor" strokeWidth="4" fill="none" className="text-white/5" />
                             <circle cx="60" cy="60" r="58" stroke="currentColor" strokeWidth="4" fill="none" className="text-warm-gold" strokeDasharray="364" strokeDashoffset="50" strokeLinecap="round" />
                           </svg>
                           <div className="text-center relative z-10">
                              <span className="text-4xl font-bold text-warm-gold"><AnimatedNumber value={86} /></span>
                              <span className="block text-[10px] text-gray-light uppercase tracking-widest">Score</span>
                           </div>
                        </div>
                        <div className="flex-1 space-y-md w-full">
                           <h3 className="text-lg font-bold text-white">Excellent Momentum</h3>
                           <div className="space-y-sm">
                              <div className="p-sm bg-black/40 border border-white/5 rounded-lg text-xs text-gray-light">
                                <span className="text-emerald-400 font-bold mr-2">Finance:</span>
                                Keuangan perlu perhatian: cek pengeluaran dan tingkatkan saving rate.
                              </div>
                              <div className="p-sm bg-black/40 border border-white/5 rounded-lg text-xs text-gray-light">
                                <span className="text-warm-gold font-bold mr-2">Vitality:</span>
                                Pertahankan momentum! Anda sudah konsisten 5 hari berturut-turut.
                              </div>
                           </div>
                        </div>
                     </div>

                     {/* Financial Health Mock */}
                     <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-xl">
                        <div className="flex items-start justify-between mb-lg">
                          <div>
                            <h3 className="text-sm font-bold text-white mb-0.5 flex items-center gap-2">
                              <CircleDollarSign size={16} className="text-warm-gold" /> Financial Health
                            </h3>
                            <p className="text-[10px] text-gray-light uppercase tracking-widest">Bulan ini</p>
                          </div>
                          <div className="flex items-center gap-sm">
                            <span className="text-3xl font-bold text-emerald-400">85</span>
                          </div>
                        </div>
                        <div className="h-1.5 bg-black/30 rounded-full overflow-hidden mb-lg">
                          <div className="h-full rounded-full bg-emerald-400 w-[85%]" />
                        </div>
                        <div className="grid grid-cols-2 gap-md text-center">
                          <div>
                            <p className="text-sm font-bold text-emerald-400">Rp 15.000.000</p>
                            <p className="text-[10px] text-gray-light">Pemasukan</p>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-red-400">Rp 4.500.000</p>
                            <p className="text-[10px] text-gray-light">Pengeluaran</p>
                          </div>
                        </div>
                     </div>
                  </div>
                </div>
              )}

              {/* Finance Tab */}
              {activeTab === 'finance' && (
                <div className="space-y-lg animate-fade-in">
                  <h2 className="text-2xl font-serif text-white mb-8">Financial Overview</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-md mb-lg">
                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-lg text-center">
                      <p className="text-3xl font-bold text-emerald-400">Rp 45.500.000</p>
                      <p className="text-[10px] text-gray-light uppercase tracking-widest mt-2">Total Net Worth</p>
                    </div>
                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-lg text-center">
                      <p className="text-3xl font-bold text-white">Rp 12.000.000</p>
                      <p className="text-[10px] text-gray-light uppercase tracking-widest mt-2">Investments</p>
                    </div>
                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-lg text-center">
                      <p className="text-3xl font-bold text-emerald-400">70%</p>
                      <p className="text-[10px] text-gray-light uppercase tracking-widest mt-2">Saving Rate</p>
                    </div>
                  </div>

                  <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-lg">
                    <h3 className="text-sm font-bold text-white mb-6">Recent Transactions</h3>
                    <div className="space-y-0 text-sm">
                      {[
                        { title: 'Salary', amount: '+Rp 15.000.000', type: 'income', date: 'Today' },
                        { title: 'Grocery Supermarket', amount: '-Rp 450.000', type: 'expense', date: 'Yesterday' },
                        { title: 'Netflix Subscription', amount: '-Rp 186.000', type: 'expense', date: '2 Days Ago' },
                        { title: 'Freelance Design', amount: '+Rp 3.500.000', type: 'income', date: '3 Days Ago' },
                      ].map((t, i) => (
                        <div key={i} className="flex justify-between items-center py-4 border-b border-white/5 last:border-0">
                          <div>
                            <p className="font-bold text-gray-200">{t.title}</p>
                            <p className="text-xs text-gray-light/60">{t.date}</p>
                          </div>
                          <p className={`font-bold ${t.type === 'income' ? 'text-emerald-400' : 'text-white'}`}>{t.amount}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Career Tab */}
              {activeTab === 'career' && (
                <div className="space-y-lg animate-fade-in">
                  <div className="flex justify-between items-center mb-8">
                     <h2 className="text-2xl font-serif text-white">Career Pipeline</h2>
                     <button className="bg-warm-gold text-black px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2">
                       <Plus size={14} /> Add Application
                     </button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-md mb-lg">
                    {[
                      { label: 'Applied', val: 12, col: 'text-white' },
                      { label: 'Reviewing', val: 4, col: 'text-amber-400' },
                      { label: 'Interview', val: 2, col: 'text-purple-400' },
                      { label: 'Offer', val: 1, col: 'text-emerald-400' }
                    ].map(s => (
                      <div key={s.label} className="bg-white/[0.02] border border-white/5 rounded-2xl p-lg text-center">
                        <p className={`text-3xl font-bold ${s.col}`}>{s.val}</p>
                        <p className="text-[10px] text-gray-light uppercase tracking-widest mt-2">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-md">
                    {[
                      { company: 'Google', role: 'Frontend Engineer', status: 'Interview', color: 'bg-purple-400/10 text-purple-400 border-purple-400/20' },
                      { company: 'Stripe', role: 'Product Designer', status: 'Reviewing', color: 'bg-amber-400/10 text-amber-400 border-amber-400/20' },
                      { company: 'Vercel', role: 'Developer Advocate', status: 'Applied', color: 'bg-white/5 text-white border-white/10' },
                    ].map((job, i) => (
                      <div key={i} className="bg-white/[0.02] border border-white/5 rounded-2xl p-lg flex flex-col md:flex-row justify-between md:items-center gap-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${job.color}`}>{job.status}</span>
                            <span className="text-[10px] text-gray-light uppercase tracking-widest flex items-center gap-1"><Briefcase size={10} /> Job</span>
                          </div>
                          <h3 className="text-lg font-bold text-white">{job.company}</h3>
                          <p className="text-sm text-gray-light">{job.role}</p>
                        </div>
                        <div className="flex flex-wrap gap-4 text-xs text-gray-light/60">
                           <span className="flex items-center gap-1"><Calendar size={12} /> Applied 2 weeks ago</span>
                           {job.status === 'Interview' && <span className="flex items-center gap-1 text-purple-400"><Clock size={12} /> Interview Tomorrow</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

           </div>
        </div>
        
        <div className="text-center pt-12">
           <Link href="/signup">
             <button className="bg-warm-gold text-warm-black px-xl py-4 rounded-xl font-bold hover:scale-105 transition-transform shadow-lg shadow-warm-gold/20">
               Start Building Your Dashboard
             </button>
           </Link>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
