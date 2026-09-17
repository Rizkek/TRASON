import React from 'react';
import Link from 'next/link';
import { ArrowRight } from '@phosphor-icons/react/dist/ssr';

type Variant = 'primary' | 'secondary' | 'inverted';
type Size = 'md' | 'lg';

interface CtaLinkProps {
  href: string;
  children: React.ReactNode;
  variant?: Variant;
  size?: Size;
  withArrow?: boolean;
  className?: string;
  id?: string;
}

const VARIANT_CLASS: Record<Variant, string> = {
  primary:
    'bg-lp-foreground text-lp-background hover:bg-lp-foreground/90 focus-visible:outline-lp-foreground',
  secondary:
    'border border-lp-border/15 bg-transparent text-lp-foreground hover:bg-lp-foreground/[0.04] focus-visible:outline-lp-foreground',
  inverted:
    'bg-lp-background text-lp-foreground hover:bg-white focus-visible:outline-lp-background',
};

const SIZE_CLASS: Record<Size, string> = {
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-6 text-[15px] sm:h-14 sm:px-7',
};

/** A link that looks like a button. Real anchor, real keyboard semantics. */
export function CtaLink({
  href,
  children,
  variant = 'primary',
  size = 'md',
  withArrow = false,
  className = '',
  id,
}: CtaLinkProps) {
  return (
    <Link
      id={id}
      href={href}
      className={`inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-[-0.01em] transition-colors ${VARIANT_CLASS[variant]} ${SIZE_CLASS[size]} ${className}`}
    >
      {children}
      {withArrow && <ArrowRight size={16} weight="bold" aria-hidden="true" />}
    </Link>
  );
}
