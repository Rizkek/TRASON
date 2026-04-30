'use client';

import { useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/services/supabaseClient';
import { userQueries } from '@/services/queries';

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

  // Initialize auth state on mount
  useEffect(() => {
    let isMounted = true;

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;

        if (event === 'INITIAL_SESSION') {
          setLoading(true);
          try {
            if (session?.user) {
              const userProfile = await userQueries.getUserWithPreferences();
              if (userProfile && isMounted) {
                setUser(userProfile);
              }
            } else {
              if (isMounted) {
                storeLogout();
              }
            }
          } catch (err) {
            console.error('Auth init error:', err);
            if (session?.user && isMounted) {
              setUser(session.user as any);
            } else if (isMounted) {
              storeLogout();
            }
          } finally {
            if (isMounted) setLoading(false);
          }
          return;
        }

        if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') && session?.user) {
          try {
            const userProfile = await userQueries.getUserWithPreferences();
            if (userProfile && isMounted) {
              setUser(userProfile);
            }
          } catch (err) {
            console.warn('Failed to load user profile:', err);
            if (isMounted) setUser(session.user as any);
          }
        } else if (event === 'SIGNED_OUT') {
          storeLogout();
        }
      }
    );

    return () => {
      isMounted = false;
      authListener?.subscription.unsubscribe();
    };
  }, [setUser, setLoading, storeLogout]);

  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      storeLogout();
    } catch (err) {
      console.error('Logout error:', err);
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
