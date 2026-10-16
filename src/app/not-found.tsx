'use client';

import Link from 'next/link';
import { WarningCircle as AlertCircle, House as Home, ArrowLeft } from '@phosphor-icons/react';
import { Button, Card } from '@/components';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { LandingFooter } from '@/components/landing/LandingFooter';

export default function NotFound() {
  return (
    <div className="min-h-dvh bg-background text-foreground flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Background Elements */}

      <Card className="w-full max-w-xl p-12 text-center space-y-8 border border-foreground/5 bg-background/80 relative z-10">
        <div className="mx-auto w-14 h-14 rounded-full bg-danger/15 text-danger flex items-center justify-center">
          <AlertCircle size={28} />
        </div>

        <div className="space-y-2">
          <h1 className="text-display-lg text-primary">Page Not Found</h1>
          <p className="text-muted-foreground">
            The page you requested does not exist or may have been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link href="/">
            <Button variant="primary" className="gap-2 px-6">
              <Home size={16} />
              Back to Home
            </Button>
          </Link>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={16} />
            Go Back
          </button>
        </div>
      </Card>
    </div>
  );
}
