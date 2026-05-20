import React from 'react';
import Link from 'next/link';
import { Compass, ArrowLeft } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-warm-black text-soft-cream font-sans selection:bg-warm-gold/30 selection:text-soft-cream">
      {/* Navigation */}
      <nav className="border-b border-white/[0.05] bg-warm-black/50 backdrop-blur-md fixed top-0 w-full z-50">
        <div className="max-w-4xl mx-auto px-lg h-20 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-sm group">
            <div className="w-8 h-8 bg-warm-gold rounded-full flex items-center justify-center text-warm-black group-hover:rotate-12 transition-transform">
              <Compass size={18} />
            </div>
            <span className="text-xl font-serif font-medium tracking-tight">TRASON</span>
          </Link>
          <Link href="/" className="text-sm text-gray-light hover:text-warm-gold flex items-center gap-2 transition-colors">
            <ArrowLeft size={16} /> Back to Home
          </Link>
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
