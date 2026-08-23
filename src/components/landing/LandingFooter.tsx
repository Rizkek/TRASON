import React from 'react';
import Link from 'next/link';
import {
  InstagramLogo,
  LinkedinLogo,
  Envelope as Mail,
  MapPin,
  ChatCircle as MessageCircle,
} from '@phosphor-icons/react/dist/ssr';
import { Logo } from '@/components';

export function LandingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="border-t border-black/[0.06] dark:border-white/[0.06] bg-black/[0.015] dark:bg-white/[0.015]"
      aria-label="Site footer"
    >
      <div className="max-w-6xl mx-auto px-6 md:px-12 py-16 grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8">

        {/* Brand */}
        <div className="space-y-4 col-span-1 md:col-span-1">
          <Link href="/" className="flex items-center gap-2 w-fit" aria-label="TRASON home">
            <Logo size={26} />
            <span className="font-brand text-xl font-extrabold tracking-tight text-warm-black dark:text-soft-cream">
              TRASON
            </span>
          </Link>
          <p className="text-sm text-gray-medium dark:text-gray-light leading-relaxed max-w-[220px]">
            A personal operating system for your money, time, career, and wellbeing.
          </p>
          {/* Social */}
          <div className="flex items-center gap-2 pt-1">
            <SocialLink
              href="https://wa.me/62895417240107"
              label="WhatsApp"
              icon={<MessageCircle size={16} />}
            />
            <SocialLink
              href="https://instagram.com"
              label="Instagram"
              icon={<InstagramLogo size={16} />}
            />
            <SocialLink
              href="https://linkedin.com"
              label="LinkedIn"
              icon={<LinkedinLogo size={16} />}
            />
          </div>
        </div>

        {/* Product */}
        <div className="space-y-4">
          <div className="text-[10px] font-bold uppercase tracking-widest text-warm-black dark:text-soft-cream">
            Product
          </div>
          <ul className="space-y-2.5">
            {[
              { label: 'Overview', href: '/' },
              { label: 'Pricing', href: '/pricing' },
              { label: 'Changelog', href: '/changelog' },
            ].map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-gray-medium dark:text-gray-light hover:text-warm-black dark:hover:text-soft-cream transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Company */}
        <div className="space-y-4">
          <div className="text-[10px] font-bold uppercase tracking-widest text-warm-black dark:text-soft-cream">
            Company
          </div>
          <ul className="space-y-2.5">
            {[
              { label: 'About', href: '/about' },
              { label: 'Contact', href: '/contact' },
              { label: 'Support', href: '/support' },
            ].map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-gray-medium dark:text-gray-light hover:text-warm-black dark:hover:text-soft-cream transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div className="space-y-4">
          <div className="text-[10px] font-bold uppercase tracking-widest text-warm-black dark:text-soft-cream">
            Contact
          </div>
          <ul className="space-y-3">
            <li className="flex items-center gap-2 text-sm text-gray-medium dark:text-gray-light">
              <Mail size={13} className="shrink-0" aria-hidden="true" />
              <a href="mailto:hello@trason.app" className="hover:text-warm-black dark:hover:text-soft-cream transition-colors">
                hello@trason.app
              </a>
            </li>
            <li className="flex items-start gap-2 text-sm text-gray-medium dark:text-gray-light">
              <MapPin size={13} className="shrink-0 mt-0.5" aria-hidden="true" />
              <span>Klaten, Jawa Tengah</span>
            </li>
          </ul>

          {/* Privacy trust signals */}
          <div className="pt-2 space-y-1.5">
            <Link href="/privacy" className="text-xs text-gray-medium dark:text-gray-light hover:text-warm-black dark:hover:text-soft-cream transition-colors block">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-xs text-gray-medium dark:text-gray-light hover:text-warm-black dark:hover:text-soft-cream transition-colors block">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-black/5 dark:border-white/5">
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-medium dark:text-gray-light">
            © {year} TRASON. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
            <span className="text-xs text-gray-medium dark:text-gray-light">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="w-8 h-8 rounded-lg bg-black/5 dark:bg-white/5 border border-black/6 dark:border-white/6 hover:bg-black/8 dark:hover:bg-white/8 text-gray-medium dark:text-gray-light flex items-center justify-center transition-colors"
      aria-label={label}
    >
      {icon}
    </a>
  );
}
