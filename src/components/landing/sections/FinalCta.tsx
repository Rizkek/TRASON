import React from 'react';
import Link from 'next/link';
import { Container, Section } from '../primitives/Section';
import { CtaLink } from '../primitives/CtaLink';
import { VideoFrame } from '../primitives/VideoFrame';
import { landingMedia } from '../media';

// The text sits on a photograph, so this block is white on a solid dark scrim in both themes.
export function FinalCta() {
  return (
    <Section labelledBy="cta-heading" bare className="pb-0">
      <Container className="pb-6 sm:pb-8 lg:pb-12">
        <VideoFrame
          video={landingMedia.finalCta.video}
          aspect="auto"
          sizes="(min-width: 1280px) 1152px, 100vw"
          className="rounded-3xl"
        >
          <div aria-hidden="true" className="absolute inset-0 bg-black/60" />
          <div className="relative flex min-h-[520px] flex-col justify-end p-8 sm:min-h-[560px] sm:p-12 lg:min-h-[600px] lg:p-16">
            <div className="max-w-xl">
              <h2 id="cta-heading" className="text-4xl leading-[1.05] text-white sm:text-5xl lg:text-6xl">
                Everything important.
                <br />
                In one place.
              </h2>
              <p className="mt-5 max-w-md text-base leading-relaxed text-white/80 sm:text-lg">
                Start with one module. Add the rest when you are ready.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                <CtaLink href="/signup" size="lg" withArrow id="cta-final">
                  Get started
                </CtaLink>
                <p className="text-sm text-white/80">
                  Already have an account?{' '}
                  <Link href="/login" className="inline-flex min-h-11 items-center font-medium text-white underline underline-offset-4">
                    Log in
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </VideoFrame>
      </Container>
    </Section>
  );
}
