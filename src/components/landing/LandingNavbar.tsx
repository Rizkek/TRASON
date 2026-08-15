'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, ArrowUpRight, List as Menu, X } from '@phosphor-icons/react';
import { ChartPieSlice as PieChart, Briefcase, Heartbeat, SquaresFour as LayoutDashboard, Monitor, Target } from '@phosphor-icons/react';
import { Logo } from '@/components';

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    let lastScrollY = 0;
    let ticking = false;

    const handleScroll = () => {
      lastScrollY = window.scrollY;
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(lastScrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Product', href: '/' },
    { name: 'Preview', href: '/#preview' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'About', href: '/about' },
  ];

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'py-sm backdrop-blur-xl bg-warm-black/80 border-b border-black/[0.05] dark:border-white/[0.05] shadow-2xl' : 'py-md bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-lg md:px-2xl flex justify-between items-center">
        <Link href="/" className="flex items-center gap-sm group cursor-pointer">
          <div className="transform transition-transform duration-500 hover:scale-105">
            <Logo size={32} />
          </div>
          <span className="text-2xl font-brand font-extrabold tracking-tight">TRASON</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-2xl bg-black/[0.03] dark:bg-white/[0.03] px-xl py-sm rounded-full border border-black/[0.05] dark:border-white/[0.05]">
          {navItems.map((item) => (
            <Link 
              key={item.name} 
              href={item.href} 
              className={`text-sm font-medium transition-colors ${pathname === item.href ? 'text-warm-gold' : 'text-gray-light hover:text-warm-gold'}`}
            >
              {item.name}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-lg">
          <Link href="/login" className="text-sm font-bold text-gray-light hover:text-warm-gold transition-colors">
            Log in
          </Link>
          <Link href="/signup">
            <button className="relative overflow-hidden bg-warm-gold text-warm-black px-xl py-2.5 rounded-xl text-sm font-bold shadow-[0_0_20px_rgba(244,201,93,0.2)] hover:shadow-[0_0_30px_rgba(244,201,93,0.4)] hover:scale-105 transition-all duration-300 group">
              <span className="relative z-10 flex items-center gap-2">
                Get Started <ArrowUpRight size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
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
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-warm-black/95 backdrop-blur-xl border-b border-white/10 py-md px-lg flex flex-col gap-sm shadow-2xl overflow-y-auto max-h-[80vh] animate-in fade-in-0 slide-in-from-top-2 duration-200">
          {navItems.map((item) => (
            <Link 
              key={item.name} 
              href={item.href} 
              onClick={() => setMobileMenuOpen(false)}
              className={`text-lg font-medium p-2 rounded-lg py-3 ${pathname === item.href ? 'bg-warm-gold/10 text-warm-gold' : 'text-gray-light'}`}
            >
              {item.name}
            </Link>
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
