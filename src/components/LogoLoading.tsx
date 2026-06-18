'use client';

import React from 'react';
import { Logo } from '@/components';

export const LogoLoading: React.FC = () => {
  return (
    <div className="w-full h-full min-h-[70vh] flex flex-col items-center justify-center relative">
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/20 blur-[80px] rounded-full animate-pulse" />
      
      {/* TRASON Logo Pulse */}
      <div className="relative z-10 flex flex-col items-center justify-center space-y-xl">
        <div className="relative flex items-center justify-center">
          {/* Outer ring spin */}
          <div className="absolute -inset-4 rounded-full border-t border-r border-primary/50 animate-spin" style={{ animationDuration: '3s' }} />
          <div className="absolute -inset-2 rounded-full border-b border-l border-primary/30 animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }} />
          
          {/* Logo container */}
          <div className="flex items-center justify-center animate-pulse">
            <Logo size={200} variant="gold" className="drop-shadow-[0_0_15px_rgba(244,201,93,0.5)]" />
          </div>
        </div>

        {/* Text Area */}
        <div className="flex flex-col items-center space-y-2">
          <h3 className="text-xl font-serif font-bold tracking-[0.2em] text-white uppercase opacity-90">
            TRASON
          </h3>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0s' }} />
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.2s' }} />
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.4s' }} />
          </div>
        </div>
      </div>
    </div>
  );
};
