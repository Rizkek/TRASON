'use client';

import React, { useEffect, useId, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { List as Menu, X } from '@phosphor-icons/react';
import { Logo } from '@/components';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

const NAV_ITEMS = [
  { name: 'Product', href: '/#product' },
  { name: 'How it works', href: '/#how-it-works' },
  { name: 'Pricing', href: '/pricing' },
  { name: 'About', href: '/about' },
];

const LINK = 'text-sm transition-colors';
const CTA =
  'inline-flex items-center justify-center rounded-full bg-primary font-semibold text-on-primary transition-colors hover:bg-secondary';

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const menuId = useId();

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
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const isCurrent = (href: string) => href === pathname;

  return (
    <nav
      aria-label="Main navigation"
      className={`fixed top-0 z-50 w-full border-b transition-[background-color,border-color,padding] duration-300 ${
        scrolled || open ? 'border-foreground/10 bg-background py-2' : 'border-transparent bg-transparent py-4'
      }`}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 sm:px-8 lg:px-12">
        <Link href="/" className="flex items-center gap-2 text-foreground" aria-label="TRASON home">
          <Logo size={26} />
          <span className="font-brand text-xl tracking-tight">TRASON</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              aria-current={isCurrent(item.href) ? 'page' : undefined}
              className={`${LINK} ${isCurrent(item.href) ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {item.name}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-4 md:flex">
          <ThemeToggle />
          <Link href="/login" className={`${LINK} text-muted-foreground hover:text-foreground`}>
            Log in
          </Link>
          <Link href="/signup" className={`${CTA} h-10 px-5 text-sm`}>
            Get started
          </Link>
        </div>

        <div className="-mr-2 flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-full text-foreground"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls={menuId}
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {open && (
        <div
          id={menuId}
          className="absolute left-0 top-full flex w-full flex-col gap-1 border-b border-foreground/10 bg-background px-5 py-4 md:hidden"
        >
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setOpen(false)}
              aria-current={isCurrent(item.href) ? 'page' : undefined}
              className={`flex min-h-11 items-center rounded-lg px-3 text-base ${
                isCurrent(item.href) ? 'bg-foreground/5 text-foreground' : 'text-muted-foreground'
              }`}
            >
              {item.name}
            </Link>
          ))}
          <div className="my-3 h-px bg-foreground/10" />
          <Link href="/login" onClick={() => setOpen(false)} className="flex min-h-11 items-center px-3 text-base text-muted-foreground">
            Log in
          </Link>
          <Link href="/signup" onClick={() => setOpen(false)} className={`${CTA} mt-1 h-12 text-base`}>
            Get started
          </Link>
        </div>
      )}
    </nav>
  );
}
