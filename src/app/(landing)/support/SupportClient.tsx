'use client';

import React, { useId, useMemo, useState } from 'react';
import { MagnifyingGlass, Shield, Wallet, Briefcase, Question as HelpCircle, Barbell as Dumbbell, Plus } from '@phosphor-icons/react';
import { PageHeader } from '@/components/landing/page/PageHeader';
import { ContactForm } from '../contact/ContactForm';

interface FAQItem {
  q: string;
  a: string;
  category: string;
}

const CATEGORIES = [
  { id: 'all', name: 'All topics', icon: HelpCircle },
  { id: 'privacy', name: 'Privacy and security', icon: Shield },
  { id: 'finance', name: 'Finance', icon: Wallet },
  { id: 'sport', name: 'Sport and schedule', icon: Dumbbell },
  { id: 'career', name: 'Career', icon: Briefcase },
];

const FAQS: FAQItem[] = [
  {
    category: 'privacy',
    q: 'Is my data truly private?',
    a: 'Yes. TRASON is designed as a personal space. We use Row-Level Security (RLS) via Supabase, which means your logs (finances, habits, workouts) are strictly bound to your account. We never sell, track, or read your data.',
  },
  {
    category: 'finance',
    q: 'How do I sync stock or crypto prices?',
    a: 'TRASON automatically fetches current market prices using lightweight background schedules. You can also manually trigger a refresh by clicking the "Refresh Prices" button in the Investments screen inside your dashboard.',
  },
  {
    category: 'privacy',
    q: 'Is TRASON free or are there hidden costs?',
    a: 'TRASON is a private utility built for sovereign individuals. The core application is entirely free, self-hostable, open-source, and free of third-party advertisements or trackers. There are no surprise paywalls.',
  },
  {
    category: 'sport',
    q: 'How do I track a workout in the Sport module?',
    a: 'You can quickly log a workout directly from your main Dashboard via the Quick Log modal, or navigate to the Sport page to build long-term routines and view your weekly consistency streak.',
  },
  {
    category: 'career',
    q: 'What is the Career module?',
    a: 'The Career module helps you organize your professional growth. You can track active job applications, store details of company contacts, log interview dates, and schedule reminders for follow-ups.',
  },
  {
    category: 'sport',
    q: 'How do reminders work?',
    a: 'You can create notifications for hydration, workouts, or billing dates in the Reminders tab. They are designed to be non-anxious and appear neatly in your daily narrative stream.',
  },
];

export default function SupportClient() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  const searchId = useId();

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return FAQS.filter(
      (faq) =>
        (category === 'all' || faq.category === category) &&
        (!needle || faq.q.toLowerCase().includes(needle) || faq.a.toLowerCase().includes(needle))
    );
  }, [query, category]);

  return (
    <div className="space-y-20">
      <div className="space-y-8">
        <PageHeader
          align="center"
          eyebrow="Support"
          title="How can we help?"
          lede="Find clear answers to common questions, or reach out to us directly."
        />

        <div className="relative mx-auto max-w-xl">
          <label htmlFor={searchId} className="sr-only">Search the FAQ</label>
          <MagnifyingGlass size={18} aria-hidden="true" className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            id={searchId}
            type="search"
            placeholder="Search FAQs, for example privacy or stocks"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-14 w-full rounded-full border border-foreground/20 bg-surface pl-12 pr-6 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50"
          />
        </div>

        <div role="group" aria-label="FAQ topics" className="flex flex-wrap justify-center gap-2">
          {CATEGORIES.map(({ id, name, icon: Icon }) => {
            const active = category === id;
            return (
              <button
                key={id}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  setCategory(id);
                  setExpanded(null);
                }}
                className={`flex min-h-11 items-center gap-2 rounded-full border px-5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                  active
                    ? 'border-primary bg-primary text-on-primary'
                    : 'border-foreground/20 bg-transparent text-muted-foreground hover:border-foreground/40 hover:text-foreground'
                }`}
              >
                <Icon size={14} aria-hidden="true" />
                {name}
              </button>
            );
          })}
        </div>
      </div>

      <section aria-labelledby="faq-heading" className="space-y-4">
        <h2 id="faq-heading" className="text-heading-lg text-foreground">Frequently asked questions</h2>
        <div className="space-y-3">
          {filtered.map((faq) => {
            const open = expanded === faq.q;
            const panelId = `${searchId}-${faq.q.length}-${faq.category}`;
            return (
              <div key={faq.q} className={`overflow-hidden rounded-2xl border bg-surface transition-colors ${open ? 'border-primary' : 'border-foreground/15'}`}>
                <h3 className="font-sans">
                  <button
                    type="button"
                    onClick={() => setExpanded(open ? null : faq.q)}
                    aria-expanded={open}
                    aria-controls={panelId}
                    className="flex min-h-14 w-full items-center justify-between gap-4 px-6 py-3 text-left text-base font-semibold text-foreground"
                  >
                    <span>{faq.q}</span>
                    <Plus size={18} aria-hidden="true" className={`shrink-0 text-primary transition-transform ${open ? 'rotate-45' : ''}`} />
                  </button>
                </h3>
                <div id={panelId} role="region" hidden={!open}>
                  <p className="border-t border-foreground/10 px-6 py-5 text-sm leading-relaxed text-muted-foreground">{faq.a}</p>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <p className="py-10 text-center text-sm text-muted-foreground" role="status">
              No matches for your search. Try a different term.
            </p>
          )}
        </div>
      </section>

      <section aria-labelledby="still-heading" className="space-y-6">
        <div className="space-y-2 text-center">
          <h2 id="still-heading" className="text-heading-lg text-foreground">Still have questions?</h2>
          <p className="text-sm text-muted-foreground">
            Send us a message. It opens your mail app with the details filled in.
          </p>
        </div>
        <div className="mx-auto max-w-xl">
          <ContactForm />
        </div>
      </section>
    </div>
  );
}
