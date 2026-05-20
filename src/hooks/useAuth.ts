'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import { supabase, User } from '@/services/supabaseClient';
import { userQueries } from '@/services/queries';
import { logError, handleQueryError, getUserErrorMessage } from '@/libs/apiErrors';

let authInitialized = false;
let authInitPromise: Promise<void> | null = null;

export const useAuth = () => {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    setUser,
    logout: storeLogout,
    clearError,
    setLoading,
  } = useAuthStore();

  const isMountedRef = useRef(true);

  // Initialize auth state on mount (singleton pattern)
  useEffect(() => {
    isMountedRef.current = true;

    const initAuth = async () => {
      // Prevent multiple initializations
      if (authInitialized) {
        return;
      }

      if (authInitPromise) {
        return authInitPromise;
      }

      authInitPromise = (async () => {
        try {
          // Get initial session without triggering multiple listeners
          const { data: { session } } = await supabase.auth.getSession();

          if (!isMountedRef.current) return;

          if (session?.user) {
            try {
              // Load user profile with timeout to prevent lock hang
              const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Profile load timeout')), 8000)
              );
              const userProfile = await Promise.race([
                userQueries.getUserWithPreferences(),
                timeoutPromise,
              ]);

              if (userProfile && isMountedRef.current) {
                setUser(userProfile as User);
              }
            } catch (err) {
              if ((err as Error)?.message === 'Profile load timeout') {
                console.warn('[useAuth.initSession] Profile load timed out, using basic session user');
              } else {
                logError(err, 'useAuth.initSession');
              }
              if (isMountedRef.current) {
                // Fallback to basic session user if profile fetch fails
                const basicUser: User = {
                  id: session.user.id,
                  email: session.user.email || '',
                  first_name: session.user.user_metadata?.first_name,
                  last_name: session.user.user_metadata?.last_name,
                  avatar_url: session.user.user_metadata?.avatar_url,
                  email_verified: !!session.user.email_confirmed_at,
                  created_at: session.user.created_at || new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                };
                setUser(basicUser);
              }
            }
          } else {
            if (isMountedRef.current) {
              storeLogout();
            }
          }
        } finally {
          authInitialized = true;
          authInitPromise = null;
          if (isMountedRef.current) {
            setLoading(false);
          }
        }
      })();

      return authInitPromise;
    };

    // Setup listener for subsequent auth changes (after init)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMountedRef.current) return;

        // Skip INITIAL_SESSION, handle it separately
        if (event === 'INITIAL_SESSION') {
          return;
        }

        // Handle sign in and updates - batch state updates
        if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session?.user) {
          try {
            const timeoutPromise = new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Profile load timeout')), 3000)
            );
            const userProfile = await Promise.race([
              userQueries.getUserWithPreferences(),
              timeoutPromise,
            ]);

            if (userProfile && isMountedRef.current) {
              setUser(userProfile as User);
            }
          } catch (err) {
            if ((err as Error)?.message === 'Profile load timeout') {
              console.warn('[useAuth.authStateChange] Profile load timed out, using basic session user');
            } else {
              logError(err, 'useAuth.authStateChange');
            }
            if (isMountedRef.current) {
              // Fallback to basic session user
              const basicUser: User = {
                id: session.user.id,
                email: session.user.email || '',
                first_name: session.user.user_metadata?.first_name,
                last_name: session.user.user_metadata?.last_name,
                avatar_url: session.user.user_metadata?.avatar_url,
                email_verified: !!session.user.email_confirmed_at,
                created_at: session.user.created_at || new Date().toISOString(),
                updated_at: new Date().toISOString(),
              };
              setUser(basicUser);
            }
          }
        } else if (event === 'SIGNED_OUT') {
          storeLogout();
        }
        // Skip TOKEN_REFRESHED to avoid unnecessary updates
      }
    );

    initAuth();

    return () => {
      isMountedRef.current = false;
      authListener?.subscription.unsubscribe();
    };
  }, [setUser, setLoading, storeLogout]);

  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      if (isMountedRef.current) {
        storeLogout();
      }
    } catch (err) {
      logError(err, 'useAuth.logout');
      // Still clear local state even if server logout fails
      storeLogout();
    }
  }, [storeLogout]);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    setUser,
    logout,
    clearError,
    setLoading,
  };
};
