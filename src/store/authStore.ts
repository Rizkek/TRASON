import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types/index';
import { supabase } from '@/services/supabaseClient';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (user: User) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
  signOut: () => Promise<void>; // Full sign-out: clears Supabase session + local state
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setUser: (user) => set({ user, isAuthenticated: true }),
      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken }),

      // Local state clear only (used internally by onAuthStateChange SIGNED_OUT handler)
      logout: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        }),

      // Full sign-out: tells Supabase to invalidate the token, then clears local state
      signOut: async () => {
        console.log('[authStore] Starting signOut process...');
        try {
          // Timeout to prevent hanging if Supabase server is unresponsive
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Supabase signOut timeout')), 2000)
          );
          
          await Promise.race([
            supabase.auth.signOut(),
            timeoutPromise
          ]);
          console.log('[authStore] Supabase signOut successful');
        } catch (err) {
          console.error('[authStore] Supabase signOut error or timeout:', err);
        } finally {
          console.log('[authStore] Clearing local auth state...');
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      clearError: () => set({ error: null }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
