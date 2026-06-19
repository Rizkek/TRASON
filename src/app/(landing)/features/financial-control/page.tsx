

import React from 'react';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { CircleDollarSign, TrendingUp, TrendingDown, Wallet, ArrowUpRight, BarChart3, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function FinancialControlPage() {
  return (
    <div className="min-h-screen bg-warm-black text-soft-cream font-sans relative overflow-x-hidden">
      {/* Background Gradients */}
      <div className="fixed top-[-20%] right-[-10%] w-[800px] h-[800px] bg-warm-gold/5 blur-[160px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-warm-gold/5 blur-[140px] rounded-full pointer-events-none" />

      <LandingNavbar />

      <main className="pt-32 md:pt-48 pb-24 px-lg max-w-7xl mx-auto space-y-32">
        {/* Hero Section */}
        <div className="text-center space-y-md max-w-4xl mx-auto relative z-10">
           <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-warm-gold/10 text-yellow-500 border border-warm-gold/20 text-sm font-bold mb-6">
             <CircleDollarSign size={16} /> Financial Control
           </div>
           <h1 className="text-5xl md:text-7xl font-serif leading-tight">
             Master Your <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-yellow-200">Capital.</span>
           </h1>
           <p className="text-xl text-gray-light/80 max-w-2xl mx-auto font-light leading-relaxed">
             Stop guessing where your money goes. TRASON provides absolute clarity on your burn rate, runway, and net worth trajectory across all your accounts.
           </p>
           <div className="pt-8 flex items-center justify-center gap-4">
             <Link href="/signup">
               <button className="bg-warm-gold text-warm-black px-8 py-4 rounded-xl font-bold hover:bg-yellow-500 transition-colors shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                 Start Tracking Free
               </button>
             </Link>
           </div>
        </div>

        {/* Complex UI Mockup Section */}
        <div className="relative z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-warm-gold/20 to-transparent blur-3xl opacity-30 rounded-[3rem]" />
          <div className="relative bg-black/60 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-6 md:p-12 shadow-2xl overflow-hidden">
             
             {/* Mock Header */}
             <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-white/5 pb-8">
               <div>
                 <p className="text-sm font-bold text-gray-light uppercase tracking-widest mb-2">Total Net Worth</p>
                 <h2 className="text-5xl font-serif text-white tracking-tight">$142,500.00</h2>
               </div>
               <div className="flex gap-4">
                 <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl">
                   <p className="text-xs text-gray-light mb-1">Monthly Burn Rate</p>
                   <p className="text-xl font-bold text-red-400 flex items-center gap-2"><TrendingDown size={18} /> $4,200</p>
                 </div>
                 <div className="bg-warm-gold/10 border border-warm-gold/20 px-6 py-3 rounded-2xl">
                   <p className="text-xs text-yellow-500/80 mb-1">Saving Rate</p>
                   <p className="text-xl font-bold text-yellow-500 flex items-center gap-2"><TrendingUp size={18} /> 62%</p>
                 </div>
               </div>
             </div>

             {/* Mock Grid */}
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               
               {/* Chart Area */}
               <div className="lg:col-span-2 bg-white/5 border border-white/5 rounded-3xl p-8 relative overflow-hidden group">
                 <div className="flex justify-between items-center mb-8 relative z-10">
                   <h3 className="font-bold text-white text-lg">Cash Flow Trajectory</h3>
                   <select className="bg-black/50 border border-white/10 rounded-lg px-3 py-1 text-sm text-gray-light outline-none">
                     <option>Last 6 Months</option>
                   </select>
                 </div>
                 
                 {/* Simulated Chart */}
                 <div className="h-64 flex items-end justify-between gap-2 relative z-10">
                   {[40, 35, 50, 45, 70, 65, 80, 75, 90, 85, 100, 95].map((height, i) => (
                     <div key={i} className="w-full relative group/bar cursor-pointer">
                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap z-20">
                          ${height * 100}
                        </div>
                        <div 
                          className="w-full bg-warm-gold/20 hover:bg-warm-gold/50 rounded-t-sm transition-all duration-300"
                          style={{ height: `${height}%` }}
                        />
                     </div>
                   ))}
                 </div>
                 {/* Abstract Chart Decoration */}
                 <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-warm-gold/10 to-transparent pointer-events-none" />
               </div>

               {/* Transactions & Cards */}
               <div className="space-y-8">
                 {/* Asset Allocation */}
                 <div className="bg-white/5 border border-white/5 rounded-3xl p-8">
                   <h3 className="font-bold text-white mb-6">Asset Allocation</h3>
                   <div className="space-y-4">
                     <div>
                       <div className="flex justify-between text-sm mb-2">
                         <span className="text-gray-light flex items-center gap-2"><Wallet size={14} className="text-yellow-500" /> Liquid Cash</span>
                         <span className="font-bold text-white">45%</span>
                       </div>
                       <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden">
                         <div className="h-full bg-yellow-500 w-[45%]" />
                       </div>
                     </div>
                     <div>
                       <div className="flex justify-between text-sm mb-2">
                         <span className="text-gray-light flex items-center gap-2"><BarChart3 size={14} className="text-yellow-500" /> Investments</span>
                         <span className="font-bold text-white">40%</span>
                       </div>
                       <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden">
                         <div className="h-full bg-yellow-500 w-[40%]" />
                       </div>
                     </div>
                     <div>
                       <div className="flex justify-between text-sm mb-2">
                         <span className="text-gray-light flex items-center gap-2"><CircleDollarSign size={14} className="text-yellow-500" /> Crypto</span>
                         <span className="font-bold text-white">15%</span>
                       </div>
                       <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden">
                         <div className="h-full bg-yellow-500 w-[15%]" />
                       </div>
                     </div>
                   </div>
                 </div>

                 {/* Recent Transactions */}
                 <div className="bg-white/5 border border-white/5 rounded-3xl p-8">
                   <div className="flex justify-between items-center mb-6">
                     <h3 className="font-bold text-white">Recent Activity</h3>
                     <button className="text-yellow-500 hover:text-yellow-400 text-sm font-medium">View All</button>
                   </div>
                   <div className="space-y-4">
                     {[
                       { name: 'Apple Store', cat: 'Technology', amount: '-$1,299', color: 'text-white' },
                       { name: 'Salary', cat: 'Income', amount: '+$8,500', color: 'text-yellow-500' },
                       { name: 'Whole Foods', cat: 'Groceries', amount: '-$142', color: 'text-white' },
                     ].map((t, i) => (
                       <div key={i} className="flex justify-between items-center pb-4 border-b border-white/5 last:border-0 last:pb-0">
                         <div>
                           <p className="font-bold text-sm text-gray-200">{t.name}</p>
                           <p className="text-xs text-gray-light/60">{t.cat}</p>
                         </div>
                         <p className={`font-bold text-sm ${t.color}`}>{t.amount}</p>
                       </div>
                     ))}
                   </div>
                 </div>
               </div>

             </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 py-16">
          <div className="space-y-6">
            <div className="w-12 h-12 bg-warm-gold/10 text-yellow-500 flex items-center justify-center rounded-2xl">
              <TrendingUp size={24} />
            </div>
            <h3 className="text-3xl font-serif text-white">Multi-Currency Support</h3>
            <p className="text-gray-light leading-relaxed">
              Whether you hold USD, EUR, or IDR, TRASON automatically converts and unifies your net worth into your primary base currency using real-time exchange rates.
            </p>
          </div>
          <div className="space-y-6">
            <div className="w-12 h-12 bg-warm-gold/10 text-yellow-500 flex items-center justify-center rounded-2xl">
              <BarChart3 size={24} />
            </div>
            <h3 className="text-3xl font-serif text-white">Runway Forecasting</h3>
            <p className="text-gray-light leading-relaxed">
              Based on your moving average burn rate, TRASON predicts exactly how many months of runway you have left if your income suddenly dropped to zero.
            </p>
          </div>
          <div className="space-y-6">
            <div className="w-12 h-12 bg-warm-gold/10 text-yellow-500 flex items-center justify-center rounded-2xl">
              <Wallet size={24} />
            </div>
            <h3 className="text-3xl font-serif text-white">Automated Categorization</h3>
            <p className="text-gray-light leading-relaxed">
              Stop tagging every coffee you buy. Our intelligent engine learns your spending habits and categorizes transactions automatically with 98% accuracy.
            </p>
          </div>
          <div className="space-y-6">
            <div className="w-12 h-12 bg-warm-gold/10 text-yellow-500 flex items-center justify-center rounded-2xl">
              <ArrowUpRight size={24} />
            </div>
            <h3 className="text-3xl font-serif text-white">Investment Tracking</h3>
            <p className="text-gray-light leading-relaxed">
              Connect your brokerage and crypto wallets. See your entire portfolio's performance alongside your liquid cash in one unified dashboard.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="py-24 text-center space-y-8 bg-white/5 border border-white/5 rounded-[3rem] relative overflow-hidden">
          <div className="absolute inset-0 bg-warm-gold/10 blur-[100px]" />
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-serif text-white mb-6">Take back control of your capital.</h2>
            <p className="text-gray-light max-w-xl mx-auto mb-10">
              Join thousands of professionals who have stopped guessing and started building wealth with intentionality.
            </p>
            <Link href="/signup">
              <button className="bg-white text-black px-8 py-4 rounded-xl font-bold flex items-center gap-2 mx-auto hover:bg-gray-200 transition-colors">
                Create Free Account <ArrowRight size={18} />
              </button>
            </Link>
          </div>
        </div>

      </main>

      <LandingFooter />
    </div>
  );
}
