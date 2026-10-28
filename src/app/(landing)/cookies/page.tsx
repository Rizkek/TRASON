import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { PageShell } from '@/components/landing/page/PageShell';
import { PageHeader } from '@/components/landing/page/PageHeader';
import { Prose } from '@/components/landing/page/Prose';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'Every cookie and local storage item TRASON uses, what it is for, and how long it stays.',
  alternates: { canonical: '/cookies' },
};

const LAST_UPDATED = 'October 28, 2026';

interface StorageItem {
  name: string;
  purpose: string;
  duration: string;
}

// Keep in step with the code: Supabase auth cookies, and every localStorage key the app writes.
const COOKIES: StorageItem[] = [
  { name: 'sb-…-auth-token', purpose: 'Keeps you signed in. May be split into numbered parts (.0, .1) when large.', duration: 'Until you sign out' },
  { name: 'sb-…-auth-token-code-verifier', purpose: 'Completes sign-in from an email link (confirmation or password reset).', duration: 'Minutes, removed once used' },
];

const LOCAL_STORAGE: StorageItem[] = [
  { name: 'auth-storage', purpose: 'Your profile and chosen theme, so pages open in the right theme without a flash.', duration: 'Until cleared; emptied when you sign out' },
  { name: 'user-preferences', purpose: 'Language, currency and theme, read before your account loads.', duration: 'Until cleared' },
  { name: 'module_status_…', purpose: 'Which modules you have turned on.', duration: 'Until cleared' },
  { name: 'exchange_rates_cache', purpose: 'Recent exchange rates, to avoid fetching them on every page.', duration: '24 hours' },
  { name: 'trason_custom_companies, trason_custom_roles', purpose: 'Company and role names you typed before, offered as suggestions.', duration: 'Until cleared' },
  { name: 'trason_pwa_dismissed_until', purpose: 'Remembers that you chose “Not now” on the install prompt.', duration: '30 days' },
];

function StorageTable({ caption, items }: { caption: string; items: StorageItem[] }) {
  return (
    <div className="not-prose overflow-x-auto rounded-xl border border-foreground/15">
      <table className="w-full min-w-[34rem] text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead className="bg-foreground/[0.04] text-foreground">
          <tr>
            <th scope="col" className="px-4 py-3 font-semibold">Name</th>
            <th scope="col" className="px-4 py-3 font-semibold">Purpose</th>
            <th scope="col" className="px-4 py-3 font-semibold">How long</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-foreground/10 text-muted-foreground">
          {items.map((item) => (
            <tr key={item.name}>
              <th scope="row" className="px-4 py-3 align-top font-mono text-xs font-medium text-foreground">{item.name}</th>
              <td className="px-4 py-3 align-top">{item.purpose}</td>
              <td className="px-4 py-3 align-top">{item.duration}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function CookiesPage() {
  return (
    <PageShell>
      <PageHeader title="Cookie Policy" lede={`Last updated: ${LAST_UPDATED}`} />

      <Prose className="mt-12 prose-lg">
        <p>
          TRASON stores a small amount of data in your browser to keep you signed in and remember your settings. There are
          no advertising cookies, no tracking cookies, and no analytics cookies. Because everything listed here is needed
          for the app to work, we do not show a consent banner.
        </p>

        <h2>Cookies</h2>
        <p>Set by our sign-in provider, Supabase, on this site only.</p>
      </Prose>
      <div className="mt-6">
        <StorageTable caption="Cookies" items={COOKIES} />
      </div>

      <Prose className="mt-10 prose-lg">
        <h2>Local storage</h2>
        <p>
          Local storage stays in your browser and is never sent to us automatically. It makes pages load faster and
          keeps your choices between visits.
        </p>
      </Prose>
      <div className="mt-6">
        <StorageTable caption="Local storage" items={LOCAL_STORAGE} />
      </div>

      <Prose className="mt-10 prose-lg">
        <h2>Offline files</h2>
        <p>
          When you install TRASON or visit it often, the browser keeps copies of the app&apos;s code, icons and public
          pages so it opens quickly and can show a notice when you are offline. Pages with your own data are always
          loaded fresh and are not kept.
        </p>

        <h2>Other services</h2>
        <ul>
          <li>
            On the sign-in, sign-up and forgot-password pages, Cloudflare&apos;s bot check runs in its own frame and may
            store data inside that frame to tell people from automated scripts.
          </li>
          <li>Vercel Speed Insights measures how fast pages load without setting any cookie.</li>
        </ul>

        <h2>Your choices</h2>
        <p>
          You can clear cookies and site data at any time in your browser settings. Doing so signs you out and resets the
          settings stored on that device; your records stay safe in your account. Blocking cookies for this site stops
          sign-in from working.
        </p>
        <p>
          For what we do with the data in your account, see the <Link href="/privacy">Privacy Policy</Link>.
        </p>
      </Prose>
    </PageShell>
  );
}
