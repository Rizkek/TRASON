'use client';

/**
 * AuthProvider — singleton that initializes the Supabase auth listener ONCE.
 *
 * Key architecture decision:
 * - useAuth() MUST only be called here (one Supabase onAuthStateChange subscription).
 * - All other components read from useAuthStore() via individual selectors.
 * - This eliminates the "multiple subscription" bug that caused repeated isLoading:true flashes.
 */

import React from 'react';
import { useAuth } from '@/hooks/useAuth';

function AuthInitializer({ children }: { children: React.ReactNode }) {
  // This call sets up the single onAuthStateChange subscription for the whole app.
  useAuth();
  return <>{children}</>;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <AuthInitializer>{children}</AuthInitializer>;
}
