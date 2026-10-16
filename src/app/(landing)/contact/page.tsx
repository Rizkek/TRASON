import React from 'react';
import type { Metadata } from 'next';
import { Envelope as Mail, MapPin, Phone } from '@phosphor-icons/react/dist/ssr';
import { PageShell } from '@/components/landing/page/PageShell';
import { PageHeader } from '@/components/landing/page/PageHeader';
import { ContactForm } from './ContactForm';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Have questions, feedback, or need support? Get in touch with the TRASON team.',
  alternates: { canonical: '/contact' },
};

const DETAILS = [
  { icon: Mail, label: 'Email', lines: ['riskiinferno@gmail.com'], note: 'We aim to reply within 24 hours.' },
  { icon: Phone, label: 'Phone', lines: ['+62 812 3456 7890'], note: 'Mon-Fri from 9am to 5pm (WIB).' },
  { icon: MapPin, label: 'Office', lines: ['Klaten', 'Jawa Tengah, Indonesia'] },
];

export default function ContactPage() {
  return (
    <PageShell width="wide">
      <PageHeader
        align="center"
        eyebrow="Contact"
        title="Contact us"
        lede="Have questions, feedback, or need support? We are here to help."
      />

      <div className="mt-16 grid gap-12 md:grid-cols-2 md:gap-16">
        <ContactForm />

        <div className="space-y-10">
          <section aria-labelledby="contact-info" className="space-y-6">
            <h2 id="contact-info" className="text-heading-lg text-foreground">Contact information</h2>
            <ul className="space-y-6">
              {DETAILS.map(({ icon: Icon, label, lines, note }) => (
                <li key={label} className="flex items-start gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                    <Icon size={22} aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="font-sans text-base font-semibold text-foreground">{label}</h3>
                    <p className="text-muted-foreground">
                      {lines.map((line, i) => (
                        <React.Fragment key={line}>
                          {i > 0 && <br />}
                          {line}
                        </React.Fragment>
                      ))}
                    </p>
                    {note && <p className="mt-1 text-sm text-muted-foreground">{note}</p>}
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <div className="relative h-64 w-full overflow-hidden rounded-3xl border border-foreground/15 bg-surface">
            <iframe
              title="Map showing the TRASON office in Klaten"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d7907.337811271201!2d110.53974908521116!3d-7.7186288539880135!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e7a45e4a2073393%3A0xa739bc39a2090c8d!2s!5e0!3m2!1sid!2sid!4v1781767456498!5m2!1sid!2sid"
              className="h-full w-full border-0 grayscale dark:invert dark:hue-rotate-180 dark:opacity-80"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </PageShell>
  );
}
