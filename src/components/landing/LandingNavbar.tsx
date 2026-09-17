'use client';

import React, { useEffect, useId, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { List as Menu, X } from '@phosphor-icons/react';
import { Logo } from '@/components';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

/**
 * `light` pins the bar to the landing's editorial tokens (used on "/").
 * `auto` follows the app theme class, which the other public pages rely on.
 */
type Tone = 'light' | 'auto';

const NAV_ITEMS = [
  { name: 'Product', href: '/#product' },
  { name: 'How it works', href: '/#how-it-works' },
  { name: 'About', href: '/about' },
];

const STYLES: Record<
  Tone,
  {
    barScrolled: string;
    fg: string;
    muted: string;
    mutedHover: string;
    ctaBg: string;
    ctaFg: string;
    sheet: string;
    sheetActive: string;
    divider: string;
  }
> = {
  light: {
    barScrolled: 'bg-lp-background/90 border-lp-border/[0.08]',
    fg: 'text-lp-foreground',
    muted: 'text-lp-muted',
    mutedHover: 'hover:text-lp-foreground',
    ctaBg: 'bg-lp-foreground hover:bg-lp-foreground/90',
    ctaFg: 'text-lp-background',
    sheet: 'bg-lp-background border-lp-border/10',
    sheetActive: 'bg-lp-foreground/[0.05]',
    divider: 'bg-lp-border/10',
  },
  auto: {
    barScrolled: 'bg-soft-cream/90 dark:bg-warm-black/90 border-black/[0.06] dark:border-white/[0.06]',
    fg: 'text-warm-black dark:text-soft-cream',
    muted: 'text-gray-medium dark:text-gray-light',
    mutedHover: 'hover:text-warm-black dark:hover:text-soft-cream',
    ctaBg: 'bg-warm-black dark:bg-soft-cream hover:opacity-85',
    ctaFg: 'text-soft-cream dark:text-warm-black',
    sheet: 'bg-soft-cream dark:bg-warm-black border-black/10 dark:border-white/10',
    sheetActive: 'bg-black/5 dark:bg-white/5',
    divider: 'bg-black/[0.08] dark:bg-white/[0.08]',
  },
};

export function LandingNavbar({ tone = 'auto' }: { tone?: Tone }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const menuId = useId();
  const s = STYLES[tone];

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        setScrolled(window.scrollY > 16);
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const isCurrent = (href: string) => href === pathname;

  return (
    <nav
      aria-label="Main navigation"
      className={`fixed top-0 z-50 w-full border-b transition-[background-color,border-color,padding] duration-300 ${
        scrolled || open ? `${s.barScrolled} py-2 backdrop-blur-xl` : 'border-transparent bg-transparent py-4'
      }`}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 sm:px-8 lg:px-12">
        <Link href="/" className={`flex items-center gap-2 ${s.fg}`} aria-label="TRASON home">
          <Logo size={26} />
          <span className="font-brand text-xl tracking-tight">TRASON</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              aria-current={isCurrent(item.href) ? 'page' : undefined}
              className={`text-sm transition-colors ${isCurrent(item.href) ? s.fg : `${s.muted} ${s.mutedHover}`}`}
            >
              {item.name}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-5 md:flex">
          {tone === 'auto' && <ThemeToggle />}
          <Link href="/login" className={`text-sm transition-colors ${s.muted} ${s.mutedHover}`}>
            Log in
          </Link>
          <Link
            href="/signup"
            className={`inline-flex h-10 items-center rounded-full px-4 text-sm font-medium transition-colors ${s.ctaBg} ${s.ctaFg}`}
          >
            Get started
          </Link>
        </div>

        <button
          type="button"
          className={`-mr-2 flex h-10 w-10 items-center justify-center rounded-full md:hidden ${s.fg}`}
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={menuId}
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
        </button>
      </div>

      {open && (
        <div
          id={menuId}
          className={`absolute left-0 top-full flex w-full flex-col gap-1 border-b px-5 py-4 shadow-xl md:hidden ${s.sheet}`}
        >
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setOpen(false)}
              aria-current={isCurrent(item.href) ? 'page' : undefined}
              className={`rounded-lg px-3 py-3 text-base ${isCurrent(item.href) ? `${s.sheetActive} ${s.fg}` : s.muted}`}
            >
              {item.name}
            </Link>
          ))}
          <div className={`my-3 h-px ${s.divider}`} />
          {tone === 'auto' && (
            <div className="flex items-center justify-between px-3 py-2">
              <span className={`text-sm ${s.muted}`}>Theme</span>
              <ThemeToggle />
            </div>
          )}
          <Link href="/login" onClick={() => setOpen(false)} className={`px-3 py-3 text-base ${s.muted}`}>
            Log in
          </Link>
          <Link
            href="/signup"
            onClick={() => setOpen(false)}
            className={`mt-1 flex h-12 items-center justify-center rounded-full text-base font-medium ${s.ctaBg} ${s.ctaFg}`}
          >
            Get started
          </Link>
        </div>
      )}
    </nav>
  );
}
