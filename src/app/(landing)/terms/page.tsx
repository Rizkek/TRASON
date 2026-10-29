import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { PageShell } from '@/components/landing/page/PageShell';
import { PageHeader } from '@/components/landing/page/PageHeader';
import { Prose, Callout } from '@/components/landing/page/Prose';
import { SITE_CONTACT } from '@/config/site';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'The terms that apply when you use TRASON.',
  alternates: { canonical: '/terms' },
};

const LAST_UPDATED = 'October 28, 2026';

export default function TermsPage() {
  return (
    <PageShell>
      <PageHeader title="Terms of Service" lede={`Last updated: ${LAST_UPDATED}`} />

      <Prose className="mt-12 prose-lg">
        <p>
          These terms apply when you create a TRASON account or use the app. By creating an account you agree to them.
          How we handle your data is described separately in the <Link href="/privacy">Privacy Policy</Link>.
        </p>

        <h2>1. Your account</h2>
        <ul>
          <li>Give a real email address you can receive mail at; we use it to confirm the account and to reset your password.</li>
          <li>Keep your password to yourself. You are responsible for what happens under your account.</li>
          <li>If you think someone else has access, reset your password right away and tell us.</li>
          <li>If you are under 18, use TRASON only with permission from a parent or guardian.</li>
        </ul>

        <h2>2. Your content</h2>
        <p>
          Everything you record in TRASON stays yours. You allow us to store and process it only to run the service for
          you, as described in the Privacy Policy. Do not upload content you have no right to, or content that is
          illegal.
        </p>

        <h2>3. Acceptable use</h2>
        <p>Do not:</p>
        <ul>
          <li>try to access another person&apos;s account or data;</li>
          <li>probe, overload or disrupt the service, or get around its bot checks and rate limits;</li>
          <li>use automated scripts to create accounts or send requests;</li>
          <li>use TRASON for anything illegal.</li>
        </ul>

        <h2>4. AI drafts, scores and figures</h2>
        <p>
          Receipt scans, Smart Input, payout imports and weekly summaries are drafts produced by AI and can be wrong.
          Check them before you save. Life Score, financial health, career rates, exchange rates and investment prices
          are calculated or fetched automatically and are for your own tracking only. Nothing in TRASON is financial,
          tax, legal, medical or career advice.
        </p>

        <h2>5. Price</h2>
        <p>
          TRASON is currently free. If paid features are introduced, we will tell you before anything you already use
          changes, and you will not be charged without agreeing to it first.
        </p>

        <h2>6. Changes and availability</h2>
        <p>
          We improve TRASON over time, so features can change, move, or be removed. We try to keep the service
          available, but it may be interrupted for maintenance or by problems with the services we depend on. We will
          give notice of significant changes in the app or by email.
        </p>

        <h2>7. Ending your account</h2>
        <p>
          You can delete your account at any time in Settings, under Security. We may suspend or close an account that
          breaks these terms, and will tell you why unless the law prevents it.
        </p>

        <h2>8. Liability</h2>
        <p>
          TRASON is provided as it is. We take care to keep your records safe, but we cannot promise the service will be
          free of errors or interruptions. To the extent the law allows, we are not liable for indirect losses, or for
          decisions you make based on what the app shows. Nothing in these terms limits rights you have under Indonesian
          consumer protection law.
        </p>

        <h2>9. Governing law</h2>
        <p>
          These terms are governed by the laws of the Republic of Indonesia. If a dispute arises, we will first try to
          settle it with you directly.
        </p>

        <h2>10. Changes to these terms</h2>
        <p>
          When these terms change, the date at the top changes too. If a change matters for how you use TRASON, we will
          tell you before it takes effect. Continuing to use TRASON after that means you accept the new terms.
        </p>
      </Prose>

      <Callout>
        Questions about these terms:{' '}
        <a className="font-medium text-primary underline underline-offset-4" href={`mailto:${SITE_CONTACT.email}`}>
          {SITE_CONTACT.email}
        </a>
        .
      </Callout>
    </PageShell>
  );
}
