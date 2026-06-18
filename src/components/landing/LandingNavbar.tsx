'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { RiCompass3Line } from 'react-icons/ri';
import { FiArrowUpRight, FiMenu, FiX } from 'react-icons/fi';
import { PieChart, Briefcase, Activity, LayoutDashboard, Monitor, Target } from 'lucide-react';
import { Logo } from '@/components';

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    {
      name: 'Features',
      items: [
        { name: 'Financial Control', href: '/features/financial-control', desc: 'Track every transaction and burn rate.', icon: PieChart },
        { name: 'Career Architect', href: '/features/career-architect', desc: 'Manage your professional growth.', icon: Briefcase },
        { name: 'Vitality & Habits', href: '/features/vitality-habits', desc: 'Build consistency with flexible routines.', icon: Activity },
        { name: 'Signal Reminders', href: '/features/signal-reminders', desc: 'Separate the noise from the signal.', icon: Target },
      ]
    },
    {
      name: 'Showcase',
      items: [
        { name: 'Live Dashboard', href: '/showcase/live-dashboard', desc: 'Experience the interactive preview environment.', icon: Monitor },
        { name: 'Life Command Center', href: '/showcase/life-command-center', desc: 'See how all TRASON modules connect.', icon: LayoutDashboard },
      ]
    },
    { name: 'Roadmap', href: '/roadmap' },
    { name: 'Vision', href: '/vision' },
  ];

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'py-sm backdrop-blur-xl bg-warm-black/80 border-b border-black/[0.05] dark:border-white/[0.05] shadow-2xl' : 'py-md bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-lg md:px-2xl flex justify-between items-center">
        <Link href="/" className="flex items-center gap-sm group cursor-pointer">
          <div className="w-10 h-10 flex items-center justify-center transform transition-transform duration-500 hover:scale-105">
            <Logo size={28} variant="gold" />
          </div>
          <span className="text-2xl font-serif font-bold tracking-tight">TRASON</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-2xl bg-black/[0.03] dark:bg-white/[0.03] px-xl py-sm rounded-full border border-black/[0.05] dark:border-white/[0.05]">
          {navItems.map((item) => (
            item.items ? (
              <div key={item.name} className="relative group">
                <button className="text-sm font-medium text-gray-light hover:text-warm-gold transition-colors flex items-center gap-1">
                  {item.name}
                  <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-[600px] bg-warm-black/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top translate-y-2 group-hover:translate-y-0 overflow-hidden">
                  <div className="p-6 grid grid-cols-2 gap-4">
                    {item.items.map(subItem => (
                      <Link key={subItem.name} href={subItem.href} className="p-4 flex items-start gap-4 rounded-xl hover:bg-white/5 transition-colors group/item">
                        <div className="w-10 h-10 rounded-lg bg-warm-gold/10 text-warm-gold flex items-center justify-center shrink-0 group-hover/item:bg-warm-gold group-hover/item:text-warm-black transition-colors">
                           {subItem.icon && <subItem.icon size={20} />}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-soft-cream mb-1">{subItem.name}</div>
                          <div className="text-xs text-gray-light leading-relaxed">{subItem.desc}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <Link 
                key={item.name} 
                href={item.href!} 
                className={`text-sm font-medium transition-colors ${pathname === item.href ? 'text-warm-gold' : 'text-gray-light hover:text-warm-gold'}`}
              >
                {item.name}
              </Link>
            )
          ))}
        </div>

        <div className="hidden md:flex items-center gap-lg">
          <Link href="/login" className="text-sm font-bold text-gray-light hover:text-warm-gold transition-colors">
            Log in
          </Link>
          <Link href="/signup">
            <button className="relative overflow-hidden bg-warm-gold text-warm-black px-xl py-2.5 rounded-xl text-sm font-bold shadow-[0_0_20px_rgba(244,201,93,0.2)] hover:shadow-[0_0_30px_rgba(244,201,93,0.4)] hover:scale-105 transition-all duration-300 group">
              <span className="relative z-10 flex items-center gap-2">
                Get Started <FiArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-black/20 dark:bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
            </button>
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden text-soft-cream p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-warm-black/95 backdrop-blur-xl border-b border-white/10 py-md px-lg flex flex-col gap-sm shadow-2xl overflow-y-auto max-h-[80vh]">
          {navItems.map((item) => (
            item.items ? (
              <div key={item.name} className="flex flex-col gap-1 py-2">
                <span className="text-sm font-bold text-warm-gold uppercase tracking-wider mb-2">{item.name}</span>
                {item.items.map(subItem => (
                  <Link 
                    key={subItem.name} 
                    href={subItem.href} 
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-lg font-medium p-2 rounded-lg text-gray-light hover:bg-white/5"
                  >
                    {subItem.name}
                  </Link>
                ))}
              </div>
            ) : (
              <Link 
                key={item.name} 
                href={item.href!} 
                onClick={() => setMobileMenuOpen(false)}
                className={`text-lg font-medium p-2 rounded-lg py-3 ${pathname === item.href ? 'bg-warm-gold/10 text-warm-gold' : 'text-gray-light'}`}
              >
                {item.name}
              </Link>
            )
          ))}
          <div className="h-px bg-white/10 my-4" />
          <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium p-2 text-gray-light">
            Log in
          </Link>
          <Link href="/signup" onClick={() => setMobileMenuOpen(false)} className="mt-2">
            <button className="w-full bg-warm-gold text-warm-black px-xl py-3 rounded-xl text-lg font-bold">
              Get Started
            </button>
          </Link>
        </div>
      )}
    </nav>
  );
}
