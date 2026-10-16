'use client';

import React from 'react';
import { Logo } from './Logo';

export const LogoLoading: React.FC = () => {
  return (
    <div
      className="fixed inset-0 w-full h-[100dvh] flex flex-col items-center justify-center bg-background z-[9999] overflow-hidden"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center space-y-6">
        <Logo size={80} variant="gold" />
        <div className="flex flex-col items-center space-y-2">
          <h3 className="font-brand text-xl tracking-[0.2em] text-foreground uppercase">TRASON</h3>
          <p className="text-xs text-muted-foreground">Loading</p>
        </div>
      </div>
    </div>
  );
};
