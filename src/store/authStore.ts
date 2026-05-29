import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types/index';
import { supabase } from '@/services/supabaseClient';

// Helper to extract language from a user object (handles array or single pref)
const extractLanguage = (user: any): string | undefined => {
  const prefs = user?.user_preferences;
  if (!prefs) return undefined;
  const pref = Array.isArray(prefs) ? prefs[0] : prefs;
  return pref?.language;
};

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  /** Dedicated string primitive for the active UI language.
   *  Kept separate from user.user_preferences so Zustand's strict-equality
   *  check reliably triggers a re-render when the language changes. */
  activeLanguage: string;

  // Actions
  setUser: (user: User) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setActiveLanguage: (lang: string) => void;
  logout: () => void;
  signOut: () => Promise<void>;
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
      activeLanguage: 'en',

      // When a full user profile is set, also sync activeLanguage automatically
      setUser: (user) =>
        set((state) => {
          const extracted = extractLanguage(user);
          const newLang = extracted || state.activeLanguage || 'en';
          return {
            user,
            isAuthenticated: true,
            activeLanguage: newLang,
          };
        }),

      setActiveLanguage: (lang) => {
        set({ activeLanguage: lang });
      },

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
          activeLanguage: 'en',
        }),

      // Full sign-out: tells Supabase to invalidate the token, then clears local state
      signOut: async () => {
        try {
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Supabase signOut timeout')), 2000)
          );
          await Promise.race([supabase.auth.signOut(), timeoutPromise]);
        } catch {
          // Ignore timeout/error — still clear local state
        } finally {
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
            activeLanguage: 'en',
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
        activeLanguage: state.activeLanguage,
      }),
      // Always keep actions from the live store — never let serialized localStorage data
      // overwrite them (functions serialize to null in JSON, breaking the actions).
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...(persistedState as Partial<AuthState>),
        // Explicitly restore all actions from the live store so they are never null
        setUser: currentState.setUser,
        setTokens: currentState.setTokens,
        setActiveLanguage: currentState.setActiveLanguage,
        logout: currentState.logout,
        signOut: currentState.signOut,
        clearError: currentState.clearError,
        setLoading: currentState.setLoading,
        setError: currentState.setError,
      }),
    }
  )
);
