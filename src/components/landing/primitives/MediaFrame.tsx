import React from 'react';
import Image from 'next/image';
import type { LandingImage } from '../media';

interface MediaFrameProps {
  image: LandingImage;
  /** CSS aspect ratio, e.g. "4 / 5". Defaults to the image's intrinsic ratio. */
  aspect?: string;
  /** Responsive `sizes` hint for next/image. */
  sizes: string;
  priority?: boolean;
  className?: string;
  imgClassName?: string;
  children?: React.ReactNode;
}

/**
 * Photography wrapper. Reserves space with an aspect ratio so images never
 * shift layout, and always goes through next/image for AVIF/WebP + sizing.
 */
export function MediaFrame({
  image,
  aspect,
  sizes,
  priority = false,
  className = '',
  imgClassName = '',
  children,
}: MediaFrameProps) {
  const ratio = aspect ?? `${image.width} / ${image.height}`;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-lp-foreground/[0.04] ${className}`}
      style={{ aspectRatio: ratio }}
    >
      <Image
        src={image.src}
        alt={image.alt}
        fill
        sizes={sizes}
        priority={priority}
        className={`object-cover ${imgClassName}`}
      />
      {children}
    </div>
  );
}
