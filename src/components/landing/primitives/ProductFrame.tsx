import React from 'react';

interface WindowFrameProps {
  /** Shown in the window's address strip, e.g. "trason.web.id/dashboard". */
  path: string;
  /** Accessible summary of what the frame depicts. */
  label: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * The application window every product visual lives in. It uses the same tokens as the app, so
 * the preview shows the product in whichever theme the visitor is looking at.
 */
export function WindowFrame({ path, label, className = '', children }: WindowFrameProps) {
  return (
    <figure
      role="img"
      aria-label={label}
      className={`overflow-hidden rounded-2xl border border-foreground/15 bg-surface text-foreground ${className}`}
    >
      <div
        aria-hidden="true"
        className="flex h-10 items-center gap-3 border-b border-foreground/10 bg-foreground/[0.04] px-4"
      >
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-foreground/20" />
          <span className="h-2.5 w-2.5 rounded-full bg-foreground/20" />
          <span className="h-2.5 w-2.5 rounded-full bg-foreground/20" />
        </div>
        <div className="mx-auto hidden h-6 w-full max-w-[260px] items-center justify-center rounded-md border border-foreground/10 bg-background px-3 font-mono text-xs text-muted-foreground sm:flex">
          {path}
        </div>
      </div>
      <div aria-hidden="true">{children}</div>
    </figure>
  );
}

interface PhoneFrameProps {
  label: string;
  className?: string;
  children: React.ReactNode;
}

/** A plain phone-shaped frame for genuinely responsive mobile UI. */
export function PhoneFrame({ label, className = '', children }: PhoneFrameProps) {
  return (
    <figure
      role="img"
      aria-label={label}
      className={`relative mx-auto w-[280px] overflow-hidden rounded-[2.4rem] border border-foreground/20 bg-surface text-foreground ring-8 ring-foreground/10 ${className}`}
    >
      <div aria-hidden="true" className="flex h-9 items-center justify-between px-6 pt-2 text-xs font-medium text-muted-foreground">
        <span>09:41</span>
        <span className="absolute left-1/2 top-2 h-5 w-20 -translate-x-1/2 rounded-full bg-black" />
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-muted-foreground" />
          <span className="h-2 w-2 rounded-full bg-muted-foreground" />
          <span className="h-2 w-2 rounded-full bg-muted-foreground/50" />
        </span>
      </div>
      <div aria-hidden="true">{children}</div>
    </figure>
  );
}
