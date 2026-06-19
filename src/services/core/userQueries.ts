import {
  supabase,
  User,
  Category,
  Transaction,
  Activity,
  Habit,
  Reminder,
  Insight,
  UserPreferences,
  getCurrentUser,
} from '../supabase/supabaseClient';
import { handleQueryError, logError } from '@/libs/apiErrors';
import type { DailyTask } from '@/types/database';

export const userQueries = {
  async ensureUserProfile() {
    const user = await getCurrentUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('users')
      .upsert([buildUserProfilePayload(user)], { onConflict: 'id' })
      .select(
        `
        id, email, first_name, last_name, avatar_url, email_verified, phone, bio,
        created_at, updated_at,
        user_preferences(theme, language, currency, timezone, notifications_enabled, 
                        push_notifications_enabled, email_digest_enabled, digest_frequency, module_features)
      `
      )
      .maybeSingle();

    if (error) {
      const isDuplicateEmail =
        error.code === '23505' &&
        String(error.details || error.message || '').toLowerCase().includes('users_email_key');

      if (isDuplicateEmail) {
        logError(error, 'userQueries.ensureUserProfile.duplicateEmail');
        throw handleQueryError(error);
      }

      logError(error, 'userQueries.ensureUserProfile');
      throw handleQueryError(error);
    }
    return data;
  },

  // Fetch user with preferences
  // Uses maybeSingle() to safely return null (instead of throwing) when no row exists.
  async getUserWithPreferences() {
    try {
      const user = await getCurrentUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('users')
        .select(
          `
          id, email, first_name, last_name, avatar_url, email_verified, phone, bio,
          created_at, updated_at,
          user_preferences(theme, language, currency, timezone, notifications_enabled, 
                          push_notifications_enabled, email_digest_enabled, digest_frequency, module_features)
        `
        )
        .eq('id', user.id)
        .is('deleted_at', null)
        .maybeSingle();

      if (error) throw error;

      // Auto-create user row if it doesn't exist yet (e.g. first login after sign-up)
      if (!data) {
        return userQueries.ensureUserProfile();
      }

      return data;
    } catch (err) {
      logError(err, 'userQueries.getUserWithPreferences');
      throw handleQueryError(err);
    }
  },

  // Update user profile
  async updateUserProfile(
    updates: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>
  ) {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('users')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      logError(err, 'userQueries.updateUserProfile');
      throw handleQueryError(err);
    }
  },

  // Update user preferences
  async updateUserPreferences(updates: Partial<UserPreferences>) {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      // Explicitly pick only the columns we manage — never pass id/user_id from `updates`
      // to avoid upsert conflicts, and always select the exact preference fields so the
      // returned shape matches what useUserPreferences expects.
      const { theme, language, currency, timezone,
              notifications_enabled, push_notifications_enabled,
              email_digest_enabled, digest_frequency, module_features } = updates as any;

      const payload: Record<string, unknown> = {
        user_id: user.id,
        updated_at: new Date().toISOString(),
      };
      if (theme !== undefined)                       payload.theme = theme;
      if (language !== undefined)                    payload.language = language;
      if (currency !== undefined)                    payload.currency = currency;
      if (timezone !== undefined)                    payload.timezone = timezone;
      if (notifications_enabled !== undefined)       payload.notifications_enabled = notifications_enabled;
      if (push_notifications_enabled !== undefined)  payload.push_notifications_enabled = push_notifications_enabled;
      if (email_digest_enabled !== undefined)        payload.email_digest_enabled = email_digest_enabled;
      if (digest_frequency !== undefined)            payload.digest_frequency = digest_frequency;
      if (module_features !== undefined)             payload.module_features = module_features;

      // Safely check if a row exists first to avoid unique constraint issues
      const { data: existingRow } = await supabase
        .from('user_preferences')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      let result;
      if (existingRow) {
        // Update existing
        result = await supabase
          .from('user_preferences')
          .update(payload)
          .eq('id', existingRow.id)
          .select('theme, language, currency, timezone, notifications_enabled, push_notifications_enabled, email_digest_enabled, digest_frequency, module_features')
          .single();
      } else {
        // Insert new
        result = await supabase
          .from('user_preferences')
          .insert([payload])
          .select('theme, language, currency, timezone, notifications_enabled, push_notifications_enabled, email_digest_enabled, digest_frequency, module_features')
          .single();
      }

      const { data, error } = result;

      if (error) throw error;
      return data;
    } catch (err) {
      logError(err, 'userQueries.updateUserPreferences');
      throw handleQueryError(err);
    }
  },
};

/**
 * ==================== CATEGORY QUERIES ====================
 */


const buildUserProfilePayload = (user: any) => ({ id: user.id, email: user.email ?? '', first_name: user.user_metadata?.first_name ?? undefined, last_name: user.user_metadata?.last_name ?? undefined, email_verified: !!user.email_confirmed_at, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), });
