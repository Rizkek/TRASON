'use client';

import { useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { supabase, User } from '@/services/supabaseClient';
import { userQueries } from '@/services/queries';
import { logError, handleQueryError, getUserErrorMessage } from '@/libs/apiErrors';

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
                setUser(userProfile as User);
              }
            } else {
              if (isMounted) {
                storeLogout();
              }
            }
          } catch (err) {
            logError(err, 'useAuth.initSession');
            if (session?.user && isMounted) {
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
              setUser(userProfile as User);
            }
          } catch (err) {
            logError(err, 'useAuth.authStateChange');
            if (isMounted) {
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
