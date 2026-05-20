'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary] Error caught:', error);
    console.error('[ErrorBoundary] Error info:', errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
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
                  {this.state.error?.message || 'An unexpected error occurred. Please try refreshing the page.'}
                </p>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="w-full px-lg py-md bg-primary hover:bg-primary/90 text-warm-black rounded-md font-bold transition-colors"
              >
                Reload Page
              </button>
              <button
                onClick={() => window.history.back()}
                className="w-full px-lg py-md bg-gray-strong hover:bg-gray-medium text-soft-cream rounded-md font-bold transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
