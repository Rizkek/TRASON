'use client';

import React, { useId, useMemo, useState } from 'react';
import { MagnifyingGlass, Shield, Wallet, Briefcase, Question, Barbell, UserCircle } from '@phosphor-icons/react';
import { FaqItem } from '@/components/landing/FaqItem';

interface Faq {
  q: string;
  a: string;
  topic: TopicId;
}

type TopicId = 'all' | 'account' | 'privacy' | 'finance' | 'sport' | 'career';

const TOPICS: { id: TopicId; name: string; icon: React.ElementType }[] = [
  { id: 'all', name: 'All topics', icon: Question },
  { id: 'account', name: 'Account', icon: UserCircle },
  { id: 'privacy', name: 'Privacy and AI', icon: Shield },
  { id: 'finance', name: 'Finance', icon: Wallet },
  { id: 'sport', name: 'Sport and reminders', icon: Barbell },
  { id: 'career', name: 'Career', icon: Briefcase },
];

// Every answer describes what the product does today; keep it in step with the code.
const FAQS: Faq[] = [
  {
    topic: 'account',
    q: 'I forgot my password. What do I do?',
    a: 'On the sign-in page, choose "Forgot password?" and enter your email. We send a link that lets you set a new password. The link works once.',
  },
  {
    topic: 'account',
    q: 'Is TRASON free?',
    a: 'Yes. Every module is free to use, with no limit on records.',
  },
  {
    topic: 'account',
    q: 'Can I use TRASON on my phone?',
    a: 'Yes. TRASON is a web app built for phones first. Open it in your browser and add it to your home screen; it then opens full-screen like any other app. There is nothing to download from an app store.',
  },
  {
    topic: 'account',
    q: 'How do I delete my account?',
    a: 'Go to Settings, open Security, and choose Delete account. You will be asked to confirm first.',
  },
  {
    topic: 'privacy',
    q: 'Who can see my data?',
    a: 'Only you. Every record is tied to your account, and the database rejects requests for records that are not yours. We do not sell your data or use it for advertising.',
  },
  {
    topic: 'privacy',
    q: 'When does AI read my data?',
    a: 'Only when you use a feature that needs it: Smart Input, receipt scanning, driver payout import, and the summary on the Insights page. That text or image is sent to Google’s Gemini API to produce a draft. You review the draft before anything is saved. Scores such as Life Score are calculated with fixed rules, not AI.',
  },
  {
    topic: 'finance',
    q: 'How do I add a transaction from a receipt?',
    a: 'In Finance, choose to scan a receipt and upload a photo. TRASON reads the items and totals into a draft, checks that the numbers add up, and lets you correct anything before you save.',
  },
  {
    topic: 'finance',
    q: 'How are investment prices updated?',
    a: 'Press Sync prices on the Investments page. Crypto prices come from CoinGecko and stock prices from Alpha Vantage. Only the ticker symbols are sent to them, never your holdings.',
  },
  {
    topic: 'sport',
    q: 'How do I log a workout?',
    a: 'Open Sport and choose Add session, or use the + button at the bottom right on your phone. Your weekly sessions and streak update right away.',
  },
  {
    topic: 'sport',
    q: 'How do reminders reach me?',
    a: 'As push notifications on every device where you turn them on in Settings, and optionally as an email digest. On iPhone and iPad, add TRASON to your Home Screen first: Safari only delivers web notifications to installed apps.',
  },
  {
    topic: 'career',
    q: 'What does the Career module track?',
    a: 'Job applications and their stage, interview dates, notes from each interview, and follow-up reminders. The resume matcher compares your resume with a job description on your own device.',
  },
];

export function HelpFaq() {
  const [query, setQuery] = useState('');
  const [topic, setTopic] = useState<TopicId>('all');
  const searchId = useId();

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return FAQS.filter(
      (faq) =>
        (topic === 'all' || faq.topic === topic) &&
        (!needle || faq.q.toLowerCase().includes(needle) || faq.a.toLowerCase().includes(needle))
    );
  }, [query, topic]);

  return (
    <section aria-labelledby="faq-heading" className="space-y-6">
      <h2 id="faq-heading" className="text-heading-lg text-foreground">
        Common questions
      </h2>

      <div className="relative">
        <label htmlFor={searchId} className="sr-only">
          Search the questions
        </label>
        <MagnifyingGlass
          size={18}
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <input
          id={searchId}
          type="search"
          placeholder="Search, for example password or reminders"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-12 w-full rounded-full border border-foreground/20 bg-surface pl-11 pr-5 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50"
        />
      </div>

      <div role="group" aria-label="Question topics" className="flex flex-wrap gap-2">
        {TOPICS.map(({ id, name, icon: Icon }) => {
          const active = topic === id;
          return (
            <button
              key={id}
              type="button"
              aria-pressed={active}
              onClick={() => setTopic(id)}
              className={`flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors ${
                active
                  ? 'border-primary bg-primary text-on-primary'
                  : 'border-foreground/20 text-muted-foreground hover:border-foreground/40 hover:text-foreground'
              }`}
            >
              <Icon size={16} aria-hidden="true" />
              {name}
            </button>
          );
        })}
      </div>

      <div className="space-y-3">
        {filtered.map((faq) => (
          <FaqItem key={faq.q} q={faq.q} a={faq.a} />
        ))}
        {filtered.length === 0 && (
          <p role="status" className="py-8 text-center text-sm text-muted-foreground">
            No matching question. Try another word, or write to us below.
          </p>
        )}
      </div>
    </section>
  );
}
