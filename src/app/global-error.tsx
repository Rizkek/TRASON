'use client';

import { useEffect } from 'react';
import { WarningCircle as AlertCircle } from '@phosphor-icons/react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[App GlobalError] Error caught:', error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="flex items-center justify-center min-h-screen bg-warm-black">
          <div className="text-center max-w-md mx-auto p-lg space-y-lg">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-danger/10 rounded-full flex items-center justify-center">
                <AlertCircle size={32} className="text-danger" />
              </div>
            </div>
            <div className="space-y-md">
              <h1 className="text-2xl font-serif font-bold text-white">
                Something Went Wrong
              </h1>
              <p className="text-gray-light text-sm">
                {error.message || 'A critical error occurred. Please try refreshing the page.'}
              </p>
            </div>
            <button
              onClick={() => reset()}
              className="w-full px-lg py-md bg-primary hover:bg-primary/90 text-warm-black rounded-md font-bold transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full px-lg py-md bg-gray-strong hover:bg-gray-medium text-soft-cream rounded-md font-bold transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
