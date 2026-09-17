import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { AuthRedirect } from '@/components/landing/AuthRedirect';
import { Hero } from '@/components/landing/sections/Hero';
import { Problem } from '@/components/landing/sections/Problem';
import { System } from '@/components/landing/sections/System';
import { ProductExperience } from '@/components/landing/sections/ProductExperience';
import { HowItWorks } from '@/components/landing/sections/HowItWorks';
import { WhyTrason } from '@/components/landing/sections/WhyTrason';
import { Intelligence } from '@/components/landing/sections/Intelligence';
import { Mobile } from '@/components/landing/sections/Mobile';
import { FinalCta } from '@/components/landing/sections/FinalCta';

export default function Home() {
  return (
    <div className="landing min-h-screen overflow-x-clip">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-lp-foreground focus:px-4 focus:py-2 focus:text-sm focus:text-lp-background"
      >
        Skip to content
      </a>

      <LandingNavbar tone="light" />

      <main id="main-content">
        <Hero />
        <Problem />
        <System />
        <ProductExperience />
        <HowItWorks />
        <WhyTrason />
        <Intelligence />
        <Mobile />
        <FinalCta />
      </main>

      <LandingFooter tone="light" />
      <AuthRedirect />
    </div>
  );
}
