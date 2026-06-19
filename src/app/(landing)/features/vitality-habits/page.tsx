

import React from 'react';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { Activity, Calendar as CalendarIcon, Target, HeartPulse, Flame, ArrowRight, Check } from 'lucide-react';
import Link from 'next/link';

export default function VitalityHabitsPage() {
  return (
    <div className="min-h-screen bg-warm-black text-soft-cream font-sans relative overflow-x-hidden">
      {/* Background Gradients */}
      <div className="fixed top-[-20%] left-[20%] w-[800px] h-[800px] bg-warm-gold/5 blur-[160px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-warm-gold/5 blur-[140px] rounded-full pointer-events-none" />

      <LandingNavbar />

      <main className="pt-32 md:pt-48 pb-24 px-lg max-w-7xl mx-auto space-y-32">
        {/* Hero Section */}
        <div className="text-center space-y-md max-w-4xl mx-auto relative z-10">
           <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-warm-gold/10 text-yellow-500 border border-warm-gold/20 text-sm font-bold mb-6">
             <Activity size={16} /> Vitality & Habits
           </div>
           <h1 className="text-5xl md:text-7xl font-serif leading-tight">
             Forge Unbreakable <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-yellow-500">Consistency.</span>
           </h1>
           <p className="text-xl text-gray-light/80 max-w-2xl mx-auto font-light leading-relaxed">
             A humanized tracker that understands life happens. Build lasting routines, visualize your health patterns, and recover gracefully when you break the chain.
           </p>
           <div className="pt-8 flex items-center justify-center gap-4">
             <Link href="/signup">
               <button className="bg-warm-gold text-white px-8 py-4 rounded-xl font-bold hover:bg-yellow-500 transition-colors shadow-[0_0_30px_rgba(244,63,94,0.3)]">
                 Start Building Habits
               </button>
             </Link>
           </div>
        </div>

        {/* Complex UI Mockup Section */}
        <div className="relative z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-warm-gold/20 to-transparent blur-3xl opacity-30 rounded-[3rem]" />
          <div className="relative bg-black/60 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-6 md:p-12 shadow-2xl overflow-hidden">
             
             {/* Mock Header */}
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 border-b border-white/5 pb-8">
               <div>
                 <h2 className="text-3xl font-serif text-white tracking-tight mb-2">Vitality Scorecard</h2>
                 <p className="text-sm text-gray-light">Your physical and mental momentum over the last 30 days.</p>
               </div>
               <div className="flex gap-4">
                 <div className="bg-warm-gold/10 border border-warm-gold/20 px-6 py-3 rounded-2xl flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-warm-gold/20 flex items-center justify-center text-yellow-500">
                     <Flame size={20} />
                   </div>
                   <div>
                     <p className="text-xs text-yellow-500/80 mb-0.5">Current Streak</p>
                     <p className="text-xl font-bold text-yellow-500">14 Days</p>
                   </div>
                 </div>
               </div>
             </div>

             {/* UI Grid Mock */}
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               
               {/* Left Column: Habits List */}
               <div className="lg:col-span-1 space-y-4">
                 <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Target size={18} className="text-yellow-500" /> Daily Routines</h3>
                 
                 {[
                   { name: 'Morning Meditation', time: '10 min', status: 'done' },
                   { name: 'Deep Work Block', time: '90 min', status: 'done' },
                   { name: 'Weight Training', time: '45 min', status: 'pending' },
                   { name: 'Read 10 Pages', time: 'Evening', status: 'pending' },
                 ].map((habit, i) => (
                   <div key={i} className={`flex items-center justify-between p-4 rounded-2xl border ${habit.status === 'done' ? 'bg-warm-gold/5 border-warm-gold/20' : 'bg-white/5 border-white/5 hover:border-white/20'} transition-colors cursor-pointer group`}>
                     <div className="flex items-center gap-4">
                       <div className={`w-6 h-6 rounded-md flex items-center justify-center border ${habit.status === 'done' ? 'bg-warm-gold border-warm-gold text-white' : 'border-white/20 text-transparent group-hover:border-yellow-500/50'}`}>
                         <Check size={14} />
                       </div>
                       <div>
                         <p className={`font-bold text-sm ${habit.status === 'done' ? 'text-gray-300 line-through' : 'text-white'}`}>{habit.name}</p>
                         <p className="text-xs text-gray-light/60">{habit.time}</p>
                       </div>
                     </div>
                   </div>
                 ))}
               </div>

               {/* Right Column: Heatmap & Stats */}
               <div className="lg:col-span-2 space-y-8">
                 {/* Heatmap Card */}
                 <div className="bg-white/5 border border-white/5 rounded-3xl p-8">
                   <div className="flex justify-between items-center mb-6">
                     <h3 className="font-bold text-white flex items-center gap-2"><CalendarIcon size={18} className="text-yellow-500" /> Consistency Heatmap</h3>
                     <span className="text-xs font-bold bg-white/10 text-white px-3 py-1 rounded-full">Last 3 Months</span>
                   </div>
                   
                   {/* Simulated GitHub-style Heatmap */}
                   <div className="flex gap-2">
                     {Array.from({ length: 12 }).map((_, col) => (
                       <div key={col} className="flex flex-col gap-2">
                         {Array.from({ length: 7 }).map((_, row) => {
                           // Random intensity 0-4
                           const intensity = Math.floor(Math.random() * 5);
                           const bgColors = ['bg-white/5', 'bg-warm-gold/20', 'bg-warm-gold/40', 'bg-warm-gold/70', 'bg-warm-gold'];
                           return (
                             <div 
                               key={row} 
                               className={`w-4 h-4 sm:w-5 sm:h-5 rounded-sm ${bgColors[intensity]} hover:ring-2 hover:ring-white/50 transition-all cursor-pointer`}
                             />
                           );
                         })}
                       </div>
                     ))}
                   </div>
                   <div className="flex items-center justify-end gap-2 mt-4 text-xs text-gray-light">
                     <span>Less</span>
                     <div className="w-3 h-3 rounded-sm bg-white/5" />
                     <div className="w-3 h-3 rounded-sm bg-warm-gold/20" />
                     <div className="w-3 h-3 rounded-sm bg-warm-gold/40" />
                     <div className="w-3 h-3 rounded-sm bg-warm-gold/70" />
                     <div className="w-3 h-3 rounded-sm bg-warm-gold" />
                     <span>More</span>
                   </div>
                 </div>

                 {/* Health Metrics */}
                 <div className="grid grid-cols-2 gap-6">
                   <div className="bg-gradient-to-br from-warm-gold/10 to-transparent border border-warm-gold/20 rounded-3xl p-6 relative overflow-hidden">
                     <HeartPulse size={120} className="absolute -bottom-10 -right-10 text-warm-gold/10" />
                     <h4 className="text-sm font-bold text-violet-300 mb-1">Average Sleep</h4>
                     <p className="text-3xl font-serif text-white">7h 24m</p>
                     <p className="text-xs text-yellow-500 mt-2 flex items-center gap-1">+12m vs last week</p>
                   </div>
                   <div className="bg-gradient-to-br from-warm-gold/10 to-transparent border border-warm-gold/20 rounded-3xl p-6 relative overflow-hidden">
                     <Activity size={120} className="absolute -bottom-10 -right-10 text-warm-gold/10" />
                     <h4 className="text-sm font-bold text-yellow-400 mb-1">Workout Completion</h4>
                     <p className="text-3xl font-serif text-white">85%</p>
                     <p className="text-xs text-yellow-500 mt-2 flex items-center gap-1">Top 10% of users</p>
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
              <CalendarIcon size={24} />
            </div>
            <h3 className="text-3xl font-serif text-white">Heatmap Visualizations</h3>
            <p className="text-gray-light leading-relaxed">
              Visualize your consistency instantly. Our rich heatmap interface provides a bird's-eye view of your adherence to multiple habits over months or years.
            </p>
          </div>
          <div className="space-y-6">
            <div className="w-12 h-12 bg-warm-gold/10 text-yellow-500 flex items-center justify-center rounded-2xl">
              <Target size={24} />
            </div>
            <h3 className="text-3xl font-serif text-white">Flexible Routines</h3>
            <p className="text-gray-light leading-relaxed">
              Not all habits need to be done daily. Setup complex recurring schedules—like "Gym 3x a week" or "Read every weekend"—and let TRASON track your compliance intelligently.
            </p>
          </div>
          <div className="space-y-6">
            <div className="w-12 h-12 bg-warm-gold/10 text-yellow-500 flex items-center justify-center rounded-2xl">
              <HeartPulse size={24} />
            </div>
            <h3 className="text-3xl font-serif text-white">Health Correlations</h3>
            <p className="text-gray-light leading-relaxed">
              See how your sleep affects your productivity. TRASON correlates your physical vitality metrics with your daily output to help you optimize your lifestyle.
            </p>
          </div>
          <div className="space-y-6">
            <div className="w-12 h-12 bg-warm-gold/10 text-yellow-500 flex items-center justify-center rounded-2xl">
              <Activity size={24} />
            </div>
            <h3 className="text-3xl font-serif text-white">Guilt-Free Recovery</h3>
            <p className="text-gray-light leading-relaxed">
              Broke a 30-day streak? It happens. Instead of guilt-tripping notifications, TRASON focuses on your recovery time and encourages you to start the next streak immediately.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="py-24 text-center space-y-8 bg-white/5 border border-white/5 rounded-[3rem] relative overflow-hidden">
          <div className="absolute inset-0 bg-warm-gold/10 blur-[100px]" />
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-serif text-white mb-6">Master your time and energy.</h2>
            <p className="text-gray-light max-w-xl mx-auto mb-10">
              Transform your goals into concrete, trackable actions that compound over time.
            </p>
            <Link href="/signup">
              <button className="bg-white text-black px-8 py-4 rounded-xl font-bold flex items-center gap-2 mx-auto hover:bg-gray-200 transition-colors">
                Design Your Routine <ArrowRight size={18} />
              </button>
            </Link>
          </div>
        </div>

      </main>

      <LandingFooter />
    </div>
  );
}
