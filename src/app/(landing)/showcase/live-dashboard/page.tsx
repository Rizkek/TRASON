'use client';

import React, { useState } from 'react';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { 
  LayoutDashboard, 
  PieChart, 
  Briefcase, 
  Activity, 
  Settings, 
  Bell, 
  Search, 
  ChevronDown,
  ArrowUpRight,
  TrendingUp,
  User,
  Zap,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import Link from 'next/link';

export default function LiveDashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-warm-black text-soft-cream font-sans relative overflow-x-hidden">
      {/* Dynamic Backgrounds */}
      <div className="fixed top-[-20%] right-[-10%] w-[800px] h-[800px] bg-warm-gold/10 blur-[160px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-warm-gold/5 blur-[140px] rounded-full pointer-events-none" />

      <LandingNavbar />

      <main className="pt-32 md:pt-48 pb-24 px-lg max-w-7xl mx-auto space-y-24">
        {/* Presentation Header */}
        <div className="text-center space-y-6 max-w-3xl mx-auto relative z-10">
           <h1 className="text-4xl md:text-6xl font-serif leading-tight">
             Live <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-warm-gold to-yellow-200">Dashboard.</span>
           </h1>
           <p className="text-lg text-gray-light font-light leading-relaxed">
             Experience the unified TRASON interface. This is a high-fidelity interactive showcase of the central command center where all your life's data converges.
           </p>
        </div>

        {/* Browser Mockup Container */}
        <div className="relative z-10 mx-auto w-full max-w-[1200px]">
          {/* Glowing Border Effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-warm-gold/30 via-warm-gold/30 to-warm-gold/30 rounded-[2.5rem] blur-xl opacity-50" />
          
          <div className="relative bg-black/80 backdrop-blur-3xl border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl flex flex-col h-[800px]">
            
            {/* Mac OS Window Controls */}
            <div className="h-12 bg-white/5 border-b border-white/5 flex items-center px-4 gap-2 shrink-0">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-warm-gold/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
              <div className="ml-4 text-xs font-medium text-gray-500 flex items-center gap-2">
                <LayoutDashboard size={12} /> app.trason.io/dashboard
              </div>
            </div>

            {/* App Layout */}
            <div className="flex flex-1 overflow-hidden">
              
              {/* Sidebar */}
              <div className="w-64 border-r border-white/5 bg-black/40 flex flex-col justify-between shrink-0 hidden md:flex">
                <div className="p-6 space-y-8">
                  {/* Logo Area */}
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-warm-gold to-yellow-600 flex items-center justify-center">
                      <span className="text-black font-serif font-bold text-lg">T</span>
                    </div>
                    <span className="font-serif font-bold text-xl text-white">TRASON</span>
                  </div>

                  {/* Nav Menu */}
                  <nav className="space-y-2">
                    <p className="text-xs font-bold text-gray-600 uppercase tracking-widest mb-4">Command Center</p>
                    {[
                      { icon: LayoutDashboard, label: 'Overview', active: true },
                      { icon: PieChart, label: 'Finance', active: false },
                      { icon: Briefcase, label: 'Career', active: false },
                      { icon: Activity, label: 'Vitality', active: false },
                    ].map((item, i) => (
                      <button key={i} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${item.active ? 'bg-warm-gold/10 text-warm-gold border border-warm-gold/20' : 'text-gray-light hover:text-white hover:bg-white/5'}`}>
                        <item.icon size={18} />
                        <span className="font-medium text-sm">{item.label}</span>
                      </button>
                    ))}
                  </nav>
                </div>

                {/* User Profile Footer */}
                <div className="p-6 border-t border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-white">
                      <User size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">John Doe</p>
                      <p className="text-xs text-warm-gold bg-warm-gold/10 px-2 py-0.5 rounded uppercase font-bold inline-block mt-1">Premium</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 flex flex-col overflow-y-auto bg-transparent">
                
                {/* Topbar */}
                <div className="h-20 border-b border-white/5 flex items-center justify-between px-8 shrink-0">
                  <div className="relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input 
                      type="text" 
                      placeholder="Search transactions, jobs, or habits..." 
                      className="bg-white/5 border border-white/5 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-warm-gold/50 w-[300px] transition-colors"
                      disabled
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <button className="relative w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-light hover:text-white transition-colors">
                      <Bell size={18} />
                      <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 border-2 border-black" />
                    </button>
                    <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-light hover:text-white transition-colors">
                      <Settings size={18} />
                    </button>
                  </div>
                </div>

                {/* Content Dashboard */}
                <div className="p-8 space-y-8">
                  
                  {/* Greeting & Life Score */}
                  <div className="flex justify-between items-end">
                    <div>
                      <h2 className="text-3xl font-serif text-white tracking-tight mb-1">Good Morning, John.</h2>
                      <p className="text-gray-light">Your life score is up 3 points since yesterday.</p>
                    </div>
                    <button className="bg-warm-gold text-black px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-yellow-500 transition-colors">
                      <Zap size={16} /> Daily Briefing
                    </button>
                  </div>

                  {/* Top Stats Row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Finance Stat */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-warm-gold/30 transition-colors cursor-pointer">
                      <div className="absolute -right-6 -top-6 w-24 h-24 bg-warm-gold/10 rounded-full blur-xl group-hover:bg-warm-gold/20 transition-all" />
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2 text-gray-light">
                          <PieChart size={16} className="text-yellow-500" />
                          <span className="text-sm font-bold">Net Worth</span>
                        </div>
                        <span className="text-xs text-yellow-500 bg-warm-gold/10 px-2 py-1 rounded font-bold">+2.4%</span>
                      </div>
                      <h3 className="text-3xl font-serif text-white mb-1">$142,500</h3>
                      <p className="text-xs text-gray-500">Updated 2 hours ago</p>
                    </div>

                    {/* Career Stat */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-warm-gold/30 transition-colors cursor-pointer">
                      <div className="absolute -right-6 -top-6 w-24 h-24 bg-warm-gold/10 rounded-full blur-xl group-hover:bg-warm-gold/20 transition-all" />
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2 text-gray-light">
                          <Briefcase size={16} className="text-yellow-500" />
                          <span className="text-sm font-bold">Active Applications</span>
                        </div>
                        <span className="text-xs text-yellow-500 bg-warm-gold/10 px-2 py-1 rounded font-bold">2 Interviews</span>
                      </div>
                      <h3 className="text-3xl font-serif text-white mb-1">14</h3>
                      <p className="text-xs text-gray-500">Pipeline health: Good</p>
                    </div>

                    {/* Vitality Stat */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-warm-gold/30 transition-colors cursor-pointer">
                      <div className="absolute -right-6 -top-6 w-24 h-24 bg-warm-gold/10 rounded-full blur-xl group-hover:bg-warm-gold/20 transition-all" />
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2 text-gray-light">
                          <Activity size={16} className="text-yellow-500" />
                          <span className="text-sm font-bold">Consistency Score</span>
                        </div>
                        <span className="text-xs text-yellow-500 bg-warm-gold/10 px-2 py-1 rounded font-bold">14 Day Streak</span>
                      </div>
                      <h3 className="text-3xl font-serif text-white mb-1">85/100</h3>
                      <p className="text-xs text-gray-500">Top 15% this month</p>
                    </div>
                  </div>

                  {/* Main Grid Area */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
                    
                    {/* Finance Chart Area */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 h-[300px] flex flex-col">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-white text-sm">Cash Flow vs Burn Rate</h3>
                        <div className="text-xs text-gray-500">Last 30 Days</div>
                      </div>
                      {/* Fake Chart */}
                      <div className="flex-1 flex items-end justify-between gap-2">
                        {[40, 60, 45, 80, 50, 90, 70, 85].map((h, i) => (
                          <div key={i} className="w-full flex gap-1 items-end">
                            <div className="w-1/2 bg-warm-gold/40 rounded-t" style={{ height: `${h}%` }} />
                            <div className="w-1/2 bg-warm-gold/40 rounded-t" style={{ height: `${h * 0.6}%` }} />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Today's Action Items */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 h-[300px] flex flex-col">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-white text-sm">Today's Signals</h3>
                        <button className="text-xs text-warm-gold font-bold">View All</button>
                      </div>
                      <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                        <div className="bg-white/5 border border-white/5 rounded-xl p-3 flex items-start gap-3">
                          <div className="mt-0.5 text-yellow-500"><Calendar size={16} /></div>
                          <div>
                            <p className="text-sm font-bold text-white">System Design Prep</p>
                            <p className="text-xs text-gray-500">For Google Interview tomorrow</p>
                          </div>
                        </div>
                        <div className="bg-warm-gold/10 border border-warm-gold/20 rounded-xl p-3 flex items-start gap-3">
                          <div className="mt-0.5 text-yellow-500"><PieChart size={16} /></div>
                          <div>
                            <p className="text-sm font-bold text-yellow-500">Review AWS Bill</p>
                            <p className="text-xs text-warm-gold/70">Unusual spike detected yesterday</p>
                          </div>
                        </div>
                        <div className="bg-white/5 border border-white/5 rounded-xl p-3 flex items-start gap-3">
                          <div className="mt-0.5 text-yellow-500"><CheckCircle2 size={16} /></div>
                          <div>
                            <p className="text-sm font-bold text-white">Evening Workout</p>
                            <p className="text-xs text-gray-500">Scheduled for 6:00 PM</p>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </main>

      <LandingFooter />
    </div>
  );
}
