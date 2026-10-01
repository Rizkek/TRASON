import React from 'react';
import { Container, Section } from '../primitives/Section';
import { SectionHeading } from '../primitives/SectionHeading';
import { PhoneFrame } from '../primitives/ProductFrame';
import { MobileUI } from '../product/MobileUI';

const POINTS = [
  { title: 'Install from the browser', body: 'Add TRASON to your home screen. It opens full-screen, like any other app.' },
  { title: 'Reminders as notifications', body: 'Turn on push notifications once and reminders reach your phone on time.' },
  { title: 'Same account everywhere', body: 'Log on your phone during the day, review on a laptop at night.' },
];

export function Mobile() {
  return (
    <Section labelledBy="mobile-heading">
      <Container>
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-16">
          <div className="order-2 flex justify-center lg:order-1 lg:col-span-5">
            <PhoneFrame label="TRASON Dashboard on a phone: Life Score, two reminders up next, net balance, vitality, and a bottom navigation bar.">
              <MobileUI />
            </PhoneFrame>
          </div>

          <div className="order-1 lg:order-2 lg:col-span-7">
            <SectionHeading
              id="mobile-heading"
              eyebrow="On your phone"
              title="The same system, in your pocket."
              lede="TRASON is a web app built for phones first. There is nothing to download from a store, and nothing you can do on desktop that you can't do here."
            />
            <ul className="mt-10 grid gap-6 sm:grid-cols-3 lg:grid-cols-1 lg:gap-5">
              {POINTS.map((p) => (
                <li key={p.title} className="border-l border-lp-border/15 pl-4">
                  <h3 className="text-lg text-lp-foreground">{p.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-lp-muted">{p.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </Section>
  );
}
