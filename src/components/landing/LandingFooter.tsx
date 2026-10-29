import React from 'react';
import Link from 'next/link';
import { ChatCircle, Envelope } from '@phosphor-icons/react/dist/ssr';
import { Logo } from '@/components';
import { SITE_CONTACT } from '@/config/site';

const COLUMNS = [
  {
    heading: 'Product',
    links: [
      { label: 'Overview', href: '/#product' },
      { label: 'How it works', href: '/#how-it-works' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Roadmap', href: '/roadmap' },
      { label: 'Changelog', href: '/changelog' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Vision', href: '/vision' },
      { label: 'Contact', href: '/contact' },
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

export function LandingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-foreground/10 bg-foreground/[0.02]" aria-label="Site footer">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-12 lg:px-12">
        <div className="space-y-4 md:col-span-5">
          <Link href="/" className="flex w-fit items-center gap-2 text-foreground" aria-label="TRASON home">
            <Logo size={24} />
            <span className="font-brand text-lg tracking-tight">TRASON</span>
          </Link>
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
            A personal operating system for your money, career, training, schedule and reminders.
          </p>
          <div className="flex items-center gap-2 pt-1">
            <SocialLink href={SITE_CONTACT.whatsappUrl} label="WhatsApp">
              <ChatCircle size={18} aria-hidden="true" />
            </SocialLink>
            <SocialLink href={`mailto:${SITE_CONTACT.email}`} label="Email">
              <Envelope size={18} aria-hidden="true" />
            </SocialLink>
          </div>
        </div>

        <nav className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:col-span-7" aria-label="Footer">
          {COLUMNS.map((col) => (
            <div key={col.heading} className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground">{col.heading}</p>
              <ul className="space-y-1">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="inline-flex min-h-9 items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      <div className="border-t border-foreground/10">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-5 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
          <p>© {year} TRASON. All rights reserved.</p>
          <p>
            <a href={`mailto:${SITE_CONTACT.email}`} className="transition-colors hover:text-foreground">
              {SITE_CONTACT.email}
            </a>
            <span aria-hidden="true"> · </span>
            {SITE_CONTACT.location}
          </p>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex h-11 w-11 items-center justify-center rounded-full border border-foreground/15 text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
    >
      {children}
    </a>
  );
}
