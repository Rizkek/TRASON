import React from 'react';
import Link from 'next/link';
import { Compass, ArrowLeft } from 'lucide-react';

export default function TermsPage() {
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
          <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight">Terms of Service</h1>
          <p className="text-gray-light font-light">Last updated: May 2026</p>
        </div>

        <div className="prose prose-invert prose-p:text-gray-light prose-headings:text-soft-cream prose-headings:font-serif prose-a:text-warm-gold hover:prose-a:text-[#E3B84D] max-w-none">
          <p>
            Welcome to TRASON. By accessing or using our platform, you agree to be bound by these Terms of Service. 
            Please read them carefully before starting your journey.
          </p>

          <h2>1. Acceptance of Terms</h2>
          <p>
            By creating an account and using TRASON, you accept and agree to comply with these terms. If you do not agree 
            with any part of these terms, you may not access the service.
          </p>

          <h2>2. Your Account</h2>
          <p>
            You are responsible for maintaining the confidentiality of your account credentials and for all activities that 
            occur under your account. You must immediately notify us of any unauthorized use of your account.
          </p>

          <h2>3. Acceptable Use</h2>
          <p>
            TRASON is designed as your personal digital living space. You agree not to use the platform for any illegal 
            purposes or to store content that violates the rights of others.
          </p>

          <h2>4. Service Modifications</h2>
          <p>
            We reserve the right to modify, suspend, or discontinue any part of the service at any time. We will always 
            attempt to provide advance notice of any significant changes that may affect your experience.
          </p>

          <h2>5. Limitation of Liability</h2>
          <p>
            TRASON is provided "as is". We are not liable for any data loss, though we employ robust backup systems. 
            Your use of the service is at your sole risk.
          </p>

          <div className="mt-12 p-lg bg-white/[0.02] border border-white/[0.05] rounded-xl text-center">
            <p className="m-0 text-sm">
              If you have any questions about these Terms, please contact us at <a href="mailto:legal@trason.app">legal@trason.app</a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
