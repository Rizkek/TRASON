import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types/index';
import { supabase } from '@/services/supabase/supabaseClient';
import { AUTH_STORAGE_KEY, DEFAULT_THEME_PREFERENCE } from '@/libs/theme';

// Helper to extract language from a user object (handles array or single pref)
const extractLanguage = (user: any): string | undefined => {
  const prefs = user?.user_preferences;
  if (!prefs) return undefined;
  const pref = Array.isArray(prefs) ? prefs[0] : prefs;
  return pref?.language;
};

// Helper to extract theme from a user object
const extractTheme = (user: any): string | undefined => {
  const prefs = user?.user_preferences;
  if (!prefs) return undefined;
  const pref = Array.isArray(prefs) ? prefs[0] : prefs;
  return pref?.theme;
};

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  /** True once the first session check has finished. Not persisted: the persisted
   *  isAuthenticated can be stale, so route guards must wait for this before redirecting. */
  isAuthReady: boolean;
  error: string | null;
  /** Dedicated string primitive for the active UI language.
   *  Kept separate from user.user_preferences so Zustand's strict-equality
   *  check reliably triggers a re-render when the language changes. */
  activeLanguage: string;
  activeTheme: string;

  // Actions
  setUser: (user: User) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setActiveLanguage: (lang: string) => void;
  setActiveTheme: (theme: string) => void;
  logout: () => void;
  signOut: () => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  setAuthReady: () => void;
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
      isAuthReady: false,
      error: null,
      activeLanguage: 'en',
      activeTheme: DEFAULT_THEME_PREFERENCE,

      setUser: (user) =>
        set((state) => {
          const extractedLang = extractLanguage(user);
          const newLang = extractedLang || state.activeLanguage || 'en';
          const extractedTheme = extractTheme(user);
          const newTheme = extractedTheme || state.activeTheme || DEFAULT_THEME_PREFERENCE;
          return {
            user,
            isAuthenticated: true,
            activeLanguage: newLang,
            activeTheme: newTheme,
          };
        }),

      setActiveLanguage: (lang) => {
        set({ activeLanguage: lang });
      },

      setActiveTheme: (theme) => {
        set({ activeTheme: theme });
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
          activeTheme: DEFAULT_THEME_PREFERENCE,
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
            activeTheme: DEFAULT_THEME_PREFERENCE,
          });
        }
      },

      clearError: () => set({ error: null }),
      setLoading: (loading) => set({ isLoading: loading }),
      setAuthReady: () => set({ isAuthReady: true }),
      setError: (error) => set({ error }),
    }),
    {
      name: AUTH_STORAGE_KEY,
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        activeLanguage: state.activeLanguage,
        activeTheme: state.activeTheme,
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
        setActiveTheme: currentState.setActiveTheme,
        logout: currentState.logout,
        signOut: currentState.signOut,
        clearError: currentState.clearError,
        setLoading: currentState.setLoading,
        setAuthReady: currentState.setAuthReady,
        setError: currentState.setError,
      }),
    }
  )
);
