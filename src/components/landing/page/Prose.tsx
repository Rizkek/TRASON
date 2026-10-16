import React from 'react';

// Long-form text on the tokens, so it reads the same in both themes. The typography plugin's own
// light and invert palettes are replaced property by property.
const PROSE = [
  'prose max-w-none',
  'prose-headings:font-normal prose-headings:text-foreground',
  'prose-h2:mt-12 prose-h2:text-heading-lg',
  'prose-p:text-muted-foreground prose-li:text-muted-foreground prose-li:marker:text-primary',
  'prose-strong:text-foreground',
  'prose-a:font-medium prose-a:text-primary prose-a:underline-offset-4 hover:prose-a:text-secondary',
  'prose-hr:border-foreground/10',
  'prose-blockquote:border-primary prose-blockquote:text-foreground',
].join(' ');

export function Prose({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return <div className={`${PROSE} ${className}`}>{children}</div>;
}

/** A small framed note, e.g. the contact line at the end of a legal page. */
export function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-12 rounded-xl border border-primary/50 bg-primary/10 p-5 text-sm text-foreground">{children}</div>
  );
}
