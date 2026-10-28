import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { PageShell } from '@/components/landing/page/PageShell';
import { PageHeader } from '@/components/landing/page/PageHeader';
import { Prose, Callout } from '@/components/landing/page/Prose';
import { SITE_CONTACT } from '@/config/site';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'What TRASON collects, why, who processes it, how long it is kept, and how to have it removed.',
  alternates: { canonical: '/privacy' },
};

const LAST_UPDATED = 'October 28, 2026';

// Each row must match a service the code actually calls; update when an integration is added or removed.
const PROCESSORS = [
  { name: 'Supabase', role: 'Database, sign-in and file storage', data: 'Everything in your account, including uploaded images' },
  { name: 'Vercel', role: 'Hosting and performance measurement (Speed Insights)', data: 'Requests to the site, IP address, page load timings' },
  { name: 'Google (Gemini API)', role: 'Drafts from Smart Input, receipt and payout scans, and weekly summaries', data: 'Only the text or image you submit to that feature, plus the records a summary is written from' },
  { name: 'Cloudflare', role: 'Bot check on sign-in pages, and a check that your email domain exists', data: 'Browser signals for the bot check; the domain part of your email at sign-up' },
  { name: 'Resend', role: 'Email digest and account emails', data: 'Your email address and the content of the email' },
  { name: 'Your browser’s push service (Google, Mozilla or Apple)', role: 'Delivering notifications', data: 'A device address and the encrypted notification' },
  { name: 'CoinGecko, Alpha Vantage, Yahoo Finance', role: 'Investment prices', data: 'Ticker symbols only, never amounts or your identity' },
  { name: 'open.er-api.com', role: 'Exchange rates', data: 'The currency codes requested' },
  { name: 'Clearbit, wger, dayoffapi', role: 'Company name suggestions, exercise library, public holidays', data: 'What you type in the company field, exercise searches, country and year' },
];

export default function PrivacyPolicyPage() {
  return (
    <PageShell>
      <PageHeader title="Privacy Policy" lede={`Last updated: ${LAST_UPDATED}`} />

      <Prose className="mt-12 prose-lg">
        <p>
          This policy explains what TRASON collects when you use it, why, who else handles it, how long it is kept, and
          what you can ask us to do with it. TRASON is operated from {SITE_CONTACT.location}, and this policy is written
          with Indonesia&apos;s Personal Data Protection Law (Law No. 27 of 2022) in mind.
        </p>

        <h2>1. What we collect</h2>
        <ul>
          <li>
            <strong>Account details:</strong> your email address, name, an optional profile photo, and a password, which
            is stored only as a one-way hash by our sign-in provider.
          </li>
          <li>
            <strong>Settings:</strong> language, currency, timezone, theme, which modules are on, and your notification
            choices.
          </li>
          <li>
            <strong>What you record:</strong> transactions, budgets, subscriptions, instalments, investment positions,
            schedule entries, tasks, reminders, workouts, job applications, interview notes, and saved insights.
          </li>
          <li>
            <strong>Images you upload:</strong> receipt photos and payout statements you scan, and your profile photo.
          </li>
          <li>
            <strong>Notification details:</strong> for each device where you turn on notifications, the address your
            browser gives us for delivering them, and a record of which reminders were sent so none is sent twice.
          </li>
          <li>
            <strong>Technical data:</strong> IP address, browser type and request times in our hosting providers&apos;
            logs, and anonymous page load timings.
          </li>
        </ul>
        <p>We do not collect your location, contacts, or bank credentials, and TRASON does not connect to your bank.</p>

        <h2>2. Why we use it</h2>
        <ul>
          <li>To run your account and show your records on every device you sign in on.</li>
          <li>To send the reminders, notifications and email digest you turned on.</li>
          <li>To calculate scores such as Life Score, streaks and financial health. These use fixed rules, not AI.</li>
          <li>To produce AI drafts and summaries, but only when you use a feature that asks for one.</li>
          <li>To keep the service secure, for example by stopping automated sign-up attempts.</li>
        </ul>
        <p>
          The legal basis is the agreement you enter when you create an account, and your consent for optional features
          such as notifications and AI drafts. You can withdraw consent at any time by turning the feature off.
        </p>
        <p>We do not sell your data, use it for advertising, or share it with anyone except the services listed below.</p>

        <h2>3. AI features</h2>
        <p>
          Smart Input, receipt scanning, driver payout import and the summary on the Insights page send what you submit
          to Google&apos;s Gemini API, which returns a draft. You review and correct the draft before anything is saved,
          and totals are checked by our own code, not by the AI. Google processes this content under the Gemini API
          terms. Google may keep it for a limited time to detect abuse, and when the API is used without paid billing,
          Google may also use it to improve its products. If you would rather not send something, enter it by hand
          instead; every AI feature is optional.
        </p>

        <h2>4. Who processes your data</h2>
        <p>
          These services handle data on our behalf, each only for the purpose shown. Some of them store or process data
          outside Indonesia.
        </p>
        <div className="not-prose overflow-x-auto rounded-xl border border-foreground/15">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead className="bg-foreground/[0.04] text-foreground">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">Service</th>
                <th scope="col" className="px-4 py-3 font-semibold">Used for</th>
                <th scope="col" className="px-4 py-3 font-semibold">What it receives</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-foreground/10 text-muted-foreground">
              {PROCESSORS.map((p) => (
                <tr key={p.name}>
                  <th scope="row" className="px-4 py-3 align-top font-medium text-foreground">{p.name}</th>
                  <td className="px-4 py-3 align-top">{p.role}</td>
                  <td className="px-4 py-3 align-top">{p.data}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2>5. How long we keep it</h2>
        <p>
          Your records are kept while your account exists. Items you delete inside the app are marked as deleted and no
          longer shown. When you delete your account, your account and the records tied to it are removed; hosting
          logs held by our providers expire on those providers&apos; own schedules.
        </p>

        <h2>6. Security</h2>
        <p>
          All traffic uses HTTPS. Every record is tied to your account, and the database itself rejects requests for
          records that belong to someone else. Passwords are never stored in readable form. Access to the production
          systems is limited to the people who run TRASON. No system is perfectly secure; if we learn of a breach that
          affects your data, we will tell you by email.
        </p>

        <h2>7. Your rights</h2>
        <ul>
          <li><strong>See and correct</strong> your data at any time in the app, or ask us for a copy by email.</li>
          <li><strong>Delete</strong> your account in Settings, under Security, or ask us to do it.</li>
          <li><strong>Withdraw consent</strong> by turning off notifications, the email digest, or the AI features you use.</li>
          <li><strong>Object or complain</strong> by writing to us; you may also contact Indonesia&apos;s data protection authority.</li>
        </ul>
        <p>We answer requests as soon as we can, and always within the time the law requires.</p>

        <h2>8. Children</h2>
        <p>
          TRASON is not meant for children. If you are under 18, use it only with permission from a parent or guardian.
        </p>

        <h2>9. Cookies and local storage</h2>
        <p>
          We use only what is needed to keep you signed in and remember your settings, and no advertising or tracking
          cookies. The full list is in the <Link href="/cookies">Cookie Policy</Link>.
        </p>

        <h2>10. Changes</h2>
        <p>
          When this policy changes, the date at the top changes too. If a change affects how your data is used, we will
          tell you in the app or by email before it takes effect.
        </p>
      </Prose>

      <Callout>
        Questions or requests about your data:{' '}
        <a className="font-medium text-primary underline underline-offset-4" href={`mailto:${SITE_CONTACT.email}`}>
          {SITE_CONTACT.email}
        </a>
        .
      </Callout>
    </PageShell>
  );
}
