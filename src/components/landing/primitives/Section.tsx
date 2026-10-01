import React from 'react';

type Tone = 'default' | 'tinted' | 'dark';

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  id?: string;
  /** id of the heading element that labels this section */
  labelledBy: string;
  tone?: Tone;
  /** Removes the vertical padding so a full-bleed child can control it. */
  bare?: boolean;
  children: React.ReactNode;
}

const TONE_CLASS: Record<Tone, string> = {
  default: '',
  tinted: 'bg-lp-foreground/[0.025] border-y border-lp-border/[0.06]',
  dark: 'bg-ui-bg text-ui-fg',
};

/**
 * Vertical rhythm for the landing page: one section padding scale, one
 * container width, one horizontal gutter. Every section aligns to the same
 * left axis at every breakpoint.
 */
export function Section({
  id,
  labelledBy,
  tone = 'default',
  bare = false,
  className = '',
  children,
  ...rest
}: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={`relative ${bare ? '' : 'py-20 sm:py-24 lg:py-32'} ${TONE_CLASS[tone]} ${className}`}
      {...rest}
    >
      {children}
    </section>
  );
}

export function Container({
  className = '',
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`mx-auto w-full max-w-6xl px-5 sm:px-8 lg:px-12 ${className}`}>
      {children}
    </div>
  );
}
