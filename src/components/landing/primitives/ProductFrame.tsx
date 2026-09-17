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
 * The dark application window every product visual lives in. The frame is
 * always dark so the product reads as the product, whatever the page theme.
 */
export function WindowFrame({ path, label, className = '', children }: WindowFrameProps) {
  return (
    <figure
      role="img"
      aria-label={label}
      className={`overflow-hidden rounded-2xl border border-ui-border/10 bg-ui-bg text-ui-fg shadow-[0_30px_80px_-30px_rgba(11,15,20,0.45)] ${className}`}
    >
      <div
        aria-hidden="true"
        className="flex h-10 items-center gap-3 border-b border-ui-border/[0.06] bg-ui-surface/60 px-4"
      >
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-ui-border/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-ui-border/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-ui-border/15" />
        </div>
        <div className="mx-auto hidden h-6 w-full max-w-[260px] items-center justify-center rounded-md border border-ui-border/[0.08] bg-ui-bg/60 px-3 font-mono text-[11px] text-ui-muted sm:flex">
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
      className={`relative mx-auto w-[280px] overflow-hidden rounded-[2.4rem] border border-ui-border/15 bg-ui-bg text-ui-fg shadow-[0_40px_90px_-30px_rgba(11,15,20,0.5)] ring-8 ring-ui-bg/90 ${className}`}
    >
      <div aria-hidden="true" className="flex h-9 items-center justify-between px-6 pt-2 text-[11px] font-medium text-ui-fg/80">
        <span>09:41</span>
        <span className="absolute left-1/2 top-2 h-5 w-20 -translate-x-1/2 rounded-full bg-black" />
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-ui-fg/80" />
          <span className="h-2 w-2 rounded-full bg-ui-fg/80" />
          <span className="h-2 w-2 rounded-full bg-ui-fg/40" />
        </span>
      </div>
      <div aria-hidden="true">{children}</div>
    </figure>
  );
}
