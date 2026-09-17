import React from 'react';
import Link from 'next/link';
import { InstagramLogo, LinkedinLogo, ChatCircle } from '@phosphor-icons/react/dist/ssr';
import { Logo } from '@/components';

type Tone = 'light' | 'auto';

const STYLES: Record<
  Tone,
  { wrap: string; fg: string; muted: string; mutedHover: string; heading: string; rule: string; social: string }
> = {
  light: {
    wrap: 'border-lp-border/[0.08] bg-lp-foreground/[0.02]',
    fg: 'text-lp-foreground',
    muted: 'text-lp-muted',
    mutedHover: 'hover:text-lp-foreground',
    heading: 'text-lp-foreground',
    rule: 'border-lp-border/[0.06]',
    social: 'border-lp-border/10 text-lp-muted hover:bg-lp-foreground/[0.05] hover:text-lp-foreground',
  },
  auto: {
    wrap: 'border-black/[0.06] dark:border-white/[0.06] bg-black/[0.015] dark:bg-white/[0.015]',
    fg: 'text-warm-black dark:text-soft-cream',
    muted: 'text-gray-medium dark:text-gray-light',
    mutedHover: 'hover:text-warm-black dark:hover:text-soft-cream',
    heading: 'text-warm-black dark:text-soft-cream',
    rule: 'border-black/5 dark:border-white/5',
    social:
      'border-black/[0.06] dark:border-white/[0.06] text-gray-medium dark:text-gray-light hover:bg-black/[0.06] dark:hover:bg-white/[0.06]',
  },
};

const COLUMNS = [
  {
    heading: 'Product',
    links: [
      { label: 'Overview', href: '/#product' },
      { label: 'How it works', href: '/#how-it-works' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Changelog', href: '/changelog' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
      { label: 'Support', href: '/support' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
      { label: 'Cookies', href: '/cookies' },
    ],
  },
];

export function LandingFooter({ tone = 'auto' }: { tone?: Tone }) {
  const year = new Date().getFullYear();
  const s = STYLES[tone];

  return (
    <footer className={`border-t ${s.wrap}`} aria-label="Site footer">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-12 lg:px-12">
        <div className="space-y-4 md:col-span-5">
          <Link href="/" className={`flex w-fit items-center gap-2 ${s.fg}`} aria-label="TRASON home">
            <Logo size={24} />
            <span className="font-brand text-lg tracking-tight">TRASON</span>
          </Link>
          <p className={`max-w-xs text-sm leading-relaxed ${s.muted}`}>
            A personal operating system for your money, career, training, schedule and reminders.
          </p>
          <div className="flex items-center gap-2 pt-1">
            <SocialLink href="https://wa.me/62895417240107" label="WhatsApp" className={s.social}>
              <ChatCircle size={16} />
            </SocialLink>
            <SocialLink href="https://instagram.com" label="Instagram" className={s.social}>
              <InstagramLogo size={16} />
            </SocialLink>
            <SocialLink href="https://linkedin.com" label="LinkedIn" className={s.social}>
              <LinkedinLogo size={16} />
            </SocialLink>
          </div>
        </div>

        <nav className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:col-span-7" aria-label="Footer">
          {COLUMNS.map((col) => (
            <div key={col.heading} className="space-y-3">
              <p className={`text-xs font-semibold uppercase tracking-[0.16em] ${s.heading}`}>{col.heading}</p>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className={`text-sm transition-colors ${s.muted} ${s.mutedHover}`}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      <div className={`border-t ${s.rule}`}>
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-5 py-5 text-xs sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
          <p className={s.muted}>© {year} TRASON. All rights reserved.</p>
          <p className={s.muted}>
            <a href="mailto:hello@trason.app" className={`transition-colors ${s.mutedHover}`}>
              hello@trason.app
            </a>
            <span aria-hidden="true"> · </span>
            Klaten, Jawa Tengah
          </p>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({
  href,
  label,
  className,
  children,
}: {
  href: string;
  label: string;
  className: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className={`flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${className}`}
    >
      {children}
    </a>
  );
}
