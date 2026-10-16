'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Quotes } from '@phosphor-icons/react';
import { Logo } from '@/components/Logo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useTranslation } from '@/libs/i18n/useTranslation';

interface AuthShellProps {
  quote: string;
  description: string;
  /** Shows a static bar at the top of the form side while a request is running. */
  busy?: boolean;
  children: React.ReactNode;
}

/**
 * Shared frame of the login and signup pages: a brand panel on desktop and the form on every
 * screen size. The form side scrolls on short phones, with the notch and home indicator respected.
 */
export function AuthShell({ quote, description, busy = false, children }: AuthShellProps) {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-dvh flex-col bg-background font-sans text-foreground md:flex-row">
      <aside className="relative hidden items-center justify-center border-r border-foreground/10 bg-surface p-16 md:flex md:w-1/2 lg:p-24">
        <div className="max-w-md space-y-6 animate-fade-in">
          <Quotes size={40} aria-hidden="true" className="text-primary" />
          <p className="text-heading-lg text-foreground">{quote}</p>
          <div className="space-y-2">
            <p className="font-brand text-title-lg text-primary">TRASON</p>
            <p className="text-body-md text-muted-foreground">{description}</p>
          </div>
        </div>
        <div className="absolute bottom-10 left-10 flex items-center gap-2 text-muted-foreground">
          <Logo size={28} variant="gold" />
          <span className="font-brand text-title-md">TRASON</span>
        </div>
      </aside>

      <main className="relative flex flex-1 flex-col px-5 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] sm:px-8 md:px-12 lg:px-20">
        {busy && <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-primary" />}

        <div className="flex min-h-11 items-center justify-between">
          <Link
            href="/"
            className="-ml-2 inline-flex min-h-11 items-center gap-2 rounded-md px-2 text-label-md text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            <span>{t('auth.back_home')}</span>
          </Link>
          <ThemeToggle />
        </div>

        <div className="flex flex-1 items-center justify-center py-8">
          <div className="w-full max-w-sm animate-slide-up space-y-8">{children}</div>
        </div>
      </main>
    </div>
  );
}
