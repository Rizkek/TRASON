'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import { supabase, User } from '@/services/supabaseClient';
import { userQueries } from '@/services/queries';
import { logError, handleQueryError } from '@/libs/apiErrors';

// Profile fetch timeout constants
const INIT_TIMEOUT_MS = 8000;    // initial session load
const REFRESH_TIMEOUT_MS = 8000; // token refresh / auth state change (was 3000 — too short for production)

let authInitialized = false;
let authInitPromise: Promise<void> | null = null;

// ---------------------------------------------------------------------------
// Dev-only structured logger — stripped in production
// ---------------------------------------------------------------------------
const isDev = process.env.NODE_ENV === 'development';

function authLog(
  tag: string,
  msg: string,
  data?: Record<string, unknown>,
  level: 'log' | 'warn' | 'error' = 'log'
) {
  if (!isDev) return;
  const ts = new Date().toISOString().slice(11, 23); // HH:MM:SS.mmm
  const prefix = `[AUTH ${ts}] [${tag}]`;
  if (data) {
    console[level](prefix, msg, data);
  } else {
    console[level](prefix, msg);
  }
}

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
  // Stable ref so the effect deps array size never changes between renders (HMR safety).
  // React errors if the deps array changes size — this keeps it at [1] always.
  const stableRef = useRef(false);

  // Initialize auth state on mount (singleton pattern)
  useEffect(() => {
    isMountedRef.current = true;

    // Access store actions via getState() to avoid stale closure issues
    // and keep the effect dependency array empty (true singleton behaviour).
    const getActions = () => ({
      setUser: useAuthStore.getState().setUser,
      setLoading: useAuthStore.getState().setLoading,
      storeLogout: useAuthStore.getState().logout,
    });

    const initAuth = async () => {
      // Prevent multiple initializations
      if (authInitialized) {
        authLog('initAuth', 'Already initialized — skipping', { authInitialized });
        return;
      }

      if (authInitPromise) {
        authLog('initAuth', 'Init already in-flight — awaiting existing promise');
        return authInitPromise;
      }

      authLog('initAuth', '▶ Starting auth initialization');

      authInitPromise = (async () => {
        try {
          authLog('initAuth', 'getSession() → calling Supabase...');
          const t0 = performance.now();
          const { data: { session } } = await supabase.auth.getSession();
          authLog('initAuth', `getSession() → done in ${(performance.now() - t0).toFixed(0)}ms`, {
            hasSession: !!session,
            userId: session?.user?.id ?? null,
            expiresAt: session?.expires_at ?? null,
          });

          if (!isMountedRef.current) {
            authLog('initAuth', 'Component unmounted after getSession — aborting', undefined, 'warn');
            return;
          }

          if (session?.user) {
            try {
              let userProfile = null;
              if (navigator.onLine !== false) {
                authLog('initAuth', `getUserWithPreferences() → calling DB (timeout=${INIT_TIMEOUT_MS}ms)...`);
                const t1 = performance.now();
                const timeoutPromise = new Promise((_, reject) =>
                  setTimeout(() => reject(new Error('Profile load timeout')), INIT_TIMEOUT_MS)
                );
                userProfile = await Promise.race([
                  userQueries.getUserWithPreferences(),
                  timeoutPromise,
                ]);
                const elapsed = (performance.now() - t1).toFixed(0);
                authLog('initAuth', `getUserWithPreferences() → done in ${elapsed}ms`, {
                  hasProfile: !!userProfile,
                  hasPreferences: !!(userProfile as any)?.user_preferences,
                  language: (userProfile as any)?.user_preferences?.[0]?.language ?? (userProfile as any)?.user_preferences?.language ?? 'N/A',
                });
              } else {
                throw new Error('Offline');
              }

              if (userProfile && isMountedRef.current) {
                authLog('initAuth', '✓ setUser() with full profile + preferences');
                getActions().setUser(userProfile as User);
              }
            } catch (err) {
              const errMsg = (err as Error)?.message;
              if (errMsg === 'Profile load timeout') {
                authLog('initAuth',
                  `⚠ Profile fetch TIMED OUT after ${INIT_TIMEOUT_MS}ms → falling back to basicUser`,
                  { userId: session.user.id },
                  'warn'
                );
              } else if (errMsg === 'Offline') {
                authLog('initAuth', '⚠ Device is offline → falling back to basicUser', undefined, 'warn');
              } else {
                authLog('initAuth', '✗ Profile fetch FAILED (unexpected error)', { errMsg }, 'error');
                logError(err, 'useAuth.initSession');
              }
              if (isMountedRef.current) {
                // Fallback to basic session user if profile fetch fails.
                // Preserve the existing user_preferences from store if available
                // (e.g. already-loaded from a prior session or persist storage)
                // so language/currency/timezone are not lost on timeout.
                const existingUser = useAuthStore.getState().user as any;
                const existingPrefs = existingUser?.user_preferences;
                authLog('initAuth', 'Fallback basicUser — checking store for existing prefs', {
                  existingPrefsFound: !!existingPrefs,
                  preservedLanguage: existingPrefs?.[0]?.language ?? existingPrefs?.language ?? 'none',
                }, 'warn');
                const basicUser: User = {
                  id: session.user.id,
                  email: session.user.email || '',
                  first_name: session.user.user_metadata?.first_name,
                  last_name: session.user.user_metadata?.last_name,
                  avatar_url: session.user.user_metadata?.avatar_url,
                  email_verified: !!session.user.email_confirmed_at,
                  created_at: session.user.created_at || new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  // Carry forward any existing preferences so i18n/currency/tz
                  // don't reset when a timeout forces a fallback
                  ...(existingPrefs ? { user_preferences: existingPrefs } : {}),
                } as User;
                getActions().setUser(basicUser);
              }
            }
          } else {
            authLog('initAuth', '✗ No session found → calling storeLogout()');
            if (isMountedRef.current) {
              getActions().storeLogout();
            }
          }
        } finally {
          authInitialized = true;
          authInitPromise = null;
          if (isMountedRef.current) {
            getActions().setLoading(false);
          }
          authLog('initAuth', '■ Auth initialization complete', { authInitialized });
        }
      })();

      return authInitPromise;
    };

    // Setup listener for subsequent auth changes (after init)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMountedRef.current) return;

        authLog('onAuthStateChange', `← Event: ${event}`, {
          userId: session?.user?.id ?? null,
          hasSession: !!session,
        });

        // Skip INITIAL_SESSION, handle it separately
        if (event === 'INITIAL_SESSION') {
          authLog('onAuthStateChange', 'INITIAL_SESSION skipped (handled by initAuth)');
          return;
        }

        // Handle sign in and updates - batch state updates
        if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session?.user) {
          // Guard: skip expensive DB fetch if the same user is already loaded.
          // This prevents redundant round-trips during token auto-refresh (_recoverAndRefresh)
          // which fires SIGNED_IN repeatedly and was causing the 3-second timeout warn in production.
          const currentUser = useAuthStore.getState().user as User | null;
          const hasPreferences = !!(currentUser as any)?.user_preferences;

          authLog('onAuthStateChange', 'SIGNED_IN / USER_UPDATED guard check', {
            sameUser: currentUser?.id === session.user.id,
            hasPreferences,
            willSkipFetch: currentUser?.id === session.user.id && event === 'SIGNED_IN' && hasPreferences,
          });

          // Skip fetch hanya jika user sama DAN preferences sudah ada di store
          if (currentUser?.id === session.user.id && event === 'SIGNED_IN' && hasPreferences) {
            authLog('onAuthStateChange', '✓ Guard: same user + prefs exist — skipping DB fetch (token refresh safe)');
            return;
          }

          try {
            authLog('onAuthStateChange', `getUserWithPreferences() → calling DB (timeout=${REFRESH_TIMEOUT_MS}ms)...`);
            const t0 = performance.now();
            const timeoutPromise = new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Profile load timeout')), REFRESH_TIMEOUT_MS)
            );
            const userProfile = await Promise.race([
              userQueries.getUserWithPreferences(),
              timeoutPromise,
            ]);
            const elapsed = (performance.now() - t0).toFixed(0);
            authLog('onAuthStateChange', `getUserWithPreferences() → done in ${elapsed}ms`, {
              hasProfile: !!userProfile,
              hasPreferences: !!(userProfile as any)?.user_preferences,
            });

            if (userProfile && isMountedRef.current) {
              authLog('onAuthStateChange', '✓ setUser() with refreshed full profile');
              getActions().setUser(userProfile as User);
            }
          } catch (err) {
            const errMsg = (err as Error)?.message;
            if (errMsg === 'Profile load timeout') {
              authLog('onAuthStateChange',
                `⚠ Profile fetch TIMED OUT after ${REFRESH_TIMEOUT_MS}ms → falling back to basicUser`,
                { event, userId: session.user.id },
                'warn'
              );
            } else {
              authLog('onAuthStateChange', '✗ Profile fetch FAILED', { errMsg }, 'error');
              logError(err, 'useAuth.authStateChange');
            }
            if (isMountedRef.current) {
              // Fallback to basic session user.
              // Preserve existing preferences from store to avoid
              // language/currency/tz reset when profile fetch times out.
              const existingUser = useAuthStore.getState().user as any;
              const existingPrefs = existingUser?.user_preferences;
              authLog('onAuthStateChange', 'Fallback basicUser — checking store for existing prefs', {
                existingPrefsFound: !!existingPrefs,
                preservedLanguage: existingPrefs?.[0]?.language ?? existingPrefs?.language ?? 'none',
              }, 'warn');
              const basicUser: User = {
                id: session.user.id,
                email: session.user.email || '',
                first_name: session.user.user_metadata?.first_name,
                last_name: session.user.user_metadata?.last_name,
                avatar_url: session.user.user_metadata?.avatar_url,
                email_verified: !!session.user.email_confirmed_at,
                created_at: session.user.created_at || new Date().toISOString(),
                updated_at: new Date().toISOString(),
                // Carry forward existing preferences so i18n/currency/tz
                // don't reset on token-refresh timeout
                ...(existingPrefs ? { user_preferences: existingPrefs } : {}),
              } as User;
              getActions().setUser(basicUser);
            }
          }
        } else if (event === 'SIGNED_OUT') {
          authLog('onAuthStateChange', '✗ SIGNED_OUT → calling storeLogout()');
          getActions().storeLogout();
        } else if (event === 'TOKEN_REFRESHED') {
          authLog('onAuthStateChange', '↺ TOKEN_REFRESHED — deliberately skipped (guard in SIGNED_IN handles this)');
        } else {
          authLog('onAuthStateChange', `Unhandled event: ${event} — no action taken`);
        }
      }
    );

    initAuth();

    return () => {
      authLog('cleanup', 'Component unmounting — unsubscribing auth listener');
      isMountedRef.current = false;
      authListener?.subscription.unsubscribe();
    };
  // stableRef.current is a guard that ensures this effect body only runs once.
  // The deps array is [stableRef] which always has size=1, satisfying React's
  // rules-of-hooks (no size change between renders, including HMR).\
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stableRef]);

  const logout = useCallback(async () => {
    authLog('logout', '▶ Initiating logout...');
    try {
      await supabase.auth.signOut();
      authLog('logout', '✓ Supabase signOut successful');
      if (isMountedRef.current) {
        storeLogout();
      }
    } catch (err) {
      authLog('logout', '✗ Supabase signOut failed — clearing local state anyway', { err }, 'error');
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
