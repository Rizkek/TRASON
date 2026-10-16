import React from 'react';
import type { Metadata } from 'next';
import { PageShell } from '@/components/landing/page/PageShell';
import { PageHeader } from '@/components/landing/page/PageHeader';
import { Prose, Callout } from '@/components/landing/page/Prose';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'The terms that apply when you use TRASON.',
  alternates: { canonical: '/terms' },
};

export default function TermsPage() {
  return (
    <PageShell>
      <PageHeader eyebrow="Legal" title="Terms of Service" lede="Last updated: May 2026" />

      <Prose className="mt-12 prose-lg">
        <p>
          Welcome to TRASON. By accessing or using our platform, you agree to be bound by these Terms of Service. Please
          read them carefully before starting your journey.
        </p>

        <h2>1. Acceptance of terms</h2>
        <p>
          By creating an account and using TRASON, you accept and agree to comply with these terms. If you do not agree
          with any part of these terms, you may not access the service.
        </p>

        <h2>2. Your account</h2>
        <p>
          You are responsible for maintaining the confidentiality of your account credentials and for all activities that
          occur under your account. You must immediately notify us of any unauthorized use of your account.
        </p>

        <h2>3. Acceptable use</h2>
        <p>
          TRASON is designed as your personal digital living space. You agree not to use the platform for any illegal
          purposes or to store content that violates the rights of others.
        </p>

        <h2>4. Service modifications</h2>
        <p>
          We reserve the right to modify, suspend, or discontinue any part of the service at any time. We will always
          attempt to provide advance notice of any significant changes that may affect your experience.
        </p>

        <h2>5. Limitation of liability</h2>
        <p>
          TRASON is provided &ldquo;as is&rdquo;. We are not liable for any data loss, though we employ robust backup
          systems. Your use of the service is at your sole risk.
        </p>
      </Prose>

      <Callout>
        If you have any questions about these Terms, please contact us at{' '}
        <a className="font-medium text-primary underline underline-offset-4" href="mailto:legal@trason.app">
          legal@trason.app
        </a>
        .
      </Callout>
    </PageShell>
  );
}
