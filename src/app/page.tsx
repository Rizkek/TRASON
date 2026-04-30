'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { Button, Loading } from '@/components';

export default function Home() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      console.log('Redirecting to dashboard (isAuthenticated)');
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <Loading />;
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-warm-black flex flex-col">
      {/* Navigation */}
      <nav className="px-2xl py-lg border-b border-deep-sage border-opacity-20">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-serif font-bold text-warm-gold">
            TRASON
          </h1>
          <div className="flex gap-md">
            <Link href="/login">
              <Button variant="ghost" size="md">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button variant="primary" size="md">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-md py-2xl text-center max-w-6xl mx-auto">
        <div className="space-y-2xl animate-fade-in">
          <div className="space-y-lg">
            <h2 className="text-display font-serif text-warm-gold">
              Your Personal Self-Improvement Journey
            </h2>
            <p className="text-lg text-soft-cream leading-relaxed max-w-2xl mx-auto">
              Track your finances, log your daily activities, manage reminders, and discover insights about yourself. 
              <span className="text-warm-gold font-semibold"> A digital living space</span> designed for your growth.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg py-lg">
            <div className="bg-gray-strong bg-opacity-50 border border-deep-sage border-opacity-20 rounded-md p-lg hover:border-warm-gold hover:border-opacity-40 transition-all duration-300">
              <div className="text-4xl mb-md">💰</div>
              <h3 className="font-serif text-lg text-warm-gold mb-md">Finance Tracking</h3>
              <p className="text-sm text-gray-light">Track income, expenses, and build smarter financial habits</p>
            </div>

            <div className="bg-gray-strong bg-opacity-50 border border-deep-sage border-opacity-20 rounded-md p-lg hover:border-warm-gold hover:border-opacity-40 transition-all duration-300">
              <div className="text-4xl mb-md">📅</div>
              <h3 className="font-serif text-lg text-warm-gold mb-md">Daily Timeline</h3>
              <p className="text-sm text-gray-light">Log activities hour by hour and see your day visualized</p>
            </div>

            <div className="bg-gray-strong bg-opacity-50 border border-deep-sage border-opacity-20 rounded-md p-lg hover:border-warm-gold hover:border-opacity-40 transition-all duration-300">
              <div className="text-4xl mb-md">🔔</div>
              <h3 className="font-serif text-lg text-warm-gold mb-md">Smart Reminders</h3>
              <p className="text-sm text-gray-light">Set reminders with priorities and recurring patterns</p>
            </div>

            <div className="bg-gray-strong bg-opacity-50 border border-deep-sage border-opacity-20 rounded-md p-lg hover:border-warm-gold hover:border-opacity-40 transition-all duration-300">
              <div className="text-4xl mb-md">💡</div>
              <h3 className="font-serif text-lg text-warm-gold mb-md">Personal Insights</h3>
              <p className="text-sm text-gray-light">Discover patterns and get narrative insights about yourself</p>
            </div>
          </div>

          {/* Value Proposition */}
          <div className="bg-gradient-to-r from-insight-taupe from-opacity-10 to-transparent border border-deep-sage border-opacity-20 rounded-md p-2xl my-lg">
            <p className="text-base text-soft-cream leading-relaxed">
              Unlike other self-improvement tools, TRASON treats your data as part of your personal story. 
              We don't overwhelm you with charts—we help you understand yourself through narrative insights and meaningful patterns.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex gap-lg justify-center pt-lg">
            <Link href="/signup">
              <Button variant="primary" size="lg">Start Free • No Credit Card</Button>
            </Link>
            <Link href="#features">
              <Button variant="ghost" size="lg">Learn More</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-deep-sage border-opacity-20 px-2xl py-xl">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-micro text-gray-light">
            © 2026 TRASON. Built for your self-improvement journey. Privacy-first. No ads. No tracking.
          </p>
        </div>
      </footer>
    </div>
  );
}
