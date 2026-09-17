import React from 'react';
import { Container } from '../primitives/Section';
import { CtaLink } from '../primitives/CtaLink';
import { WindowFrame } from '../primitives/ProductFrame';
import { DashboardUI } from '../product/DashboardUI';

export function Hero() {
  return (
    <header
      aria-labelledby="hero-heading"
      className="relative overflow-hidden pt-28 sm:pt-36 lg:pt-40"
    >
      <Container>
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-8">
          <div className="lg:col-span-7">
            <p className="lp-rise flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-lp-muted">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-lp-accent" />
              Personal operating system
            </p>
            <h1
              id="hero-heading"
              className="lp-rise lp-rise-delay-1 mt-6 text-[2.75rem] leading-[1.02] text-lp-foreground sm:text-6xl lg:text-[4.5rem]"
            >
              Your life, in one clear system.
            </h1>
          </div>

          <div className="lp-rise lp-rise-delay-2 flex flex-col gap-7 lg:col-span-5 lg:pb-2">
            <p className="max-w-md text-base leading-relaxed text-lp-muted sm:text-lg">
              TRASON keeps your money, career, workouts, schedule and reminders in one connected place,
              so you always know where things stand without opening six apps.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <CtaLink href="/signup" size="lg" withArrow id="hero-cta-primary">
                Get started
              </CtaLink>
              <CtaLink href="#product" size="lg" variant="secondary" id="hero-cta-secondary">
                See the product
              </CtaLink>
            </div>
            <p className="text-xs text-lp-muted">
              Free to start · English and Indonesian · Installs like an app
            </p>
          </div>
        </div>

        <div className="lp-rise lp-rise-delay-3 mt-14 sm:mt-20">
          <WindowFrame
            path="trason.web.id/dashboard"
            label="The TRASON Dashboard: Life Score of 74 out of 100, three reminders up next, net balance and weekly workout sessions, and today's task list."
          >
            <DashboardUI />
          </WindowFrame>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-lp-muted">
            The Dashboard. Your Life Score, what is due next, the current state of your money and training,
            and today&apos;s tasks, on one screen.
          </p>
        </div>
      </Container>
    </header>
  );
}
