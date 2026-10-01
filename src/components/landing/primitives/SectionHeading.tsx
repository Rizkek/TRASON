import React from 'react';

interface SectionHeadingProps {
  id: string;
  eyebrow?: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  align?: 'left' | 'center';
  /** Use when the heading sits on a dark surface. */
  inverted?: boolean;
  className?: string;
}

/**
 * Primary + secondary message for a section. The eyebrow names the section,
 * the title carries the point, the lede adds context only when needed.
 */
export function SectionHeading({
  id,
  eyebrow,
  title,
  lede,
  align = 'left',
  inverted = false,
  className = '',
}: SectionHeadingProps) {
  const alignClass = align === 'center' ? 'text-center items-center mx-auto' : 'text-left items-start';
  const eyebrowColor = inverted ? 'text-ui-muted' : 'text-lp-muted';
  const titleColor = inverted ? 'text-ui-fg' : 'text-lp-foreground';
  const ledeColor = inverted ? 'text-ui-muted' : 'text-lp-muted';

  return (
    <div className={`flex max-w-2xl flex-col gap-4 ${alignClass} ${className}`}>
      {eyebrow && (
        <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${eyebrowColor}`}>
          {eyebrow}
        </p>
      )}
      <h2
        id={id}
        className={`text-[2rem] leading-[1.08] sm:text-4xl lg:text-[2.75rem] ${titleColor}`}
      >
        {title}
      </h2>
      {lede && (
        <p className={`max-w-xl text-base leading-relaxed sm:text-lg ${ledeColor}`}>{lede}</p>
      )}
    </div>
  );
}
