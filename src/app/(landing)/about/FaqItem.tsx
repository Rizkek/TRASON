'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export function FaqItem({ q, a }: { q: string, a: string }) {
  const [open, setOpen] = useState(false);
  
  return (
    <div className="border border-white/5 rounded-xl bg-black/20 overflow-hidden">
      <button 
        className="w-full text-left px-lg py-md flex justify-between items-center font-bold text-gray-light hover:text-white transition-colors"
        onClick={() => setOpen(!open)}
      >
        {q}
        {open ? <ChevronUp size={20} className="text-warm-gold" /> : <ChevronDown size={20} className="text-gray-light group-hover:text-soft-cream transition-colors" />}
      </button>
      {open && (
        <div className="px-lg pb-md text-gray-light/80 leading-relaxed text-sm">
          {a}
        </div>
      )}
    </div>
  );
}
