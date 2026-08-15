'use client';

import React, { useState } from 'react';
import { 
  CurrencyCircleDollar, Briefcase, Heartbeat, Target, 
  TrendUp, ArrowRight, CheckCircle, Command
} from '@phosphor-icons/react';

type Tab = 'dashboard' | 'finance' | 'career';

export function InteractivePreview() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  return (
    <div className="w-full max-w-5xl mx-auto relative group perspective-1000">
      {/* Glow effect */}
      <div className="absolute inset-0 bg-warm-gold/10 blur-2xl md:blur-[80px] rounded-[3rem] group-hover:bg-warm-gold/20 transition-all duration-700" />
      
      {/* App Window */}
      <div className="relative w-full bg-[#111] backdrop-blur-xl rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col md:flex-row h-auto min-h-[600px] max-h-[800px]">
        
        {/* Sidebar (Desktop) / Topbar (Mobile) */}
        <div className="shrink-0 w-full md:w-64 bg-black/40 border-b md:border-b-0 md:border-r border-white/5 p-4 md:p-6 flex flex-col gap-6 md:gap-8 z-10">
          <div className="flex items-center gap-2 px-2 pt-2">
            <div className="w-8 h-8 rounded bg-warm-gold flex items-center justify-center text-black font-bold">
              T
            </div>
            <span className="font-display font-bold tracking-widest text-sm text-soft-cream">TRASON</span>
          </div>

          <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
            <NavButton 
              active={activeTab === 'dashboard'} 
              onClick={() => setActiveTab('dashboard')}
              icon={<Command size={18} />}
              label="Overview"
            />
            <NavButton 
              active={activeTab === 'finance'} 
              onClick={() => setActiveTab('finance')}
              icon={<CurrencyCircleDollar size={18} />}
              label="Finance"
            />
            <NavButton 
              active={activeTab === 'career'} 
              onClick={() => setActiveTab('career')}
              icon={<Briefcase size={18} />}
              label="Career"
            />
          </nav>
          
          <div className="mt-auto hidden md:block">
            <div className="p-4 rounded-xl bg-warm-gold/5 border border-warm-gold/10">
              <div className="flex items-center gap-2 text-warm-gold mb-2">
                <Target size={16} />
                <span className="text-xs font-bold uppercase tracking-widest">Life Score</span>
              </div>
              <div className="text-3xl font-display text-soft-cream">86/100</div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0 bg-[#111] p-6 md:p-10 overflow-y-auto">
          {activeTab === 'dashboard' && <DashboardMock />}
          {activeTab === 'finance' && <FinanceMock />}
          {activeTab === 'career' && <CareerMock />}
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all whitespace-nowrap text-sm font-medium ${
        active 
          ? 'bg-warm-gold text-black shadow-lg shadow-warm-gold/20' 
          : 'text-gray-light/70 hover:bg-white/5 hover:text-white'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function DashboardMock() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h3 className="text-3xl font-display text-soft-cream">Good Evening, Alex</h3>
        <p className="text-gray-light/50 text-sm mt-1">Here is your life at a glance.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard label="Net Worth" value="$12,450" trend="+4.2%" icon={<CurrencyCircleDollar />} color="text-yellow-400" bg="bg-yellow-400/10" border="border-yellow-400/20" />
        <MetricCard label="Active Apps" value="4" trend="1 interview" icon={<Briefcase />} color="text-blue-400" bg="bg-blue-400/10" border="border-blue-400/20" />
        <MetricCard label="Vitality" value="6/7" trend="On track" icon={<Heartbeat />} color="text-rose-400" bg="bg-rose-400/10" border="border-rose-400/20" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-black/40 rounded-2xl p-6 border border-white/5">
          <h4 className="text-sm font-bold uppercase tracking-widest text-gray-light/50 mb-4">What's Next</h4>
          <div className="space-y-3">
            <TaskItem text="Submit System Design Assignment" />
            <TaskItem text="Gym (Leg Day)" />
            <TaskItem text="Review monthly budget" done />
          </div>
        </div>

        {/* Intelligence / Insight Demo */}
        <div className="bg-gradient-to-br from-warm-gold/10 to-transparent rounded-2xl p-6 border border-warm-gold/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20"><Command size={48} /></div>
          <h4 className="text-sm font-bold uppercase tracking-widest text-warm-gold mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-warm-gold animate-pulse" />
            Insight
          </h4>
          <p className="text-soft-cream text-lg leading-relaxed mt-4">
            Your transport spending is <strong className="text-warm-gold">18% higher</strong> this month, mostly from ride-hailing apps.
          </p>
          <button className="mt-6 text-sm text-warm-gold font-medium flex items-center gap-2 hover:gap-3 transition-all">
            Review transactions <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

function FinanceMock() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h3 className="text-3xl font-display text-soft-cream">Finance</h3>
          <p className="text-gray-light/50 text-sm mt-1">October 2026</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-light/50">Cash Flow</p>
          <p className="text-2xl text-green-400 font-display">+$1,240</p>
        </div>
      </div>

      <div className="h-40 w-full bg-black/40 border border-white/5 rounded-2xl flex items-end px-4 gap-2 pb-4 pt-8">
        {/* Fake chart bars */}
        {[30, 45, 20, 60, 80, 40, 90, 50, 70, 85, 30, 65].map((h, i) => (
          <div key={i} className="flex-1 bg-yellow-500/20 hover:bg-yellow-500/80 rounded-t-sm transition-all duration-300" style={{ height: `${h}%` }} />
        ))}
      </div>

      <div>
        <h4 className="text-sm font-bold uppercase tracking-widest text-gray-light/50 mb-4">Recent Transactions</h4>
        <div className="space-y-2">
          <TxItem name="Uber Ride" amount="-$24.50" category="Transport" />
          <TxItem name="Salary" amount="+$4,200.00" category="Income" positive />
          <TxItem name="Groceries" amount="-$85.20" category="Food" />
        </div>
      </div>
    </div>
  );
}

function CareerMock() {
  return (
    <div className="space-y-8 animate-fade-in">
       <div>
        <h3 className="text-3xl font-display text-soft-cream">Career Pipeline</h3>
        <p className="text-gray-light/50 text-sm mt-1">Track your professional growth.</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-black/40 border border-white/5 rounded-2xl p-4">
          <div className="text-xs font-bold uppercase tracking-widest text-gray-light/50 mb-2">Applied</div>
          <div className="space-y-2">
            <div className="bg-white/5 p-3 rounded-lg text-sm">Frontend Eng @ Stripe</div>
            <div className="bg-white/5 p-3 rounded-lg text-sm">Product Eng @ Vercel</div>
          </div>
        </div>
        <div className="bg-black/40 border border-blue-400/20 rounded-2xl p-4">
          <div className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-2">Interviewing</div>
          <div className="space-y-2">
            <div className="bg-blue-400/10 border border-blue-400/20 p-3 rounded-lg text-sm">Fullstack @ Supabase</div>
          </div>
        </div>
        <div className="bg-black/40 border border-green-400/20 rounded-2xl p-4">
          <div className="text-xs font-bold uppercase tracking-widest text-green-400 mb-2">Offers</div>
          <div className="h-full flex items-center justify-center text-gray-light/30 text-sm pb-8">Empty</div>
        </div>
      </div>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function MetricCard({ label, value, trend, icon, color, bg, border }: any) {
  return (
    <div className={`p-5 rounded-2xl ${bg} border ${border}`}>
      <div className={`w-8 h-8 rounded-lg bg-black/20 flex items-center justify-center ${color} mb-3`}>
        {icon}
      </div>
      <p className="text-xs font-bold uppercase tracking-widest text-gray-light/70">{label}</p>
      <div className="text-2xl font-display text-soft-cream mt-1">{value}</div>
      <div className="text-xs mt-2 opacity-80">{trend}</div>
    </div>
  );
}

function TaskItem({ text, done }: { text: string, done?: boolean }) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl border ${done ? 'border-white/5 bg-white/5 opacity-50' : 'border-white/10 bg-black/40'}`}>
      <CheckCircle size={20} className={done ? 'text-gray-light/50' : 'text-gray-light/30'} weight={done ? "fill" : "regular"} />
      <span className={`text-sm ${done ? 'line-through text-gray-light/50' : 'text-soft-cream'}`}>{text}</span>
    </div>
  );
}

function TxItem({ name, amount, category, positive }: any) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-black/40 border border-white/5">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
          <CurrencyCircleDollar size={20} className="text-gray-light/50" />
        </div>
        <div>
          <div className="text-sm font-medium text-soft-cream">{name}</div>
          <div className="text-xs text-gray-light/50">{category}</div>
        </div>
      </div>
      <div className={`font-display tracking-tight ${positive ? 'text-green-400' : 'text-soft-cream'}`}>
        {amount}
      </div>
    </div>
  );
}
