
import React from 'react';
import Link from 'next/link';
import { GithubLogo, LinkedinLogo, Envelope as Mail, MapPin, ChatCircle as MessageCircle, Phone } from '@phosphor-icons/react/dist/ssr';
import { Logo } from '@/components';

export function LandingFooter() {
  return (
    <footer className="py-20 px-lg border-t border-black/[0.05] dark:border-white/[0.05] bg-black/20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-xl">
        {/* Brand & Description */}
        <div className="space-y-md col-span-1 md:col-span-1">
          <div className="flex items-center gap-sm">
            <Logo size={32} />
            <span className="font-brand text-2xl font-extrabold tracking-tight text-soft-cream">TRASON</span>
          </div>
          <p className="text-sm text-gray-light font-light leading-relaxed">
            The unified personal operating system designed to eliminate app fatigue and centralize your financial, career, and vitality data.
          </p>
          <div className="flex items-center gap-2 pt-sm">
            <a
              href="https://wa.me/62895417240107"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-xl bg-white/5 border border-white/5 hover:border-warm-gold/40 hover:bg-warm-gold/10 hover:text-warm-gold text-gray-light flex items-center justify-center transition-all duration-300 group"
              aria-label="WhatsApp"
            >
              <MessageCircle size={18} className="group-hover:scale-110 transition-transform" />
            </a>
            <a
              href="https://github.com/Rizkek/TRASON"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-xl bg-white/5 border border-white/5 hover:border-warm-gold/40 hover:bg-warm-gold/10 hover:text-warm-gold text-gray-light flex items-center justify-center transition-all duration-300 group"
              aria-label="GitHub"
            >
              <GithubLogo size={18} className="group-hover:scale-110 transition-transform" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-xl bg-white/5 border border-white/5 hover:border-warm-gold/40 hover:bg-warm-gold/10 hover:text-warm-gold text-gray-light flex items-center justify-center transition-all duration-300 group"
              aria-label="LinkedIn"
            >
              <LinkedinLogo size={18} className="group-hover:scale-110 transition-transform" />
            </a>
          </div>
        </div>

        {/* Product Links */}
        <div className="space-y-md">
          <h4 className="text-xs font-bold uppercase tracking-widest text-soft-cream">Ecosystem</h4>
          <ul className="space-y-sm">
            <li><Link href="/#preview" className="text-sm text-gray-light hover:text-warm-gold transition-colors">Live Preview</Link></li>
            <li><Link href="/vision" className="text-sm text-gray-light hover:text-warm-gold transition-colors">Vision</Link></li>
            <li><Link href="/roadmap" className="text-sm text-gray-light hover:text-warm-gold transition-colors">Roadmap</Link></li>
            <li><Link href="/changelog" className="text-sm text-gray-light hover:text-warm-gold transition-colors">Changelog</Link></li>
          </ul>
        </div>

        {/* Connect Info */}
        <div className="space-y-md">
          <h4 className="text-xs font-bold uppercase tracking-widest text-soft-cream">Connect</h4>
          <ul className="space-y-sm">
            <li className="flex items-center gap-2 text-sm text-gray-light">
              <Mail size={14} className="text-warm-gold" /> hello@trason.app
            </li>
            <li className="flex items-center gap-2 text-sm text-gray-light">
              <Phone size={14} className="text-warm-gold" /> 0895417240107
            </li>
            <li className="flex items-start gap-2 text-sm text-gray-light">
              <MapPin size={14} className="mt-0.5 flex-shrink-0 text-warm-gold" />
              <span>Klaten<br />Jawa Tengah, Indonesia</span>
            </li>
          </ul>
        </div>

        {/* Legal Links */}
        <div className="space-y-md">
          <h4 className="text-xs font-bold uppercase tracking-widest text-soft-cream">Legal</h4>
          <ul className="space-y-sm">
            <li><Link href="/privacy" className="text-sm text-gray-light hover:text-warm-gold transition-colors">Privacy Policy</Link></li>
            <li><Link href="/terms" className="text-sm text-gray-light hover:text-warm-gold transition-colors">Terms of Service</Link></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-2xl pt-lg border-t border-black/10 dark:border-white/10 flex flex-col md:flex-row items-center justify-between gap-md">
        <p className="text-xs text-gray-light/60">
          © {new Date().getFullYear()} TRASON OS. All rights reserved.
        </p>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs text-gray-light">All systems operational</span>
        </div>
      </div>
    </footer>
  );
}
