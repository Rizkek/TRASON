'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface SwitchProps {
  checked: boolean;
  onChange: () => void;
  /** Accessible name; the visible text next to the switch is not linked automatically. */
  label: string;
  disabled?: boolean;
  /** A save is in flight: blocks input and marks the control busy. */
  busy?: boolean;
  className?: string;
}

/** On/off control for settings. Use instead of hand-built toggle buttons. */
export function Switch({ checked, onChange, label, disabled = false, busy = false, className }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      aria-busy={busy || undefined}
      disabled={disabled || busy}
      onClick={onChange}
      className={cn(
        'relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'disabled:opacity-50',
        checked ? 'border-primary bg-primary' : 'border-foreground/20 bg-foreground/10',
        busy && 'cursor-wait',
        className
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'inline-block h-5 w-5 rounded-full transition-transform',
          checked ? 'translate-x-6 bg-on-primary' : 'translate-x-1 bg-muted-foreground'
        )}
      />
    </button>
  );
}
