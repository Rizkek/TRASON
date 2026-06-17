'use client';

import React from 'react';
import Link from 'next/link';
import { RiCompass3Line } from 'react-icons/ri';

export function LandingFooter() {
  return (
    <footer className="py-12 px-lg border-t border-black/[0.05] dark:border-white/[0.05] bg-black/20">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-xl">
        <div className="flex items-center gap-sm">
          <RiCompass3Line size={24} className="text-warm-gold" />
          <span className="font-serif text-xl font-bold tracking-tight">TRASON</span>
        </div>
        
        <div className="flex gap-lg flex-wrap justify-center">
          <Link href="/features" className="text-sm font-medium text-gray-light hover:text-warm-gold transition-colors">Features</Link>
          <Link href="/preview" className="text-sm font-medium text-gray-light hover:text-warm-gold transition-colors">Preview</Link>
          <Link href="/about" className="text-sm font-medium text-gray-light hover:text-warm-gold transition-colors">About</Link>
          <Link href="/privacy" className="text-sm font-medium text-gray-light hover:text-warm-gold transition-colors">Privacy</Link>
          <Link href="/terms" className="text-sm font-medium text-gray-light hover:text-warm-gold transition-colors">Terms</Link>
        </div>
        
        <p className="text-[10px] uppercase tracking-[0.2em] text-gray-light/40 text-center md:text-right">
          © 2026 TRASON OS
        </p>
      </div>
    </footer>
  );
}
