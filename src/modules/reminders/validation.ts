import { ValidationResult } from '@/libs/validation';

// Re-export ValidationResult for module use
export type { ValidationResult };

// ============================================================================
// REMINDER VALIDATION
// ============================================================================

export interface ReminderInput {
  title: string;
  description?: string;
  due_date?: string;
  due_datetime?: string;
  priority: 'low' | 'medium' | 'high';
  status?: 'pending' | 'completed' | 'cancelled';
  is_recurring?: boolean;
  recurrence_pattern?: string;
  category?: string;
}

export const validateReminder = (data: Partial<ReminderInput>): ValidationResult => {
  const errors: Record<string, string> = {};

  // Title validation
  if (!data.title?.trim()) {
    errors.title = 'Reminder title is required';
  } else if (data.title.length > 255) {
    errors.title = 'Title must be less than 255 characters';
  } else if (data.title.length < 2) {
    errors.title = 'Title must be at least 2 characters';
  }

  // Due date/datetime validation
  if (!data.due_date && !data.due_datetime) {
    errors.due_date = 'Due date or due datetime is required';
  } else {
    if (data.due_datetime && isNaN(new Date(data.due_datetime).getTime())) {
      errors.due_datetime = 'Invalid due datetime format';
    }
    if (data.due_date && !/^\d{4}-\d{2}-\d{2}$/.test(data.due_date)) {
      errors.due_date = 'Invalid due date format (YYYY-MM-DD)';
    }
  }

  // Priority validation
  if (!data.priority) {
    errors.priority = 'Priority is required';
  } else if (!['low', 'medium', 'high'].includes(data.priority)) {
    errors.priority = 'Priority must be low, medium, or high';
  }

  // Status validation (optional)
  if (data.status && !['pending', 'completed', 'cancelled'].includes(data.status)) {
    errors.status = 'Invalid status';
  }

  // Description validation (optional)
  if (data.description && data.description.length > 1000) {
    errors.description = 'Description must be less than 1000 characters';
  }

  // Recurrence pattern validation (optional)
  if (data.is_recurring) {
    if (!data.recurrence_pattern) {
      errors.recurrence_pattern = 'Recurrence pattern is required when reminder is recurring';
    } else if (!['daily', 'weekly', 'monthly', 'yearly'].includes(data.recurrence_pattern)) {
      errors.recurrence_pattern = 'Recurrence pattern must be daily, weekly, monthly, or yearly';
    }
  }

  // Category validation (optional)
  if (data.category && data.category.length > 50) {
    errors.category = 'Category must be less than 50 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// ============================================================================
// REMINDER FILTER
// ============================================================================

export interface ReminderFilterInput {
  status?: 'pending' | 'completed' | 'cancelled' | 'all';
  priority?: 'low' | 'medium' | 'high' | 'all';
  startDate?: string;
  endDate?: string;
  category?: string;
}

export const validateReminderFilter = (data: ReminderFilterInput): ValidationResult => {
  const errors: Record<string, string> = {};

  // Status validation
  if (data.status && !['pending', 'completed', 'cancelled', 'all'].includes(data.status)) {
    errors.status = 'Invalid status filter';
  }

  // Priority validation
  if (data.priority && !['low', 'medium', 'high', 'all'].includes(data.priority)) {
    errors.priority = 'Invalid priority filter';
  }

  // Date range validation
  if (data.startDate && !/^\d{4}-\d{2}-\d{2}$/.test(data.startDate)) {
    errors.startDate = 'Invalid start date format (YYYY-MM-DD)';
  }

  if (data.endDate && !/^\d{4}-\d{2}-\d{2}$/.test(data.endDate)) {
    errors.endDate = 'Invalid end date format (YYYY-MM-DD)';
  }

  if (data.startDate && data.endDate) {
    if (new Date(data.startDate) > new Date(data.endDate)) {
      errors.endDate = 'End date must be after or equal to start date';
    }
  }

  // Category validation
  if (data.category && data.category.length > 50) {
    errors.category = 'Category must be less than 50 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// ============================================================================
// QUICK REMINDER INPUT (for fast creation)
// ============================================================================

export interface QuickReminderInput {
  title: string;
  due_in_minutes?: number;
  priority?: 'low' | 'medium' | 'high';
}

export const validateQuickReminder = (data: Partial<QuickReminderInput>): ValidationResult => {
  const errors: Record<string, string> = {};

  // Title validation
  if (!data.title?.trim()) {
    errors.title = 'Reminder title is required';
  } else if (data.title.length > 255) {
    errors.title = 'Title must be less than 255 characters';
  }

  // Due in minutes validation
  if (data.due_in_minutes !== undefined) {
    if (typeof data.due_in_minutes !== 'number' || data.due_in_minutes <= 0) {
      errors.due_in_minutes = 'Due time must be a positive number of minutes';
    } else if (data.due_in_minutes > 525600) {
      errors.due_in_minutes = 'Due time cannot exceed 1 year';
    }
  }

  // Priority validation
  if (data.priority && !['low', 'medium', 'high'].includes(data.priority)) {
    errors.priority = 'Priority must be low, medium, or high';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
