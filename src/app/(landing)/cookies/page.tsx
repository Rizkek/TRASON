

import React from 'react';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { LandingFooter } from '@/components/landing/LandingFooter';

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-warm-black text-soft-cream font-sans relative overflow-x-hidden">
      <LandingNavbar />
      
      <main className="pt-32 md:pt-48 pb-24 px-lg max-w-3xl mx-auto space-y-12">
        <div className="space-y-md">
           <h1 className="text-5xl md:text-7xl font-serif">Cookie Policy</h1>
           <p className="text-xl text-gray-light/60">Last updated: June 17, 2026</p>
        </div>

        <div className="prose prose-invert prose-lg max-w-none text-gray-light/90 space-y-8">
          <p>
            At TRASON, we believe in transparency and respecting your privacy. This Cookie Policy explains how and why cookies and similar technologies are used by us to improve your experience.
          </p>

          <h2 className="text-2xl font-bold text-white mt-8 mb-4">What are cookies?</h2>
          <p>
            Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and provide information to the owners of the site.
          </p>

          <h2 className="text-2xl font-bold text-white mt-8 mb-4">How we use cookies</h2>
          <p>
            We use cookies for the following purposes:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-light">
            <li><strong>Essential Cookies:</strong> These are required for the operation of TRASON. They include cookies that enable you to log into secure areas of our application.</li>
            <li><strong>Functional Cookies:</strong> These are used to recognize you when you return to our website. This enables us to personalize our content for you and remember your preferences (for example, your choice of language or region).</li>
            <li><strong>Analytical/Performance Cookies:</strong> They allow us to recognize and count the number of visitors and to see how visitors move around our website when they are using it. We use minimal tracking that respects your privacy.</li>
          </ul>

          <h2 className="text-2xl font-bold text-white mt-8 mb-4">Your choices</h2>
          <p>
            Most web browsers allow some control of most cookies through the browser settings. To find out more about cookies, including how to see what cookies have been set, visit <a href="https://www.aboutcookies.org" target="_blank" rel="noopener noreferrer" className="text-warm-gold underline">aboutcookies.org</a> or <a href="https://www.allaboutcookies.org" target="_blank" rel="noopener noreferrer" className="text-warm-gold underline">allaboutcookies.org</a>.
          </p>
          <p>
            Please note that if you choose to block essential cookies, you may not be able to access all or parts of our application (such as logging into your dashboard).
          </p>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
