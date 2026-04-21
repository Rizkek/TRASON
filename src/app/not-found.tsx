'use client';

import Link from 'next/link';
import { AlertCircle, Home, ArrowLeft } from 'lucide-react';
import { Button, Card } from '@/components';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-warm-black text-soft-cream flex items-center justify-center px-md">
      <Card className="w-full max-w-xl p-2xl text-center space-y-xl border border-gray-light/20">
        <div className="mx-auto w-14 h-14 rounded-full bg-danger/15 text-danger flex items-center justify-center">
          <AlertCircle size={28} />
        </div>

        <div className="space-y-sm">
          <h1 className="text-3xl font-serif text-warm-gold">Page Not Found</h1>
          <p className="text-gray-very-light">
            The page you requested does not exist or may have been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-md">
          <Link href="/">
            <Button variant="primary" leftIcon={<Home size={16} />}>
              Back to Home
            </Button>
          </Link>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-sm text-sm text-gray-light hover:text-soft-cream transition-colors"
          >
            <ArrowLeft size={16} />
            Go Back
          </button>
        </div>
      </Card>
    </div>
  );
}
