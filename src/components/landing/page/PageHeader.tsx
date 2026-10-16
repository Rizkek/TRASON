import React from 'react';

interface PageHeaderProps {
  title: React.ReactNode;
  lede?: React.ReactNode;
  eyebrow?: string;
  align?: 'left' | 'center';
  className?: string;
}

/** Title block at the top of a public page. The title is the page's only h1. */
export function PageHeader({ title, lede, eyebrow, align = 'left', className = '' }: PageHeaderProps) {
  const alignClass = align === 'center' ? 'mx-auto items-center text-center' : 'items-start text-left';

  return (
    <header className={`flex max-w-3xl flex-col gap-4 ${alignClass} ${className}`}>
      {eyebrow && (
        <p className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-primary" />
          {eyebrow}
        </p>
      )}
      <h1 className="text-heading-xl leading-[1.08] text-foreground sm:text-5xl lg:text-display-xl">{title}</h1>
      {lede && <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">{lede}</p>}
    </header>
  );
}
