import React from 'react';

interface SectionHeadingProps {
  id: string;
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
 * Primary + secondary message for a section: the title carries the point,
 * the lede adds context only when needed. No eyebrow label above the title.
 */
export function SectionHeading({
  id,
  title,
  lede,
  align = 'left',
  as: Tag = 'h2',
  className = '',
}: SectionHeadingProps) {
  const alignClass = align === 'center' ? 'mx-auto items-center text-center' : 'items-start text-left';

  return (
    <div className={`flex max-w-2xl flex-col gap-4 ${alignClass} ${className}`}>
      <Tag id={id} className="text-heading-xl leading-[1.08] text-foreground sm:text-4xl lg:text-display-md">
        {title}
      </Tag>
      {lede && <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">{lede}</p>}
    </div>
  );
}
