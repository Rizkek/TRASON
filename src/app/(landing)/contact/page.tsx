import React from 'react';
import type { Metadata } from 'next';
import { Envelope, ChatCircle, MapPin } from '@phosphor-icons/react/dist/ssr';
import { PageShell } from '@/components/landing/page/PageShell';
import { PageHeader } from '@/components/landing/page/PageHeader';
import { SITE_CONTACT } from '@/config/site';
import { ContactForm } from './ContactForm';
import { HelpFaq } from './HelpFaq';

export const metadata: Metadata = {
  title: 'Contact and help',
  description: 'Answers to common questions about TRASON, and how to reach us.',
  alternates: { canonical: '/contact' },
};

const CHANNELS = [
  { icon: Envelope, label: 'Email', value: SITE_CONTACT.email, href: `mailto:${SITE_CONTACT.email}` },
  { icon: ChatCircle, label: 'WhatsApp', value: 'Send a message', href: SITE_CONTACT.whatsappUrl },
  { icon: MapPin, label: 'Based in', value: SITE_CONTACT.location },
];

export default function ContactPage() {
  return (
    <PageShell width="wide">
      <PageHeader
        title="Contact and help"
        lede="Questions about your account, a problem, or an idea. Check the answers below first; if yours is not there, write to us."
      />

      <div className="mt-14 grid gap-14 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-7">
          <HelpFaq />
        </div>

        <div className="space-y-10 lg:col-span-5">
          <section aria-labelledby="channels-heading" className="space-y-5">
            <h2 id="channels-heading" className="text-heading-lg text-foreground">
              Reach us
            </h2>
            <ul className="space-y-4">
              {CHANNELS.map(({ icon: Icon, label, value, href }) => (
                <li key={label} className="flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm text-muted-foreground">{label}</p>
                    {href ? (
                      <a
                        href={href}
                        target={href.startsWith('http') ? '_blank' : undefined}
                        rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="break-words font-medium text-foreground underline-offset-4 hover:underline"
                      >
                        {value}
                      </a>
                    ) : (
                      <p className="font-medium text-foreground">{value}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <ContactForm />
        </div>
      </div>
    </PageShell>
  );
}
