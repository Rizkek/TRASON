'use client';

import Link from 'next/link';
import { AlertCircle, Home, ArrowLeft } from 'lucide-react';
import { Button, Card } from '@/components';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { LandingFooter } from '@/components/landing/LandingFooter';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-warm-black text-soft-cream flex items-center justify-center p-md relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-warm-gold/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-deep-sage/5 blur-[100px] rounded-full pointer-events-none" />

      <Card className="w-full max-w-xl p-2xl text-center space-y-xl border border-white/5 bg-black/40 backdrop-blur-xl shadow-2xl relative z-10">
        <div className="mx-auto w-14 h-14 rounded-full bg-danger/15 text-danger flex items-center justify-center">
          <AlertCircle size={28} />
        </div>

        <div className="space-y-sm">
          <h1 className="text-4xl font-serif text-warm-gold">Page Not Found</h1>
          <p className="text-gray-light">
            The page you requested does not exist or may have been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-md pt-4">
          <Link href="/">
            <Button variant="primary" className="gap-2 px-6">
              <Home size={16} />
              Back to Home
            </Button>
          </Link>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 text-sm text-gray-light hover:text-soft-cream transition-colors"
          >
            <ArrowLeft size={16} />
            Go Back
          </button>
        </div>
      </Card>
    </div>
  );
}
