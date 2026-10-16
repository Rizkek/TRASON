import React from 'react';
import type { Metadata } from 'next';
import { PageShell } from '@/components/landing/page/PageShell';
import { PageHeader } from '@/components/landing/page/PageHeader';
import { Prose, Callout } from '@/components/landing/page/Prose';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How TRASON collects, uses and protects your information.',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPolicyPage() {
  return (
    <PageShell>
      <PageHeader eyebrow="Legal" title="Privacy Policy" lede="Last updated: May 2026" />

      <Prose className="mt-12 prose-lg">
        <p>
          At TRASON, we respect your privacy and are committed to protecting the personal data you share within your
          digital living space. This Privacy Policy explains how we collect, use, and safeguard your information.
        </p>

        <h2>1. Information we collect</h2>
        <p>We only collect the information necessary to provide you with the TRASON experience. This includes:</p>
        <ul>
          <li>
            <strong>Account information:</strong> Email address and authentication credentials.
          </li>
          <li>
            <strong>Usage data:</strong> Your logged activities, financial records, and schedules stored securely in your
            workspace.
          </li>
        </ul>

        <h2>2. How we use your information</h2>
        <p>
          Your data is used exclusively to personalize your experience, provide insights, and synchronize your data across
          devices. We do not sell your personal data to third parties.
        </p>

        <h2>3. Data security</h2>
        <p>
          We implement industry-standard security measures to protect your data. Your information is stored in secured
          databases with restricted access.
        </p>

        <h2>4. Your rights</h2>
        <p>
          You have full control over your digital living space. You can request to view, modify, or permanently delete
          your data at any time through your account settings.
        </p>
      </Prose>

      <Callout>
        If you have any questions about this Privacy Policy, please contact us at{' '}
        <a className="font-medium text-primary underline underline-offset-4" href="mailto:privacy@trason.app">
          privacy@trason.app
        </a>
        .
      </Callout>
    </PageShell>
  );
}
