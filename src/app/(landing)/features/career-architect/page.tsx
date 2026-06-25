

import React from 'react';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { Briefcase, KanbanSquare, CheckCircle, FileText, ArrowUpRight, ArrowRight, MoreHorizontal, Calendar, Plus } from 'lucide-react';
import Link from 'next/link';

export default function CareerArchitectPage() {
  return (
    <div className="min-h-screen bg-warm-black text-soft-cream font-sans relative overflow-x-hidden">
      {/* Background Gradients */}
      <div className="fixed top-[-20%] left-[-10%] w-[800px] h-[800px] bg-warm-gold/5 md:blur-[160px] rounded-full pointer-events-none" style={{ transform: 'translateZ(0)', contain: 'strict' }} />
      <div className="fixed bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-warm-gold/5 md:blur-[140px] rounded-full pointer-events-none" style={{ transform: 'translateZ(0)', contain: 'strict' }} />

      <LandingNavbar />

      <main className="pt-32 md:pt-48 pb-24 px-lg max-w-7xl mx-auto space-y-32">
        {/* Hero Section */}
        <div className="text-center space-y-md max-w-4xl mx-auto relative z-10">
           <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-warm-gold/10 text-yellow-500 border border-warm-gold/20 text-sm font-bold mb-6">
             <Briefcase size={16} /> Career Architect
           </div>
           <h1 className="text-5xl md:text-7xl font-serif leading-tight">
             Design Your <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-yellow-200">Career.</span>
           </h1>
           <p className="text-xl text-gray-light/80 max-w-2xl mx-auto font-light leading-relaxed">
             Stop losing track of your applications. Manage your professional growth, prepare for interviews, and negotiate better compensation like a true CRM.
           </p>
           <div className="pt-8 flex items-center justify-center gap-4">
             <Link href="/signup">
               <button className="bg-warm-gold text-white px-8 py-4 rounded-xl font-bold hover:bg-yellow-500 transition-colors shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                 Build Your Pipeline
               </button>
             </Link>
           </div>
        </div>

        {/* Complex UI Mockup Section */}
        <div className="relative z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-warm-gold/20 to-transparent md:blur-3xl opacity-30 rounded-[3rem]" style={{ transform: 'translateZ(0)' }} />
          <div className="relative bg-black/60 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-6 md:p-12 shadow-2xl overflow-hidden">
             
             {/* Mock Header */}
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 border-b border-white/5 pb-8">
               <div>
                 <h2 className="text-3xl font-serif text-white tracking-tight mb-2">Job Pipeline</h2>
                 <p className="text-sm text-gray-light">Currently tracking 14 active applications.</p>
               </div>
               <div className="flex gap-4">
                 <button className="bg-white/5 border border-white/10 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-white/10 transition-colors">
                   Filter
                 </button>
                 <button className="bg-warm-gold text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-yellow-500 transition-colors flex items-center gap-2">
                   <Plus size={16} /> New Application
                 </button>
               </div>
             </div>

             {/* Kanban Board Mock */}
             <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 overflow-x-auto pb-4">
               
               {/* Column 1: Applied */}
               <div className="space-y-4 min-w-[280px]">
                 <div className="flex items-center justify-between mb-2">
                   <h3 className="text-sm font-bold text-gray-200 flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full bg-gray-400"></span> Applied
                   </h3>
                   <span className="text-xs font-bold bg-white/10 text-white px-2 py-1 rounded-md">8</span>
                 </div>
                 {/* Card 1 */}
                 <div className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-colors cursor-pointer group">
                   <div className="flex justify-between items-start mb-3">
                     <div className="w-10 h-10 rounded-lg bg-black/50 border border-white/10 flex items-center justify-center font-bold text-white text-lg">
                       M
                     </div>
                     <button className="text-gray-light hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                       <MoreHorizontal size={16} />
                     </button>
                   </div>
                   <h4 className="font-bold text-white text-lg">Meta</h4>
                   <p className="text-sm text-gray-light mb-4">Senior Frontend Engineer</p>
                   <div className="flex justify-between items-center text-xs text-gray-light/60">
                     <span className="flex items-center gap-1"><Calendar size={12} /> 2 days ago</span>
                   </div>
                 </div>
                 {/* Card 2 */}
                 <div className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-colors cursor-pointer group">
                   <div className="flex justify-between items-start mb-3">
                     <div className="w-10 h-10 rounded-lg bg-black/50 border border-white/10 flex items-center justify-center font-bold text-white text-lg">
                       S
                     </div>
                     <button className="text-gray-light hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                       <MoreHorizontal size={16} />
                     </button>
                   </div>
                   <h4 className="font-bold text-white text-lg">Spotify</h4>
                   <p className="text-sm text-gray-light mb-4">React Developer</p>
                   <div className="flex justify-between items-center text-xs text-gray-light/60">
                     <span className="flex items-center gap-1"><Calendar size={12} /> 1 week ago</span>
                   </div>
                 </div>
               </div>

               {/* Column 2: Reviewing */}
               <div className="space-y-4 min-w-[280px]">
                 <div className="flex items-center justify-between mb-2">
                   <h3 className="text-sm font-bold text-gray-200 flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full bg-yellow-500"></span> Reviewing
                   </h3>
                   <span className="text-xs font-bold bg-white/10 text-white px-2 py-1 rounded-md">4</span>
                 </div>
                 {/* Card */}
                 <div className="bg-white/5 border border-yellow-500/20 rounded-2xl p-5 hover:border-yellow-500/40 transition-colors cursor-pointer group">
                   <div className="flex justify-between items-start mb-3">
                     <div className="w-10 h-10 rounded-lg bg-black/50 border border-yellow-500/20 flex items-center justify-center font-bold text-white text-lg">
                       S
                     </div>
                     <button className="text-gray-light hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                       <MoreHorizontal size={16} />
                     </button>
                   </div>
                   <h4 className="font-bold text-white text-lg">Stripe</h4>
                   <p className="text-sm text-gray-light mb-4">Product Engineer</p>
                   <div className="flex justify-between items-center text-xs text-gray-light/60">
                     <span className="flex items-center gap-1"><Calendar size={12} /> Recruiter reached out</span>
                   </div>
                 </div>
               </div>

               {/* Column 3: Interview */}
               <div className="space-y-4 min-w-[280px]">
                 <div className="flex items-center justify-between mb-2">
                   <h3 className="text-sm font-bold text-gray-200 flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full bg-yellow-500"></span> Interview
                   </h3>
                   <span className="text-xs font-bold bg-white/10 text-white px-2 py-1 rounded-md">1</span>
                 </div>
                 {/* Card */}
                 <div className="bg-warm-gold/10 border border-warm-gold/30 rounded-2xl p-5 hover:border-warm-gold/50 transition-colors cursor-pointer group relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-16 h-16 bg-warm-gold/20 md:blur-xl rounded-full" style={{ transform: 'translateZ(0)' }} />
                   <div className="flex justify-between items-start mb-3 relative z-10">
                     <div className="w-10 h-10 rounded-lg bg-warm-gold/20 border border-warm-gold/30 flex items-center justify-center font-bold text-yellow-500 text-lg">
                       G
                     </div>
                     <button className="text-gray-light hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                       <MoreHorizontal size={16} />
                     </button>
                   </div>
                   <h4 className="font-bold text-white text-lg relative z-10">Google</h4>
                   <p className="text-sm text-yellow-200/70 mb-4 relative z-10">Frontend Engineer, L4</p>
                   <div className="flex justify-between items-center text-xs font-bold text-yellow-500 bg-warm-gold/20 px-3 py-2 rounded-lg relative z-10">
                     <span className="flex items-center gap-2"><Calendar size={14} /> System Design - Tomorrow 10AM</span>
                   </div>
                 </div>
               </div>

               {/* Column 4: Offer */}
               <div className="space-y-4 min-w-[280px]">
                 <div className="flex items-center justify-between mb-2">
                   <h3 className="text-sm font-bold text-gray-200 flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full bg-yellow-500"></span> Offer
                   </h3>
                   <span className="text-xs font-bold bg-white/10 text-white px-2 py-1 rounded-md">1</span>
                 </div>
                 {/* Card */}
                 <div className="bg-warm-gold/10 border border-warm-gold/30 rounded-2xl p-5 hover:border-warm-gold/50 transition-colors cursor-pointer group">
                   <div className="flex justify-between items-start mb-3">
                     <div className="w-10 h-10 rounded-lg bg-warm-gold/20 border border-warm-gold/30 flex items-center justify-center font-bold text-yellow-500 text-lg">
                       V
                     </div>
                     <button className="text-gray-light hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                       <MoreHorizontal size={16} />
                     </button>
                   </div>
                   <h4 className="font-bold text-white text-lg">Vercel</h4>
                   <p className="text-sm text-yellow-200/70 mb-4">Developer Advocate</p>
                   <div className="flex justify-between items-center text-xs font-bold text-yellow-500 bg-warm-gold/20 px-3 py-2 rounded-lg">
                     <span>$180k Base + Equity</span>
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
              <KanbanSquare size={24} />
            </div>
            <h3 className="text-3xl font-serif text-white">Application Board</h3>
            <p className="text-gray-light leading-relaxed">
              Visualize your entire job hunt. Move applications seamlessly from 'Applied' to 'Offer' and never let an opportunity slip through the cracks.
            </p>
          </div>
          <div className="space-y-6">
            <div className="w-12 h-12 bg-warm-gold/10 text-yellow-500 flex items-center justify-center rounded-2xl">
              <FileText size={24} />
            </div>
            <h3 className="text-3xl font-serif text-white">Interview Preparation Notes</h3>
            <p className="text-gray-light leading-relaxed">
              Store company research, behavioral questions, and technical prep notes directly attached to each specific job application card.
            </p>
          </div>
          <div className="space-y-6">
            <div className="w-12 h-12 bg-warm-gold/10 text-yellow-500 flex items-center justify-center rounded-2xl">
              <CheckCircle size={24} />
            </div>
            <h3 className="text-3xl font-serif text-white">Skill Progression Tracking</h3>
            <p className="text-gray-light leading-relaxed">
              Identify skill gaps required for your dream roles. Track your learning progress over time and match it against market demands.
            </p>
          </div>
          <div className="space-y-6">
            <div className="w-12 h-12 bg-warm-gold/10 text-yellow-500 flex items-center justify-center rounded-2xl">
              <ArrowUpRight size={24} />
            </div>
            <h3 className="text-3xl font-serif text-white">Compensation History</h3>
            <p className="text-gray-light leading-relaxed">
              Log historical offers and your current compensation packages to visualize your career growth trajectory and negotiate from a position of strength.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="py-24 text-center space-y-8 bg-white/5 border border-white/5 rounded-[3rem] relative overflow-hidden">
          <div className="absolute inset-0 bg-warm-gold/10 md:blur-[100px]" style={{ transform: 'translateZ(0)' }} />
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-serif text-white mb-6">Build the career you deserve.</h2>
            <p className="text-gray-light max-w-xl mx-auto mb-10">
              Treat your professional growth with the same rigor a company treats its sales pipeline.
            </p>
            <Link href="/signup">
              <button className="bg-white text-black px-8 py-4 rounded-xl font-bold flex items-center gap-2 mx-auto hover:bg-gray-200 transition-colors">
                Start Building Your Pipeline <ArrowRight size={18} />
              </button>
            </Link>
          </div>
        </div>

      </main>

      <LandingFooter />
    </div>
  );
}
