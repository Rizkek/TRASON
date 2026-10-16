'use client';

/**
 * AuthProvider — singleton that initializes the Supabase auth listener ONCE.
 *
 * Key architecture decision:
 * - useAuth() MUST only be called here (one Supabase onAuthStateChange subscription).
 * - All other components read from useAuthStore() via individual selectors.
 * - This eliminates the "multiple subscription" bug that caused repeated isLoading:true flashes.
 *
 * Performance note:
 * - ReminderScheduler was removed from here and moved to Layout.tsx.
 *   It only needs to run on protected/authenticated pages, not on every public page load.
 */

import React from 'react';
import { useAuth } from '@/hooks/useAuth';

function AuthInitializer({ children }: { children: React.ReactNode }) {
  // This call sets up the single onAuthStateChange subscription for the whole app.
  // The theme class is owned by ThemeSync, not by this provider.
  useAuth();

  return <>{children}</>;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <AuthInitializer>{children}</AuthInitializer>;
}
