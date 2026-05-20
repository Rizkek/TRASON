import { supabase } from './supabaseClient';
import {
  WeeklyTemplate,
  TemplateActivity,
  TemplateOverride,
} from '@/types/database';

type QueryError = {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
};

const OPTIONAL_TEMPLATE_ERROR_CODES = new Set(['42P01', 'PGRST205', 'PGRST204']);

const formatQueryError = (error: unknown) => {
  const err = error as QueryError;
  return [err.code, err.message, err.details, err.hint].filter(Boolean).join(' - ') || 'Unknown database error';
};

const isOptionalTemplateSchemaError = (error: unknown) => {
  const err = error as QueryError;
  const text = formatQueryError(error).toLowerCase();

  return (
    (err.code ? OPTIONAL_TEMPLATE_ERROR_CODES.has(err.code) : false) ||
    text.includes('weekly_templates') ||
    text.includes('template_activities') ||
    text.includes('template_overrides') ||
    text.includes('schema cache') ||
    text.includes('does not exist')
  );
};

const logTemplateWriteError = (context: string, error: unknown) => {
  if (isOptionalTemplateSchemaError(error)) {
    console.warn(`${context}: weekly schedule tables are not available yet. Run the weekly template migration to enable this feature.`);
    return;
  }

  console.warn(`${context}: ${formatQueryError(error)}`);
};

/**
 * Weekly Template Queries
 */
export const templateQueries = {
  /**
   * Get active template (default or specified)
   */
  async getActiveTemplate(userId: string): Promise<WeeklyTemplate | null> {
    const { data, error } = await supabase
      .from('weekly_templates')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .eq('is_default', true)
      .maybeSingle();

    if (error) {
      return null;
    }

    return data;
  },

  /**
   * Get all templates for user
   */
  async getTemplates(userId: string): Promise<WeeklyTemplate[]> {
    const { data, error } = await supabase
      .from('weekly_templates')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      return [];
    }

    return data || [];
  },

  /**
   * Get template by ID
   */
  async getTemplate(templateId: string): Promise<WeeklyTemplate | null> {
    const { data, error } = await supabase
      .from('weekly_templates')
      .select('*')
      .eq('id', templateId)
      .maybeSingle();

    if (error) {
      return null;
    }

    return data;
  },

  /**
   * Create template
   */
  async createTemplate(
    userId: string,
    template: Omit<WeeklyTemplate, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ): Promise<WeeklyTemplate | null> {
    const { data, error } = await supabase
      .from('weekly_templates')
      .insert([{ ...template, user_id: userId }])
      .select()
      .single();

    if (error) {
      logTemplateWriteError('Error creating weekly routine', error);
      return null;
    }

    return data;
  },

  /**
   * Update template
   */
  async updateTemplate(
    templateId: string,
    updates: Partial<WeeklyTemplate>
  ): Promise<WeeklyTemplate | null> {
    const { data, error } = await supabase
      .from('weekly_templates')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', templateId)
      .select()
      .single();

    if (error) {
      logTemplateWriteError('Error updating weekly routine', error);
      return null;
    }

    return data;
  },

  /**
   * Set template as default
   */
  async setDefaultTemplate(userId: string, templateId: string): Promise<boolean> {
    try {
      // First, unset all other defaults
      await supabase
        .from('weekly_templates')
        .update({ is_default: false })
        .eq('user_id', userId);

      // Then set this as default
      const { error } = await supabase
        .from('weekly_templates')
        .update({ is_default: true })
        .eq('id', templateId)
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      logTemplateWriteError('Error setting default weekly routine', error);
      return false;
    }
  },

  /**
   * Delete template
   */
  async deleteTemplate(templateId: string): Promise<boolean> {
    const { error } = await supabase
      .from('weekly_templates')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', templateId);

    if (error) {
      logTemplateWriteError('Error deleting weekly routine', error);
      return false;
    }

    return true;
  },

  /**
   * Get template activities
   */
  async getTemplateActivities(templateId: string): Promise<TemplateActivity[]> {
    const { data, error } = await supabase
      .from('template_activities')
      .select('*')
      .eq('weekly_template_id', templateId)
      .order('day_of_week')
      .order('start_time');

    if (error) {
      return [];
    }

    return data || [];
  },

  /**
   * Create template activity
   */
  async createTemplateActivity(
    activity: Omit<TemplateActivity, 'id' | 'created_at' | 'updated_at'>
  ): Promise<TemplateActivity | null> {
    const { data, error } = await supabase
      .from('template_activities')
      .insert([activity])
      .select()
      .single();

    if (error) {
      logTemplateWriteError('Error creating routine activity', error);
      return null;
    }

    return data;
  },

  /**
   * Update template activity
   */
  async updateTemplateActivity(
    activityId: string,
    updates: Partial<TemplateActivity>
  ): Promise<TemplateActivity | null> {
    const { data, error } = await supabase
      .from('template_activities')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', activityId)
      .select()
      .single();

    if (error) {
      logTemplateWriteError('Error updating routine activity', error);
      return null;
    }

    return data;
  },

  /**
   * Delete template activity
   */
  async deleteTemplateActivity(activityId: string): Promise<boolean> {
    const { error } = await supabase
      .from('template_activities')
      .delete()
      .eq('id', activityId);

    if (error) {
      logTemplateWriteError('Error deleting routine activity', error);
      return false;
    }

    return true;
  },
};

/**
 * Template Override Queries
 */
export const overrideQueries = {
  /**
   * Get override for specific week
   */
  async getOverrideForWeek(
    userId: string,
    templateId: string,
    weekStartDate: string
  ): Promise<TemplateOverride | null> {
    const { data, error } = await supabase
      .from('template_overrides')
      .select('*')
      .eq('user_id', userId)
      .eq('weekly_template_id', templateId)
      .eq('week_start_date', weekStartDate)
      .maybeSingle();

    if (error) {
      return null;
    }

    return data;
  },

  /**
   * Get all overrides for template
   */
  async getOverridesForTemplate(templateId: string): Promise<TemplateOverride[]> {
    const { data, error } = await supabase
      .from('template_overrides')
      .select('*')
      .eq('weekly_template_id', templateId)
      .order('week_start_date', { ascending: false });

    if (error) {
      return [];
    }

    return data || [];
  },

  /**
   * Create override
   */
  async createOverride(
    override: Omit<TemplateOverride, 'id' | 'created_at' | 'updated_at'>
  ): Promise<TemplateOverride | null> {
    const { data, error } = await supabase
      .from('template_overrides')
      .insert([override])
      .select()
      .single();

    if (error) {
      logTemplateWriteError('Error creating routine override', error);
      return null;
    }

    return data;
  },

  /**
   * Update override
   */
  async updateOverride(
    overrideId: string,
    updates: Partial<TemplateOverride>
  ): Promise<TemplateOverride | null> {
    const { data, error } = await supabase
      .from('template_overrides')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', overrideId)
      .select()
      .single();

    if (error) {
      logTemplateWriteError('Error updating routine override', error);
      return null;
    }

    return data;
  },

  /**
   * Delete override
   */
  async deleteOverride(overrideId: string): Promise<boolean> {
    const { error } = await supabase
      .from('template_overrides')
      .delete()
      .eq('id', overrideId);

    if (error) {
      logTemplateWriteError('Error deleting routine override', error);
      return false;
    }

    return true;
  },
};
