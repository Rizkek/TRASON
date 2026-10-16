'use client';

import React, { useId, useState } from 'react';
import { CaretDown } from '@phosphor-icons/react';

export interface FaqItemProps {
  q: string;
  a: string;
}

export function FaqItem({ q, a }: FaqItemProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <div
      className={`overflow-hidden rounded-xl border bg-surface transition-colors ${
        open ? 'border-primary' : 'border-foreground/15 hover:border-foreground/30'
      }`}
    >
      <h3 className="font-sans text-base">
        <button
          type="button"
          className="flex min-h-14 w-full items-center justify-between gap-4 px-5 py-3 text-left font-semibold text-foreground"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls={panelId}
        >
          <span>{q}</span>
          <span
            aria-hidden="true"
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
              open ? 'bg-primary text-on-primary' : 'bg-foreground/5 text-muted-foreground'
            }`}
          >
            <CaretDown size={16} weight="bold" className={open ? 'rotate-180' : ''} />
          </span>
        </button>
      </h3>
      <div id={panelId} role="region" hidden={!open}>
        <p className="border-t border-foreground/10 px-5 py-4 text-sm leading-relaxed text-muted-foreground">{a}</p>
      </div>
    </div>
  );
}
