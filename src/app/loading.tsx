import React from 'react';

export default function GlobalLoading() {
  return (
    <div className="w-full h-full min-h-[70vh] flex flex-col items-center justify-center relative">
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/20 blur-[80px] rounded-full animate-pulse" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-accent-purple/20 blur-[60px] rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
      
      {/* TRASON Logo Pulse */}
      <div className="relative z-10 flex flex-col items-center justify-center space-y-xl">
        <div className="relative flex items-center justify-center">
          {/* Outer ring spin */}
          <div className="absolute -inset-4 rounded-full border-t border-r border-primary/50 animate-spin" style={{ animationDuration: '3s' }} />
          <div className="absolute -inset-2 rounded-full border-b border-l border-accent-purple/50 animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }} />
          
          {/* Logo container */}
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-accent-purple flex items-center justify-center shadow-[0_0_30px_rgba(78,79,235,0.5)] animate-pulse">
            <span className="text-3xl font-serif font-bold text-white italic drop-shadow-md">T</span>
          </div>
        </div>

        {/* Text Area */}
        <div className="flex flex-col items-center space-y-2">
          <h3 className="text-xl font-serif font-bold tracking-[0.2em] text-white uppercase opacity-90">
            TRASON
          </h3>
          <div className="flex items-center gap-1">
            <div className="w-1 h-1 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0s' }} />
            <div className="w-1 h-1 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.2s' }} />
            <div className="w-1 h-1 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.4s' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
