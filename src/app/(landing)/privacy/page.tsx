import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Compass } from '@phosphor-icons/react/dist/ssr';
import { Logo } from '@/components';
import { Heading, Paragraph } from '@/components/ui/typography';

export default function PrivacyPolicyPage() {
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
          <Heading as="h1" size="h1" className="font-bold">Privacy Policy</Heading>
          <Paragraph size="xl" className="text-gray-light font-light">Last updated: May 2026</Paragraph>
        </div>

        <div className="prose prose-invert prose-p:text-gray-light prose-headings:text-soft-cream prose-headings:font-display tracking-tight prose-a:text-warm-gold hover:prose-a:text-[#E3B84D] max-w-none">
          <Paragraph size="lg">
            At TRASON, we respect your privacy and are committed to protecting the personal data you share within your digital living space. 
            This Privacy Policy explains how we collect, use, and safeguard your information.
          </Paragraph>

          <Heading as="h2" size="h4" className="text-white mt-8 mb-4">1. Information We Collect</Heading>
          <Paragraph size="lg">
            We only collect the information necessary to provide you with the TRASON experience. This includes:
          </Paragraph>
          <ul>
            <li><strong>Account Information:</strong> Email address and authentication credentials.</li>
            <li><strong>Usage Data:</strong> Your logged activities, financial records, and schedules stored securely in your workspace.</li>
          </ul>

          <Heading as="h2" size="h4" className="text-white mt-8 mb-4">2. How We Use Your Information</Heading>
          <Paragraph size="lg">
            Your data is used exclusively to personalize your experience, provide insights, and synchronize your data across devices. 
            We do not sell your personal data to third parties.
          </Paragraph>

          <Heading as="h2" size="h4" className="text-white mt-8 mb-4">3. Data Security</Heading>
          <Paragraph size="lg">
            We implement industry-standard security measures to protect your data. Your information is stored in secured databases 
            with restricted access.
          </Paragraph>

          <Heading as="h2" size="h4" className="text-white mt-8 mb-4">4. Your Rights</Heading>
          <Paragraph size="lg">
            You have full control over your digital living space. You can request to view, modify, or permanently delete your data 
            at any time through your account settings.
          </Paragraph>

          <div className="mt-12 p-6 bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/[0.05] rounded-xl text-center">
            <p className="m-0 text-sm">
              If you have any questions about this Privacy Policy, please contact us at <a href="mailto:privacy@trason.app">privacy@trason.app</a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
