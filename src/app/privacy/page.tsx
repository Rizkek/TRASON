import React from 'react';
import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';
import { RiCompass3Line } from 'react-icons/ri';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-warm-black text-soft-cream font-sans selection:bg-warm-gold/30 selection:text-soft-cream relative overflow-x-hidden">
      {/* Background Ambient Glows */}
      <div className="fixed top-[-10%] right-[-5%] w-[600px] h-[600px] bg-warm-gold/5 blur-[140px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-deep-sage/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-xl border-b border-white/[0.03]">
        <div className="max-w-7xl mx-auto px-lg md:px-2xl h-20 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-sm group cursor-pointer">
            <FiArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform text-warm-gold" />
            <span className="text-sm font-bold uppercase tracking-widest text-warm-gold">Back</span>
          </Link>
          <div className="flex items-center gap-sm">
            <div className="w-8 h-8 bg-warm-gold rounded-full flex items-center justify-center text-warm-black">
              <RiCompass3Line size={18} />
            </div>
            <span className="text-xl font-serif font-bold tracking-tight">TRASON</span>
          </div>
          <div className="w-20" /> {/* Spacer */}
        </div>
      </nav>

      {/* Content */}
      <main className="pt-32 pb-24 px-lg max-w-3xl mx-auto space-y-xl">
        <div className="space-y-sm text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight">Privacy Policy</h1>
          <p className="text-gray-light font-light">Last updated: May 2026</p>
        </div>

        <div className="prose prose-invert prose-p:text-gray-light prose-headings:text-soft-cream prose-headings:font-serif prose-a:text-warm-gold hover:prose-a:text-[#E3B84D] max-w-none">
          <p>
            At TRASON, we respect your privacy and are committed to protecting the personal data you share within your digital living space. 
            This Privacy Policy explains how we collect, use, and safeguard your information.
          </p>

          <h2>1. Information We Collect</h2>
          <p>
            We only collect the information necessary to provide you with the TRASON experience. This includes:
          </p>
          <ul>
            <li><strong>Account Information:</strong> Email address and authentication credentials.</li>
            <li><strong>Usage Data:</strong> Your logged activities, financial records, and schedules stored securely in your workspace.</li>
          </ul>

          <h2>2. How We Use Your Information</h2>
          <p>
            Your data is used exclusively to personalize your experience, provide insights, and synchronize your data across devices. 
            We do not sell your personal data to third parties.
          </p>

          <h2>3. Data Security</h2>
          <p>
            We implement industry-standard security measures to protect your data. Your information is stored in secured databases 
            with restricted access.
          </p>

          <h2>4. Your Rights</h2>
          <p>
            You have full control over your digital living space. You can request to view, modify, or permanently delete your data 
            at any time through your account settings.
          </p>

          <div className="mt-12 p-lg bg-white/[0.02] border border-white/[0.05] rounded-xl text-center">
            <p className="m-0 text-sm">
              If you have any questions about this Privacy Policy, please contact us at <a href="mailto:privacy@trason.app">privacy@trason.app</a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
