import React from 'react';
import Link from 'next/link';
import { ArrowRight } from '@phosphor-icons/react/dist/ssr';

type Variant = 'primary' | 'secondary';
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

// The one conversion action is brand gold with dark text; everything else is an outline.
const VARIANT_CLASS: Record<Variant, string> = {
  primary: 'bg-primary text-on-primary hover:bg-secondary',
  secondary: 'border border-foreground/25 bg-transparent text-foreground hover:bg-foreground/5',
};

const SIZE_CLASS: Record<Size, string> = {
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-6 text-base sm:h-14 sm:px-8',
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
      className={`inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-[-0.01em] transition-colors ${VARIANT_CLASS[variant]} ${SIZE_CLASS[size]} ${className}`}
    >
      {children}
      {withArrow && <ArrowRight size={16} weight="bold" aria-hidden="true" />}
    </Link>
  );
}
