'use client';

/**
 * AuthProvider — singleton that initializes the Supabase auth listener ONCE.
 *
 * Key architecture decision:
 * - useAuth() MUST only be called here (one Supabase onAuthStateChange subscription).
 * - All other components read from useAuthStore() via individual selectors.
 * - This eliminates the "multiple subscription" bug that caused repeated isLoading:true flashes.
 */

import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';

function AuthInitializer({ children }: { children: React.ReactNode }) {
  // This call sets up the single onAuthStateChange subscription for the whole app.
  const { user } = useAuth();
  
  // Handle Global Theme Application
  useEffect(() => {
    const theme = (user as any)?.user_preferences?.[0]?.theme || 'dark';
    const root = window.document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else if (theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      // Auto
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', isDark);
      root.classList.toggle('light', !isDark);
    }
  }, [user]);

  return <>{children}</>;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <AuthInitializer>{children}</AuthInitializer>;
}
