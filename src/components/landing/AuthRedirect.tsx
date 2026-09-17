'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

/**
 * The middleware already sends signed-in visitors from "/" to the Dashboard.
 * This covers the client-side case where a persisted session exists but the
 * cookie check did not run (e.g. a cached HTML response), without hiding the
 * landing content behind a client render.
 */
export function AuthRedirect() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  return null;
}
