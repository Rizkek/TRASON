/**
 * Single source of truth for landing media.
 *
 * Every asset lives under /public/media/landing/<section>/ and is referenced
 * from here only, so swapping a poster, adding a final video render, or
 * re-generating a photograph never requires touching a component.
 *
 * Video sources are optional on purpose: when a source is absent the
 * VideoFrame renders the poster as a still image and never leaves an empty
 * <video> box behind.
 */

export interface LandingImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface LandingVideo {
  /** Landscape render, served at ≥ 768px. */
  desktop?: string;
  /** Portrait or square render, served below 768px. */
  mobile?: string;
  poster: LandingImage;
}

const ROOT = '/media/landing';

export const landingMedia = {
  problem: {
    /**
     * Purpose: make "fragmented context" tangible without a diagram.
     * Subject: a real desk, phone + laptop + paper notebook + receipts.
     * Lighting: soft window light, morning. Mood: calm, warm neutrals.
     * Crop: 4:5 portrait on desktop split layout; centre-weighted so a 16:10
     * crop on mobile keeps the phone and notebook in frame.
     */
    image: {
      src: `${ROOT}/problem/fragmented-desk.webp`,
      alt: 'A desk with a phone, a laptop, a paper notebook and loose receipts, each holding a different part of the same week.',
      width: 1280,
      height: 1600,
    } satisfies LandingImage,
  },

  finalCta: {
    /**
     * Purpose: the closing shot. One person, one quiet moment, everything
     * in hand. Subject: person by a window in morning light, phone in hand.
     * Composition: subject on the right third, negative space on the left
     * for the headline. Video renders (when produced) should hold the same
     * frame with minimal camera movement.
     */
    video: {
      desktop: undefined,
      mobile: undefined,
      poster: {
        src: `${ROOT}/final-cta/morning-window.webp`,
        alt: 'A person standing by a bright window in the morning, glancing at their phone with a cup of coffee.',
        width: 1920,
        height: 1080,
      },
    } satisfies LandingVideo,
  },
} as const;
