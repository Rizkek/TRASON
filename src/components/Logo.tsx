import React from 'react';
import Image from 'next/image';

export interface LogoProps {
  size?: number;
  className?: string;
  variant?: 'gold' | 'currentColor' | 'white'; // Kept for compatibility but won't affect PNG
}

export function Logo({ size = 40, className = '' }: LogoProps) {
  return (
    <div 
      className={`relative flex items-center justify-center overflow-hidden rounded-xl ${className}`}
      style={{ width: size, height: size }}
    >
      <Image 
        src="/Logo Trason Cropped.png"
        alt="TRASON Logo"
        fill
        className="object-contain"
        sizes={`${size}px`}
        priority
      />
    </div>
  );
}

export default Logo;
