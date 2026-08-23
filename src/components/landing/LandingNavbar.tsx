'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUpRight, List as Menu, X } from '@phosphor-icons/react';
import { Logo } from '@/components';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 20);
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
    { name: 'Pricing', href: '/pricing' },
    { name: 'About', href: '/about' },
  ];

  return (
    <nav
      aria-label="Main navigation"
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? 'py-2 backdrop-blur-xl bg-soft-cream/90 dark:bg-warm-black/90 border-b border-black/[0.06] dark:border-white/[0.06]'
          : 'py-4 bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 md:px-12 flex justify-between items-center">
        {/* Wordmark */}
        <Link
          href="/"
          className="flex items-center gap-2 group"
          aria-label="TRASON — Home"
        >
          <Logo size={28} />
          <span className="text-xl font-brand font-extrabold tracking-tight text-warm-black dark:text-soft-cream">
            TRASON
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`text-sm font-medium transition-colors ${
                pathname === item.href
                  ? 'text-warm-black dark:text-soft-cream'
                  : 'text-gray-medium dark:text-gray-light hover:text-warm-black dark:hover:text-soft-cream'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          <ThemeToggle />
          <Link
            href="/login"
            className="text-sm font-medium text-gray-medium dark:text-gray-light hover:text-warm-black dark:hover:text-soft-cream transition-colors"
          >
            Log in
          </Link>
          <Link href="/signup">
            <button
              className="inline-flex items-center gap-1.5 bg-warm-black dark:bg-soft-cream text-soft-cream dark:text-warm-black px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-80 transition-opacity"
              aria-label="Get started with TRASON"
            >
              Get Started
              <ArrowUpRight size={15} aria-hidden="true" />
            </button>
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-warm-black dark:text-soft-cream p-2 -mr-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileMenuOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-soft-cream/98 dark:bg-warm-black/98 backdrop-blur-xl border-b border-black/10 dark:border-white/10 py-4 px-6 flex flex-col gap-1 shadow-xl animate-fade-in">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`text-base font-medium py-3 px-3 rounded-lg transition-colors ${
                pathname === item.href
                  ? 'bg-black/5 dark:bg-white/5 text-warm-black dark:text-soft-cream'
                  : 'text-gray-medium dark:text-gray-light'
              }`}
            >
              {item.name}
            </Link>
          ))}
          <div className="h-px bg-black/8 dark:bg-white/8 my-3" />
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-sm text-gray-medium dark:text-gray-light">Theme</span>
            <ThemeToggle />
          </div>
          <Link
            href="/login"
            onClick={() => setMobileMenuOpen(false)}
            className="text-base font-medium py-3 px-3 text-gray-medium dark:text-gray-light"
          >
            Log in
          </Link>
          <Link href="/signup" onClick={() => setMobileMenuOpen(false)} className="mt-1">
            <button className="w-full bg-warm-black dark:bg-soft-cream text-soft-cream dark:text-warm-black px-6 py-3 rounded-xl text-base font-semibold">
              Get Started
            </button>
          </Link>
        </div>
      )}
    </nav>
  );
}
