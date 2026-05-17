import { supabase } from './supabaseClient';
import { handleQueryError } from '@/libs/apiErrors';

export const logger = {
  /**
   * Log a general user activity
   */
  async logActivity(action: string, resourceType?: string, resourceId?: string, changes?: Record<string, any>) {
    // Fire and forget to avoid blocking UI
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { error } = await supabase.from('activity_logs').insert([{
          user_id: session.user.id,
          action,
          resource_type: resourceType,
          resource_id: resourceId,
          changes,
          user_agent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server'
        }]);
        
        if (error) console.warn('[Logger] DB insert failed:', error.message);
      } catch (err) {
        console.warn('[Logger] Critical failure:', err);
      }
    })();
  },

  /**
   * Log a system or API error to the database for debugging
   */
  async logError(context: string, error: any) {
    const apiError = handleQueryError(error);
    await this.logActivity(`ERROR: ${context}`, 'system_error', undefined, {
      message: apiError.message,
      code: apiError.code,
      statusCode: apiError.statusCode,
      originalError: apiError.originalError ? String(apiError.originalError) : undefined
    });
  }
};
