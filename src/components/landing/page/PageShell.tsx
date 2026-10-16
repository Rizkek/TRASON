import React from 'react';
import { LandingNavbar } from '../LandingNavbar';
import { LandingFooter } from '../LandingFooter';

const WIDTH = {
  prose: 'max-w-3xl',
  article: 'max-w-4xl',
  wide: 'max-w-6xl',
} as const;

interface PageShellProps {
  /** Reading width of the main column. */
  width?: keyof typeof WIDTH;
  children: React.ReactNode;
}

/**
 * Frame shared by every public page except the home page: skip link, navigation, one main
 * column, footer. Theme, tokens and typography come from the .landing scope.
 */
export function PageShell({ width = 'prose', children }: PageShellProps) {
  return (
    <div className="landing min-h-dvh overflow-x-clip">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:text-on-primary"
      >
        Skip to content
      </a>
      <LandingNavbar />
      <main id="main-content" className={`mx-auto w-full ${WIDTH[width]} px-5 pb-24 pt-28 sm:px-8 sm:pt-36`}>
        {children}
      </main>
      <LandingFooter />
    </div>
  );
}
