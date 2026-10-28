import React from 'react';

interface PageHeaderProps {
  title: React.ReactNode;
  lede?: React.ReactNode;
  align?: 'left' | 'center';
  className?: string;
}

/** Title block at the top of a public page. The title is the page's only h1. */
export function PageHeader({ title, lede, align = 'left', className = '' }: PageHeaderProps) {
  const alignClass = align === 'center' ? 'mx-auto items-center text-center' : 'items-start text-left';

  return (
    <header className={`flex max-w-3xl flex-col gap-4 ${alignClass} ${className}`}>
      <h1 className="text-heading-xl leading-[1.08] text-foreground sm:text-5xl lg:text-display-xl">{title}</h1>
      {lede && <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">{lede}</p>}
    </header>
  );
}
