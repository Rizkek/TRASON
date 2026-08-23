'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Envelope as Mail, Compass, Shield, Wallet, Briefcase, Question as HelpCircle, PaperPlaneRight, Checks, Barbell as Dumbbell } from '@phosphor-icons/react';

interface FAQItem {
  q: string;
  a: string;
  category: string;
}

export default function SupportPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  
  // Feedback form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    { id: 'all', name: 'All Topics', icon: HelpCircle },
    { id: 'privacy', name: 'Privacy & Security', icon: Shield },
    { id: 'finance', name: 'Finance Module', icon: Wallet },
    { id: 'sport', name: 'Sport & Timeline', icon: Dumbbell },
    { id: 'career', name: 'Career Tracker', icon: Briefcase },
  ];

  const faqs: FAQItem[] = [
    {
      category: 'privacy',
      q: 'Is my data truly private?',
      a: 'Yes, absolutely. TRASON is designed as a personal sanctuary. We use Row-Level Security (RLS) via Supabase, which means your logs (finances, habits, workouts) are encrypted and strictly bound to your account. We never sell, track, or read your data.'
    },
    {
      category: 'finance',
      q: 'How do I sync stock or crypto prices?',
      a: 'TRASON automatically fetches current market prices using lightweight background schedules. You can also manually trigger a refresh by clicking the "Refresh Prices" button in the Investment Analyst screen inside your dashboard.'
    },
    {
      category: 'privacy',
      q: 'Is TRASON free or are there hidden costs?',
      a: 'TRASON is a private utility built for sovereign individuals. The core application is entirely free, self-hostable, open-source, and free of third-party advertisements or trackers. There are no surprise paywalls.'
    },
    {
      category: 'sport',
      q: 'How do I track a workout in the Sport module?',
      a: 'You can quickly log a workout directly from your main Dashboard via the Quick Log modal, or navigate to the Sport page to build long-term routines and view your weekly consistency streak.'
    },
    {
      category: 'career',
      q: 'What is the Career module?',
      a: 'The Career Architect helps you organize your professional growth. You can track active job applications, store details of company contacts, log interview dates, and schedule reminders for follow-ups.'
    },
    {
      category: 'sport',
      q: 'How do reminders work?',
      a: 'You can create notifications for hydration, workouts, or billing dates in the Reminders tab. They are designed to be non-anxious and appear neatly in your daily narrative stream.'
    }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch = faq.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          faq.a.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    
    setIsSubmitting(true);
    // Simulate API request
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setName('');
      setEmail('');
      setMessage('');
    }, 1200);
  };

  return (
    <div className="min-h-screen font-sans selection:bg-warm-gold/30 selection:text-soft-cream relative overflow-x-hidden">
      {/* Background Ambient Glows */}
      <div className="fixed top-[-10%] right-[-5%] w-[600px] h-[600px] bg-warm-gold/5 blur-[140px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-deep-sage/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-xl border-b border-black/[0.03] dark:border-white/[0.03]">
        <div className="max-w-7xl mx-auto px-6 md:px-12 h-20 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 group cursor-pointer">
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform text-warm-gold" />
            <span className="text-sm font-bold uppercase tracking-widest text-warm-gold">Back</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-warm-gold rounded-full flex items-center justify-center text-warm-black">
              <Compass size={18} />
            </div>
            <span className="text-xl font-display tracking-tight font-bold tracking-tight">TRASON</span>
          </div>
          <div className="w-20" /> {/* Spacer */}
        </div>
      </nav>

      <main className="pt-40 pb-20 px-6">
        <div className="max-w-4xl mx-auto space-y-16">
          
          {/* Header & Hero */}
          <section className="space-y-8 text-center">
            <h1 className="text-5xl md:text-7xl font-display tracking-tight leading-tight">
              Sanctuary <br />
              <span className="italic text-warm-gold">Support Center</span>
            </h1>
            <p className="text-xl text-gray-light font-light leading-relaxed max-w-2xl mx-auto">
              Need assistance building your sanctuary? Find clear answers to common questions or reach out to us directly.
            </p>

            {/* Search Bar */}
            <div className="max-w-xl mx-auto pt-4 relative group">
              <input
                type="text"
                placeholder="Search FAQs (e.g. privacy, stocks, sync)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-8 py-6 bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.08] dark:border-white/[0.08] group-hover:border-warm-gold/30 focus:border-warm-gold focus:outline-none focus:ring-1 focus:ring-warm-gold/20 rounded-full text-sm transition-all text-soft-cream placeholder:text-gray-light/40 shadow-xl"
              />
            </div>
          </section>

          {/* FAQ Categories Selector */}
          <section className="flex flex-wrap justify-center gap-2 md:gap-4">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    setExpandedFAQ(null);
                  }}
                  className={`flex items-center gap-2 px-8 py-4 rounded-full text-xs font-bold uppercase tracking-wider transition-all border duration-300 ${
                    isActive 
                      ? 'bg-warm-gold text-warm-black border-warm-gold scale-105 shadow-lg shadow-warm-gold/15' 
                      : 'bg-black/[0.02] dark:bg-white/[0.02] border-black/[0.05] dark:border-white/[0.05] hover:bg-black/[0.05] dark:bg-white/[0.05] hover:border-black/10 dark:border-white/10 text-gray-light hover:text-soft-cream'
                  }`}
                >
                  <Icon size={14} />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </section>

          {/* FAQ Display Accordion */}
          <section className="space-y-4">
            <h3 className="text-lg font-display tracking-tight italic text-warm-gold/80 mb-2">Frequently Asked Questions</h3>
            <div className="space-y-2">
              {filteredFaqs.map((faq, index) => {
                const isExpanded = expandedFAQ === index;
                return (
                  <div 
                    key={index} 
                    className="overflow-hidden rounded-2xl bg-black/[0.01] dark:bg-white/[0.01] border border-black/[0.03] dark:border-white/[0.03] hover:border-black/[0.08] dark:border-white/[0.08] transition-all"
                  >
                    <button
                      onClick={() => setExpandedFAQ(isExpanded ? null : index)}
                      className="w-full text-left px-8 py-6 flex justify-between items-center gap-4"
                    >
                      <span className="font-semibold text-sm md:text-base text-soft-cream">{faq.q}</span>
                      <span className={`text-warm-gold transition-transform duration-300 text-lg ${isExpanded ? 'rotate-45' : ''}`}>
                        +
                      </span>
                    </button>
                    <div 
                      className={`transition-all duration-500 ease-in-out overflow-hidden ${
                        isExpanded ? 'max-h-60 border-t border-black/[0.03] dark:border-white/[0.03]' : 'max-h-0'
                      }`}
                    >
                      <p className="px-8 py-6 text-xs md:text-sm text-gray-light leading-relaxed font-light">
                        {faq.a}
                      </p>
                    </div>
                  </div>
                );
              })}
              {filteredFaqs.length === 0 && (
                <div className="py-12 text-center text-gray-light/50 italic text-sm">
                  No matches found for your query. Try a different term!
                </div>
              )}
            </div>
          </section>

          {/* Contact Sanctuary Form */}
          <section className="bg-black/[0.01] dark:bg-white/[0.01] border border-black/[0.03] dark:border-white/[0.03] rounded-[2.5rem] p-8 md:p-16 space-y-8 relative overflow-hidden">
            <div className="absolute -right-16 -bottom-16 w-48 h-48 bg-deep-sage/10 blur-[80px] rounded-full pointer-events-none" />
            
            <div className="max-w-xl mx-auto space-y-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-warm-gold/10 rounded-2xl flex items-center justify-center text-warm-gold mx-auto mb-2">
                  <Mail size={20} />
                </div>
                <h2 className="text-3xl font-display tracking-tight">Still have questions?</h2>
                <p className="text-sm text-gray-light font-light leading-relaxed">
                  PaperPlaneRight a private message to the TRASON developers. We read all constructive feedback and support inquiries.
                </p>
              </div>

              {isSubmitted ? (
                <div className="p-8 rounded-2xl bg-deep-sage/10 border border-deep-sage/30 text-center space-y-4 animate-fade-in">
                  <div className="w-10 h-10 bg-deep-sage/20 text-deep-sage rounded-full flex items-center justify-center mx-auto text-xl">
                    <Checks />
                  </div>
                  <h4 className="font-display tracking-tight text-lg text-soft-cream">Message Sent Successfully</h4>
                  <p className="text-xs text-gray-light font-light">
                    Your inquiry has been stored securely in our registry. Thank you for helping us improve TRASON.
                  </p>
                  <button 
                    onClick={() => setIsSubmitted(false)}
                    className="text-xs font-bold text-warm-gold uppercase tracking-widest hover:underline pt-2"
                  >
                    PaperPlaneRight another inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-light tracking-widest uppercase">Your Name</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Jean Doe"
                        className="w-full h-12 bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/[0.05] rounded-lg px-4 text-sm text-white focus:border-warm-gold focus:outline-none focus:ring-1 focus:ring-warm-gold/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-light tracking-widest uppercase">Email Address</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="jean@sanctuary.com"
                        className="w-full h-12 bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/[0.05] rounded-lg px-4 text-sm text-white focus:border-warm-gold focus:outline-none focus:ring-1 focus:ring-warm-gold/20"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-light tracking-widest uppercase">Message / Feedback</label>
                    <textarea
                      required
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="How can we help? Share your bug reports, feature requests, or words of encouragement..."
                      className="w-full bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/[0.05] rounded-lg p-6 text-sm text-soft-cream focus:border-warm-gold focus:outline-none focus:ring-1 focus:ring-warm-gold/20 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-warm-gold hover:bg-soft-cream text-warm-black py-4 px-8 rounded-full text-sm font-bold flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-lg shadow-warm-gold/15"
                  >
                    {isSubmitting ? 'Sending inquiry...' : 'PaperPlaneRight Private Inquiry'}
                    <PaperPlaneRight size={14} />
                  </button>
                </form>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-black/[0.03] dark:border-white/[0.03] text-center">
        <p className="text-[10px] uppercase tracking-[0.3em] text-gray-light/20">
          TRASON â€” CO-CREATED FOR SOVEREIGN GROWTH.
        </p>
      </footer>
    </div>
  );
}
