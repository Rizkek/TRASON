import React from 'react';
import type { Metadata } from 'next';
import { PageShell } from '@/components/landing/page/PageShell';
import { PageHeader } from '@/components/landing/page/PageHeader';
import { Prose } from '@/components/landing/page/Prose';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'How and why TRASON uses cookies and similar technologies.',
  alternates: { canonical: '/cookies' },
};

export default function CookiesPage() {
  return (
    <PageShell>
      <PageHeader eyebrow="Legal" title="Cookie Policy" lede="Last updated: June 17, 2026" />

      <Prose className="mt-12 prose-lg">
        <p>
          At TRASON, we believe in transparency and respecting your privacy. This Cookie Policy explains how and why
          cookies and similar technologies are used by us to improve your experience.
        </p>

        <h2>What are cookies?</h2>
        <p>
          Cookies are small text files that are placed on your computer or mobile device when you visit a website. They
          are widely used to make websites work more efficiently and provide information to the owners of the site.
        </p>

        <h2>How we use cookies</h2>
        <p>We use cookies for the following purposes:</p>
        <ul>
          <li>
            <strong>Essential cookies:</strong> These are required for the operation of TRASON. They include cookies that
            enable you to log into secure areas of our application.
          </li>
          <li>
            <strong>Functional cookies:</strong> These are used to recognize you when you return to our website. This
            enables us to personalize our content for you and remember your preferences (for example, your choice of
            language or region).
          </li>
          <li>
            <strong>Analytical and performance cookies:</strong> They allow us to recognize and count the number of
            visitors and to see how visitors move around our website when they are using it. We use minimal tracking that
            respects your privacy.
          </li>
        </ul>

        <h2>Your choices</h2>
        <p>
          Most web browsers allow some control of most cookies through the browser settings. To find out more about
          cookies, including how to see what cookies have been set, visit{' '}
          <a href="https://www.aboutcookies.org" target="_blank" rel="noopener noreferrer">aboutcookies.org</a> or{' '}
          <a href="https://www.allaboutcookies.org" target="_blank" rel="noopener noreferrer">allaboutcookies.org</a>.
        </p>
        <p>
          Please note that if you choose to block essential cookies, you may not be able to access all or parts of our
          application (such as logging into your dashboard).
        </p>
      </Prose>
    </PageShell>
  );
}
