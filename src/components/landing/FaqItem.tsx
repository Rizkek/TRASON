'use client';

import React, { useState } from 'react';
import { CaretDown as ChevronDown } from '@phosphor-icons/react';

export interface FaqItemProps {
  q: string;
  a: string;
}

export function FaqItem({ q, a }: FaqItemProps) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`border rounded-xl bg-black/20 backdrop-blur-sm transition-all duration-300 overflow-hidden ${
        open ? 'border-warm-gold/40 shadow-[0_0_20px_rgba(244,201,93,0.06)]' : 'border-white/5 hover:border-white/10'
      }`}
    >
      <button
        type="button"
        className="w-full text-left px-lg py-md flex justify-between items-center font-bold text-soft-cream/90 hover:text-white transition-colors gap-4"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span>{q}</span>
        <div
          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300 ${
            open ? 'bg-warm-gold/15 text-warm-gold rotate-180' : 'bg-white/5 text-gray-light'
          }`}
        >
          <ChevronDown size={16} weight="bold" />
        </div>
      </button>
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="px-lg pb-md text-gray-light leading-relaxed text-sm pt-1 border-t border-white/5">
            {a}
          </div>
        </div>
      </div>
    </div>
  );
}
