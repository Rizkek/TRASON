import React from 'react';

interface SectionHeadingProps {
  id: string;
  eyebrow?: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  align?: 'left' | 'center';
  as?: 'h1' | 'h2';
  className?: string;
}

/** An emphasized phrase inside a title: solid gold highlight with dark text, readable in both themes. */
export function Mark({ children }: { children: React.ReactNode }) {
  return <mark className="box-decoration-clone rounded-md bg-primary px-2 text-on-primary">{children}</mark>;
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
  as: Tag = 'h2',
  className = '',
}: SectionHeadingProps) {
  const alignClass = align === 'center' ? 'mx-auto items-center text-center' : 'items-start text-left';

  return (
    <div className={`flex max-w-2xl flex-col gap-4 ${alignClass} ${className}`}>
      {eyebrow && (
        <p className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-primary" />
          {eyebrow}
        </p>
      )}
      <Tag id={id} className="text-heading-xl leading-[1.08] text-foreground sm:text-4xl lg:text-display-md">
        {title}
      </Tag>
      {lede && <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">{lede}</p>}
    </div>
  );
}
