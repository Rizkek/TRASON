import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Compass } from '@phosphor-icons/react/dist/ssr';
import { Logo } from '@/components';
import { Heading, Paragraph } from '@/components/ui/typography';

export default function TermsPage() {
  return (
    <div className="min-h-screen font-sans selection:bg-warm-gold/30 selection:text-soft-cream relative overflow-x-hidden">
      {/* Background Ambient Glows */}
      <div className="fixed top-[-10%] right-[-5%] w-[600px] h-[600px] bg-warm-gold/5 blur-[140px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-deep-sage/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-xl border-b border-black/[0.03] dark:border-white/[0.03]">
        <div className="max-w-7xl mx-auto px-6 md:px-12 h-20 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 group cursor-pointer">
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform text-warm-gold" />
            <span className="text-sm font-bold uppercase tracking-widest text-warm-gold">Back</span>
          </Link>
          <div className="flex items-center gap-2">
            <Logo size={32} />
            <span className="font-brand text-2xl font-extrabold tracking-tight text-soft-cream">TRASON</span>
          </div>
          <div className="w-20" /> {/* Spacer */}
        </div>
      </nav>

      {/* Content */}
      <main className="pt-32 pb-24 px-6 max-w-3xl mx-auto space-y-8">
        <div className="space-y-2 text-center">
          <Heading as="h1" size="h1" className="font-bold">Terms of Service</Heading>
          <Paragraph size="xl" className="text-gray-light font-light">Last updated: May 2026</Paragraph>
        </div>

        <div className="prose prose-invert prose-p:text-gray-light prose-headings:text-soft-cream prose-headings:font-display tracking-tight prose-a:text-warm-gold hover:prose-a:text-[#E3B84D] max-w-none">
          <Paragraph size="lg">
            Welcome to TRASON. By accessing or using our platform, you agree to be bound by these Terms of Service. 
            Please read them carefully before starting your journey.
          </Paragraph>

          <Heading as="h2" size="h4" className="text-white mt-8 mb-4">1. Acceptance of Terms</Heading>
          <Paragraph size="lg">
            By creating an account and using TRASON, you accept and agree to comply with these terms. If you do not agree 
            with any part of these terms, you may not access the service.
          </Paragraph>

          <Heading as="h2" size="h4" className="text-white mt-8 mb-4">2. Your Account</Heading>
          <Paragraph size="lg">
            You are responsible for maintaining the confidentiality of your account credentials and for all activities that 
            occur under your account. You must immediately notify us of any unauthorized use of your account.
          </Paragraph>

          <Heading as="h2" size="h4" className="text-white mt-8 mb-4">3. Acceptable Use</Heading>
          <Paragraph size="lg">
            TRASON is designed as your personal digital living space. You agree not to use the platform for any illegal 
            purposes or to store content that violates the rights of others.
          </Paragraph>

          <Heading as="h2" size="h4" className="text-white mt-8 mb-4">4. Service Modifications</Heading>
          <Paragraph size="lg">
            We reserve the right to modify, suspend, or discontinue any part of the service at any time. We will always 
            attempt to provide advance notice of any significant changes that may affect your experience.
          </Paragraph>

          <Heading as="h2" size="h4" className="text-white mt-8 mb-4">5. Limitation of Liability</Heading>
          <Paragraph size="lg">
            TRASON is provided "as is". We are not liable for any data loss, though we employ robust backup systems. 
            Your use of the service is at your sole risk.
          </Paragraph>

          <div className="mt-12 p-6 bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/[0.05] rounded-xl text-center">
            <p className="m-0 text-sm">
              If you have any questions about these Terms, please contact us at <a href="mailto:legal@trason.app">legal@trason.app</a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
