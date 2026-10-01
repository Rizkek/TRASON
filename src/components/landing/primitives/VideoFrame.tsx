'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import type { LandingVideo } from '../media';

interface VideoFrameProps {
  video: LandingVideo;
  sizes: string;
  /** CSS aspect ratio. Defaults to the poster's intrinsic ratio. */
  aspect?: string;
  className?: string;
  /** Layered on top of the media (gradients, copy). */
  children?: React.ReactNode;
}

/**
 * Cinematic media slot with a strict fallback chain:
 *
 *   poster image (always rendered, optimized by next/image)
 *     → muted, inline, looping video once it is in view
 *     → stays on the poster when: no source exists, the user prefers reduced
 *       motion, Data Saver is on, or the video fails to load.
 *
 * The page never depends on the video and never shows an empty box.
 */
export function VideoFrame({ video, sizes, aspect, className = '', children }: VideoFrameProps) {
  const { desktop, mobile, poster } = video;
  const hasSource = Boolean(desktop || mobile);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [motionAllowed, setMotionAllowed] = useState(false);
  const [inView, setInView] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!hasSource) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    setMotionAllowed(!reduced && !saveData);
  }, [hasSource]);

  useEffect(() => {
    if (!hasSource || !motionAllowed || !wrapperRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: '200px 0px' }
    );
    observer.observe(wrapperRef.current);
    return () => observer.disconnect();
  }, [hasSource, motionAllowed]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (inView) {
      el.play().catch(() => setFailed(true));
    } else {
      el.pause();
    }
  }, [inView]);

  const showVideo = hasSource && motionAllowed && !failed;
  const ratio = aspect ?? `${poster.width} / ${poster.height}`;

  return (
    <div
      ref={wrapperRef}
      className={`relative overflow-hidden bg-ui-bg ${className}`}
      style={{ aspectRatio: ratio }}
    >
      <Image
        src={poster.src}
        alt={poster.alt}
        fill
        sizes={sizes}
        className={`object-cover transition-opacity duration-700 ${showVideo && ready ? 'opacity-0' : 'opacity-100'}`}
      />

      {showVideo && (
        <video
          ref={videoRef}
          muted
          loop
          playsInline
          preload="none"
          poster={poster.src}
          aria-hidden="true"
          tabIndex={-1}
          onCanPlay={() => setReady(true)}
          onError={() => setFailed(true)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${ready ? 'opacity-100' : 'opacity-0'}`}
        >
          {desktop && <source src={desktop} media="(min-width: 768px)" type="video/mp4" />}
          {mobile && <source src={mobile} type="video/mp4" />}
          {!mobile && desktop && <source src={desktop} type="video/mp4" />}
        </video>
      )}

      {children}
    </div>
  );
}
