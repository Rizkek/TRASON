'use client';

import React, { useState } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

export function FaqItem({ q, a }: { q: string, a: string }) {
  const [open, setOpen] = useState(false);
  
  return (
    <div className="border border-white/5 rounded-xl bg-black/20 overflow-hidden">
      <button 
        className="w-full text-left px-lg py-md flex justify-between items-center font-bold text-gray-light hover:text-white transition-colors"
        onClick={() => setOpen(!open)}
      >
        {q}
        {open ? <FiChevronUp /> : <FiChevronDown />}
      </button>
      {open && (
        <div className="px-lg pb-md text-gray-light/80 leading-relaxed text-sm">
          {a}
        </div>
      )}
    </div>
  );
}
